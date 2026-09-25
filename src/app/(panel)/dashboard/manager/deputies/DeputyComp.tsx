"use client";

import React, { useState } from "react";
import { toast } from "react-toastify";
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
import BackButton from "@/components/widgets/Elements/BackButton";
import { Trash2, Shield } from "lucide-react";
import DeputyForm from "./DeputyForm";
import { deleteDeputy } from "@/actions/deputyActions";

type DeputyItem = {
  id: string;
  firstName: string;
  lastName: string;
  nationalCode: string;
  phone: string;
  address: string | null;
  permissions: string[];
  assignmentId: string;
};

type Props = {
  listItems: DeputyItem[];
  totalCount: number;
  pageSize: number;
};

export default function DeputyComp({ listItems, totalCount, pageSize }: Props) {
  const [openCreate, setOpenCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    const res = await deleteDeputy(id);

    if (res.status === "error") {
      toast.error(res.error, { autoClose: 8000 });
      throw new Error(res.error);
    }

    toast.success("معاون با موفقیت حذف شد");
  };

  return (
    <div className="p-2">
      <TitlePage>معاونین مدرسه</TitlePage>
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
              title="تعریف معاون جدید"
              desc="اطلاعات معاون و دسترسی‌های او را وارد کنید"
              open={openCreate}
              setOpen={setOpenCreate}
              trigger={<CreateBtn>تعریف معاون جدید</CreateBtn>}
              contentClassName="w-[95vw] max-w-4xl"
            >
              <DeputyForm setOpen={setOpenCreate} mode="create" />
            </ActionModal>
          }
        >
          <Table>
            <thead>
              <HeadTr>
                <SortableTh field="firstName" sortable title="نام">
                  <TextSearch field="firstName" placeholder="جستجوی نام..." />
                </SortableTh>
                <SortableTh field="lastName" sortable title="نام خانوادگی">
                  <TextSearch field="lastName" placeholder="جستجو..." />
                </SortableTh>
                <SortableTh field="nationalCode" sortable title="کد ملی">
                  <TextSearch field="nationalCode" placeholder="جستجو..." />
                </SortableTh>
                <SortableTh field="phone" sortable title="شماره تماس">
                  <TextSearch field="phone" placeholder="جستجو..." />
                </SortableTh>
                <SortableTh field="permissions" title="دسترسی‌ها">
                  <span className="text-xs text-gray-400">تعداد</span>
                </SortableTh>
                <ThActions>عملیات</ThActions>
              </HeadTr>
            </thead>
            <Tbody>
              {listItems.length === 0 ? (
                <Tr>
                  <Td>
                    <div className="py-6 text-center text-gray-500">
                      معاونی برای نمایش وجود ندارد.
                    </div>
                  </Td>
                </Tr>
              ) : (
                listItems.map((item) => {
                  const isEditOpen = editingId === item.id;

                  return (
                    <Tr key={item.id}>
                      <Td>{item.firstName}</Td>
                      <Td>{item.lastName}</Td>
                      <Td>{item.nationalCode}</Td>
                      <Td>{item.phone}</Td>
                      <Td>
                        <div className="flex items-center gap-1">
                          <Shield size={14} className="text-indigo-500" />
                          <span className="font-bold">
                            {item.permissions.length}
                          </span>
                          <span className="text-xs text-zinc-500">دسترسی</span>
                        </div>
                      </Td>
                      <TdActions>
                        <div className="flex items-center justify-center gap-1">
                          <ActionModal
                            title="ویرایش معاون"
                            desc="ویرایش اطلاعات و دسترسی‌های معاون"
                            open={isEditOpen}
                            setOpen={(isOpen) =>
                              setEditingId(isOpen ? item.id : null)
                            }
                            contentClassName="w-[95vw] max-w-4xl"
                            trigger={
                              <span onClick={() => setEditingId(item.id)}>
                                <EditBtn />
                              </span>
                            }
                          >
                            <DeputyForm
                              key={item.id}
                              setOpen={(isOpen) => {
                                if (!isOpen) setEditingId(null);
                              }}
                              mode="edit"
                              initialData={{
                                id: item.id,
                                firstName: item.firstName,
                                lastName: item.lastName,
                                nationalCode: item.nationalCode,
                                phone: item.phone,
                                address: item.address,
                                permissions: item.permissions,
                              }}
                            />
                          </ActionModal>

                          <ConfirmModal
                            title="حذف معاون"
                            desc={`آیا از حذف معاون "${item.firstName} ${item.lastName}" از این مدرسه مطمئن هستید؟`}
                            open={deletingId === item.id}
                            setOpen={(isOpen) =>
                              setDeletingId(isOpen ? item.id : null)
                            }
                            onConfirm={() => handleDelete(item.id)}
                            confirmText="حذف"
                            cancelText="انصراف"
                            confirmButtonClassName="bg-rose-600 hover:bg-rose-700"
                            trigger={
                              <button
                                type="button"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-rose-300 text-rose-700 transition hover:bg-rose-50"
                                title="حذف"
                              >
                                <Trash2 size={14} />
                              </button>
                            }
                          >
                            <div className="px-4 py-3 text-sm leading-7 text-gray-700">
                              <p className="font-medium text-rose-600">
                                ⚠️ توجه: این عملیات معاون را از این مدرسه حذف
                                می‌کند.
                              </p>
                              <p className="mt-2">
                                معاون{" "}
                                <strong>
                                  {item.firstName} {item.lastName}
                                </strong>{" "}
                                در دیتابیس باقی می‌ماند و می‌تواند در سال‌های
                                بعد یا مدارس دیگر تعریف شود.
                              </p>
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
