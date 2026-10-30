import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const mode = process.argv[2]?.toLowerCase() || 'toggle';

const envPath = path.resolve(process.cwd(), '.env');
const schemaPath = path.resolve(process.cwd(), 'prisma/schema.prisma');

const NEON_DB_URL = "postgresql://neondb_owner:npg_TNS4Emiuf8UK@ep-frosty-dawn-az46ddlc-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const NEON_DIRECT_URL = "postgresql://neondb_owner:npg_TNS4Emiuf8UK@ep-frosty-dawn-az46ddlc.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
const SQLITE_URL = "file:./dev.db";

let currentEnv = fs.readFileSync(envPath, 'utf8');
const isCurrentlySqlite = currentEnv.includes('DATABASE_URL="file:./dev.db"');

let target = mode;
if (mode === 'toggle') {
  target = isCurrentlySqlite ? 'neon' : 'local';
}

console.log(`\n⚡ Switching Database mode to: [${target.toUpperCase()}]...\n`);

if (target === 'local' || target === 'sqlite') {
  // Switch to SQLite
  currentEnv = currentEnv.replace(/DATABASE_URL=["'][^"'\r\n]+["']/, `DATABASE_URL="${SQLITE_URL}"`);
  fs.writeFileSync(envPath, currentEnv);

  let schema = fs.readFileSync(schemaPath, 'utf8');
  schema = schema.replace(/provider\s*=\s*"postgresql"/, 'provider = "sqlite"');
  schema = schema.replace(/\s*directUrl\s*=\s*env\("DIRECT_URL"\)/, '');
  fs.writeFileSync(schemaPath, schema);

  console.log('🔄 Pushing SQLite schema and seeding locally...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  execSync('node scripts/seed.mjs', { stdio: 'inherit' });
  console.log('\n🚀 Switched to SUPERFAST Local SQLite database (0ms latency)!');
} else {
  // Switch to Neon PostgreSQL (Singapore)
  currentEnv = currentEnv.replace(/DATABASE_URL=["'][^"'\r\n]+["']/, `DATABASE_URL="${NEON_DB_URL}"`);
  fs.writeFileSync(envPath, currentEnv);

  let schema = fs.readFileSync(schemaPath, 'utf8');
  if (schema.includes('provider = "sqlite"')) {
    schema = schema.replace('provider = "sqlite"', 'provider  = "postgresql"\n  directUrl = env("DIRECT_URL")');
    fs.writeFileSync(schemaPath, schema);
  }

  console.log('🔄 Syncing Prisma Client with Singapore Neon PostgreSQL...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('\n🚀 Switched to Cloud Neon PostgreSQL (Singapore - ap-southeast-1)!');
}
