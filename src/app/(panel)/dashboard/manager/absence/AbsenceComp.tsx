"use client";

import React, { useState } from "react";
import { AbsenceType } from "@prisma/client";
import { AbsenceListItem, deleteAbsenceAction } from "@/actions/absenceActions";
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
import { AbsenceCreateForm } from "./AbsenceCreateForm";
import AbsenceEditForm from "./AbsenceEditForm";
import AbsenceScheduleEditForm from "./AbsenceScheduleEditForm";

import { FaCheck } from "react-icons/fa";
import BackButton from "@/components/widgets/Elements/BackButton";
import { CalendarDays, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import ConfirmModal from "@/components/widgets/ConfirmModal";

type Props = {
  initialItems?: AbsenceListItem[];
  listItems?: AbsenceListItem[];
  total?: number;
  totalCount?: number;
  pageSize?: number;
  payes: { id: number; title: string }[];
  klasses: { id: string; title: string; payeId: number }[];
};

export default function AbsenceComp({
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
  const [statusEditId, setStatusEditId] = useState<string | null>(null);
  const [scheduleEditId, setScheduleEditId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState("");
  const handleDelete = async (id: string) => {
    try {
      const res = await deleteAbsenceAction({ id });

      if (res.status === "error") {
        toast.error(res.error.toString());
        throw new Error(res.error.toString());
      }

      toast.success("غیبت حذف شد");
      // ⬅️ هیچ setDeletingId اینجا نگذارید
      // ConfirmModal خودش setOpen(false) را صدا می‌زند
    } catch (error) {
      console.error(error);
      throw error; // ⬅️ به ConfirmModal بگو خطا داد
    }
  };
  const renderStatusBadge = (type: AbsenceType) => {
    switch (type) {
      case "EXCUSED":
        return (
          <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
            موجه
          </span>
        );
      case "UNEXCUSED":
        return (
          <span className="inline-flex items-center rounded-md bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
            غیرموجه
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
            نامشخص
          </span>
        );
    }
  };

  return (
    <div className="p-2">
      <TitlePage>لیست و مدیریت غیبت دانش‌آموزان</TitlePage>
      <BackButton
        href="/dashboard/manager"
        label="بازگشت به پنل مدیریت"
        className="mb-3"
      />
      <div className="container mx-auto px-4 py-2">
        <DataTableLayout
          totalCount={count}
          action={
            <ActionModal
              desc="ثبت گروهی یا فردی غیبت برای ساعت مشخص"
              open={openCreate}
              setOpen={setOpenCreate}
              title="ثبت غیبت جدید"
              trigger={<CreateBtn>ثبت غیبت جدید</CreateBtn>}
              contentClassName="w-[95vw] max-w-4xl"
            >
              <AbsenceCreateForm
                payes={payes}
                klasses={klasses}
                onCreated={() => setOpenCreate(false)}
                setOpen={setOpenCreate} // ⬅️ این خط اضافه شود
              />
            </ActionModal>
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
                <SortableTh field="time" title="بازه زمانی">
                  <span className="text-xs text-gray-400">
                    ساعت شروع - پایان
                  </span>
                </SortableTh>
                <SortableTh field="absenceType" sortable title="وضعیت">
                  <StatusSearch field="absenceType" />
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
                  const isStatusOpen = statusEditId === item.id;
                  const isScheduleOpen = scheduleEditId === item.id;

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
                        {item.isFullDay ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-950/50 dark:text-purple-300">
                            <CalendarDays size={12} />
                            روز کامل
                          </span>
                        ) : (
                          <span
                            className="text-xs text-zinc-600 dark:text-zinc-300"
                            dir="ltr"
                          >
                            {item.startTime} - {item.endTime}
                          </span>
                        )}
                      </Td>
                      <Td>{renderStatusBadge(item.absenceType)}</Td>
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
                          {/* ویرایش وضعیت */}
                          <ActionModal
                            title="ویرایش وضعیت غیبت"
                            desc="تغییر وضعیت موجه/غیرموجه و ثبت دلیل غیبت"
                            open={isStatusOpen}
                            setOpen={(isOpen) =>
                              setStatusEditId(isOpen ? item.id : null)
                            }
                            contentClassName="w-[95vw] max-w-md"
                            trigger={
                              <span onClick={() => setStatusEditId(item.id)}>
                                <button className=" px-2 py-1 rounded-md transition-all  items-center bg-orange-400  transform  hover:scale-110 flex gap-2 hover:bg-blue-500 text-white">
                                  <span className="text-nowrap text-sm">
                                    تغییر وضعیت
                                  </span>
                                  <FaCheck size={14} fill="white" />
                                </button>
                              </span>
                            }
                          >
                            <AbsenceEditForm
                              key={`status-${item.id}`}
                              absence={{
                                id: item.id,
                                absenceType: item.absenceType,
                                reason: item.reason,
                                studentName: studentFullName,

                                date: item.date,
                              }}
                              setOpen={(isOpen) => {
                                if (!isOpen) setStatusEditId(null);
                              }}
                            />
                          </ActionModal>

                          {/* ویرایش زمان */}
                          <ActionModal
                            title="ویرایش زمان غیبت"
                            desc="تغییر تاریخ و بازه ساعتی غیبت"
                            open={isScheduleOpen}
                            setOpen={(isOpen) =>
                              setScheduleEditId(isOpen ? item.id : null)
                            }
                            contentClassName="w-[95vw] max-w-md"
                            trigger={
                              <span onClick={() => setScheduleEditId(item.id)}>
                                <EditBtn />
                              </span>
                            }
                          >
                            <AbsenceScheduleEditForm
                              key={`schedule-${item.id}`}
                              absence={{
                                id: item.id,
                                date: item.date,
                                startTime: item.startTime,
                                endTime: item.endTime,
                                isFullDay: item.isFullDay, // ⬅️
                                studentName:
                                  item.studentEnrollment.student.firstName +
                                  " " +
                                  item.studentEnrollment.student.lastName,
                              }}
                              setOpen={(isOpen) => {
                                if (!isOpen) setScheduleEditId(null);
                              }}
                            />
                          </ActionModal>

                          {/* حذف غیبت */}
                          {/* <AbsenceDeleteBtn absenceId={item.id} /> */}
                          <ConfirmModal
                            title="حذف غیبت دانش آموز"
                            desc="آیا از حذف این رکورد مطمئن هستید؟"
                            open={deletingId === item.id}
                            setOpen={(isOpen) =>
                              setDeletingId(isOpen ? item.id : "")
                            }
                            onConfirm={() => handleDelete(item.id)}
                            confirmText="حذف"
                            cancelText="انصراف"
                            confirmButtonClassName="bg-rose-600 hover:bg-rose-700"
                            trigger={
                              <button
                                type="button"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-rose-300 text-rose-700 hover:bg-rose-50"
                              >
                                <Trash2 size={14} />
                              </button>
                            }
                          />
                        </div>
                      </TdActions>
                    </Tr>
                  );
                })
              )}
            </Tbody>
          </Table>
        </DataTableLayout>

        <Pagination pageSize={pageSize} totalCount={count} />
      </div>
    </div>
  );
}
