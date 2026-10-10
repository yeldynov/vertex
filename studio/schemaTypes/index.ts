import {category} from './documents/category'
import {course} from './documents/course'
import {instructor} from './documents/instructor'
import {lesson} from './documents/lesson'
import {video} from './documents/video'
import {learningOutcome} from './objects/learning-outcome'
import {courseModule} from './objects/module'
import {resource} from './objects/resource'

export const schemaTypes = [course, lesson, instructor, category, video, courseModule, learningOutcome, resource]
