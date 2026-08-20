const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const pw = encodeURIComponent('p$VR7+2hFiR$/XU');
const connectionString = `postgresql://postgres.qphaqgkjiqsbphqsdrik:${pw}@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`;

const client = new Client({
  connectionString,
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to database.');

    const sqlPath = path.join(__dirname, 'supabase', 'migrations', '20260820111509_create_projects_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Running migration...');
    await client.query(sql);
    console.log('Migration successful!');
    
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

run();
