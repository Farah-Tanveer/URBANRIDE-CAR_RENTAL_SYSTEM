const oracledb = require('oracledb');

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.autoCommit = true;

// Try to enable Thick mode for Oracle 11g support
try {
  oracledb.initOracleClient();
} catch (err) {
  // Ignore if already initialized or not found (will fall back to Thin mode, which might fail for 11g)
  // But strictly speaking, for 11g we need this.
  console.log('Oracle Client not found or already initialized, proceeding...');
}

async function initPool(config) {
  return oracledb.createPool({
    user: config.user,
    password: config.password,
    connectionString: config.connectionString,
    poolMin: 1,
    poolMax: 5,
    poolIncrement: 1
  });
}

async function getConnection() {
  return oracledb.getConnection();
}

async function closePool() {
  try {
    await oracledb.getPool().close(10);
  } catch (err) {
    console.error('Error closing Oracle pool', err);
  }
}

module.exports = {
  initPool,
  getConnection,
  closePool
};
