const { execSync } = require('child_process')

try {
  console.log('🚀 Setting up database...')
  execSync('npx prisma migrate deploy', { stdio: 'inherit' })
  
  console.log('🌱 Seeding database...')
  execSync('npx tsx prisma/seed.ts', { stdio: 'inherit' })
  
  console.log('✅ Setup complete')
} catch (error) {
  console.error('❌ Setup failed:', error)
  process.exit(1)
}