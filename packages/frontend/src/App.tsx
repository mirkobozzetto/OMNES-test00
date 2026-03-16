import { Toaster } from 'sonner'
import { AppLayout } from '@/components/layout/AppLayout'
import { StudentTable } from '@/components/students/StudentTable'

export function App() {
  return (
    <AppLayout>
      <StudentTable />
      <Toaster richColors position="bottom-right" />
    </AppLayout>
  )
}
