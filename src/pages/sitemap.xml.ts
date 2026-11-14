import type { APIRoute } from "astro";
import { PUBLIC_PATHS } from "../constants/routes.ts";

export const prerender = true;

export const GET: APIRoute = ({ site, url }) => {
  const origin = site?.href ?? url.origin;
  const urls = PUBLIC_PATHS.map((path) => new URL(path, origin).href);
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((loc) => `  <url><loc>${loc}</loc></url>`).join("\n")}
</urlset>
`;

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
