import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // اگر بخش‌هایی دارید که نمی‌خواهید ایندکس شوند، اینجا Disallow کنید
      // disallow: '/private/',
    },
    sitemap: "https://sch7.ir/sitemap.xml",
  };
}
