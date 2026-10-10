import { test } from "node:test";
import assert from "node:assert/strict";
import { embedUrl, parseStart } from "./video.ts";

test("embed urls per provider", () => {
  const yt = "https://www.youtube-nocookie.com/embed/9602Yzvd7ik?start=90&rel=0";
  assert.equal(embedUrl("https://www.youtube.com/watch?v=9602Yzvd7ik", 90), yt);
  assert.equal(embedUrl("https://youtu.be/9602Yzvd7ik", 90), yt);
  assert.equal(embedUrl("https://www.youtube.com/embed/9602Yzvd7ik", 90), yt);
  assert.equal(embedUrl("https://vimeo.com/76979871", 12), "https://player.vimeo.com/video/76979871#t=12s");
  assert.equal(
    embedUrl("https://iframe.mediadelivery.net/play/1234/abc-def", 5),
    "https://iframe.mediadelivery.net/embed/1234/abc-def?t=5",
  );
  assert.equal(embedUrl("https://www.youtube.com/watch?v=bad\"><x"), null);
  assert.equal(embedUrl("https://example.com/video.mp4"), null);
  assert.equal(embedUrl("not a url"), null);
});

test("start param", () => {
  assert.equal(parseStart("90"), 90);
  assert.equal(parseStart("12.7"), 12);
  assert.equal(parseStart(["30", "40"]), 30);
  assert.equal(parseStart("-5"), 0);
  assert.equal(parseStart("abc"), 0);
  assert.equal(parseStart(undefined), 0);
});
