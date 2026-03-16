import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import type { PaginationParams, CreateStudent, UpdateStudent } from '@student-app/shared'
import {
  fetchStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  reorderStudent,
} from '@/lib/api'

export function useStudents(params: PaginationParams) {
  return useQuery({
    queryKey: ['students', params],
    queryFn: () => fetchStudents(params),
  })
}

export function useCreateStudent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateStudent) => createStudent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
}

export function useUpdateStudent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStudent }) =>
      updateStudent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
}

export function useDeleteStudent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteStudent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
}

export function useReorderStudent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, newSortOrder }: { id: string; newSortOrder: number }) =>
      reorderStudent(id, newSortOrder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
}
