import { defineEventHandler, readBody, getHeader } from "h3";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.SUPABASE_URL as string;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  if (!url || !key) throw new Error("Supabase credentials not configured");
  return createClient(url, key, { auth: { persistSession: false } });
}

function checkAuth(event: any): boolean {
  const adminPassword = (process.env.ADMIN_PASSWORD as string) || "Onlyme@2024.";
  const authHeader = getHeader(event, "authorization") || "";
  const token = authHeader.replace("Bearer ", "").trim();
  return token === adminPassword;
}

export default defineEventHandler(async (event) => {
  if (!checkAuth(event)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = getSupabase();
  const method = event.node.req.method || "GET";

  // Extract the ID from the URL path  /api/admin/consultations/[id]
  const url = new URL(event.node.req.url!, `http://${event.node.req.headers.host}`);
  const pathParts = url.pathname.split("/");
  const id = pathParts[pathParts.length - 1];

  // PATCH — update status / notes
  if (method === "PATCH") {
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

  // DELETE — remove a consultation
  if (method === "DELETE") {
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
