import { getSupabaseAdmin } from "../lib/supabase";

// Public projects handler — no auth required
export async function projectsHandler(request: Request, env?: any) {
  const envObj = env || (typeof process !== "undefined" ? process.env : {});
  let supabase: ReturnType<typeof getSupabaseAdmin>;
  try {
    supabase = getSupabaseAdmin(envObj);
  } catch {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const url = new URL(request.url);

  // ── GET /api/projects ─────────────────────────────────────────────────────
  if (request.method === "GET" && url.pathname === "/api/projects") {
    const featuredOnly = url.searchParams.get("featured") === "true";

    let query = supabase
      .from("projects")
      .select("id, slug, title, short_description, industry, category, featured_image, technologies, featured, metrics, project_url")
      .eq("status", "published")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (featuredOnly) {
      query = (query as any).eq("featured", true);
    }

    const { data, error } = await query;
    if (error) {
      return new Response(JSON.stringify([]), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify(data ?? []), { headers: { "Content-Type": "application/json" } });
  }

  // ── GET /api/projects/:slug ───────────────────────────────────────────────
  if (request.method === "GET" && url.pathname.match(/^\/api\/projects\/[^/]+$/)) {
    const slug = url.pathname.split("/").pop();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (error || !data) {
      return new Response(JSON.stringify({ error: "Project not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
  }

  return new Response(JSON.stringify({ error: "Not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  });
}
