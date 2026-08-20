import { defineEventHandler, readBody, getHeader, getRouterParam } from "h3";
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

// GET  /api/admin/consultations
// PATCH /api/admin/consultations/:id
// DELETE /api/admin/consultations/:id

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

  const url = new URL(event.node.req.url!, `http://${event.node.req.headers.host}`);
  const method = event.node.req.method || "GET";

  // GET /api/admin/consultations
  if (method === "GET") {
    const { data, error } = await supabase
      .from("consultations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      // If the table doesn't exist yet, return empty array with a hint rather than crashing
      console.error("Supabase GET error:", error.message);
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json", "X-DB-Error": error.message },
      });
    }

    return new Response(JSON.stringify(data ?? []), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // PATCH /api/admin/consultations/:id
  if (method === "PATCH") {
    const pathParts = url.pathname.split("/");
    const id = pathParts[pathParts.length - 1];
    const body = await readBody(event) as { status?: string; notes?: string };

    const { data, error } = await supabase
      .from("consultations")
      .update({ status: body.status, notes: body.notes })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // DELETE /api/admin/consultations/:id
  if (method === "DELETE") {
    const pathParts = url.pathname.split("/");
    const id = pathParts[pathParts.length - 1];

    const { error } = await supabase.from("consultations").delete().eq("id", id);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });
});
