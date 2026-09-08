import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/dashboard",
        "/operate/",
        "/settings/",
        "/appointments",
        "/schedule",
        "/patients",
        "/services",
        "/doctors",
        "/branches",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
