"use client";
import ActionModal from "@/components/widgets/ActionModal";
import CreateBtn from "@/components/widgets/Elements/CreateBtn";
import HeadTr from "@/components/widgets/Elements/table/HeaddTr";
import Table from "@/components/widgets/Elements/table/Table";
import Tbody from "@/components/widgets/Elements/table/Tbody";
import Td from "@/components/widgets/Elements/table/Td";
import Th from "@/components/widgets/Elements/table/Th";
import Tr from "@/components/widgets/Elements/table/Tr";
import TitlePage from "@/components/widgets/TitlePage";
import React, { useState } from "react";
import CreateDoreh from "./CreateDoreh";
import { DoreTahsili } from "@prisma/client";
import DeleteBtn from "@/components/widgets/Elements/DeleteBtn";
import DeleteDoreh from "./DeleteDoreh";
import DeleteConfirmModal from "@/components/widgets/DeleteConfirmModal";
import { DeleteDorehTahiliAction } from "@/actions/dorehTahsiliActions";
import { toast } from "react-toastify";

export default function DoreTahsiliComp({
  doreTahisilis,
}: {
  doreTahisilis: DoreTahsili[];
}) {
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DoreTahsili | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  return (
    <div className="p-2">
      <TitlePage> لیست دوره تحصیلی</TitlePage>

      <div className="container mx-auto px-4 py-2">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <ActionModal
            desc="فرم ثبت مشخصات دوره تحصیلی"
            open={open}
            setOpen={() => setOpen(true)}
            title="ثبت دوره تحصیلی"
            trigger={<CreateBtn>ثبت دوره تحصیلی جدید</CreateBtn>}
          >
            <CreateDoreh setOpen={setOpen} />
          </ActionModal>
          <div className="w-full md:w-1/3 mb-4 md:mb-0">
            <input
              type="text"
              placeholder="Search users..."
              className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <Table>
          <thead>
            <HeadTr>
              <Th>کد</Th>
              <Th>نام</Th>
              <Th>عملیات</Th>
            </HeadTr>
          </thead>
          <Tbody>
            {doreTahisilis &&
              doreTahisilis.map((item) => (
                <Tr key={item.id}>
                  <Td>{item.id}</Td>
                  <Td> {item.title}</Td>

                  <Td>
                    <DeleteBtn
                      onClick={() => {
                        setSelectedItem(item);
                        setDeleteOpen(true);
                      }}
                    />
                  </Td>
                </Tr>
              ))}
          </Tbody>
        </Table>

        <DeleteConfirmModal
          open={deleteOpen}
          setOpen={(v) => {
            setDeleteOpen(v);
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
          // onDeleted={(item) => {
          //   // 🔥 optimistic update
          //   setData((prev) => prev.filter((x) => x.id !== item.id));
          // }}
        />
        <div className="flex justify-between items-center mt-6">
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
        </div>
      </div>
    </div>
  );
}
