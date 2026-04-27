const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const getStores = async (bounds, zoom, filters) => {
  const { ne, sw } = bounds;
  const { brand, state, status } = filters;

  // Initial filtering by viewport coordinates
  let baseQuery = `SELECT * FROM stores WHERE latitude BETWEEN $1 AND $2 AND longitude BETWEEN $3 AND $4`;
  let params = [sw.lat, ne.lat, sw.lng, ne.lng];

  // Add extra filters if they exist
  if (brand) { params.push(brand); baseQuery += ` AND brand_initial = $${params.length}`; }
  if (state) { params.push(state); baseQuery += ` AND state = $${params.length}`; }
  if (status) { params.push(status); baseQuery += ` AND status = $${params.length}`; }

  if (zoom < 5) {
    // State-level aggregation
    const res = await pool.query(`SELECT state, COUNT(*) as store_count, AVG(latitude) as lat, AVG(longitude) as lng FROM (${baseQuery}) AS f GROUP BY state`, params);
    return { tier: 1, data: res.rows };
  } else if (zoom < 10) {
    // Grid-based clustering
    const gridSize = 1 / Math.pow(2, zoom - 5);
    const res = await pool.query(`SELECT ROUND(latitude / $${params.length+1}) * $${params.length+1} as lat, ROUND(longitude / $${params.length+2}) * $${params.length+2} as lng, COUNT(*) as store_count FROM (${baseQuery}) AS f GROUP BY lat, lng`, [...params, gridSize, gridSize]);
    return { tier: 2, data: res.rows };
  }

  // Street-level pins
  const res = await pool.query(`${baseQuery} LIMIT 500`, params);
  return { tier: 3, data: res.rows };
};

module.exports = { getStores };
