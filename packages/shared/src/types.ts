import type { z } from 'zod'
import type {
  studentSchema,
  createStudentSchema,
  updateStudentSchema,
  paginationSchema,
} from './schemas'

export type Student = z.infer<typeof studentSchema>
export type CreateStudent = z.infer<typeof createStudentSchema>
export type UpdateStudent = z.infer<typeof updateStudentSchema>
export type PaginationParams = z.infer<typeof paginationSchema>

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface ErrorResponse {
  error: string
  details?: Record<string, string>
}
