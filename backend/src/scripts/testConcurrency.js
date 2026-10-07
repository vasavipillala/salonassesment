/**
 * Concurrency Test Script (Part D Verification)
 * Simulates two customers attempting to book the exact same salon service
 * at the exact same date and time simultaneously.
 */

const http = require('http');

const PORT = process.env.PORT || 5000;
const TEST_DATE = '2026-10-25';
const TEST_TIME = '15:00';

function sendBookingRequest(customerId, clientLabel) {
  return new Promise((resolve) => {
    const payload = JSON.stringify({
      customerId,
      salonId: 1,
      serviceId: 2,
      date: TEST_DATE,
      time: TEST_TIME,
      paymentMethod: 'pay_at_salon',
      notes: `Concurrent test from ${clientLabel}`
    });

    const options = {
      hostname: '127.0.0.1',
      port: PORT,
      path: '/bookings',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(body); } catch (e) { parsed = body; }
        resolve({
          client: clientLabel,
          statusCode: res.statusCode,
          response: parsed
        });
      });
    });

    req.on('error', (err) => {
      resolve({ client: clientLabel, statusCode: 'ERROR', error: err.message });
    });

    req.write(payload);
    req.end();
  });
}

async function runConcurrencyTest() {
  console.log('================================================================');
  console.log('🧪 RUNNING CONCURRENCY & DOUBLE-BOOKING SIMULATION (PART D)');
  console.log(`🎯 Target: Salon 1, Service 2, Date: ${TEST_DATE}, Time: ${TEST_TIME}`);
  console.log('⚡ Launching 2 simultaneous HTTP POST requests...');
  console.log('================================================================');

  // Trigger both requests concurrently with Promise.all
  const results = await Promise.all([
    sendBookingRequest(1, 'Customer 1 (Alice)'),
    sendBookingRequest(2, 'Customer 2 (Bob)')
  ]);

  console.log('\n--- Simulation Results ---');
  results.forEach(res => {
    console.log(`[${res.client}] HTTP Status: ${res.statusCode}`);
    console.log(`  Payload:`, JSON.stringify(res.response, null, 2));
  });

  const successCount = results.filter(r => r.statusCode === 201).length;
  const conflictCount = results.filter(r => r.statusCode === 409).length;

  console.log('----------------------------------------------------------------');
  if (successCount === 1 && conflictCount === 1) {
    console.log('✅ PASSED: Exactly 1 booking was created (201) and 1 was blocked with 409 Conflict!');
    console.log('🛡️ Zero double bookings occurred. Database integrity preserved.');
  } else {
    console.log(`⚠️ UNEXPECTED RESULT: 201s = ${successCount}, 409s = ${conflictCount}`);
  }
  console.log('================================================================\n');
}

runConcurrencyTest();
