import { defineEventHandler } from "h3";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.SUPABASE_URL as string;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  if (!url || !key) throw new Error("Supabase credentials not configured");
  return createClient(url, key, { auth: { persistSession: false } });
}

// GET /api/projects?featured=true  — public, no auth required

export default defineEventHandler(async (event) => {
  let supabase: ReturnType<typeof createClient>;
  try {
    supabase = getSupabase();
  } catch (e: any) {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const url = new URL(event.node.req.url!, `http://${event.node.req.headers.host}`);
  const featuredOnly = url.searchParams.get("featured") === "true";

  let query = supabase
    .from("projects")
    .select("id, slug, title, short_description, industry, category, featured_image, technologies, featured, metrics, project_url")
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (featuredOnly) {
    query = query.eq("featured", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Public projects fetch error:", error.message);
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify(data ?? []), {
    headers: { "Content-Type": "application/json" },
  });
});
