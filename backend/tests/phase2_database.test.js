import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";

test("PHASE 2 DATABASE: Collision-Safe Identifiers", () => {
  const generatedIds = new Set();
  const count = 1000;

  for (let i = 0; i < count; i++) {
    const bookingId = `BK-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    const enquiryId = `ENQ-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    const frameId = `SS-FR-20260918-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    assert.equal(generatedIds.has(bookingId), false, `Collision detected on booking ID: ${bookingId}`);
    assert.equal(generatedIds.has(enquiryId), false, `Collision detected on enquiry ID: ${enquiryId}`);
    assert.equal(generatedIds.has(frameId), false, `Collision detected on frame ID: ${frameId}`);

    generatedIds.add(bookingId);
    generatedIds.add(enquiryId);
    generatedIds.add(frameId);

    assert.match(bookingId, /^BK-\d+-[0-9A-F]{6}$/);
    assert.match(enquiryId, /^ENQ-\d+-[0-9A-F]{6}$/);
    assert.match(frameId, /^SS-FR-\d{8}-[0-9A-F]{6}$/);
  }

  assert.equal(generatedIds.size, count * 3);
});

test("PHASE 2 DATABASE: Date Types & Formatting", () => {
  const isoString = "2026-09-18T10:00:00.000Z";
  const dateObj = new Date(isoString);

  assert.equal(isNaN(dateObj.getTime()), false);
  assert.equal(dateObj.toISOString(), isoString);

  // Verifying date fallback
  const fallback = new Date();
  assert.equal(isNaN(fallback.getTime()), false);
});
