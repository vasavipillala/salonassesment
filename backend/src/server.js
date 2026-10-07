/**
 * Server Entrypoint
 * Binds to 0.0.0.0 to enable LAN access from mobile devices (addresses Part E)
 */

require('dotenv').config();
const os = require('os');
const app = require('./app');
const db = require('./config/db');

const PORT = parseInt(process.env.PORT || '5000', 10);
const HOST = '0.0.0.0';

/**
 * Utility to find local IPv4 network addresses
 */
function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const ifaceName of Object.keys(interfaces)) {
    for (const iface of interfaces[ifaceName]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  return addresses;
}

async function startServer() {
  try {
    // Initialize database
    await db.initDatabase();

    const server = app.listen(PORT, HOST, () => {
      const localIps = getLocalIpAddresses();
      console.log('================================================================');
      console.log(`💈 Salonista Backend API Server is RUNNING`);
      console.log(`📡 Local Host:       http://localhost:${PORT}`);
      console.log(`📡 Loopback:         http://127.0.0.1:${PORT}`);
      if (localIps.length > 0) {
        localIps.forEach(ip => {
          console.log(`📱 LAN Mobile Host:  http://${ip}:${PORT} (Use this on physical phone)`);
        });
      }
      console.log(`🗄️ Database Engine:   ${db.getActiveEngine().toUpperCase()}`);
      console.log('================================================================');
    });

    const shutdown = async () => {
      console.log('\nShutting down server gracefully...');
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    console.error('Fatal Server Startup Error:', err.message);
    process.exit(1);
  }
}

startServer();
