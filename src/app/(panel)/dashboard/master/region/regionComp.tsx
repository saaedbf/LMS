/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/manager/region/RegionComp.tsx
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
import { Region } from "@prisma/client";
import DeleteBtn from "@/components/widgets/Elements/DeleteBtn";
import DeleteConfirmModal from "@/components/widgets/DeleteConfirmModal";
import { DeleteRegionAction } from "@/actions/regionActions";
import RegionForm from "./regionForm";
import TdActions from "@/components/widgets/Elements/table/TdActions";
import EditBtn from "@/components/widgets/Elements/EditBtn";
import ThActions from "@/components/widgets/Elements/table/ThActions";
import DataTableLayout from "@/components/widgets/DataTableLayout";
import Pagination from "@/components/widgets/Pagination";
import SortableTh from "@/components/widgets/Elements/table/SortableTh";
import ColumnSearch from "@/components/widgets/Elements/table/ColumnSearch";

export default function RegionComp({
  listItems,
  totalCount,
  pageSize,
}: {
  listItems: Region[];
  totalCount: number;
  pageSize: number;
}) {
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Region | null>(null);
  const [openDelete, setOpenDelete] = useState(false);

  return (
    <div className="p-2">
      <TitlePage>لیست مناطق</TitlePage>

      <div className="container mx-auto px-4 py-2">
        <DataTableLayout
          totalCount={totalCount}
          action={
            <ActionModal
              desc="فرم ثبت مشخصات منطقه"
              open={openCreate}
              setOpen={() => setOpenCreate(true)}
              title="ثبت منطقه جدید"
              trigger={<CreateBtn>ثبت منطقه جدید</CreateBtn>}
            >
              <RegionForm setOpen={setOpenCreate} mode="create" />
            </ActionModal>
          }
        >
          <Table>
            <thead>
              <HeadTr>
                <SortableTh field="id" sortable title="کد">
                  <ColumnSearch field="id" />
                </SortableTh>

                <SortableTh field="title" sortable title="نام منطقه">
                  <ColumnSearch field="title" />
                </SortableTh>

                <SortableTh field="ostanTitle" sortable title="نام استان">
                  <ColumnSearch field="ostanTitle" />
                </SortableTh>
                <ThActions>عملیات</ThActions>
              </HeadTr>
            </thead>
            <Tbody>
              {listItems.map((item) => (
                <Tr key={item.id}>
                  <Td>{item.id}</Td>
                  <Td>{item.title}</Td>
                  <Td>{(item as any).ostan?.title || item.ostanId}</Td>
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
          desc="فرم ویرایش مشخصات منطقه"
          open={openEdit}
          setOpen={() => setOpenEdit(true)}
          title="ویرایش منطقه"
          trigger={null}
        >
          <RegionForm
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
          getTitle={() => "حذف منطقه"}
          getDescription={(item) =>
            `آیا از حذف منطقه "${item.title}" با کد ${item.id} مطمئن هستید؟`
          }
          onDelete={async (item) => {
            return await DeleteRegionAction(item.id);
          }}
        />

        <Pagination pageSize={pageSize} totalCount={totalCount} />
      </div>
    </div>
  );
}
