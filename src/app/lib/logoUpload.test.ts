import assert from "node:assert/strict";
import test from "node:test";
import { requestHeaders, validateLogo, logoFormData } from "./logoUpload.ts";

test("multipart deja al navegador generar el boundary y conserva headers personalizados", () => {
  const file = new File(["logo"], "logo.png", { type: "image/png" });
  const body = logoFormData(file);
  const headers = requestHeaders(body, { "X-Custom": "example" });
  assert.equal(headers.has("Content-Type"), false);
  assert.equal(headers.get("X-Custom"), "example");
  assert.equal((body.get("file") as File).name, "logo.png");
  assert.equal(Array.from(body.keys()).length, 1);
});

test("JSON conserva Content-Type y headers existentes", () => {
  assert.equal(requestHeaders("{}").get("Content-Type"), "application/json");
  assert.equal(
    requestHeaders("{}", new Headers({ "X-Custom": "value" })).get("X-Custom"),
    "value",
  );
  assert.equal(requestHeaders(null).has("Content-Type"), false);
});

test("valida tipos, archivos vacíos y máximo 2 MB", () => {
  assert.equal(
    validateLogo({ type: "image/png", size: 2 * 1024 * 1024 }),
    null,
  );
  assert.equal(validateLogo({ type: "image/jpeg", size: 10 }), null);
  assert.equal(validateLogo({ type: "image/webp", size: 10 }), null);
  assert.ok(validateLogo({ type: "image/svg+xml", size: 10 }));
  assert.ok(validateLogo({ type: "image/gif", size: 10 }));
  assert.ok(validateLogo({ type: "image/png", size: 0 }));
  assert.ok(validateLogo({ type: "image/png", size: 2 * 1024 * 1024 + 1 }));
});
