import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { createStudentSchema } from '@student-app/shared'
import type { Student, CreateStudent } from '@student-app/shared'
import { useCreateStudent, useUpdateStudent } from '@/hooks/useStudents'
import { toast } from 'sonner'
import { ZodError } from 'zod'

interface StudentFormProps {
  open: boolean
  onClose: () => void
  student: Student | null
}

export function StudentForm({ open, onClose, student }: StudentFormProps) {
  const isEditing = !!student

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [grade, setGrade] = useState('')
  const [enrollmentDate, setEnrollmentDate] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const createMutation = useCreateStudent()
  const updateMutation = useUpdateStudent()

  useEffect(() => {
    if (student) {
      setFirstName(student.firstName)
      setLastName(student.lastName)
      setEmail(student.email)
      setDateOfBirth(new Date(student.dateOfBirth).toISOString().split('T')[0]!)
      setGrade(student.grade)
      setEnrollmentDate(new Date(student.enrollmentDate).toISOString().split('T')[0]!)
    } else {
      setFirstName('')
      setLastName('')
      setEmail('')
      setDateOfBirth('')
      setGrade('')
      setEnrollmentDate('')
    }
    setErrors({})
  }, [student, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    const formData: CreateStudent = {
      firstName,
      lastName,
      email,
      dateOfBirth: new Date(dateOfBirth),
      grade,
      enrollmentDate: new Date(enrollmentDate),
    }

    try {
      createStudentSchema.parse(formData)
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrors: Record<string, string> = {}
        for (const issue of err.issues) {
          const path = issue.path.join('.')
          fieldErrors[path] = issue.message
        }
        setErrors(fieldErrors)
        return
      }
    }

    if (isEditing && student) {
      updateMutation.mutate(
        { id: student.id, data: formData },
        {
          onSuccess: () => {
            toast.success('Student updated')
            onClose()
          },
          onError: (err) => toast.error(err.message),
        }
      )
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => {
          toast.success('Student created')
          onClose()
        },
        onError: (err) => toast.error(err.message),
      })
    }
  }

  if (!open) return null

  const isPending = createMutation.isPending || updateMutation.isPending

  const GRADES = ['6eme', '5eme', '4eme', '3eme', '2nde', '1ere', 'Terminale']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white border border-zinc-200 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <h2 className="text-sm font-semibold text-zinc-900">
            {isEditing ? 'Edit Student' : 'Add Student'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-zinc-100 rounded transition-colors">
            <X className="w-4 h-4 text-zinc-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-tight mb-1">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full h-8 px-3 bg-zinc-50 border border-zinc-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-zinc-300"
              />
              {errors.firstName && <p className="text-[10px] text-red-500 mt-0.5">{errors.firstName}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-tight mb-1">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full h-8 px-3 bg-zinc-50 border border-zinc-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-zinc-300"
              />
              {errors.lastName && <p className="text-[10px] text-red-500 mt-0.5">{errors.lastName}</p>}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-tight mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-8 px-3 bg-zinc-50 border border-zinc-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-zinc-300"
            />
            {errors.email && <p className="text-[10px] text-red-500 mt-0.5">{errors.email}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-tight mb-1">Date of Birth</label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full h-8 px-3 bg-zinc-50 border border-zinc-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-zinc-300"
              />
              {errors.dateOfBirth && <p className="text-[10px] text-red-500 mt-0.5">{errors.dateOfBirth}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-tight mb-1">Grade</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full h-8 px-3 bg-zinc-50 border border-zinc-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-zinc-300"
              >
                <option value="">Select...</option>
                {GRADES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              {errors.grade && <p className="text-[10px] text-red-500 mt-0.5">{errors.grade}</p>}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-tight mb-1">Enrollment Date</label>
            <input
              type="date"
              value={enrollmentDate}
              onChange={(e) => setEnrollmentDate(e.target.value)}
              className="w-full h-8 px-3 bg-zinc-50 border border-zinc-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-zinc-300"
            />
            {errors.enrollmentDate && <p className="text-[10px] text-red-500 mt-0.5">{errors.enrollmentDate}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-8 px-3 border border-zinc-200 rounded-md text-xs font-medium hover:bg-zinc-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="h-8 px-4 bg-zinc-900 text-white rounded-md text-xs font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              {isPending ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
