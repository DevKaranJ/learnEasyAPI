const sql = require('./database');

async function getPgVersion() {
  const result = await sql`select version()`;
  console.log(result);
}

getPgVersion();