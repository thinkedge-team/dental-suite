import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/layanan`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/dokter`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/lokasi`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/asuransi`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/tentang`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/book`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.95,
    },
  ];

  try {
    const [services, doctors, branches] = await Promise.all([
      prisma.service.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.doctor.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.branch.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      }),
    ]);

    const serviceUrls: MetadataRoute.Sitemap = services.map((s) => ({
      url: `${baseUrl}/layanan/${s.slug}`,
      lastModified: s.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const doctorUrls: MetadataRoute.Sitemap = doctors.map((d) => ({
      url: `${baseUrl}/dokter/${d.slug}`,
      lastModified: d.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const branchUrls: MetadataRoute.Sitemap = branches.map((b) => ({
      url: `${baseUrl}/lokasi/${b.slug}`,
      lastModified: b.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticPages, ...serviceUrls, ...doctorUrls, ...branchUrls];
  } catch (error) {
    console.error("Failed to generate dynamic sitemap routes:", error);
    return staticPages;
  }
}
