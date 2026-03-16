import { useState, useDeferredValue, useCallback, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table'
import { DragDropProvider } from '@dnd-kit/react'
import { useSortable } from '@dnd-kit/react/sortable'
import {
  Search,
  Plus,
  GripVertical,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import type { Student } from '@student-app/shared'
import { useStudents, useReorderStudent } from '@/hooks/useStudents'
import { StudentForm } from './StudentForm'
import { DeleteConfirmDialog } from './DeleteConfirmDialog'

function DraggableRow({
  student,
  children,
}: {
  student: Student
  children: React.ReactNode
}) {
  const { ref, isDragging } = useSortable({ id: student.id, index: 0 })
  return (
    <tr
      ref={ref}
      className={`group border-b border-zinc-100 last:border-0 hover:bg-zinc-50/80 transition-colors ${isDragging ? 'opacity-50 shadow-lg bg-white z-10' : ''}`}
    >
      {children}
    </tr>
  )
}

export function StudentTable() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(25)
  const [sorting, setSorting] = useState<SortingState>([{ id: 'sortOrder', desc: false }])
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [showColumnMenu, setShowColumnMenu] = useState(false)

  const [formOpen, setFormOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null)

  const VALID_SORT_FIELDS = ['firstName', 'lastName', 'email', 'grade', 'enrollmentDate', 'sortOrder'] as const
  type SortField = typeof VALID_SORT_FIELDS[number]
  const rawSortBy = sorting[0]?.id ?? 'sortOrder'
  const sortBy: SortField = VALID_SORT_FIELDS.includes(rawSortBy as SortField) ? (rawSortBy as SortField) : 'sortOrder'
  const sortOrder = sorting[0]?.desc ? 'desc' as const : 'asc' as const

  const { data, isLoading, isError, refetch } = useStudents({
    page,
    pageSize,
    sortBy,
    sortOrder,
    search: deferredSearch || undefined,
  })

  const reorderMutation = useReorderStudent()

  const columnHelper = createColumnHelper<Student>()

  const columns = useMemo(() => [
    columnHelper.display({
      id: 'drag',
      header: () => null,
      cell: () => (
        <div className="text-zinc-300 group-hover:text-zinc-400 transition-colors cursor-grab active:cursor-grabbing">
          <GripVertical className="w-3.5 h-3.5" />
        </div>
      ),
      size: 32,
      enableHiding: false,
    }),
    columnHelper.accessor('firstName', {
      header: 'First Name',
      cell: (info) => <span className="text-xs font-medium text-zinc-700">{info.getValue()}</span>,
    }),
    columnHelper.accessor('lastName', {
      header: 'Last Name',
      cell: (info) => <span className="text-xs text-zinc-600">{info.getValue()}</span>,
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      cell: (info) => <span className="text-xs text-zinc-500 font-mono tracking-tighter">{info.getValue()}</span>,
    }),
    columnHelper.accessor('grade', {
      header: 'Grade',
      cell: (info) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('enrollmentDate', {
      header: 'Enrollment',
      cell: (info) => (
        <span className="text-xs text-zinc-500">
          {new Date(info.getValue()).toLocaleDateString('fr-FR')}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: () => null,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => { setEditingStudent(row.original); setFormOpen(true) }}
            className="p-1 hover:bg-zinc-200 rounded transition-colors text-zinc-500"
          >
            <Edit3 className="w-3 h-3" />
          </button>
          <button
            onClick={() => setDeletingStudent(row.original)}
            className="p-1 hover:bg-red-50 hover:text-red-600 rounded transition-colors text-zinc-500"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      ),
      size: 64,
      enableHiding: false,
    }),
  ], [columnHelper])

  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
    pageCount: data?.pagination.totalPages ?? 0,
  })

  const handleDragEnd = useCallback((event: Parameters<NonNullable<React.ComponentProps<typeof DragDropProvider>['onDragEnd']>>[0]) => {
    const sourceId = event.operation.source?.id
    const targetId = event.operation.target?.id
    if (!sourceId || !targetId || sourceId === targetId || !data?.data) return

    const sourceIndex = data.data.findIndex((s) => s.id === String(sourceId))
    const targetIndex = data.data.findIndex((s) => s.id === String(targetId))
    if (sourceIndex === -1 || targetIndex === -1) return

    const targetStudent = data.data[targetIndex]
    if (!targetStudent) return

    reorderMutation.mutate({ id: String(sourceId), newSortOrder: targetStudent.sortOrder })
  }, [data?.data, reorderMutation])

  const totalPages = data?.pagination.totalPages ?? 0
  const total = data?.pagination.total ?? 0

  const visiblePages = useMemo(() => {
    const pages: (number | string)[] = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (page > 3) pages.push('...')
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i)
      if (page < totalPages - 2) pages.push('...')
      pages.push(totalPages)
    }
    return pages
  }, [page, totalPages])

  const toggleableColumns = table.getAllColumns().filter((col) => col.getCanHide())

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full h-8 pl-8 pr-3 bg-zinc-50 border border-zinc-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-zinc-300 transition-all placeholder:text-zinc-400"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowColumnMenu(!showColumnMenu)}
              className="h-8 px-3 flex items-center gap-2 border border-zinc-200 rounded-md text-xs font-medium hover:bg-zinc-50 transition-colors"
            >
              Columns
              <ChevronDown className="w-3 h-3" />
            </button>
            {showColumnMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-zinc-200 rounded-md shadow-lg z-20 py-1 min-w-[160px]">
                {toggleableColumns.map((col) => (
                  <label key={col.id} className="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-zinc-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={col.getIsVisible()}
                      onChange={col.getToggleVisibilityHandler()}
                      className="w-3 h-3 rounded border-zinc-300"
                    />
                    {typeof col.columnDef.header === 'string' ? col.columnDef.header : col.id}
                  </label>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => { setEditingStudent(null); setFormOpen(true) }}
            className="h-8 px-3 flex items-center gap-2 bg-zinc-900 text-white rounded-md text-xs font-medium hover:bg-zinc-800 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add Student
          </button>
        </div>
      </div>

      <div className="border border-zinc-200 rounded-lg overflow-hidden bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 bg-zinc-100 rounded animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-8 text-center">
            <p className="text-xs text-zinc-500 mb-2">Failed to load students</p>
            <button onClick={() => refetch()} className="text-xs text-zinc-700 underline">Retry</button>
          </div>
        ) : data?.data.length === 0 ? (
          <div className="p-12 text-center">
            <Search className="w-6 h-6 text-zinc-300 mx-auto mb-2" />
            <p className="text-xs text-zinc-400">No students found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/50">
                  {table.getHeaderGroups().map((headerGroup) =>
                    headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-2.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-tight"
                        style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                      >
                        {header.isPlaceholder ? null : header.column.getCanSort() ? (
                          <button
                            onClick={() => {
                              const currentSort = sorting[0]
                              if (currentSort?.id === header.column.id) {
                                setSorting([{ id: header.column.id, desc: !currentSort.desc }])
                              } else {
                                setSorting([{ id: header.column.id, desc: false }])
                              }
                              setPage(1)
                            }}
                            className="flex items-center gap-1 hover:text-zinc-700 transition-colors"
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {sorting[0]?.id === header.column.id ? (
                              sorting[0]?.desc ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />
                            ) : (
                              <ArrowUpDown className="w-3 h-3 opacity-30" />
                            )}
                          </button>
                        ) : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                      </th>
                    ))
                  )}
                </tr>
              </thead>
              <DragDropProvider onDragEnd={handleDragEnd}>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <DraggableRow key={row.original.id} student={row.original}>
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-2.5">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </DraggableRow>
                  ))}
                </tbody>
              </DragDropProvider>
            </table>
          </div>
        )}

        {data && data.data.length > 0 && (
          <div className="px-4 py-3 bg-zinc-50/50 border-t border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-zinc-400 font-medium uppercase">
                Showing {((page - 1) * pageSize) + 1}-{Math.min(page * pageSize, total)} of {total}
              </span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }}
                className="h-6 text-[10px] border border-zinc-200 rounded bg-white text-zinc-600 px-1"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1 border border-zinc-200 rounded bg-white hover:bg-zinc-50 disabled:opacity-30 transition-all"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-center px-1 gap-1">
                {visiblePages.map((p, i) =>
                  typeof p === 'string' ? (
                    <span key={`dots-${i}`} className="text-zinc-300 text-[10px] px-0.5">...</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-5 h-5 flex items-center justify-center text-[10px] font-medium rounded transition-colors ${
                        p === page ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-900'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1 border border-zinc-200 rounded bg-white hover:bg-zinc-50 disabled:opacity-30 transition-all"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <StudentForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingStudent(null) }}
        student={editingStudent}
      />

      <DeleteConfirmDialog
        student={deletingStudent}
        onClose={() => setDeletingStudent(null)}
      />
    </div>
  )
}
