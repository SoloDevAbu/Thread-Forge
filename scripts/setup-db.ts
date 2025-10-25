import { PrismaClient } from '../app/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('Setting up database...')
  
  // The Prisma schema will handle creating the tables
  // This script can be used for any additional setup if needed
  
  console.log('Database setup complete!')
  console.log('Run the following commands:')
  console.log('1. npx prisma generate')
  console.log('2. npx prisma db push')
  console.log('3. npm run dev')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
