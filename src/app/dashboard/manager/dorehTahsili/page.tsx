"use client";
import { Button } from "@/components/ui/button";
import ActionModal from "@/components/widgets/ActionModal";
import TitlePage from "@/components/widgets/TitlePage";
import React, { useState } from "react";

export default function ListDorehTahsiliPage() {
  const [open, setOpen] = useState(false);
  return (
    <div className="p-2">
      <TitlePage> لیست دوره تحصیلی</TitlePage>

      <ActionModal
        btnText="ذخیره"
        btnclass=""
        desc="lorem*1fsdf"
        onclick={() => alert("hi")}
        open={open}
        setOpen={() => setOpen(!open)}
        title="ثبت دوره تحصیلی"
        trigger={<Button>مودال</Button>}
      >
        <h1>saeed</h1>
      </ActionModal>
    </div>
  );
}
