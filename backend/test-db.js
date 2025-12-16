const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function test() {
  const users = await prisma.user.findMany({
    select: { email: true, name: true }
  })
  console.log('Users in database:', users.length)
  users.forEach(u => console.log(`- ${u.email} (${u.name})`))
  await prisma.$disconnect()
}
test().catch(console.error)
