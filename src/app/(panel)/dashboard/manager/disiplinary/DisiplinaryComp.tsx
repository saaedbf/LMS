"use client";

import React, { useState } from "react";
import { AbsenceType } from "@prisma/client";
import { AbsenceListItem } from "@/actions/absenceActions";
import TextSearch from "@/components/widgets/Elements/table/TextSearch";
import DateSearch from "@/components/widgets/Elements/table/DateSearch";
import StatusSearch from "@/components/widgets/Elements/table/StatusSearch";
import CreateBtn from "@/components/widgets/Elements/CreateBtn";
import HeadTr from "@/components/widgets/Elements/table/HeaddTr";
import Table from "@/components/widgets/Elements/table/Table";
import Tbody from "@/components/widgets/Elements/table/Tbody";
import Td from "@/components/widgets/Elements/table/Td";
import Tr from "@/components/widgets/Elements/table/Tr";
import TdActions from "@/components/widgets/Elements/table/TdActions";
import ThActions from "@/components/widgets/Elements/table/ThActions";
import SortableTh from "@/components/widgets/Elements/table/SortableTh";
import ColumnSearch from "@/components/widgets/Elements/table/ColumnSearch";
import DataTableLayout from "@/components/widgets/DataTableLayout";
import Pagination from "@/components/widgets/Pagination";
import TitlePage from "@/components/widgets/TitlePage";
import ActionModal from "@/components/widgets/ActionModal";
import EditBtn from "@/components/widgets/Elements/EditBtn";
import { convertGregorianToJalali } from "@/lib/dateUtils";
import { DisiplinaryCreateForm } from "./DisiplinaryCreateForm";
import DisiplinaryEditForm from "./DisiplinaryEditForm";
import DisiplinaryDeleteBtn from "./DisiplinaryDeleteBtn";

import {
  DisciplinaryListItem,
  getAllDisciplinariesForExport,
} from "@/actions/disciplinaryActions";
import BackButton from "@/components/widgets/Elements/BackButton";
import { exportToExcel } from "@/lib/utils/exportExcel";
import ExportExcelBtn from "@/components/widgets/ExportExcelBtn";
import { toast } from "react-toastify";
type Props = {
  initialItems?: DisciplinaryListItem[];
  listItems?: DisciplinaryListItem[];
  total?: number;
  totalCount?: number;
  pageSize?: number;
  payes: { id: number; title: string }[];
  klasses: { id: string; title: string; payeId: number }[];
};

export default function DisiplinaryComp({
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
      const all = await getAllDisciplinariesForExport();

      if (!all || all.length === 0) {
        toast.warn("داده‌ای برای خروجی وجود ندارد");
        return;
      }

      exportToExcel({
        data: all,
        fileName: `موارد-انضباطی-${new Date().toISOString().slice(0, 10)}.xlsx`,
        sheetName: "موارد انضباطی",
        columns: [
          {
            key: "studentName",
            title: "نام دانش‌آموز",
            width: 22,
            render: (row) =>
              `${row.studentEnrollment?.student?.lastName ?? ""} ${
                row.studentEnrollment?.student?.firstName ?? ""
              }`,
          },
          {
            key: "nationalCode",
            title: "کد ملی",
            width: 15,
            render: (row) =>
              row.studentEnrollment?.student?.nationalCode ?? "-",
          },
          {
            key: "klass",
            title: "کلاس",
            width: 18,
            render: (row) => row.studentEnrollment?.klass?.title ?? "-",
          },
          {
            key: "date",
            title: "تاریخ",
            width: 15,
            render: (row) =>
              row.date ? new Date(row.date).toLocaleDateString("fa-IR") : "-",
          },
          { key: "startTime", title: "ساعت", width: 12 },
          { key: "reason", title: "شرح", width: 40 },
        ],
      });

      toast.success(`فایل اکسل (${all.length} رکورد) دانلود شد`);
    } catch (error) {
      console.error(error);
      toast.error("خطا در ساخت فایل اکسل");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-2">
      <TitlePage>لیست و مدیریت موارد انضباطی دانش‌آموزان</TitlePage>
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
                desc="ثبت گروهی یا فردی مورد انضباطی   "
                open={openCreate}
                setOpen={setOpenCreate}
                title="ثبت مورد انضباطی جدید"
                trigger={<CreateBtn>ثبت مورد انضباطی جدید</CreateBtn>}
                contentClassName="w-[95vw] max-w-4xl"
              >
                <DisiplinaryCreateForm
                  payes={payes}
                  klasses={klasses}
                  onCreated={() => setOpenCreate(false)}
                />
              </ActionModal>
              <ExportExcelBtn onClick={handleExportExcel} loading={exporting} />
              {/* بقیه دکمه‌ها */}
            </div>
          }
        >
          <Table>
            <thead>
              <HeadTr>
                <SortableTh field="studentName" sortable title="نام دانش‌آموز">
                  <TextSearch field="studentName" placeholder="جستجوی نام..." />
                </SortableTh>
                <SortableTh field="paye" sortable title="پایه">
                  <TextSearch field="paye" placeholder="جستجوی پایه..." />
                </SortableTh>
                <SortableTh field="klass" sortable title="کلاس">
                  <TextSearch field="klass" placeholder="جستجوی کلاس..." />
                </SortableTh>
                <SortableTh field="date" sortable title="تاریخ غیبت">
                  <DateSearch field="date" />
                </SortableTh>
                <SortableTh field="starttime" title="ساعت">
                  <span className="text-xs text-gray-400">ساعت</span>
                </SortableTh>

                <SortableTh field="reason" title="دلیل / توضیحات">
                  <TextSearch field="reason" placeholder="جستجوی دلیل..." />
                </SortableTh>
                <ThActions>عملیات</ThActions>
              </HeadTr>
            </thead>

            <Tbody>
              {items.length === 0 ? (
                <Tr>
                  <Td>
                    <div className="py-6 text-center text-gray-500">
                      موردی برای نمایش وجود ندارد.
                    </div>
                  </Td>
                </Tr>
              ) : (
                items.map((item) => {
                  const studentFullName = `${item.studentEnrollment.student.firstName} ${item.studentEnrollment.student.lastName}`;
                  const isStatusOpen = editId === item.id;

                  return (
                    <Tr key={item.id}>
                      <Td>
                        <div className="font-medium text-zinc-900 dark:text-zinc-100">
                          {studentFullName}
                        </div>
                      </Td>
                      <Td>{item?.studentEnrollment?.paye?.title}</Td>
                      <Td>{item?.studentEnrollment?.klass?.title}</Td>
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
                          className="line-clamp-1 max-w-[180px] text-xs text-zinc-500"
                          title={item.reason || "-"}
                        >
                          {item.reason || "-"}
                        </span>
                      </Td>

                      <TdActions>
                        <div className="flex items-center justify-center gap-1">
                          {/* ویرایش زمان */}
                          <ActionModal
                            title="ویرایش  "
                            desc=" ویرایش مورد انضباطی "
                            open={isStatusOpen}
                            setOpen={(isOpen) =>
                              setEditId(isOpen ? item.id : null)
                            }
                            contentClassName="w-[95vw] max-w-md"
                            trigger={
                              <span onClick={() => setEditId(item.id)}>
                                <EditBtn />
                              </span>
                            }
                          >
                            <DisiplinaryEditForm
                              key={`schedule-${item.id}`}
                              disiplinary={{
                                id: item.id,
                                date: item.date,
                                startTime: item.startTime,
                                reason: item.reason,
                                studentName:
                                  item.studentEnrollment.student.firstName +
                                  " " +
                                  item.studentEnrollment.student.lastName,
                              }}
                              setOpen={(isOpen) => {
                                if (!isOpen) setEditId(null);
                              }}
                            />
                          </ActionModal>

                          {/* حذف  */}
                          <DisiplinaryDeleteBtn absenceId={item.id} />
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
