import {PlayIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

// Providers with both caption ingestion and embed-with-start-time support.
const VIDEO_HOSTS = /(^|\.)(youtube\.com|youtu\.be|vimeo\.com|mediadelivery\.net|b-cdn\.net)$/

export const lesson = defineType({
  name: 'lesson',
  title: 'Lesson',
  type: 'document',
  icon: PlayIcon,
  fields: [
    defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'title'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video URL',
      type: 'url',
      description: 'YouTube, Vimeo or Bunny Stream URL.',
      validation: (rule) =>
        rule.required().custom((url) => {
          if (!url) return true
          try {
            return VIDEO_HOSTS.test(new URL(url).hostname) || 'Use a YouTube, Vimeo or Bunny Stream URL'
          } catch {
            return 'Invalid URL'
          }
        }),
    }),
    defineField({name: 'poster', type: 'image', options: {hotspot: true}, fields: [defineField({name: 'alt', type: 'string'})]}),
    defineField({
      name: 'duration',
      type: 'number',
      description: 'Video length in seconds.',
      validation: (rule) => rule.required().integer().positive(),
    }),
    defineField({
      name: 'freePreview',
      type: 'boolean',
      description: 'Shows a "Free preview" badge. Not access control.',
      initialValue: false,
    }),
    defineField({name: 'studentCount', type: 'number', validation: (rule) => rule.integer().min(0)}),
    defineField({
      name: 'notes',
      type: 'array',
      of: [defineArrayMember({type: 'block'})],
    }),
    defineField({
      name: 'keyPoints',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
    }),
    defineField({name: 'proTip', type: 'text', rows: 3}),
    defineField({
      name: 'resources',
      type: 'array',
      of: [defineArrayMember({type: 'resource'})],
    }),
  ],
  preview: {select: {title: 'title', subtitle: 'slug.current', media: 'poster'}},
})
