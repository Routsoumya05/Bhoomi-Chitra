const path = require('path');
const fs = require('fs');

let dbInstance = null;
let isPgLite = true;

async function getDb() {
  if (dbInstance) return dbInstance;

  if (process.env.DATABASE_URL) {
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    dbInstance = {
      query: async (text, params) => pool.query(text, params),
      pool
    };
    isPgLite = false;
    console.log('Connected to PostgreSQL server via DATABASE_URL');
  } else {
    const { PGlite } = require('@electric-sql/pglite');
    const dataDir = path.resolve(__dirname, '../../data/bhoomichitra_pg');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const pglite = new PGlite(dataDir);
    dbInstance = {
      query: async (text, params = []) => {
        // PGlite query method accepts (text, params)
        const res = await pglite.query(text, params);
        return {
          rows: res.rows || [],
          rowCount: res.rows ? res.rows.length : (res.rowCount || 0)
        };
      },
      pglite
    };
    isPgLite = true;
    console.log('Using persistent embedded PostgreSQL engine (PGlite) at:', dataDir);
  }

  return dbInstance;
}

async function query(text, params = []) {
  const db = await getDb();
  return db.query(text, params);
}

async function initDb() {
  const db = await getDb();
  const schemaPath = path.resolve(__dirname, '../models/schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  // Split into statements and execute
  const statements = schemaSql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const stmt of statements) {
    try {
      await db.query(stmt);
    } catch (err) {
      // Ignore if index/table already exists
      if (!err.message.includes('already exists')) {
        console.error('Schema initialization statement warning:', err.message, '\nStatement:', stmt.substring(0, 80));
      }
    }
  }

  // Check if users exist; if not, seed data
  const userCheck = await db.query('SELECT COUNT(*) as count FROM users');
  const count = parseInt(userCheck.rows[0]?.count || '0', 10);
  if (count === 0) {
    console.log('Database empty. Seeding initial national data...');
    const { seedAllData } = require('../services/seedData');
    await seedAllData(db);
    console.log('National data successfully seeded!');
  } else {
    console.log(`Database already populated with ${count} users.`);
    // Check if parcels need updating to the full 400+ intact contiguous suite
    const parcelCheck = await db.query('SELECT COUNT(*) as count FROM land_parcels');
    const pCount = parseInt(parcelCheck.rows[0]?.count || '0', 10);
    if (pCount < 200) {
      console.log(`Parcel count is ${pCount} (<200). Seeding full contiguous intact parcels across all 15 projects...`);
      const { seedAllData } = require('../services/seedData');
      await seedAllData(db);
      console.log('Intact contiguous parcels populated successfully!');
    }
  }
}

module.exports = {
  getDb,
  query,
  initDb
};
