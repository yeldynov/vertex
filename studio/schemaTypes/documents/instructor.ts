import {UserIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const instructor = defineType({
  name: 'instructor',
  title: 'Instructor',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({name: 'name', type: 'string', validation: (rule) => rule.required()}),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'name'},
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'photo', type: 'image', options: {hotspot: true}}),
    defineField({name: 'expertise', type: 'string', description: 'e.g. "Senior Frontend Engineer"'}),
    defineField({name: 'bio', type: 'array', of: [defineArrayMember({type: 'block'})]}),
  ],
  preview: {select: {title: 'name', subtitle: 'expertise', media: 'photo'}},
})
