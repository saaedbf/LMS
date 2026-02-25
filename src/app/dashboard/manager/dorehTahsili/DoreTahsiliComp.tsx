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

export default function DoreTahsiliComp({
  doreTahisilis,
  totalCount,
}: {
  doreTahisilis: DoreTahsili[];
  totalCount: number;
  currentPage: number;
  search: string;
}) {
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
                <SortableTh field="id" sortable>
                  <div className="flex gap-2 items-center justify-center">
                    <span> کد</span>
                    <ColumnSearch field="id" />
                  </div>
                </SortableTh>

                <SortableTh field="title" sortable>
                  <div className="flex gap-2 items-center justify-center">
                    <span> نام</span>
                    <ColumnSearch field="title" />
                  </div>
                </SortableTh>
                <ThActions>عملیات</ThActions>
              </HeadTr>
            </thead>
            <Tbody>
              {doreTahisilis &&
                doreTahisilis.map((item) => (
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
        {/* <div className="flex justify-between items-center mt-6">
          <div>
            <span className="text-sm text-gray-700">
              Showing 1 to 5 of 5 entries
            </span>
          </div>
          <div className="flex space-x-2">
            <a href="https://abhirajk.vercel.app/" target="blank">
              <button className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 opacity-50">
                Previous
              </button>
            </a>
            <a href="https://abhirajk.vercel.app/" target="blank">
              <button className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 opacity-50">
                Next
              </button>
            </a>
          </div>
        </div> */}
        <Pagination pageSize={2} totalCount={totalCount} />
      </div>
    </div>
  );
}
