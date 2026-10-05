import { test } from "node:test";
import assert from "node:assert/strict";
import { formatCount, formatDuration, lessonLabel, moduleLabel } from "./course.ts";

test("labels and durations", () => {
  assert.equal(moduleLabel(4), "Module 5");
  assert.equal(lessonLabel(4, 0), "Lesson 5.1");
  assert.equal(formatDuration(66240), "18h 24m");
  assert.equal(formatDuration(754), "12m 34s");
  assert.equal(formatDuration(600), "10m");
  assert.equal(formatDuration(42), "42s");
  assert.equal(formatCount(18240), "18.2k");
  assert.equal(formatCount(2100), "2.1k");
  assert.equal(formatCount(950), "950");
});
