import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_DATASET,
  },
  deployment: {appId: 'yxd2fw9d3bxasa21so9amwfw'},
  typegen: {
    path: '../sanity/**/*.ts',
    schema: './schema.json',
    generates: '../sanity.types.ts',
  },
})
