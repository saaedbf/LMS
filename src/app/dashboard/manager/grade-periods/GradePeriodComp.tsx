// app/dashboard/manager/grade-periods/GradePeriodComp.tsx
"use client";

import React, { useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Trash2, Power, BookOpen, Users, Layers } from "lucide-react";

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
import EditBtn from "@/components/widgets/Elements/EditBtn";
import ConfirmModal from "@/components/widgets/ConfirmModal";

import GradePeriodForm from "./GradePeriodForm";
import {
  deleteGradePeriod,
  toggleGradePeriodActive,
} from "@/actions/gradePeriodActions";
import { convertGregorianToJalali } from "@/lib/dateUtils";

// ==========================================
// Types
// ==========================================
type GradePeriodItem = {
  id: string;
  title: string;
  description: string | null;
  startDate: Date | null;
  endDate: Date | null;
  isActive: boolean;
  createdAt: Date;
  klassPeriods: {
    klass: {
      id: string;
      title: string;
      paye: { id: number; title: string };
      reshtehTahsili: { id: number; title: string };
    };
  }[];
  lessonPeriods: {
    klassId: string;
    darsPayeReshteh: {
      id: string;
      reshtehTadris: { id: string; title: string };
      paye: { id: number; title: string };
      reshtehTahsili: { id: number; title: string };
    };
  }[];
  _count: {
    klassPeriods: number;
    lessonPeriods: number;
  };
};

type Props = {
  listItems: GradePeriodItem[];
  totalCount: number;
  pageSize: number;
};

// ==========================================
// Helper: گروه‌بندی دروس بر اساس پایه برای initialData
// ==========================================
function groupLessonsByPaye(
  lessonPeriods: GradePeriodItem["lessonPeriods"],
): { payeId: number; lessonIds: string[] }[] {
  const map = new Map<number, Set<string>>();

  for (const lp of lessonPeriods) {
    const payeId = lp.darsPayeReshteh.paye.id;
    if (!map.has(payeId)) {
      map.set(payeId, new Set());
    }
    map.get(payeId)!.add(lp.darsPayeReshteh.id);
  }

  return Array.from(map.entries()).map(([payeId, set]) => ({
    payeId,
    lessonIds: Array.from(set),
  }));
}

// ==========================================
// Component
// ==========================================
export default function GradePeriodComp({
  listItems,
  totalCount,
  pageSize,
}: Props) {
  const router = useRouter();
  const [openCreate, setOpenCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingItem, setDeletingItem] = useState<GradePeriodItem | null>(
    null,
  );
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleDelete = async (item: GradePeriodItem) => {
    setTogglingId(item.id);
    const res = await deleteGradePeriod(item.id);
    if (res.status === "error") {
      toast.error(res.error);
    } else {
      toast.success("دوره با موفقیت حذف شد");
      setDeletingItem(null);
      router.refresh();
    }
    setTogglingId(null);
  };

  const handleToggleActive = async (item: GradePeriodItem) => {
    setTogglingId(item.id);
    const res = await toggleGradePeriodActive(item.id);
    if (res.status === "error") {
      toast.error(res.error);
    } else {
      toast.success(item.isActive ? "دوره غیرفعال شد" : "دوره فعال شد");
      router.refresh();
    }
    setTogglingId(null);
  };

  return (
    <div className="p-2">
      <TitlePage>دوره‌های ثبت نمره</TitlePage>

      <div className="container mx-auto px-4 py-2">
        <DataTableLayout
          totalCount={totalCount}
          action={
            <ActionModal
              desc="ایجاد دوره جدید ثبت نمره"
              open={openCreate}
              setOpen={setOpenCreate}
              title="ایجاد دوره ثبت نمره"
              trigger={<CreateBtn>ایجاد دوره جدید</CreateBtn>}
              contentClassName="w-[95vw] max-w-5xl"
            >
              <GradePeriodForm setOpen={setOpenCreate} mode="create" />
            </ActionModal>
          }
        >
          <Table>
            <thead>
              <HeadTr>
                <SortableTh field="title" sortable title="عنوان دوره">
                  <TextSearch field="title" placeholder="جستجوی عنوان..." />
                </SortableTh>

                <SortableTh field="description" title="توضیحات">
                  <TextSearch field="description" placeholder="جستجو..." />
                </SortableTh>

                <SortableTh field="date" title="تاریخ شروع - پایان">
                  <span className="text-xs text-gray-400">شمسی</span>
                </SortableTh>

                <SortableTh field="klasses" title="کلاس‌ها">
                  <span className="text-xs text-gray-400">تعداد</span>
                </SortableTh>

                <SortableTh field="lessons" title="دروس">
                  <span className="text-xs text-gray-400">تعداد</span>
                </SortableTh>

                <SortableTh field="status" title="وضعیت">
                  <span className="text-xs text-gray-400">فعال/غیرفعال</span>
                </SortableTh>

                <ThActions>عملیات</ThActions>
              </HeadTr>
            </thead>

            <Tbody>
              {listItems.length === 0 ? (
                <Tr>
                  <Td>
                    <div className="py-6 text-center text-gray-500">
                      دوره‌ای برای نمایش وجود ندارد.
                    </div>
                  </Td>
                </Tr>
              ) : (
                listItems.map((item) => {
                  const isEditOpen = editingId === item.id;

                  // گروه‌بندی دروس بر اساس پایه برای ویرایش
                  const lessonsByPaye = groupLessonsByPaye(item.lessonPeriods);

                  // محاسبه تعداد پایه‌های درگیر
                  const uniquePayes = new Set(
                    item.lessonPeriods.map((lp) => lp.darsPayeReshteh.paye.id),
                  );

                  return (
                    <Tr key={item.id}>
                      <Td>
                        <div className="font-medium text-zinc-800 dark:text-zinc-200">
                          {item.title}
                        </div>
                      </Td>

                      <Td>
                        <span className="line-clamp-1 max-w-[200px] text-xs text-zinc-500">
                          {item.description || "-"}
                        </span>
                      </Td>

                      <Td>
                        <div className="flex flex-col text-xs">
                          {item.startDate ? (
                            <span>
                              شروع:{" "}
                              {convertGregorianToJalali(
                                new Date(item.startDate),
                              )}
                            </span>
                          ) : (
                            <span className="text-zinc-400">شروع: -</span>
                          )}
                          {item.endDate ? (
                            <span>
                              پایان:{" "}
                              {convertGregorianToJalali(new Date(item.endDate))}
                            </span>
                          ) : (
                            <span className="text-zinc-400">پایان: -</span>
                          )}
                        </div>
                      </Td>

                      <Td>
                        <div className="flex items-center gap-1 text-xs">
                          <Users size={14} className="text-blue-500" />
                          <span className="font-bold">
                            {item._count.klassPeriods}
                          </span>
                          <span className="text-zinc-500">کلاس</span>
                        </div>
                      </Td>

                      <Td>
                        <div className="flex flex-col gap-1 text-xs">
                          <div className="flex items-center gap-1">
                            <BookOpen size={14} className="text-emerald-500" />
                            <span className="font-bold">
                              {item._count.lessonPeriods}
                            </span>
                            <span className="text-zinc-500">تخصیص درس</span>
                          </div>
                          {uniquePayes.size > 0 && (
                            <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                              <Layers size={12} />
                              <span>{uniquePayes.size} پایه</span>
                            </div>
                          )}
                        </div>
                      </Td>

                      <Td>
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                            item.isActive
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                          }`}
                        >
                          {item.isActive ? "فعال" : "غیرفعال"}
                        </span>
                      </Td>

                      <TdActions>
                        <div className="flex items-center justify-center gap-1">
                          {/* ویرایش */}
                          <ActionModal
                            title="ویرایش دوره ثبت نمره"
                            desc="ویرایش اطلاعات دوره"
                            open={isEditOpen}
                            setOpen={(isOpen) =>
                              setEditingId(isOpen ? item.id : null)
                            }
                            contentClassName="w-[95vw] max-w-5xl"
                            trigger={
                              <span onClick={() => setEditingId(item.id)}>
                                <EditBtn />
                              </span>
                            }
                          >
                            <GradePeriodForm
                              key={item.id}
                              setOpen={(isOpen) => {
                                if (!isOpen) setEditingId(null);
                              }}
                              mode="edit"
                              initialData={{
                                id: item.id,
                                title: item.title,
                                description: item.description,
                                startDate: item.startDate
                                  ? new Date(item.startDate)
                                      .toISOString()
                                      .split("T")[0]
                                  : null,
                                endDate: item.endDate
                                  ? new Date(item.endDate)
                                      .toISOString()
                                      .split("T")[0]
                                  : null,
                                isActive: item.isActive,
                                klassIds: item.klassPeriods.map(
                                  (kp) => kp.klass.id,
                                ),
                                // ⬅️ گروه‌بندی دروس بر اساس پایه
                                lessonsByPaye,
                              }}
                            />
                          </ActionModal>

                          {/* فعال/غیرفعال */}
                          <button
                            type="button"
                            onClick={() => handleToggleActive(item)}
                            disabled={togglingId === item.id}
                            title={item.isActive ? "غیرفعال کردن" : "فعال کردن"}
                            className={`inline-flex h-9 w-9 items-center justify-center rounded-md border transition-colors ${
                              item.isActive
                                ? "border-amber-300 text-amber-700 hover:bg-amber-50"
                                : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                            } disabled:opacity-50`}
                          >
                            <Power size={14} />
                          </button>

                          {/* حذف */}
                          <ConfirmModal
                            title="حذف دوره"
                            desc="آیا از حذف این دوره مطمئن هستید؟"
                            open={deletingItem?.id === item.id}
                            setOpen={(isOpen) =>
                              setDeletingItem(isOpen ? item : null)
                            }
                            onConfirm={() => handleDelete(item)}
                            confirmText="حذف"
                            cancelText="انصراف"
                            loading={togglingId === item.id}
                            contentClassName="w-[95vw] max-w-md"
                            trigger={
                              <button
                                type="button"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-rose-300 text-rose-700 transition-colors hover:bg-rose-50"
                              >
                                <Trash2 size={14} />
                              </button>
                            }
                          >
                            <div className="px-4 py-3 text-sm text-gray-700">
                              آیا مطمئن هستید که دوره{" "}
                              <strong>{item.title}</strong> حذف شود؟ این عملیات
                              قابل بازگشت نیست.
                            </div>
                          </ConfirmModal>
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
