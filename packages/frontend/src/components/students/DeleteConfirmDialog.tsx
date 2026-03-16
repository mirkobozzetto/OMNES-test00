import { X, AlertTriangle } from 'lucide-react'
import type { Student } from '@student-app/shared'
import { useDeleteStudent } from '@/hooks/useStudents'
import { toast } from 'sonner'

interface DeleteConfirmDialogProps {
  student: Student | null
  onClose: () => void
}

export function DeleteConfirmDialog({ student, onClose }: DeleteConfirmDialogProps) {
  const deleteMutation = useDeleteStudent()

  if (!student) return null

  const handleDelete = () => {
    deleteMutation.mutate(student.id, {
      onSuccess: () => {
        toast.success(`${student.firstName} ${student.lastName} deleted`)
        onClose()
      },
      onError: (err) => toast.error(err.message),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white border border-zinc-200 rounded-lg shadow-xl w-full max-w-sm mx-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <h2 className="text-sm font-semibold text-zinc-900">Delete Student</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-zinc-100 rounded transition-colors">
            <X className="w-4 h-4 text-zinc-500" />
          </button>
        </div>
        <div className="p-5">
          <p className="text-xs text-zinc-600">
            Are you sure you want to delete <span className="font-semibold text-zinc-900">{student.firstName} {student.lastName}</span>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 mt-5">
            <button
              onClick={onClose}
              className="h-8 px-3 border border-zinc-200 rounded-md text-xs font-medium hover:bg-zinc-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="h-8 px-4 bg-red-600 text-white rounded-md text-xs font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
