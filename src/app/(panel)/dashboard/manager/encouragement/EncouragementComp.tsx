"use client";

import React, { useState } from "react";
import {
  EncouragementListItem,
  getAllEncouragementsForExport,
} from "@/actions/encouragementActions";
import TextSearch from "@/components/widgets/Elements/table/TextSearch";
import DateSearch from "@/components/widgets/Elements/table/DateSearch";
import CreateBtn from "@/components/widgets/Elements/CreateBtn";
import HeadTr from "@/components/widgets/Elements/table/HeaddTr";
import Table from "@/components/widgets/Elements/table/Table";
import Tbody from "@/components/widgets/Elements/table/Tbody";
import Td from "@/components/widgets/Elements/table/Td";
import Tr from "@/components/widgets/Elements/table/Tr";
import TdActions from "@/components/widgets/Elements/table/TdActions";
import ThActions from "@/components/widgets/Elements/table/ThActions";
import SortableTh from "@/components/widgets/Elements/table/SortableTh";
import DataTableLayout from "@/components/widgets/DataTableLayout";
import TitlePage from "@/components/widgets/TitlePage";
import ActionModal from "@/components/widgets/ActionModal";
import EditBtn from "@/components/widgets/Elements/EditBtn";
import { convertGregorianToJalali } from "@/lib/dateUtils";
import { EncouragementCreateForm } from "./EncouragementCreateForm";
import EncouragementEditForm from "./EncouragementEditForm";
import EncouragementDeleteBtn from "./EncouragementDeleteBtn";
import BackButton from "@/components/widgets/Elements/BackButton";
import { exportToExcel } from "@/lib/utils/exportExcel";
import ExportExcelBtn from "@/components/widgets/ExportExcelBtn";
import { toast } from "react-toastify";

type Props = {
  initialItems?: EncouragementListItem[];
  listItems?: EncouragementListItem[];
  total?: number;
  totalCount?: number;
  pageSize?: number;
  payes: { id: number; title: string }[];
  klasses: { id: string; title: string; payeId: number }[];
};

const TYPE_MAP: Record<string, string> = {
  EDUCATIONAL: "آموزشی",
  CULTURAL: "پرورشی",
  DISCIPLINARY: "انضباطی",
  COMPETITIONS: "مسابقات",
  KHAVARAZMI: "جشنواره خوارزمی",
  OTHER: "سایر",
};

export default function EncouragementComp({
  initialItems,
  listItems,
  total,
  totalCount,
  pageSize = 10,
  payes,
  klasses,
}: Props) {
  const items = initialItems ?? listItems ?? [];
  const count = total ?? totalCount ?? 0;

  const [openCreate, setOpenCreate] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const all = await getAllEncouragementsForExport();
      if (!all || all.length === 0)
        return toast.warn("داده‌ای برای خروجی وجود ندارد");

      exportToExcel({
        data: all,
        fileName: `تشویق‌ها-${new Date().toISOString().slice(0, 10)}.xlsx`,
        sheetName: "تشویق‌ها",
        columns: [
          {
            key: "studentName",
            title: "نام دانش‌آموز",
            width: 22,
            render: (row: any) =>
              `${row.studentEnrollment?.student?.lastName ?? ""} ${row.studentEnrollment?.student?.firstName ?? ""}`,
          },
          {
            key: "type",
            title: "نوع تشویق",
            width: 15,
            render: (row: any) => TYPE_MAP[row.type] || row.type,
          },
          {
            key: "klass",
            title: "کلاس",
            width: 18,
            render: (row: any) => row.studentEnrollment?.klass?.title ?? "-",
          },
          {
            key: "date",
            title: "تاریخ",
            width: 15,
            render: (row: any) =>
              row.date ? new Date(row.date).toLocaleDateString("fa-IR") : "-",
          },
          { key: "startTime", title: "ساعت", width: 12 },
          { key: "reason", title: "شرح", width: 40 },
        ],
      });
      toast.success(`فایل اکسل (${all.length} رکورد) دانلود شد`);
    } catch (error) {
      toast.error("خطا در ساخت فایل اکسل");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-2">
      <TitlePage>لیست و مدیریت تشویق‌های دانش‌آموزان</TitlePage>
      <BackButton
        href="/dashboard/manager"
        label="بازگشت به پنل مدیریت"
        className="mb-3"
      />
      <div className="container mx-auto px-4 py-2">
        <DataTableLayout
          totalCount={count}
          pageSize={pageSize}
          action={
            <div className="flex flex-wrap gap-2">
              <ActionModal
                desc="ثبت گروهی یا فردی تشویق"
                open={openCreate}
                setOpen={setOpenCreate}
                title="ثبت تشویق جدید"
                trigger={<CreateBtn>ثبت تشویق جدید</CreateBtn>}
                contentClassName="w-[95vw] max-w-5xl"
              >
                <EncouragementCreateForm
                  payes={payes}
                  klasses={klasses}
                  onCreated={() => setOpenCreate(false)}
                />
              </ActionModal>
              <ExportExcelBtn onClick={handleExportExcel} loading={exporting} />
            </div>
          }
        >
          <Table>
            <thead>
              <HeadTr>
                <SortableTh field="studentName" sortable title="نام دانش‌آموز">
                  <TextSearch field="studentName" placeholder="جستجو..." />
                </SortableTh>
                <SortableTh field="type" title="نوع تشویق">
                  <span className="text-xs text-gray-400">نوع</span>
                </SortableTh>
                <SortableTh field="klass" sortable title="کلاس">
                  <TextSearch field="klass" placeholder="جستجو..." />
                </SortableTh>
                <SortableTh field="date" sortable title="تاریخ">
                  <DateSearch field="date" />
                </SortableTh>
                <SortableTh field="starttime" title="ساعت">
                  <span className="text-xs text-gray-400">ساعت</span>
                </SortableTh>
                <SortableTh field="reason" title="دلیل / توضیحات">
                  <TextSearch field="reason" placeholder="جستجو..." />
                </SortableTh>
                <ThActions>عملیات</ThActions>
              </HeadTr>
            </thead>
            <Tbody>
              {items.length === 0 ? (
                <Tr>
                  <Td>
                    <div className="py-6 text-center">موردی وجود ندارد.</div>
                  </Td>
                </Tr>
              ) : (
                items.map((item) => {
                  const studentFullName = `${item.studentEnrollment.student.firstName} ${item.studentEnrollment.student.lastName}`;
                  const isEditOpen = editId === item.id;

                  return (
                    <Tr key={item.id}>
                      <Td>
                        <div className="font-medium">{studentFullName}</div>
                      </Td>
                      <Td>
                        <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                          {TYPE_MAP[item.type] || item.type}
                        </span>
                      </Td>
                      <Td>{item.studentEnrollment.klass?.title}</Td>
                      <Td>{convertGregorianToJalali(new Date(item.date))}</Td>
                      <Td>
                        <span
                          className="text-xs text-zinc-600 dark:text-zinc-300"
                          dir="ltr"
                        >
                          {item.startTime}
                        </span>
                      </Td>
                      <Td>
                        <span
                          className="line-clamp-1 max-w-[180px] text-xs"
                          title={item.reason}
                        >
                          {item.reason || "-"}
                        </span>
                      </Td>

                      <TdActions>
                        <div className="flex items-center justify-center gap-1">
                          <ActionModal
                            title="ویرایش تشویق"
                            open={isEditOpen}
                            desc=""
                            setOpen={(isOpen) =>
                              setEditId(isOpen ? item.id : null)
                            }
                            trigger={
                              <span onClick={() => setEditId(item.id)}>
                                <EditBtn />
                              </span>
                            }
                          >
                            <EncouragementEditForm
                              encouragement={{
                                id: item.id,
                                date: item.date,
                                startTime: item.startTime,
                                reason: item.reason,
                                type: item.type,
                                studentName: studentFullName,
                              }}
                              setOpen={(isOpen) => {
                                if (!isOpen) setEditId(null);
                              }}
                            />
                          </ActionModal>
                          <EncouragementDeleteBtn id={item.id} />
                        </div>
                      </TdActions>
                    </Tr>
                  );
                })
              )}
            </Tbody>
          </Table>
        </DataTableLayout>
      </div>
    </div>
  );
}
