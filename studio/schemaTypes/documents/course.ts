import {BookIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const course = defineType({
  name: 'course',
  title: 'Course',
  type: 'document',
  icon: BookIcon,
  fields: [
    defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'title'},
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'summary', type: 'text', rows: 3, validation: (rule) => rule.required()}),
    defineField({
      name: 'coverImage',
      type: 'image',
      description: 'Course icon shown on cards and the course page.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'level',
      type: 'string',
      options: {
        list: [
          {title: 'Beginner', value: 'beginner'},
          {title: 'Intermediate', value: 'intermediate'},
          {title: 'Advanced', value: 'advanced'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'price',
      type: 'number',
      description: 'USD. 0 means free.',
      validation: (rule) => rule.min(0),
    }),
    defineField({name: 'popular', type: 'boolean', initialValue: false}),
    defineField({name: 'studentCount', type: 'number', validation: (rule) => rule.integer().min(0)}),
    defineField({
      name: 'learningOutcomes',
      type: 'array',
      of: [defineArrayMember({type: 'learningOutcome'})],
    }),
    defineField({
      name: 'instructor',
      type: 'reference',
      to: [{type: 'instructor'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      type: 'reference',
      to: [{type: 'category'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'modules',
      type: 'array',
      description: 'Order matters: "Module 1", "Lesson 1.1" labels are derived from it.',
      of: [defineArrayMember({type: 'module'})],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: {title: 'title', level: 'level', modules: 'modules', media: 'coverImage'},
    prepare: ({title, level, modules, media}) => ({
      title,
      subtitle: [`${modules?.length ?? 0} modules`, level].filter(Boolean).join(' · '),
      media,
    }),
  },
})
