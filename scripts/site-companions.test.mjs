import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(new URL("../lib/site-companions.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
const companions = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);

test("health colors report only the two states returned by the basic site check", () => {
  assert.equal(companions.companionHealth({ status: "ok" }), "ok");
  assert.equal(companions.companionHealth({ status: "degraded" }), "degraded");
  for (const payload of [null, undefined, "ok", {}, { status: "safe" }, { status: "ok<script>" }]) {
    assert.equal(companions.companionHealth(payload), "unavailable");
  }
});

test("checks are gated by visibility, connectivity, and room for the companions", () => {
  const allowed = { visible: true, online: true, desktop: true };
  assert.equal(companions.companionPollDelay(null, 0, allowed), 1000);
  assert.equal(companions.companionPollDelay(0, 0, allowed), 300000);
  assert.equal(companions.companionPollDelay(0, 299000, allowed), 1000);
  assert.equal(companions.companionPollDelay(0, 900000, allowed), 1000);
  assert.equal(companions.companionPollDelay(10000, 0, allowed), 300000);
  for (const key of Object.keys(allowed)) {
    assert.equal(companions.companionPollDelay(0, 900000, { ...allowed, [key]: false }), null);
  }
  // Repeated resume/network events retain the same last-attempt deadline.
  assert.equal(companions.companionPollDelay(10000, 12000, allowed), 298000);
  assert.equal(companions.companionPollDelay(10000, 13000, allowed), 297000);
});

test("corner collision checks preserve both controls and the space around them", () => {
  const w = 1440, h = 900;
  assert.deepEqual(companions.availableCompanionCorners(w, h, []), { left: true, right: true });
  const center = { left: 200, right: 1240, top: 700, bottom: 890 };
  assert.deepEqual(companions.availableCompanionCorners(w, h, [center]), { left: true, right: true });
  const left = { left: 30, right: 80, top: 830, bottom: 880 };
  assert.deepEqual(companions.availableCompanionCorners(w, h, [left]), { left: false, right: true });
  const right = { left: 1360, right: 1410, top: 830, bottom: 880 };
  assert.deepEqual(companions.availableCompanionCorners(w, h, [left, right]), { left: false, right: false });
  assert.deepEqual(companions.availableCompanionCorners(1439, h, []), { left: false, right: false });
  assert.deepEqual(companions.availableCompanionCorners(w, 399, []), { left: false, right: false });
  assert.deepEqual(companions.availableCompanionCorners(w, h, Array.from({ length: 601 }, () => center)), { left: false, right: false });
});
