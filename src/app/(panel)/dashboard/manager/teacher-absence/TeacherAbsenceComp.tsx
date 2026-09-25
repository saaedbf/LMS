"use client";

import React, { useState } from "react";
import CreateBtn from "@/components/widgets/Elements/CreateBtn";
import HeadTr from "@/components/widgets/Elements/table/HeaddTr";
import Table from "@/components/widgets/Elements/table/Table";
import Tbody from "@/components/widgets/Elements/table/Tbody";
import Td from "@/components/widgets/Elements/table/Td";
import Tr from "@/components/widgets/Elements/table/Tr";
import TdActions from "@/components/widgets/Elements/table/TdActions";
import ThActions from "@/components/widgets/Elements/table/ThActions";
import SortableTh from "@/components/widgets/Elements/table/SortableTh";
import TextSearch from "@/components/widgets/Elements/table/TextSearch";
import DataTableLayout from "@/components/widgets/DataTableLayout";
import Pagination from "@/components/widgets/Pagination";
import TitlePage from "@/components/widgets/TitlePage";
import ActionModal from "@/components/widgets/ActionModal";
import BackButton from "@/components/widgets/Elements/BackButton";
import EditBtn from "@/components/widgets/Elements/EditBtn";
import { CalendarDays, FileEdit, Trash2 } from "lucide-react";
import { convertGregorianToJalali } from "@/lib/dateUtils";
import { TeacherAbsenceCreateForm } from "./TeacherAbsenceCreateForm";
import TeacherAbsenceEditForm from "./TeacherAbsenceEditForm";
import TeacherAbsenceScheduleEditForm from "./TeacherAbsenceScheduleEditForm";
import ConfirmModal from "@/components/widgets/ConfirmModal";
import { deleteTeacherAbsenceAction } from "@/actions/teacherAbsenceActions";
import { toast } from "react-toastify";

type TeacherAbsenceItem = {
  id: string;
  date: Date;
  isFullDay: boolean;
  startTime: string | null;
  endTime: string | null;
  reason: string | null;
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
    nationalCode: string;
  };
};

type Props = {
  listItems: TeacherAbsenceItem[];
  totalCount: number;
  pageSize: number;
};

export default function TeacherAbsenceComp({
  listItems,
  totalCount,
  pageSize,
}: Props) {
  const [openCreate, setOpenCreate] = useState(false);
  const [reasonEditId, setReasonEditId] = useState<string | null>(null);
  const [scheduleEditId, setScheduleEditId] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState("");
  const handleDelete = async (id: string) => {
    try {
      const res = await deleteTeacherAbsenceAction(id);

      if (res.status === "error") {
        toast.error(res.error);
        throw new Error(res.error);
      }

      toast.success("غیبت حذف شد");
      // ⬅️ هیچ setDeletingId اینجا نگذارید
      // ConfirmModal خودش setOpen(false) را صدا می‌زند
    } catch (error) {
      console.error(error);
      throw error; // ⬅️ به ConfirmModal بگو خطا داد
    }
  };
  return (
    <div className="p-2">
      <TitlePage>غیبت معلمان</TitlePage>
      <BackButton
        href="/dashboard/manager"
        label="بازگشت به پنل مدیریت"
        className="mb-3"
      />

      <div className="container mx-auto px-4 py-2">
        <DataTableLayout
          totalCount={totalCount}
          action={
            <ActionModal
              desc="ثبت غیبت برای یک یا چند معلم"
              open={openCreate}
              setOpen={setOpenCreate}
              title="ثبت غیبت معلمان"
              trigger={<CreateBtn>ثبت غیبت جدید</CreateBtn>}
              contentClassName="w-[95vw] max-w-3xl"
            >
              <TeacherAbsenceCreateForm
                onCreated={() => setOpenCreate(false)}
                setOpen={setOpenCreate}
              />
            </ActionModal>
          }
        >
          <Table>
            <thead>
              <HeadTr>
                <SortableTh field="teacherName" sortable title="نام معلم">
                  <TextSearch field="teacherName" placeholder="جستجوی نام..." />
                </SortableTh>
                <SortableTh field="date" sortable title="تاریخ">
                  <span className="text-xs text-gray-400">شمسی</span>
                </SortableTh>
                <SortableTh field="time" title="بازه زمانی">
                  <span className="text-xs text-gray-400">ساعت</span>
                </SortableTh>
                <SortableTh field="reason" title="علت">
                  <TextSearch field="reason" placeholder="جستجوی علت..." />
                </SortableTh>
                <ThActions>عملیات</ThActions>
              </HeadTr>
            </thead>
            <Tbody>
              {listItems.length === 0 ? (
                <Tr>
                  <Td>
                    <div className="py-6 text-center text-gray-500">
                      موردی برای نمایش وجود ندارد.
                    </div>
                  </Td>
                </Tr>
              ) : (
                listItems.map((item) => {
                  const teacherName = `${item.teacher.firstName} ${item.teacher.lastName}`;
                  const isReasonOpen = reasonEditId === item.id;
                  const isScheduleOpen = scheduleEditId === item.id;

                  return (
                    <Tr key={item.id}>
                      <Td>
                        <div className="font-medium text-zinc-900 dark:text-zinc-100">
                          {teacherName}
                        </div>
                        <div className="text-xs text-zinc-500">
                          {item.teacher.nationalCode}
                        </div>
                      </Td>
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
                      <Td>
                        <span className="line-clamp-1 max-w-[200px] text-xs text-zinc-500">
                          {item.reason || "-"}
                        </span>
                      </Td>
                      <TdActions>
                        <div className="flex items-center justify-center gap-1">
                          {/* ویرایش علت */}
                          <ActionModal
                            title="ویرایش علت غیبت"
                            desc="تغییر علت / توضیحات غیبت معلم"
                            open={isReasonOpen}
                            setOpen={(isOpen) =>
                              setReasonEditId(isOpen ? item.id : null)
                            }
                            contentClassName="w-[95vw] max-w-md"
                            trigger={
                              <span onClick={() => setReasonEditId(item.id)}>
                                <button
                                  type="button"
                                  className="inline-flex h-9 items-center gap-1.5 rounded-md border border-orange-300 bg-orange-50 px-2.5 text-xs font-medium text-orange-700 transition hover:bg-orange-100"
                                  title="ویرایش علت"
                                >
                                  <FileEdit size={14} />
                                  علت
                                </button>
                              </span>
                            }
                          >
                            <TeacherAbsenceEditForm
                              key={`reason-${item.id}`}
                              absence={{
                                id: item.id,
                                reason: item.reason,
                                teacherName,
                                date: item.date,
                              }}
                              setOpen={(isOpen) => {
                                if (!isOpen) setReasonEditId(null);
                              }}
                            />
                          </ActionModal>

                          {/* ویرایش زمان */}
                          <ActionModal
                            title="ویرایش زمان غیبت"
                            desc="تغییر تاریخ و بازه ساعتی غیبت معلم"
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
                            <TeacherAbsenceScheduleEditForm
                              key={`schedule-${item.id}`}
                              absence={{
                                id: item.id,
                                date: item.date,
                                isFullDay: item.isFullDay,
                                startTime: item.startTime,
                                endTime: item.endTime,
                                teacherName,
                              }}
                              setOpen={(isOpen) => {
                                if (!isOpen) setScheduleEditId(null);
                              }}
                            />
                          </ActionModal>

                          {/* ⬅️ حذف - با کامپوننت جدید */}
                          <ConfirmModal
                            title="حذف غیبت معلم"
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
        <Pagination pageSize={pageSize} totalCount={totalCount} />
      </div>
    </div>
  );
}
