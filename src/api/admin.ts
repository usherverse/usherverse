import { getSupabaseAdmin } from "../lib/supabase";

function generateSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

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

  // ── POST /api/admin/consultations ────────────────────────────────────────────
  if (request.method === "POST" && url.pathname === "/api/admin/consultations") {
    const body = await request.json() as Record<string, any>;
    const { data, error } = await supabase
      .from("consultations")
      .insert([{ ...body, status: body.status ?? "new", created_at: new Date().toISOString() }])
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

  // ── POST /api/admin/upload ──────────────────────────────────────────────────
  if (request.method === "POST" && url.pathname === "/api/admin/upload") {
    try {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return new Response(JSON.stringify({ error: "No file provided" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      const ext = file.name?.split(".").pop() || "png";
      const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      const arrayBuffer = await file.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);
      const { data, error } = await supabase.storage
        .from("projects")
        .upload(uniqueName, uint8, { contentType: file.type || "image/png", upsert: false });
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
      const { data: publicUrlData } = supabase.storage.from("projects").getPublicUrl(data.path);
      return new Response(JSON.stringify({ url: publicUrlData.publicUrl }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message ?? "Upload failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // ── GET /api/admin/projects ─────────────────────────────────────────────────
  if (request.method === "GET" && url.pathname === "/api/admin/projects") {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) return new Response(JSON.stringify([]), { status: 200, headers: { "Content-Type": "application/json" } });
    return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
  }

  // ── POST /api/admin/projects ─────────────────────────────────────────────────
  if (request.method === "POST" && url.pathname === "/api/admin/projects") {
    const body = await request.json() as Record<string, any>;
    if (!body.slug && body.title) body.slug = generateSlug(body.title);
    const { data, error } = await supabase
      .from("projects")
      .insert([{ ...body, updated_at: new Date().toISOString() }])
      .select().single();
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
    return new Response(JSON.stringify(data), { status: 201, headers: { "Content-Type": "application/json" } });
  }

  // ── GET /api/admin/projects/:id ──────────────────────────────────────────────
  if (request.method === "GET" && url.pathname.match(/^\/api\/admin\/projects\/[^/]+$/)) {
    const id = url.pathname.split("/").pop();
    const { data, error } = await supabase.from("projects").select("*").eq("id", id).single();
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 404, headers: { "Content-Type": "application/json" } });
    return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
  }

  // ── PATCH /api/admin/projects/:id ────────────────────────────────────────────
  if (request.method === "PATCH" && url.pathname.startsWith("/api/admin/projects/")) {
    const id = url.pathname.split("/").pop();
    const body = await request.json() as Record<string, any>;
    if (body.title && !body.slug) body.slug = generateSlug(body.title);
    const { data, error } = await supabase
      .from("projects")
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq("id", id).select().single();
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
    return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
  }

  // ── DELETE /api/admin/projects/:id ───────────────────────────────────────────
  if (request.method === "DELETE" && url.pathname.startsWith("/api/admin/projects/")) {
    const id = url.pathname.split("/").pop();
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
    return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
  }

  return new Response(JSON.stringify({ error: "Not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  });
}
