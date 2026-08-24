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

import { Ostan } from "@prisma/client";
import DeleteBtn from "@/components/widgets/Elements/DeleteBtn";

import DeleteConfirmModal from "@/components/widgets/DeleteConfirmModal";
import { DeleteOstanAction } from "@/actions/ostanActions";

import ListForm from "./OstanForm";
import TdActions from "@/components/widgets/Elements/table/TdActions";
import EditBtn from "@/components/widgets/Elements/EditBtn";
import ThActions from "@/components/widgets/Elements/table/ThActions";
import DataTableLayout from "@/components/widgets/DataTableLayout";
import Pagination from "@/components/widgets/Pagination";
import SortableTh from "@/components/widgets/Elements/table/SortableTh";
import ColumnSearch from "@/components/widgets/Elements/table/ColumnSearch";

import { ListProps } from "@/types/myTypes";

export default function OstanComp({
  listItems,
  totalCount,
  pageSize,
}: ListProps<Ostan>) {
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Ostan | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  return (
    <div className="p-2">
      <TitlePage> لیست استان ها</TitlePage>

      <div className="container mx-auto px-4 py-2">
        <DataTableLayout
          totalCount={totalCount}
          action={
            <ActionModal
              desc="فرم ثبت مشخصات استان"
              open={openCreate}
              setOpen={() => setOpenCreate(true)}
              title="ثبت استان"
              trigger={<CreateBtn>ثبت استان جدید</CreateBtn>}
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
                    </TdActions>
                  </Tr>
                ))}
            </Tbody>
          </Table>
        </DataTableLayout>
        {/* مودال ویرایش */}
        <ActionModal
          desc="فرم ویرایش مشخصات  استان"
          open={openEdit}
          setOpen={() => setOpenEdit(true)}
          title="ویرایش  استان"
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
          getTitle={() => "حذف استان"}
          getDescription={(item) =>
            `آیا از حذف استان با کد ${item.id} و نام ${item.title} مطمئن هستید؟`
          }
          onDelete={async (item) => {
            return await DeleteOstanAction(item.id);
          }}
        />

        <Pagination pageSize={pageSize} totalCount={totalCount} />
      </div>
    </div>
  );
}
