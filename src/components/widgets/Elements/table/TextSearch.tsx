"use client";

import ColumnSearch from "./ColumnSearch";

type Props = {
  field: string;
  placeholder?: string;
};

export default function TextSearch({ field, placeholder }: Props) {
  return (
    <ColumnSearch
      field={field}
      placeholder={placeholder || "جستجو..."}
      type="text"
    />
  );
}
