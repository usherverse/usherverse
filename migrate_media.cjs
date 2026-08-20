const { Client } = require('pg');

const pw = encodeURIComponent('p$VR7+2hFiR$/XU');
const connectionString = `postgresql://postgres.qphaqgkjiqsbphqsdrik:${pw}@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`;

const client = new Client({
  connectionString,
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to database.');

    const sql = `
      -- 1. Alter key_features column type
      ALTER TABLE projects ALTER COLUMN key_features DROP DEFAULT;
      ALTER TABLE projects ALTER COLUMN key_features TYPE jsonb USING to_jsonb(key_features);
      ALTER TABLE projects ALTER COLUMN key_features SET DEFAULT '[]'::jsonb;
      
      -- 2. Create storage bucket if not exists
      INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
      VALUES ('projects', 'projects', true, 52428800, '{image/jpeg, image/png, image/webp, image/gif}')
      ON CONFLICT (id) DO NOTHING;
    `;
    
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
