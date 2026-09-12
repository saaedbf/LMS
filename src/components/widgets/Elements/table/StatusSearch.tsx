"use client";

import ColumnSearch from "./ColumnSearch";

type Props = {
  field: string;
};

export default function StatusSearch({ field }: Props) {
  return (
    <ColumnSearch
      field={field}
      placeholder="وضعیت غیبت"
      type="select"
      options={[
        { label: "موجه", value: "موجه" },
        { label: "غیرموجه", value: "غیرموجه" },
        { label: "نامشخص", value: "نامشخص" },
      ]}
    />
  );
}
