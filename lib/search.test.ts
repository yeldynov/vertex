import { test } from "node:test";
import assert from "node:assert/strict";
import { formatTimestamp, groundHit } from "./search.ts";

const lesson = {
  _id: "lesson.b",
  title: "Fetching data",
  slug: "fetching-data",
  duration: 600,
  poster: null,
  keyPoints: ["a", "b", "c", "d"],
  excerpt: "Intro paragraph.",
  course: {
    title: "Next.js",
    slug: "nextjs",
    coverImage: null,
    modules: [
      { title: "Basics", lessonIds: ["lesson.a"] },
      { title: "Data", lessonIds: ["lesson.x", "lesson.b"] },
    ],
  },
  video: { chapter: "Caching", nextChapter: 120, chunk: null, nextChunk: null },
};
const img = () => "img";

test("lesson hit gets labels from array order", () => {
  const r = groundHit({ kind: "lesson", lessonId: "lesson.b", startSeconds: null }, lesson, img)!;
  assert.equal(r.href, "/courses/nextjs/lessons/fetching-data");
  assert.equal(r.lessonLabel, "Lesson 2.2");
  assert.equal(r.moduleLabel, "Module 2");
  assert.deepEqual(r.keyPoints, ["a", "b", "c"]);
  assert.equal(r.seconds, 600);
});

test("video hit needs a real chapter or chunk start", () => {
  const r = groundHit({ kind: "video", lessonId: "lesson.b", startSeconds: 90 }, lesson, img)!;
  assert.equal(r.href, "/courses/nextjs/lessons/fetching-data?t=90");
  assert.equal(r.description, "Caching");
  assert.equal(r.seconds, 30);

  const chunkTail = { ...lesson, video: { chapter: null, nextChapter: null, chunk: "said here", nextChunk: null } };
  assert.equal(groundHit({ kind: "video", lessonId: "lesson.b", startSeconds: 590 }, chunkTail, img)!.seconds, 10);

  const noMatch = { ...lesson, video: { chapter: null, nextChapter: 120, chunk: null, nextChunk: null } };
  assert.equal(groundHit({ kind: "video", lessonId: "lesson.b", startSeconds: 91 }, noMatch, img), null);
  assert.equal(groundHit({ kind: "video", lessonId: "lesson.b", startSeconds: null }, lesson, img), null);
  assert.equal(groundHit({ kind: "video", lessonId: "lesson.b", startSeconds: 90 }, { ...lesson, video: null }, img), null);
});

test("unknown lesson or lesson outside its course is dropped", () => {
  assert.equal(groundHit({ kind: "lesson", lessonId: "nope", startSeconds: null }, null, img), null);
  const orphan = { ...lesson, _id: "lesson.z" };
  assert.equal(groundHit({ kind: "lesson", lessonId: "lesson.z", startSeconds: null }, orphan, img), null);
});

test("timestamps", () => {
  assert.equal(formatTimestamp(765), "12:45");
  assert.equal(formatTimestamp(5), "0:05");
  assert.equal(formatTimestamp(3725), "1:02:05");
});
