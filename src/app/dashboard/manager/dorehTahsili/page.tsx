import React from "react";

import DoreTahsiliComp from "./DoreTahsiliComp";
import { getDoreTahsilis } from "@/actions/dorehTahsiliActions";

export default async function ListDorehTahsiliPage() {
  const doreTahisilis = await getDoreTahsilis();

  return <DoreTahsiliComp doreTahisilis={doreTahisilis || []} />;
}
