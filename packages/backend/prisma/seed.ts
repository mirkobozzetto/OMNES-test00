import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { faker } from '@faker-js/faker'

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./prisma/dev.db',
})

const prisma = new PrismaClient({ adapter })

const GRADES = ['6eme', '5eme', '4eme', '3eme', '2nde', '1ere', 'Terminale']
const STUDENT_COUNT = 2000

async function main() {
  faker.seed(42)

  await prisma.student.deleteMany()

  const students = Array.from({ length: STUDENT_COUNT }, (_, i) => {
    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()
    return {
      firstName,
      lastName,
      email: faker.internet
        .email({ firstName, lastName })
        .toLowerCase()
        .replace('@', `${i}@`),
      dateOfBirth: faker.date.between({
        from: '2005-01-01',
        to: '2012-12-31',
      }),
      grade: GRADES[Math.floor(Math.random() * GRADES.length)]!,
      enrollmentDate: faker.date.between({
        from: '2023-09-01',
        to: '2026-01-15',
      }),
      sortOrder: i,
    }
  })

  await prisma.student.createMany({ data: students })

  const count = await prisma.student.count()
  console.log(`Seeded ${count} students`)
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
