import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://sch7.ir",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
    // بقیه صفحات مهم سایت را اینجا اضافه کنید
  ];
}
