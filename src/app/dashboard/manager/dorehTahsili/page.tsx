"use client";

import ActionModal from "@/components/widgets/ActionModal";
import TitlePage from "@/components/widgets/TitlePage";
import React, { useState } from "react";
import CreateDoreh from "./CreateDoreh";
import CreateBtn from "@/components/widgets/Elements/CreateBtn";

export default function ListDorehTahsiliPage() {
  const [open, setOpen] = useState(false);
  return (
    <div className="p-2">
      <TitlePage> لیست دوره تحصیلی</TitlePage>
      <div className="p-2">
        <ActionModal
          desc="فرم ثبت مشخصات دوره تحصیلی"
          open={open}
          setOpen={() => setOpen(true)}
          title="ثبت دوره تحصیلی"
          trigger={<CreateBtn>ثبت دوره تحصیلی جدید</CreateBtn>}
        >
          <CreateDoreh setOpen={setOpen} />
        </ActionModal>
      </div>
    </div>
  );
}
