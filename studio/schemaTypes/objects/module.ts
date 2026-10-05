import {FolderIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const courseModule = defineType({
  name: 'module',
  title: 'Module',
  type: 'object',
  icon: FolderIcon,
  fields: [
    defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'summary', type: 'text', rows: 2}),
    defineField({
      name: 'lessons',
      type: 'array',
      description: 'Every lesson must actually cover this module’s topic.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'lesson'}]})],
      validation: (rule) => rule.required().min(1).unique(),
    }),
  ],
  preview: {
    select: {title: 'title', lessons: 'lessons'},
    prepare: ({title, lessons}) => ({title, subtitle: `${lessons?.length ?? 0} lessons`}),
  },
})
