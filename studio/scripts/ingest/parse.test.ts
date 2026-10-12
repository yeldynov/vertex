import {test} from 'node:test'
import assert from 'node:assert/strict'
import {parseDescriptionChapters, parseJson3, parseProvider, parseVtt, toChunks, videoDocId} from './parse.ts'

test('doc id strips invalid characters, including dots', () => {
  assert.equal(videoDocId('https://www.youtube.com/watch?v=9602Yzvd7ik'), 'video-httpswwwyoutubecomwatchv9602Yzvd7ik')
  assert.ok(videoDocId(`https://x.com/${'a'.repeat(300)}`).length <= 128)
})

test('providers', () => {
  assert.deepEqual(parseProvider('https://youtu.be/9602Yzvd7ik'), {kind: 'youtube', id: '9602Yzvd7ik'})
  assert.deepEqual(parseProvider('https://www.youtube.com/watch?v=9602Yzvd7ik'), {kind: 'youtube', id: '9602Yzvd7ik'})
  assert.deepEqual(parseProvider('https://vimeo.com/76979871'), {kind: 'vimeo', id: '76979871'})
  assert.deepEqual(parseProvider('https://iframe.mediadelivery.net/play/1234/abc-def'), {kind: 'bunny', library: '1234', id: 'abc-def'})
  assert.equal(parseProvider('https://example.com/a.mp4'), null)
  assert.equal(parseProvider('nope'), null)
})

test('description chapters', () => {
  const desc = 'Great video\n0:00 Intro\n(1:05) What are RSC?\n12:30 - Streaming\n1:02:03 Wrap up\nfollow me'
  assert.deepEqual(parseDescriptionChapters(desc), [
    {startSeconds: 0, label: 'Intro'},
    {startSeconds: 65, label: 'What are RSC?'},
    {startSeconds: 750, label: 'Streaming'},
    {startSeconds: 3723, label: 'Wrap up'},
  ])
  assert.deepEqual(parseDescriptionChapters('0:10 a\n0:20 b\n0:30 c'), [], 'must start at 0:00')
  assert.deepEqual(parseDescriptionChapters('0:00 a\n0:20 b'), [], 'needs 3+')
})

test('json3 and vtt cues', () => {
  assert.deepEqual(
    parseJson3({events: [{tStartMs: 0}, {tStartMs: 1500, segs: [{utf8: 'hello'}, {utf8: ' world'}]}, {tStartMs: 2000, segs: [{utf8: '\n'}]}, {tStartMs: 3000, segs: [{utf8: '[Music]'}]}]}),
    [{start: 1.5, text: 'hello world'}],
  )
  const vtt = 'WEBVTT\n\n1\n00:00:01.500 --> 00:00:03.000\n<v Bob>Hi &amp; welcome</v>\n\n00:01:02.000 --> 00:01:04.000\nnext\nline'
  assert.deepEqual(parseVtt(vtt), [
    {start: 1.5, text: 'Hi & welcome'},
    {start: 62, text: 'next line'},
  ])
})

test('chunks are ~30s with whole, increasing starts', () => {
  const cues = Array.from({length: 40}, (_, i) => ({start: i * 2.7, text: `w${i}`}))
  const chunks = toChunks(cues)
  assert.equal(chunks[0].startSeconds, 0)
  for (let i = 1; i < chunks.length; i++) {
    assert.ok(Number.isInteger(chunks[i].startSeconds))
    assert.ok(chunks[i].startSeconds >= chunks[i - 1].startSeconds + 29)
  }
  assert.equal(chunks.map((c) => c.text).join(' ').split(' ').length, 40)
  assert.deepEqual(toChunks([{start: 0, text: 'a'}, {start: 1, text: 'a'}]), [{startSeconds: 0, text: 'a'}])
  assert.deepEqual(toChunks([]), [])
})
