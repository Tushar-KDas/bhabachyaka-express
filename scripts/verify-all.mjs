async function testUrl(url) {
  try {
    const res = await fetch(url);
    return { url, status: res.status, ok: res.ok };
  } catch (err) {
    return { url, error: err.message, ok: false };
  }
}

async function run() {
  console.log('🔍 Testing all platform routes and APIs on http://localhost:3000...\n');

  const urls = [
    // 1. Core Public & Bilingual Pages
    'http://localhost:3000/',
    'http://localhost:3000/bn',
    'http://localhost:3000/en',
    'http://localhost:3000/bn/search?origin=Dhaka&destination=Chattogram',
    'http://localhost:3000/en/search?origin=Dhaka&destination=Chattogram',
    
    // 2. Booking Flow & Confirmation
    'http://localhost:3000/bn/booking/confirmation/BE9123456',
    'http://localhost:3000/bn/manage-booking',
    'http://localhost:3000/bn/account',

    // 3. Operational Workstations & Dashboards
    'http://localhost:3000/bn/counter/pos',
    'http://localhost:3000/bn/operator/dashboard',
    'http://localhost:3000/bn/supervisor',
    'http://localhost:3000/bn/boarding',
    'http://localhost:3000/bn/super-admin',

    // 4. Auth & Legal
    'http://localhost:3000/bn/login',
    'http://localhost:3000/bn/register',
    'http://localhost:3000/bn/terms',
    'http://localhost:3000/bn/privacy',
    'http://localhost:3000/bn/refund-policy',

    // 5. Authoritative Backend APIs
    'http://localhost:3000/api/trips/search?origin=Dhaka&destination=Chattogram',
    'http://localhost:3000/api/bookings/BE9123456',
    'http://localhost:3000/api/operator/stats',
    'http://localhost:3000/api/super-admin/stats',
  ];

  let passed = 0;
  let failed = 0;

  for (const u of urls) {
    const r = await testUrl(u);
    if (r.ok) {
      console.log(`✅ [HTTP ${r.status}] ${r.url}`);
      passed++;
    } else {
      console.log(`❌ [FAIL ${r.status || r.error}] ${r.url}`);
      failed++;
    }
  }

  console.log(`\n========================================`);
  console.log(`Total URLs Tested: ${urls.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`========================================`);
}

run();
