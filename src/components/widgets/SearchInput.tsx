"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function SearchInput({
  placeholder = "جستجو...",
}: {
  placeholder?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");

    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }

    router.push(`?${params.toString()}`);
  };

  return (
    <input
      defaultValue={searchParams.get("search") || ""}
      onChange={(e) => handleChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-2 rounded-md border"
    />
  );
}
