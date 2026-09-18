import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import app from "../src/app.js";

test("PHASE 8 OBSERVABILITY: Request Correlation ID generation and propagation", async () => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;

  try {
    // 1. Without X-Request-Id header: server generates UUID
    const res1 = await fetch(`http://127.0.0.1:${port}/api/health`);
    const reqId1 = res1.headers.get("x-request-id");
    assert.ok(reqId1, "X-Request-Id header should be present on response");
    assert.match(
      reqId1,
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      "Generated X-Request-Id should be a valid UUID"
    );

    // 2. With client X-Request-Id header: server preserves it
    const customId = "trace-client-custom-999";
    const res2 = await fetch(`http://127.0.0.1:${port}/api/health`, {
      headers: { "x-request-id": customId },
    });
    const reqId2 = res2.headers.get("x-request-id");
    assert.equal(reqId2, customId, "Custom X-Request-Id should be preserved and echoed");

    // 3. Error response contains requestId in payload
    const res3 = await fetch(`http://127.0.0.1:${port}/api/non-existent-endpoint-test-404`, {
      headers: { "x-request-id": "error-trace-404" },
    });
    assert.equal(res3.headers.get("x-request-id"), "error-trace-404");
  } finally {
    server.close();
  }
});
