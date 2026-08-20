import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const envStr = fs.readFileSync(".env", "utf8");
const env: Record<string, string> = {};
for (const line of envStr.split("\n")) {
  if (line.includes("=")) {
    const [k, ...v] = line.split("=");
    env[k.trim()] = v.join("=").trim();
  }
}

const url = env.SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing Supabase config");
  process.exit(1);
}

const supabase = createClient(url, key);

async function init() {
  const { data, error } = await supabase.storage.createBucket('projects', {
    public: true,
    fileSizeLimit: 52428800,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  });
  
  if (error) {
    if (error.message.includes('already exists') || error.message.includes('duplicate')) {
      console.log("Bucket already exists.");
    } else {
      console.error("Error creating bucket:", error);
    }
  } else {
    console.log("Bucket 'projects' created successfully!");
  }
}

init();
