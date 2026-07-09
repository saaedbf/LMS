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

import { ReshtehTadris } from "@prisma/client";
import DeleteBtn from "@/components/widgets/Elements/DeleteBtn";

import DeleteConfirmModal from "@/components/widgets/DeleteConfirmModal";
import { DeleteReshteTadrisAction } from "@/actions/reshtehTadrisesActions";

import CreateForm from "./CreateReshtehTadrisForm";
import UpdateForm from "./UpdateReshtehTadrisForm";
import TdActions from "@/components/widgets/Elements/table/TdActions";
import EditBtn from "@/components/widgets/Elements/EditBtn";
import ThActions from "@/components/widgets/Elements/table/ThActions";
import DataTableLayout from "@/components/widgets/DataTableLayout";
import Pagination from "@/components/widgets/Pagination";
import SortableTh from "@/components/widgets/Elements/table/SortableTh";
import ColumnSearch from "@/components/widgets/Elements/table/ColumnSearch";

export default function ReshtehTadrisComp({
  listItems,
  totalCount,
}: {
  listItems: ReshtehTadris[];
  totalCount: number;
  currentPage: number;
  search: string;
}) {
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ReshtehTadris | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  return (
    <div className="p-2">
      <TitlePage> لیست رشته تدریس</TitlePage>

      <div className="container mx-auto px-4 py-2">
        <DataTableLayout
          totalCount={totalCount}
          action={
            <ActionModal
              desc="فرم ثبت مشخصات رشته تدریس"
              open={openCreate}
              setOpen={() => setOpenCreate(true)}
              title="ثبت رشته تدریس"
              trigger={<CreateBtn>ثبت رشته تدریس جدید</CreateBtn>}
            >
              <CreateForm setOpen={setOpenCreate} />
            </ActionModal>
          }
        >
          <Table>
            <thead>
              <HeadTr>
                {/* <SortableTh field="id" sortable>
                  <div className="flex gap-2 items-center justify-center">
                    <span> کد</span>
                    <ColumnSearch field="id" />
                  </div>
                </SortableTh> */}

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
              {listItems &&
                listItems.map((item) => (
                  <Tr key={item.id}>
                    {/* <Td>{item.id}</Td> */}
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
          desc="فرم ویرایش مشخصات رشته تدریس"
          open={openEdit}
          setOpen={() => setOpenEdit(true)}
          title="ویرایش رشته تدریس"
          trigger={null}
        >
          <UpdateForm
            setOpen={setOpenEdit}
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
          getTitle={() => "حذف رشته تدریس"}
          getDescription={(item) =>
            `آیا از حذف رشته تدریس با  نام ${item.title} مطمئن هستید؟`
          }
          onDelete={async (item) => {
            return await DeleteReshteTadrisAction(item.id);
          }}
        />

        <Pagination pageSize={2} totalCount={totalCount} />
      </div>
    </div>
  );
}
