import { defineEventHandler, readBody, getHeader } from "h3";
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

// GET  /api/admin/projects
// POST /api/admin/projects

export default defineEventHandler(async (event) => {
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

  const method = event.node.req.method || "GET";

  // GET /api/admin/projects
  if (method === "GET") {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase GET projects error:", error.message);
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json", "X-DB-Error": error.message },
      });
    }

    return new Response(JSON.stringify(data ?? []), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // POST /api/admin/projects
  if (method === "POST") {
    const body = await readBody(event) as Record<string, any>;

    // Auto-generate slug from title if not provided
    if (!body.slug && body.title) {
      body.slug = body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    const { data, error } = await supabase
      .from("projects")
      .insert([{ ...body, updated_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });
});
