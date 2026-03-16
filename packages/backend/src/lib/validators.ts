import type { Context } from 'hono'
import { ZodError, type ZodSchema } from 'zod'

export function parseBody<T>(schema: ZodSchema<T>, data: unknown): T {
  return schema.parse(data)
}

export function parseQuery<T>(schema: ZodSchema<T>, data: Record<string, string>): T {
  return schema.parse(data)
}

export function formatZodError(error: ZodError): {
  error: string
  details: Record<string, string>
} {
  const details: Record<string, string> = {}
  for (const issue of error.issues) {
    const path = issue.path.join('.')
    details[path] = issue.message
  }
  return { error: 'Validation failed', details }
}
