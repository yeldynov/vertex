import {VideoIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

// Internal lookup for search: one per unique video URL, written only by ingestion.
// Joined to lessons on `url == lesson.videoUrl`; never shown as a result on its own.
export const video = defineType({
  name: 'video',
  title: 'Video',
  type: 'document',
  icon: VideoIcon,
  readOnly: true,
  fields: [
    defineField({name: 'url', title: 'URL', type: 'url', validation: (rule) => rule.required()}),
    defineField({
      name: 'chapters',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'chapter',
          fields: [
            defineField({name: 'startSeconds', type: 'number', validation: (rule) => rule.required().min(0)}),
            defineField({name: 'label', type: 'string', validation: (rule) => rule.required()}),
          ],
          preview: {select: {title: 'label', subtitle: 'startSeconds'}},
        }),
      ],
    }),
    defineField({
      name: 'chunks',
      description: 'Transcript in short timed pieces. Never one whole-transcript field.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'chunk',
          fields: [
            defineField({name: 'startSeconds', type: 'number', validation: (rule) => rule.required().min(0)}),
            defineField({name: 'text', type: 'text', validation: (rule) => rule.required()}),
          ],
          preview: {select: {title: 'text', subtitle: 'startSeconds'}},
        }),
      ],
    }),
  ],
  preview: {select: {title: 'url'}},
})
