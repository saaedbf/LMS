"use client";

import React, { useState } from "react";
import { toast } from "react-toastify";
import { Plus, Edit2 } from "lucide-react";
import Pagination from "@/components/widgets/Pagination";
import Table from "@/components/widgets/Elements/table/Table";
import Tbody from "@/components/widgets/Elements/table/Tbody";
import Td from "@/components/widgets/Elements/table/Td";
import Tr from "@/components/widgets/Elements/table/Tr";
import HeadTr from "@/components/widgets/Elements/table/HeaddTr";
import SortableTh from "@/components/widgets/Elements/table/SortableTh";
import ColumnSearch from "@/components/widgets/Elements/table/ColumnSearch";
import TdActions from "@/components/widgets/Elements/table/TdActions";
import ThActions from "@/components/widgets/Elements/table/ThActions";
import DeleteBtn from "@/components/widgets/Elements/DeleteBtn";
import EditBtn from "@/components/widgets/Elements/EditBtn";
import DeleteConfirmModal from "@/components/widgets/DeleteConfirmModal";
import DataTableLayout from "@/components/widgets/DataTableLayout";
import { createKlass, deleteKlass, updateKlass } from "@/actions/klassActions";
import BackButton from "@/components/widgets/Elements/BackButton";

type KlassItem = {
  id: string;
  title: string;
  paye: { id: number; title: string };
  reshtehTahsili: { id: number; title: string };
};

interface Props {
  schoolId: number;
  academicYearId: number;
  payes: { id: number; title: string }[];
  reshtehs: { id: number; title: string }[];
  klasses: KlassItem[];
  totalCount: number;
  pageSize: number;
}

export default function ManageKlassesForm({
  schoolId,
  academicYearId,
  payes,
  reshtehs,
  klasses,
  totalCount,
  pageSize,
}: Props) {
  // فیلدهای ثبت کلاس جدید
  const [selectedPaye, setSelectedPaye] = useState<number>(0);
  const [selectedReshteh, setSelectedReshteh] = useState<number>(0);
  const [classTitle, setClassTitle] = useState<string>("");
  const [loadingAdd, setLoadingAdd] = useState(false);

  // مودال حذف
  const [selectedItemToDelete, setSelectedItemToDelete] =
    useState<KlassItem | null>(null);
  const [openDelete, setOpenDelete] = useState(false);

  // مودال ویرایش تک‌فیلدی (فقط عنوان کلاس)
  const [selectedItemToEdit, setSelectedItemToEdit] =
    useState<KlassItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [loadingEdit, setLoadingEdit] = useState(false);

  const handleAdd = async () => {
    if (!selectedPaye || !selectedReshteh || !classTitle.trim()) {
      toast.warning(
        "لطفاً تمامی فیلدها (پایه، رشته و عنوان کلاس) را وارد کنید",
      );
      return;
    }

    setLoadingAdd(true);
    const res = await createKlass(
      classTitle,
      schoolId,
      academicYearId,
      selectedPaye,
      selectedReshteh,
    );

    if (res.status === "success") {
      toast.success("کلاس جدید با موفقیت ثبت شد");
      setClassTitle("");
    } else {
      toast.error(String(res.error));
    }
    setLoadingAdd(false);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemToEdit || !editTitle.trim()) {
      toast.warning("عنوان کلاس نمی‌تواند خالی باشد");
      return;
    }

    setLoadingEdit(true);
    const res = await updateKlass(selectedItemToEdit.id, editTitle, schoolId);
    if (res.status === "success") {
      toast.success("عنوان کلاس با موفقیت بروزرسانی شد");
      setSelectedItemToEdit(null);
      setEditTitle("");
    } else {
      toast.error(String(res.error));
    }
    setLoadingEdit(false);
  };

  return (
    <div className="space-y-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <BackButton
        href="/dashboard/manager"
        label="بازگشت به پنل مدیریت"
        className="mb-3"
      />
      {/* بخش ثبت کلاس جدید */}
      <div className="bg-indigo-50/70 p-4 rounded-lg space-y-4 border border-indigo-100/50">
        <h2 className="text-sm font-semibold text-indigo-900">
          تعریف کلاس جدید:
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              پایه تحصیلی:
            </label>
            <select
              value={selectedPaye}
              onChange={(e) => setSelectedPaye(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-indigo-500"
            >
              <option value={0}>انتخاب پایه ...</option>
              {payes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              رشته تحصیلی:
            </label>
            <select
              value={selectedReshteh}
              onChange={(e) => setSelectedReshteh(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-indigo-500"
            >
              <option value={0}>انتخاب رشته ...</option>
              {reshtehs.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              عنوان کلاس (مثال: دهم برق ۱):
            </label>
            <input
              type="text"
              placeholder="مثال: ۱۰۱ یا دهم برق ۱"
              value={classTitle}
              onChange={(e) => setClassTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-indigo-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleAdd}
            disabled={
              !selectedPaye ||
              !selectedReshteh ||
              !classTitle.trim() ||
              loadingAdd
            }
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 transition-all text-sm font-medium"
          >
            <Plus size={18} />
            {loadingAdd ? "در حال ثبت..." : "افزودن کلاس"}
          </button>
        </div>
      </div>

      {/* جدول نمایش کلاس‌ها */}
      <DataTableLayout totalCount={totalCount}>
        <Table>
          <thead>
            <HeadTr>
              <SortableTh field="title" sortable title="عنوان کلاس">
                <ColumnSearch field="title" />
              </SortableTh>

              <SortableTh field="paye.title" sortable title="پایه تحصیلی">
                <ColumnSearch field="paye.title" />
              </SortableTh>

              <SortableTh
                field="reshtehTahsili.title"
                sortable
                title="رشته تحصیلی"
              >
                <ColumnSearch field="reshtehTahsili.title" />
              </SortableTh>

              <ThActions>عملیات</ThActions>
            </HeadTr>
          </thead>

          <Tbody>
            {klasses.map((item) => (
              <Tr key={item.id}>
                <Td>{item.title}</Td>
                <Td>{item.paye.title}</Td>
                <Td>{item.reshtehTahsili.title}</Td>
                <TdActions>
                  <EditBtn
                    onClick={() => {
                      setSelectedItemToEdit(item);
                      setEditTitle(item.title);
                    }}
                  />
                  <DeleteBtn
                    onClick={() => {
                      setSelectedItemToDelete(item);
                      setOpenDelete(true);
                    }}
                  />
                </TdActions>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </DataTableLayout>

      {/* مودال تأیید حذف */}
      <DeleteConfirmModal
        open={openDelete}
        setOpen={(v) => {
          setOpenDelete(v);
          if (!v) setSelectedItemToDelete(null);
        }}
        item={selectedItemToDelete}
        getTitle={() => "حذف کلاس"}
        getDescription={(item) =>
          `آیا از حذف کلاس "${item.title}" مربوط به پایه "${item.paye.title}" مطمئن هستید؟`
        }
        onDelete={async (item) => {
          return await deleteKlass(item.id, schoolId);
        }}
      />

      {/* مودال ویرایش عنوان کلاس */}
      {selectedItemToEdit && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl border border-gray-100">
            <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Edit2 size={18} className="text-indigo-600" />
              ویرایش عنوان کلاس
            </h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  پایه و رشته (غیرقابل تغییر):
                </label>
                <div className="p-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-500">
                  {selectedItemToEdit.paye.title} -{" "}
                  {selectedItemToEdit.reshtehTahsili.title}
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  عنوان جدید کلاس:
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedItemToEdit(null)}
                  className="px-4 py-2 border rounded text-sm text-gray-600 hover:bg-gray-100"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={loadingEdit || !editTitle.trim()}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm disabled:bg-gray-400"
                >
                  {loadingEdit ? "در حال ثبت..." : "ثبت تغییرات"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Pagination pageSize={pageSize} totalCount={totalCount} />
    </div>
  );
}
