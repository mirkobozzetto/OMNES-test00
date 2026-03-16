import { Hono } from 'hono'
import { ZodError } from 'zod'
import { prisma } from '../lib/prisma'
import { formatZodError } from '../lib/validators'
import {
  createStudentSchema,
  updateStudentSchema,
  reorderSchema,
  paginationSchema,
} from '@student-app/shared'

export const students = new Hono()

students.get('/', async (c) => {
  try {
    const query = paginationSchema.parse(c.req.query())

    const where = query.search
      ? {
          OR: [
            { firstName: { contains: query.search } },
            { lastName: { contains: query.search } },
            { email: { contains: query.search } },
          ],
        }
      : undefined

    const [data, total] = await Promise.all([
      prisma.student.findMany({
        where,
        orderBy: { [query.sortBy]: query.sortOrder },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.student.count({ where }),
    ])

    return c.json({
      data,
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize),
      },
    })
  } catch (e) {
    if (e instanceof ZodError) return c.json(formatZodError(e), 400)
    throw e
  }
})

students.get('/:id', async (c) => {
  const student = await prisma.student.findUnique({
    where: { id: c.req.param('id') },
  })
  if (!student) return c.json({ error: 'Student not found' }, 404)
  return c.json(student)
})

students.post('/', async (c) => {
  try {
    const body = createStudentSchema.parse(await c.req.json())
    const maxSort = await prisma.student.aggregate({
      _max: { sortOrder: true },
    })
    const student = await prisma.student.create({
      data: { ...body, sortOrder: (maxSort._max.sortOrder ?? -1) + 1 },
    })
    return c.json(student, 201)
  } catch (e) {
    if (e instanceof ZodError) return c.json(formatZodError(e), 400)
    if (
      e instanceof Error &&
      e.message.includes('Unique constraint failed')
    ) {
      return c.json({ error: 'Email already exists' }, 400)
    }
    throw e
  }
})

students.put('/:id', async (c) => {
  try {
    const body = updateStudentSchema.parse(await c.req.json())
    const student = await prisma.student.update({
      where: { id: c.req.param('id') },
      data: body,
    })
    return c.json(student)
  } catch (e) {
    if (e instanceof ZodError) return c.json(formatZodError(e), 400)
    if (e instanceof Error && e.message.includes('Record to update not found')) {
      return c.json({ error: 'Student not found' }, 404)
    }
    throw e
  }
})

students.patch('/:id/reorder', async (c) => {
  try {
    const { newSortOrder } = reorderSchema.parse(await c.req.json())
    const student = await prisma.student.findUnique({
      where: { id: c.req.param('id') },
    })
    if (!student) return c.json({ error: 'Student not found' }, 404)

    const oldSortOrder = student.sortOrder

    if (newSortOrder === oldSortOrder) {
      return c.json({ success: true })
    }

    await prisma.$transaction(async (tx) => {
      if (newSortOrder > oldSortOrder) {
        await tx.student.updateMany({
          where: {
            sortOrder: { gt: oldSortOrder, lte: newSortOrder },
          },
          data: { sortOrder: { decrement: 1 } },
        })
      } else {
        await tx.student.updateMany({
          where: {
            sortOrder: { gte: newSortOrder, lt: oldSortOrder },
          },
          data: { sortOrder: { increment: 1 } },
        })
      }
      await tx.student.update({
        where: { id: c.req.param('id') },
        data: { sortOrder: newSortOrder },
      })
    })

    return c.json({ success: true })
  } catch (e) {
    if (e instanceof ZodError) return c.json(formatZodError(e), 400)
    throw e
  }
})

students.delete('/:id', async (c) => {
  try {
    await prisma.student.delete({ where: { id: c.req.param('id') } })
    return c.json({ success: true })
  } catch (e) {
    if (e instanceof Error && e.message.includes('Record to delete does not exist')) {
      return c.json({ error: 'Student not found' }, 404)
    }
    throw e
  }
})
