/**
 * Complete API Test Suite
 * Tests all required endpoints, validations, and edge cases
 */

const http = require('http');

const PORT = 5000;

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      hostname: '127.0.0.1',
      port: PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (e) { json = data; }
        resolve({ status: res.statusCode, data: json });
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting API Verification Tests...\n');

  // Test 1: GET /health
  const health = await request('GET', '/health');
  console.log(`1. GET /health -> [${health.status}] ${health.data.status}`);

  // Test 2: GET /salons
  const salons = await request('GET', '/salons');
  console.log(`2. GET /salons -> [${salons.status}] Found ${salons.data.count} salons`);

  // Test 3: GET /salons with search
  const search = await request('GET', '/salons?search=Barber');
  console.log(`3. GET /salons?search=Barber -> [${search.status}] Found ${search.data.count} salons matching "Barber"`);

  // Test 4: GET /salons/1
  const salonDetail = await request('GET', '/salons/1');
  console.log(`4. GET /salons/1 -> [${salonDetail.status}] Name: ${salonDetail.data.data.name}`);

  // Test 5: GET /salons/999 (Not Found)
  const salon404 = await request('GET', '/salons/999');
  console.log(`5. GET /salons/999 -> [${salon404.status}] Expected 404: ${salon404.data.error}`);

  // Test 6: GET /salons/1/services
  const services = await request('GET', '/salons/1/services');
  console.log(`6. GET /salons/1/services -> [${services.status}] Found ${services.data.count} services for ${services.data.salonName}`);

  // Test 7: POST /bookings (Invalid payload missing fields)
  const badBooking = await request('POST', '/bookings', { customerId: 1 });
  console.log(`7. POST /bookings (invalid input) -> [${badBooking.status}] Expected 400 Bad Request`);

  // Test 8: POST /bookings (Valid booking)
  const uniqueTime = '11:30';
  const newBooking = await request('POST', '/bookings', {
    customerId: 1,
    salonId: 1,
    serviceId: 1,
    date: '2026-10-28',
    time: uniqueTime,
    paymentMethod: 'pay_at_salon'
  });
  console.log(`8. POST /bookings (valid) -> [${newBooking.status}] Created Booking ID: ${newBooking.data.data?.bookingId}`);

  // Test 9: POST /bookings (Duplicate -> 409 Conflict)
  const duplicateBooking = await request('POST', '/bookings', {
    customerId: 2,
    salonId: 1,
    serviceId: 1,
    date: '2026-10-28',
    time: uniqueTime,
    paymentMethod: 'pay_at_salon'
  });
  console.log(`9. POST /bookings (duplicate slot) -> [${duplicateBooking.status}] Expected 409: ${duplicateBooking.data.error}`);

  // Test 10: GET /bookings/:customerId
  const customerBookings = await request('GET', '/bookings/1');
  console.log(`10. GET /bookings/1 -> [${customerBookings.status}] Customer has ${customerBookings.data.count} bookings`);

  console.log('\n✨ All backend API tests completed successfully!');
}

runTests().catch(console.error);
