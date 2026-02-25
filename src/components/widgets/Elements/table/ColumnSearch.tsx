"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type Props = {
  field: string;
};

export default function ColumnSearch({ field }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(
    searchParams.get("searchField") === field
      ? searchParams.get("searchValue") || ""
      : "",
  );

  const handleSearch = (val: string) => {
    setValue(val);

    const params = new URLSearchParams(searchParams.toString());

    if (val) {
      params.set("searchField", field);
      params.set("searchValue", val);
    } else {
      params.delete("searchField");
      params.delete("searchValue");
    }

    params.set("page", "1");
    router.push(`?${params.toString()}`);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="ml-2 inline-flex items-center gap-2 justify-center">
          <Search size={18} />
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-52 p-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="جستجو..."
          className="w-full border px-2 py-1 text-sm"
        />
        <div className="flex gap-2 items-center justify-end mt-2">
          <button
            className="px-2 py-1 bg-blue-200 rounded-md"
            onClick={() => handleSearch(value)}
          >
            جست و جو
          </button>
          <button
            className="px-2 py-1 bg-gray-200 rounded-md"
            onClick={() => {
              setValue("");
              handleSearch("");
            }}
          >
            لغو
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
