import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const envPath = path.resolve(process.cwd(), '.env');
const prismaSchemaPath = path.resolve(process.cwd(), 'prisma/schema.prisma');
const supabaseSchemaPath = path.resolve(process.cwd(), 'prisma/schema.supabase.prisma');

console.log('⚡ Checking Supabase Connection Configuration...\n');

if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found.');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');

const dbUrlMatch = envContent.match(/^DATABASE_URL=["']?(postgresql:\/\/[^"'\r\n]+)["']?/m);
const directUrlMatch = envContent.match(/^DIRECT_URL=["']?(postgresql:\/\/[^"'\r\n]+)["']?/m);

const isPlaceholder = (str) =>
  !str || str.includes('[YOUR-PROJECT-REF]') || str.includes('your-project-ref') || str.includes('[YOUR-PASSWORD]');

if (!dbUrlMatch || isPlaceholder(dbUrlMatch[1])) {
  console.log('ℹ️  Supabase PostgreSQL credentials are not yet set in .env');
  console.log('------------------------------------------------------------------');
  console.log('To connect your Supabase database:');
  console.log('1. Go to your Supabase Project: https://supabase.com/dashboard');
  console.log('2. Click: Project Settings -> Database -> Connection string');
  console.log('3. Copy the URI (Mode: Transaction & Session)');
  console.log('4. Add them to .env:');
  console.log('   DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"');
  console.log('   DIRECT_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"');
  console.log('   NEXT_PUBLIC_SUPABASE_URL="https://[REF].supabase.co"');
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGci..."');
  console.log('------------------------------------------------------------------');
  console.log('Then run: npm run db:supabase:push && npm run db:supabase:seed');
  process.exit(0);
}

console.log('✅ Found valid Supabase PostgreSQL DATABASE_URL in .env');

try {
  console.log('🔄 Syncing schema to PostgreSQL for Supabase...');
  const supabaseSchema = fs.readFileSync(supabaseSchemaPath, 'utf8');
  fs.writeFileSync(prismaSchemaPath, supabaseSchema);

  console.log('🚀 Pushing database tables to Supabase...');
  execSync('npx prisma db push', { stdio: 'inherit' });

  console.log('🌱 Seeding Supabase with all 64 districts, buses, pricing, and routes...');
  execSync('node scripts/seed.mjs', { stdio: 'inherit' });

  console.log('\n🎉 Successfully connected and migrated to Supabase!');
} catch (error) {
  console.error('❌ Migration error:', error.message);
  process.exit(1);
}
