const oracledb = require('oracledb');

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.autoCommit = true;

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
