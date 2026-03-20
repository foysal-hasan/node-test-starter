import assert from "node:assert/strict";
import request from "supertest";

import { app } from "../app.js";

const main = async () => {
  const response = await request(app).get("/api/v1/health");

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, {
    success: true,
    message: "Healthy",
  });

  console.log("Health smoke test passed");
};

void main();
