import { getSupabaseAdmin } from "../lib/supabase";

export async function adminHandler(request: Request, env?: any) {
  const envObj = env || (typeof process !== "undefined" ? process.env : {});
  const adminPassword = (envObj.ADMIN_PASSWORD as string) || "Onlyme@2024";

  // ── Auth check ──────────────────────────────────────────────────────────────
  const authHeader = request.headers.get("Authorization") || "";
  const token = authHeader.replace("Bearer ", "").trim();
  if (token !== adminPassword) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = getSupabaseAdmin(envObj);
  const url = new URL(request.url);

  // ── GET /api/admin/consultations ─────────────────────────────────────────────
  if (request.method === "GET" && url.pathname === "/api/admin/consultations") {
    const { data, error } = await supabase
      .from("consultations")
      .select("*")
      .order("created_at", { ascending: false });
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

  // ── PATCH /api/admin/consultations/:id ──────────────────────────────────────
  if (request.method === "PATCH" && url.pathname.startsWith("/api/admin/consultations/")) {
    const id = url.pathname.split("/").pop();
    const body = await request.json() as { status?: string; notes?: string };
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

  // ── DELETE /api/admin/consultations/:id ─────────────────────────────────────
  if (request.method === "DELETE" && url.pathname.startsWith("/api/admin/consultations/")) {
    const id = url.pathname.split("/").pop();
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

  return new Response(JSON.stringify({ error: "Not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  });
}
