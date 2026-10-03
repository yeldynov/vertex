import { test } from "node:test";
import assert from "node:assert/strict";
import { getPageItems } from "./pagination.ts";

test("getPageItems", () => {
  assert.deepEqual(getPageItems(1, 8), [1, 2, 3, "ellipsis", 8]);
  assert.deepEqual(getPageItems(5, 8), [1, "ellipsis", 4, 5, 6, "ellipsis", 8]);
  assert.deepEqual(getPageItems(8, 8), [1, "ellipsis", 6, 7, 8]);
  assert.deepEqual(getPageItems(3, 4), [1, 2, 3, 4]);
  assert.deepEqual(getPageItems(1, 1), [1]);
  assert.deepEqual(getPageItems(1, 0), []);
});
