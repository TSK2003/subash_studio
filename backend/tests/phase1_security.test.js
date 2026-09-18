import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import app from "../src/app.js";
import { verifyImageMagicBytes } from "../src/utils/storage.js";
import {
  validateCreateBooking,
  validateCreateEnquiry,
  validateCreateFrameOrder,
} from "../src/middleware/validation.js";

function mockReqRes(body = {}) {
  const req = { body };
  let statusCode = 200;
  let jsonResponse = null;
  let nextCalled = false;

  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      jsonResponse = data;
      return this;
    },
  };

  const next = () => {
    nextCalled = true;
  };

  return { req, res, next, getStatus: () => statusCode, getJson: () => jsonResponse, wasNextCalled: () => nextCalled };
}

test("PHASE 1 SECURITY: Input Validation - Bookings", () => {
  // Test 1: Empty customer name rejected
  {
    const { req, res, getStatus, getJson, wasNextCalled } = mockReqRes({
      customerName: " ",
      email: "client@example.com",
      phone: "+919876543210",
    });
    validateCreateBooking(req, res, () => {});
    assert.equal(getStatus(), 400);
    assert.match(getJson().error, /client name/i);
    assert.equal(wasNextCalled(), false);
  }

  // Test 2: Invalid email rejected
  {
    const { req, res, getStatus, getJson } = mockReqRes({
      customerName: "Priya & Rahul",
      email: "not-an-email",
      phone: "+919876543210",
    });
    validateCreateBooking(req, res, () => {});
    assert.equal(getStatus(), 400);
    assert.match(getJson().error, /valid email/i);
  }

  // Test 3: Invalid phone rejected
  {
    const { req, res, getStatus, getJson } = mockReqRes({
      customerName: "Priya & Rahul",
      email: "priya@example.com",
      phone: "12",
    });
    validateCreateBooking(req, res, () => {});
    assert.equal(getStatus(), 400);
    assert.match(getJson().error, /phone number/i);
  }

  // Test 4: Valid booking passes
  {
    const { req, res, next, wasNextCalled } = mockReqRes({
      customerName: "Priya & Rahul",
      email: "priya@example.com",
      phone: "+91 98765 43210",
      eventType: "Wedding",
      numberOfDays: "2 Days",
      requiredService: "Wedding Photography",
    });
    validateCreateBooking(req, res, next);
    assert.equal(wasNextCalled(), true);
  }
});

test("PHASE 1 SECURITY: Input Validation - Enquiries", () => {
  // Test 1: Missing message rejected
  {
    const { req, res, getStatus, getJson } = mockReqRes({
      clientName: "Anand",
      email: "anand@example.com",
      phone: "9876543210",
      message: " ",
    });
    validateCreateEnquiry(req, res, () => {});
    assert.equal(getStatus(), 400);
    assert.match(getJson().error, /message/i);
  }

  // Test 2: Valid enquiry passes
  {
    const { req, res, next, wasNextCalled } = mockReqRes({
      clientName: "Anand Kumar",
      email: "anand@example.com",
      phone: "9876543210",
      interestedService: "Candid Photography",
      message: "Looking for pre-wedding photography session in Tirunelveli.",
    });
    validateCreateEnquiry(req, res, next);
    assert.equal(wasNextCalled(), true);
  }
});

test("PHASE 1 SECURITY: Input Validation - Frame Orders", () => {
  // Test 1: Missing photoUrl rejected
  {
    const { req, res, getStatus, getJson } = mockReqRes({
      customerName: "Divya",
      email: "divya@example.com",
      phone: "9876543210",
      deliveryType: "Studio Pickup",
      quantity: 1,
      photoUrl: "",
    });
    validateCreateFrameOrder(req, res, () => {});
    assert.equal(getStatus(), 400);
    assert.match(getJson().error, /photo/i);
  }

  // Test 2: Home delivery without address rejected
  {
    const { req, res, getStatus, getJson } = mockReqRes({
      customerName: "Divya",
      email: "divya@example.com",
      phone: "9876543210",
      deliveryType: "Home Delivery",
      address: "   ",
      quantity: 1,
      photoUrl: "https://example.com/framed-photo.jpg",
    });
    validateCreateFrameOrder(req, res, () => {});
    assert.equal(getStatus(), 400);
    assert.match(getJson().error, /address/i);
  }

  // Test 3: Valid frame order passes
  {
    const { req, res, next, wasNextCalled } = mockReqRes({
      customerName: "Divya",
      email: "divya@example.com",
      phone: "9876543210",
      deliveryType: "Studio Pickup",
      quantity: 2,
      totalAmount: 4800,
      photoUrl: "https://example.com/framed-photo.jpg",
    });
    validateCreateFrameOrder(req, res, next);
    assert.equal(wasNextCalled(), true);
  }
});

test("PHASE 1 SECURITY: Image Magic Byte Verification", () => {
  // Valid JPEG header (FF D8 FF)
  const validJpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
  assert.equal(verifyImageMagicBytes(validJpeg, "image/jpeg"), true);

  // Valid PNG header (89 50 4E 47 0D 0A 1A 0A)
  const validPng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
  assert.equal(verifyImageMagicBytes(validPng, "image/png"), true);

  // Fake file (text file disguised as image/jpeg)
  const fakeFile = Buffer.from("THIS_IS_NOT_AN_IMAGE_FILE_JUST_PLAIN_TEXT");
  assert.throws(
    () => verifyImageMagicBytes(fakeFile, "image/jpeg"),
    /signature verification failed/i
  );
});

test("PHASE 1 SECURITY: Unauthenticated Upload Rejection", async () => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;

  try {
    const res = await fetch(`http://localhost:${port}/api/uploads`, {
      method: "POST",
      body: new FormData(),
    });
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.match(data.error, /authentication required/i);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("PHASE 1 SECURITY: Public Booking Input Validation via HTTP", async () => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;

  try {
    const res = await fetch(`http://localhost:${port}/api/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: "",
        email: "bad-email",
        phone: "12",
      }),
    });
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.match(data.error, /client name/i);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("PHASE 1 SECURITY: CORS Origin Rejection", async () => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;

  try {
    const res = await fetch(`http://localhost:${port}/api/health`, {
      headers: {
        Origin: "https://evil-attacker-phishing-site.com",
      },
    });
    // CORS middleware should not include Access-Control-Allow-Origin for untrusted origins
    const allowOrigin = res.headers.get("access-control-allow-origin");
    assert.notEqual(allowOrigin, "https://evil-attacker-phishing-site.com");
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

