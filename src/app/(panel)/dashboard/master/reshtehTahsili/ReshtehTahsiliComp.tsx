"use client";
import ActionModal from "@/components/widgets/ActionModal";
import CreateBtn from "@/components/widgets/Elements/CreateBtn";
import HeadTr from "@/components/widgets/Elements/table/HeaddTr";
import Table from "@/components/widgets/Elements/table/Table";
import Tbody from "@/components/widgets/Elements/table/Tbody";
import Td from "@/components/widgets/Elements/table/Td";

import Tr from "@/components/widgets/Elements/table/Tr";
import TitlePage from "@/components/widgets/TitlePage";
import React, { useState } from "react";

import { ReshtehTahsili } from "@prisma/client";
import DeleteBtn from "@/components/widgets/Elements/DeleteBtn";

import DeleteConfirmModal from "@/components/widgets/DeleteConfirmModal";
import { DeleteReshteTahiliAction } from "@/actions/reshtehTahsiliActions";

import ListForm from "./ReshteTahsiliForm";
import TdActions from "@/components/widgets/Elements/table/TdActions";
import EditBtn from "@/components/widgets/Elements/EditBtn";
import ThActions from "@/components/widgets/Elements/table/ThActions";
import DataTableLayout from "@/components/widgets/DataTableLayout";
import Pagination from "@/components/widgets/Pagination";
import SortableTh from "@/components/widgets/Elements/table/SortableTh";
import ColumnSearch from "@/components/widgets/Elements/table/ColumnSearch";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import ActionButton from "@/components/widgets/Elements/table/ActionButton";
import BackButton from "@/components/widgets/Elements/BackButton";

export default function ReshtehTahsiliComp({
  listItems,
  totalCount,
  pageSize,
}: {
  listItems: ReshtehTahsili[];
  totalCount: number;
  pageSize: number;
}) {
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ReshtehTahsili | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  return (
    <div className="p-2">
      <TitlePage> لیست رشته تحصیلی</TitlePage>
      <BackButton
        href="/dashboard/master"
        label="بازگشت به پنل مدیریت "
        className="mb-3"
      />
      <div className="container mx-auto px-4 py-2">
        <DataTableLayout
          totalCount={totalCount}
          action={
            <ActionModal
              desc="فرم ثبت مشخصات رشته تحصیلی"
              open={openCreate}
              setOpen={() => setOpenCreate(true)}
              title="ثبت رشته تحصیلی"
              trigger={<CreateBtn>ثبت رشته تحصیلی جدید</CreateBtn>}
            >
              <ListForm setOpen={setOpenCreate} mode="create" />
            </ActionModal>
          }
        >
          <Table>
            <thead>
              <HeadTr>
                <SortableTh field="id" sortable title="کد">
                  <ColumnSearch field="id" />
                </SortableTh>

                <SortableTh field="title" sortable title="نام">
                  <ColumnSearch field="title" />
                </SortableTh>
                <ThActions>عملیات</ThActions>
              </HeadTr>
            </thead>
            <Tbody>
              {listItems &&
                listItems.map((item) => (
                  <Tr key={item.id}>
                    <Td>{item.id}</Td>
                    <Td> {item.title}</Td>

                    <TdActions>
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
                      {/* دکمه انتقال به بخش مدیریت دروس رشته */}
                      <Link
                        href={`/dashboard/master/reshtehTahsili/${item.id}/courses`}
                        className="p-1 text-indigo-600 hover:text-indigo-900 transition-colors"
                        title="مدیریت دروس و واحدها"
                      >
                        <ActionButton
                          color="amber"
                          size="sm"
                          icon={<BookOpen size={14} />}
                        >
                          مدیریت دروس و واحدها
                        </ActionButton>
                      </Link>
                    </TdActions>
                  </Tr>
                ))}
            </Tbody>
          </Table>
        </DataTableLayout>
        {/* مودال ویرایش */}
        <ActionModal
          desc="فرم ویرایش مشخصات رشته تحصیلی"
          open={openEdit}
          setOpen={() => setOpenEdit(true)}
          title="ویرایش رشته تحصیلی"
          trigger={null}
        >
          <ListForm
            setOpen={setOpenEdit}
            mode="edit"
            defaultValues={selectedItem || undefined}
          />
        </ActionModal>
        <DeleteConfirmModal
          open={openDelete}
          setOpen={(v) => {
            setOpenDelete(v);
            if (!v) setSelectedItem(null);
          }}
          item={selectedItem}
          getTitle={() => "حذف رشته تحصیلی"}
          getDescription={(item) =>
            `آیا از حذف رشته تحصیلی با کد ${item.id} و نام ${item.title} مطمئن هستید؟`
          }
          onDelete={async (item) => {
            return await DeleteReshteTahiliAction(item.id);
          }}
        />

        <Pagination pageSize={pageSize} totalCount={totalCount} />
      </div>
    </div>
  );
}
