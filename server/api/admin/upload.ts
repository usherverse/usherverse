import { defineEventHandler, getHeader, readMultipartFormData } from "h3";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.SUPABASE_URL as string;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  if (!url || !key) throw new Error("Supabase credentials not configured");
  return createClient(url, key, { auth: { persistSession: false } });
}

function checkAuth(event: any): boolean {
  const adminPassword = (process.env.ADMIN_PASSWORD as string) || "Onlyme@2024";
  const authHeader = getHeader(event, "authorization") || "";
  const token = authHeader.replace("Bearer ", "").trim();
  return token === adminPassword;
}

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!checkAuth(event)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let supabase: ReturnType<typeof createClient>;
  try {
    supabase = getSupabase();
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const parts = await readMultipartFormData(event);
    if (!parts || parts.length === 0) {
      return new Response(JSON.stringify({ error: "No files uploaded" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const file = parts.find(p => p.name === 'file');
    if (!file || !file.data) {
      return new Response(JSON.stringify({ error: "No file part found" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const ext = file.filename?.split('.').pop() || 'png';
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    const contentType = file.type || 'image/png';

    const { data, error } = await supabase.storage
      .from('projects')
      .upload(uniqueName, file.data, {
        contentType,
        upsert: false
      });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { data: publicUrlData } = supabase.storage
      .from('projects')
      .getPublicUrl(data.path);

    return new Response(JSON.stringify({ url: publicUrlData.publicUrl }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
