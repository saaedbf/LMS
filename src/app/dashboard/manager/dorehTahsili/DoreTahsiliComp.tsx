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

import { DoreTahsili } from "@prisma/client";
import DeleteBtn from "@/components/widgets/Elements/DeleteBtn";

import DeleteConfirmModal from "@/components/widgets/DeleteConfirmModal";
import { DeleteDorehTahiliAction } from "@/actions/dorehTahsiliActions";

import DorehForm from "./DorehForm";
import TdActions from "@/components/widgets/Elements/table/TdActions";
import EditBtn from "@/components/widgets/Elements/EditBtn";
import ThActions from "@/components/widgets/Elements/table/ThActions";
import DataTableLayout from "@/components/widgets/DataTableLayout";
import Pagination from "@/components/widgets/Pagination";
import SortableTh from "@/components/widgets/Elements/table/SortableTh";
import ColumnSearch from "@/components/widgets/Elements/table/ColumnSearch";
import { ListProps } from "@/types/myTypes";

export default function DoreTahsiliComp({
  listItems,
  totalCount,
  pageSize,
}: ListProps<DoreTahsili>) {
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DoreTahsili | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  return (
    <div className="p-2">
      <TitlePage> لیست دوره تحصیلی</TitlePage>

      <div className="container mx-auto px-4 py-2">
        <DataTableLayout
          totalCount={totalCount}
          action={
            <ActionModal
              desc="فرم ثبت مشخصات دوره تحصیلی"
              open={openCreate}
              setOpen={() => setOpenCreate(true)}
              title="ثبت دوره تحصیلی"
              trigger={<CreateBtn>ثبت دوره تحصیلی جدید</CreateBtn>}
            >
              <DorehForm setOpen={setOpenCreate} mode="create" />
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
                    </TdActions>
                  </Tr>
                ))}
            </Tbody>
          </Table>
        </DataTableLayout>
        {/* مودال ویرایش */}
        <ActionModal
          desc="فرم ویرایش مشخصات دوره تحصیلی"
          open={openEdit}
          setOpen={() => setOpenEdit(true)}
          title="ویرایش دوره تحصیلی"
          trigger={null}
        >
          <DorehForm
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
          getTitle={() => "حذف دوره تحصیلی"}
          getDescription={(item) =>
            `آیا از حذف دوره با کد ${item.id} و نام ${item.title} مطمئن هستید؟`
          }
          onDelete={async (item) => {
            return await DeleteDorehTahiliAction(item.id);
          }}
        />

        <Pagination pageSize={pageSize} totalCount={totalCount} />
      </div>
    </div>
  );
}
