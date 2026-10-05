import {CheckmarkCircleIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const learningOutcome = defineType({
  name: 'learningOutcome',
  title: 'Learning outcome',
  type: 'object',
  icon: CheckmarkCircleIcon,
  fields: [
    defineField({
      name: 'icon',
      type: 'string',
      description: 'Lucide icon name rendered by the site.',
      options: {
        list: ['rocket', 'layers', 'zap', 'code', 'server', 'database', 'shield-check', 'gauge', 'puzzle', 'target', 'workflow', 'sparkles', 'shield'],
      },
    }),
    defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'description', type: 'text', rows: 2}),
  ],
})
