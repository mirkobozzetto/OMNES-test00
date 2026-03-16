import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { corsMiddleware } from './middleware/cors'
import { students } from './routes/students'

const app = new Hono()

app.use('*', corsMiddleware)
app.route('/api/students', students)

app.use('/*', serveStatic({ root: './public' }))
app.use('/*', serveStatic({ root: './public', path: 'index.html' }))

const port = Number(process.env.PORT) || 3000

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Server running on http://localhost:${info.port}`)
})
