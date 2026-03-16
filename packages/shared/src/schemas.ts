import { z } from 'zod'

export const studentSchema = z.object({
  id: z.string().cuid(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  dateOfBirth: z.coerce.date(),
  grade: z.string().min(1).max(20),
  enrollmentDate: z.coerce.date(),
  sortOrder: z.number().int().min(0),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const createStudentSchema = studentSchema.omit({
  id: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
})

export const updateStudentSchema = createStudentSchema.partial()

export const reorderSchema = z.object({
  newSortOrder: z.number().int().min(0),
})

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce
    .number()
    .int()
    .refine((v) => [25, 50, 100].includes(v), {
      message: 'pageSize must be 25, 50, or 100',
    })
    .default(25),
  sortBy: z
    .enum([
      'firstName',
      'lastName',
      'email',
      'grade',
      'enrollmentDate',
      'sortOrder',
    ])
    .default('sortOrder'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  search: z.string().optional(),
})
