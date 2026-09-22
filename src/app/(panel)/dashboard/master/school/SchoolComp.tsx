"use client";

import ActionModal from "@/components/widgets/ActionModal";
import CreateBtn from "@/components/widgets/Elements/CreateBtn";
import HeadTr from "@/components/widgets/Elements/table/HeaddTr";
import Table from "@/components/widgets/Elements/table/Table";
import Tbody from "@/components/widgets/Elements/table/Tbody";
import Td from "@/components/widgets/Elements/table/Td";
import Tr from "@/components/widgets/Elements/table/Tr";
import TitlePage from "@/components/widgets/TitlePage";
import React, { useState, useTransition } from "react";
import { School } from "@prisma/client";
import DeleteBtn from "@/components/widgets/Elements/DeleteBtn";
import DeleteConfirmModal from "@/components/widgets/DeleteConfirmModal";
import {
  deleteSchoolAction,
  resetSchoolManagerPassword, // ⬅️ اضافه کنید
} from "@/actions/schoolActions";
import SchoolForm from "./SchoolForm";
import TdActions from "@/components/widgets/Elements/table/TdActions";
import EditBtn from "@/components/widgets/Elements/EditBtn";
import ThActions from "@/components/widgets/Elements/table/ThActions";
import DataTableLayout from "@/components/widgets/DataTableLayout";
import Pagination from "@/components/widgets/Pagination";
import SortableTh from "@/components/widgets/Elements/table/SortableTh";
import ColumnSearch from "@/components/widgets/Elements/table/ColumnSearch";
import ResetPasswordBtn from "@/components/widgets/Elements/ResetPasswordBtn"; // ⬅️
import ConfirmModal from "@/components/widgets/ConfirmModal"; // ⬅️
import BackButton from "@/components/widgets/Elements/BackButton"; // ⬅️
import { toast } from "react-toastify"; // ⬅️

export default function SchoolComp({
  listItems,
  totalCount,
  pageSize,
}: {
  listItems: School[];
  totalCount: number;
  pageSize: number;
}) {
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedItem, setSelectedItem] = useState<School | null>(null);
  const [openDelete, setOpenDelete] = useState(false);

  // ⬅️ state برای ریست رمز
  const [resetPasswordSchool, setResetPasswordSchool] = useState<School | null>(
    null,
  );
  const [resettingSchoolId, setResettingSchoolId] = useState<number | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();

  // ⬅️ تابع ریست رمز
  const handleResetPassword = (school: School) => {
    setResettingSchoolId(school.id);

    startTransition(async () => {
      try {
        const res = await resetSchoolManagerPassword(school.id);

        if (res.status === "error") {
          toast.error(res.error.toString());
        } else {
          toast.success(res.data.message, {
            autoClose: 8000,
          });
          setResetPasswordSchool(null);
        }
      } catch (error) {
        console.error(error);
        toast.error("خطا در ریست کلمه عبور.");
      } finally {
        setResettingSchoolId(null);
      }
    });
  };

  return (
    <div className="p-2">
      {/* ⬅️ دکمه بازگشت */}
      <BackButton
        href="/dashboard/master"
        label="بازگشت به پنل مدیریت "
        className="mb-3"
      />

      <TitlePage>لیست مدارس</TitlePage>

      <div className="container mx-auto px-4 py-2">
        <DataTableLayout
          totalCount={totalCount}
          action={
            <ActionModal
              desc="فرم ثبت مشخصات مدرسه"
              open={openCreate}
              setOpen={setOpenCreate}
              title="ثبت مدرسه جدید"
              trigger={<CreateBtn>ثبت مدرسه جدید</CreateBtn>}
              contentClassName="w-[95vw] max-w-4xl"
            >
              <SchoolForm setOpen={setOpenCreate} mode="create" />
            </ActionModal>
          }
        >
          <Table>
            <thead>
              <HeadTr>
                <SortableTh field="id" sortable title="کد">
                  <ColumnSearch field="id" />
                </SortableTh>

                <SortableTh field="title" sortable title="نام مدرسه">
                  <ColumnSearch field="title" />
                </SortableTh>

                <SortableTh field="modirName" sortable title="نام مدیر">
                  <ColumnSearch field="modirName" />
                </SortableTh>

                <SortableTh field="doreTitle" sortable title="دوره تحصیلی">
                  <ColumnSearch field="doreTitle" />
                </SortableTh>

                <SortableTh field="schoolType" sortable title="نوع مدرسه">
                  <ColumnSearch field="schoolType" />
                </SortableTh>

                <ThActions>عملیات</ThActions>
              </HeadTr>
            </thead>
            <Tbody>
              {listItems.map((item) => (
                <Tr key={item.id}>
                  <Td>{item.id}</Td>
                  <Td>{item.title}</Td>
                  <Td>{item.modirName}</Td>
                  <Td>{(item as any).doreTahsili?.title || ""}</Td>
                  <Td>{item.schoolType}</Td>
                  <TdActions>
                    {/* ⬅️ دکمه ریست رمز */}
                    <ConfirmModal
                      title="ریست کلمه عبور مدیر"
                      desc={`آیا مطمئن هستید که کلمه عبور مدیر مدرسه "${item.title}" به کد مدرسه (${item.id}) تغییر کند؟`}
                      open={resetPasswordSchool?.id === item.id}
                      setOpen={(isOpen) => {
                        setResetPasswordSchool(isOpen ? item : null);
                      }}
                      onConfirm={() => handleResetPassword(item)}
                      confirmText="تأیید ریست"
                      cancelText="انصراف"
                      loading={resettingSchoolId === item.id}
                      confirmButtonClassName="bg-amber-600 hover:bg-amber-700"
                      trigger={<ResetPasswordBtn title="ریست کلمه عبور مدیر" />}
                    >
                      <div className="mx-4 mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
                        <p className="font-bold">توجه:</p>
                        <ul className="mt-1 list-inside list-disc space-y-0.5">
                          <li>
                            کلمه عبور جدید برابر کد مدرسه ({item.id}) خواهد بود.
                          </li>
                          <li>
                            مدیر می‌تواند پس از ورود، رمز خود را تغییر دهد.
                          </li>
                          <li>این عملیات قابل بازگشت نیست.</li>
                        </ul>
                      </div>
                    </ConfirmModal>

                    <DeleteBtn
                      onClick={() => {
                        setSelectedItem(item);
                        setOpenDelete(true);
                      }}
                    />
                    <EditBtn
                      onClick={() => {
                        setSelectedItem(item);
                        setOpenEdit(true);
                      }}
                    />
                  </TdActions>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </DataTableLayout>

        {/* مودال ویرایش */}
        <ActionModal
          desc="فرم ویرایش مشخصات مدرسه"
          open={openEdit}
          setOpen={setOpenEdit}
          title="ویرایش مدرسه"
          trigger={null}
          contentClassName="w-[95vw] max-w-4xl"
        >
          <SchoolForm
            setOpen={setOpenEdit}
            mode="edit"
            defaultValues={
              selectedItem
                ? {
                    id: selectedItem.id,
                    title: selectedItem.title,
                    subTitle: selectedItem.subTitle ?? undefined,
                    modirName: selectedItem.modirName,
                    isActive: selectedItem.isActive,
                    sex: selectedItem.sex,
                    schoolType: selectedItem.schoolType,
                    doreTahsiliId: selectedItem.doreTahsiliId,
                  }
                : undefined
            }
          />
        </ActionModal>

        <DeleteConfirmModal
          open={openDelete}
          setOpen={(v) => {
            setOpenDelete(v);
            if (!v) setSelectedItem(null);
          }}
          item={selectedItem}
          getTitle={() => "حذف مدرسه"}
          getDescription={(item) =>
            `آیا از حذف مدرسه "${item.title}" با کد ${item.id} مطمئن هستید؟`
          }
          onDelete={async (item) => {
            return await deleteSchoolAction(item.id);
          }}
        />

        <Pagination pageSize={pageSize} totalCount={totalCount} />
      </div>
    </div>
  );
}
