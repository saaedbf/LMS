// components/class-course/ClassCourseComp.tsx
"use client";

import React, { useState } from "react";
import TextSearch from "@/components/widgets/Elements/table/TextSearch";
import HeadTr from "@/components/widgets/Elements/table/HeaddTr";
import Table from "@/components/widgets/Elements/table/Table";
import Tbody from "@/components/widgets/Elements/table/Tbody";
import Td from "@/components/widgets/Elements/table/Td";
import Tr from "@/components/widgets/Elements/table/Tr";
import ThActions from "@/components/widgets/Elements/table/ThActions";
import SortableTh from "@/components/widgets/Elements/table/SortableTh";
import TdActions from "@/components/widgets/Elements/table/TdActions";
import DataTableLayout from "@/components/widgets/DataTableLayout";
import Pagination from "@/components/widgets/Pagination";
import TitlePage from "@/components/widgets/TitlePage";
import TeacherSelectModal from "./TeacherSelectModal";
import BackButton from "@/components/widgets/Elements/BackButton";

type Teacher = {
  id: string;
  firstName: string;
  lastName: string;
  nationalCode: string;
};

type ClassCourseItem = {
  id: string; // "klassId-darsId"
  klassId: string;
  klassTitle: string;
  payeId: number;
  payeTitle: string;
  reshtehTahsiliTitle: string;
  darsPayeReshtehId: string;
  lessonTitle: string;
  units: number;
  classCourseId: string | null;
  teacherId: string | null;
  teacher: Teacher | null;
};

type Props = {
  listItems: ClassCourseItem[];
  totalCount: number;
  pageSize: number;
};

export default function ClassCourseComp({
  listItems,
  totalCount,
  pageSize,
}: Props) {
  // ذخیره تغییرات محلی برای به‌روزرسانی UI بدون refresh
  const [localChanges, setLocalChanges] = useState<
    Record<string, Teacher | null>
  >({});

  const getTeacher = (item: ClassCourseItem): Teacher | null => {
    if (item.id in localChanges) {
      return localChanges[item.id];
    }
    return item.teacher;
  };

  const handleTeacherChange = (itemId: string, teacher: Teacher | null) => {
    setLocalChanges((prev) => ({ ...prev, [itemId]: teacher }));
  };

  return (
    <div className="p-2">
      <TitlePage>تخصیص معلم به دروس کلاس‌ها</TitlePage>
      <BackButton
        href="/dashboard/manager"
        label="بازگشت به پنل مدیریت"
        className="mb-3"
      />
      <div className="container mx-auto px-4 py-2">
        <DataTableLayout totalCount={totalCount}>
          <Table>
            <thead>
              <HeadTr>
                <SortableTh field="paye" sortable title="پایه">
                  <TextSearch field="paye" placeholder="جستجوی پایه..." />
                </SortableTh>

                <SortableTh field="klass" sortable title="کلاس">
                  <TextSearch field="klass" placeholder="جستجوی کلاس..." />
                </SortableTh>

                <SortableTh field="lesson" sortable title="درس">
                  <TextSearch field="lesson" placeholder="جستجوی درس..." />
                </SortableTh>

                <SortableTh field="teacher" sortable title="معلم">
                  <TextSearch field="teacher" placeholder="جستجوی معلم..." />
                </SortableTh>

                <ThActions>عملیات</ThActions>
              </HeadTr>
            </thead>

            <Tbody>
              {listItems.length === 0 ? (
                <Tr>
                  <Td>
                    <div className="py-6 text-center text-gray-500">
                      موردی برای نمایش وجود ندارد.
                    </div>
                  </Td>
                </Tr>
              ) : (
                listItems.map((item) => {
                  const teacher = getTeacher(item);

                  return (
                    <Tr key={item.id}>
                      <Td>
                        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                          {item.payeTitle}
                        </span>
                      </Td>

                      <Td>
                        <div className="flex flex-col">
                          <span className="text-sm text-zinc-800 dark:text-zinc-200">
                            {item.klassTitle}
                          </span>
                          <span className="text-xs text-zinc-500">
                            {item.reshtehTahsiliTitle}
                          </span>
                        </div>
                      </Td>

                      <Td>
                        <div className="flex flex-col">
                          <span className="text-sm text-zinc-800 dark:text-zinc-200">
                            {item.lessonTitle}
                          </span>
                          <span className="text-xs text-zinc-500">
                            {item.units} واحد
                          </span>
                        </div>
                      </Td>

                      <Td>
                        {teacher ? (
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
                              {teacher.firstName[0]}
                              {teacher.lastName[0]}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                                {teacher.firstName} {teacher.lastName}
                              </div>
                              <div className="text-xs text-zinc-500">
                                {teacher.nationalCode}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-amber-600 dark:text-amber-400">
                            انتخاب نشده
                          </span>
                        )}
                      </Td>

                      <TdActions>
                        <div className="flex items-center justify-center">
                          <TeacherSelectModal
                            klassId={item.klassId}
                            darsPayeReshtehId={item.darsPayeReshtehId}
                            currentTeacher={teacher}
                            onAssigned={(newTeacher) =>
                              handleTeacherChange(item.id, newTeacher)
                            }
                          />
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
