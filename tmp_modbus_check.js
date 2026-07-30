const ModbusRTU = require('modbus-serial');
(async () => {
  const client = new ModbusRTU();
  client.setTimeout(3000);
  try {
    await client.connectTCP('127.0.0.1', { port: 502 });
    console.log('CONNECT_OK');
    client.close(() => process.exit(0));
  } catch (err) {
    console.error('CONNECT_FAIL', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
