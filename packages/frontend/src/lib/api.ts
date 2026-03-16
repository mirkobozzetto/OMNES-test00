import type {
  Student,
  CreateStudent,
  UpdateStudent,
  PaginatedResponse,
  PaginationParams,
} from '@student-app/shared'

const BASE_URL = '/api/students'

export async function fetchStudents(
  params: PaginationParams
): Promise<PaginatedResponse<Student>> {
  const searchParams = new URLSearchParams()
  searchParams.set('page', String(params.page))
  searchParams.set('pageSize', String(params.pageSize))
  searchParams.set('sortBy', params.sortBy)
  searchParams.set('sortOrder', params.sortOrder)
  if (params.search) searchParams.set('search', params.search)

  const res = await fetch(`${BASE_URL}?${searchParams}`)
  if (!res.ok) throw new Error('Failed to fetch students')
  return res.json()
}

export async function fetchStudent(id: string): Promise<Student> {
  const res = await fetch(`${BASE_URL}/${id}`)
  if (!res.ok) throw new Error('Student not found')
  return res.json()
}

export async function createStudent(data: CreateStudent): Promise<Student> {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to create student')
  }
  return res.json()
}

export async function updateStudent(
  id: string,
  data: UpdateStudent
): Promise<Student> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to update student')
  }
  return res.json()
}

export async function deleteStudent(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to delete student')
  }
}

export async function reorderStudent(
  id: string,
  newSortOrder: number
): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}/reorder`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newSortOrder }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to reorder student')
  }
}
