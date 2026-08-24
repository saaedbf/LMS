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
import { School } from "@prisma/client";
import DeleteBtn from "@/components/widgets/Elements/DeleteBtn";
import DeleteConfirmModal from "@/components/widgets/DeleteConfirmModal";
import { deleteSchoolAction } from "@/actions/schoolActions";
import SchoolForm from "./SchoolForm";
import TdActions from "@/components/widgets/Elements/table/TdActions";
import EditBtn from "@/components/widgets/Elements/EditBtn";
import ThActions from "@/components/widgets/Elements/table/ThActions";
import DataTableLayout from "@/components/widgets/DataTableLayout";
import Pagination from "@/components/widgets/Pagination";
import SortableTh from "@/components/widgets/Elements/table/SortableTh";
import ColumnSearch from "@/components/widgets/Elements/table/ColumnSearch";

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

  return (
    <div className="p-2">
      <TitlePage>لیست مدارس</TitlePage>

      <div className="container mx-auto px-4 py-2">
        <DataTableLayout
          totalCount={totalCount}
          action={
            <ActionModal
              desc="فرم ثبت مشخصات مدرسه"
              open={openCreate}
              setOpen={() => setOpenCreate(true)}
              title="ثبت مدرسه جدید"
              trigger={<CreateBtn>ثبت مدرسه جدید</CreateBtn>}
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
          setOpen={() => setOpenEdit(true)}
          title="ویرایش مدرسه"
          trigger={null}
        >
          <SchoolForm
            setOpen={setOpenEdit}
            mode="edit"
            defaultValues={
              selectedItem
                ? {
                    id: selectedItem.id,
                    title: selectedItem.title,
                    subTitle: selectedItem.subTitle ?? undefined, // تبدیل null به undefined
                    modirName: selectedItem.modirName,
                    isActive: selectedItem.isActive,
                    sex: selectedItem.sex, // اگر Enumها دقیقاً یکی هستند
                    schoolType: selectedItem.schoolType, // اگر Enumها دقیقاً یکی هستند
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
