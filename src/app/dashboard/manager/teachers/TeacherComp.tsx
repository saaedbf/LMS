"use client";

import { Teacher } from "@prisma/client";
import React from "react";

import CreateBtn from "@/components/widgets/Elements/CreateBtn";
import HeadTr from "@/components/widgets/Elements/table/HeaddTr";
import Table from "@/components/widgets/Elements/table/Table";
import Tbody from "@/components/widgets/Elements/table/Tbody";
import Td from "@/components/widgets/Elements/table/Td";
import Tr from "@/components/widgets/Elements/table/Tr";
import TdActions from "@/components/widgets/Elements/table/TdActions";
import ThActions from "@/components/widgets/Elements/table/ThActions";
import SortableTh from "@/components/widgets/Elements/table/SortableTh";
import ColumnSearch from "@/components/widgets/Elements/table/ColumnSearch";
import DataTableLayout from "@/components/widgets/DataTableLayout";
import Pagination from "@/components/widgets/Pagination";
import TitlePage from "@/components/widgets/TitlePage";
import ActionModal from "@/components/widgets/ActionModal";
import EditBtn from "@/components/widgets/Elements/EditBtn";
import TeacherCreateAssignForm from "./TeacherCreateAssignForm";
import { toast } from "react-toastify";
import { resetTeacherPassword } from "@/actions/teacherActions";
import ConfirmModal from "@/components/widgets/ConfirmModal";

type AssignmentForTable = {
  id: string;
  schoolId: number;
  academicYearId: number;
  isActive: boolean;
  school: {
    id: number;
    title: string;
  } | null;
  academicYear: {
    id: number;
    title: string;
  } | null;
};

type TeacherWithLatestAssignment = Teacher & {
  assignments: AssignmentForTable[];
};

type Props = {
  listItems: TeacherWithLatestAssignment[];
  totalCount: number;
  pageSize: number;

  /**
   * این مقادیر فقط از getCurrentContext در سرور می‌آیند.
   */
  schoolId: number;
  academicYearId: number;
};

export default function TeacherComp({
  listItems,
  totalCount,
  pageSize,
  schoolId,
  academicYearId,
}: Props) {
  const [openCreate, setOpenCreate] = React.useState(false);
  const [resettingTeacherId, setResettingTeacherId] = React.useState<
    string | null
  >(null);

  /*
   * به‌جای state جداگانه برای هر ردیف،
   * معلم انتخاب‌شده برای ویرایش را نگه می‌داریم.
   */
  const [editingTeacherId, setEditingTeacherId] = React.useState<string | null>(
    null,
  );
  const [resetPasswordTeacher, setResetPasswordTeacher] =
    React.useState<Teacher | null>(null);

  const handleResetTeacherPassword = async (teacher: Teacher) => {
    if (!teacher.phone?.trim()) {
      toast.error(
        "برای این معلم شماره تماسی ثبت نشده است؛ ابتدا شماره تماس را ثبت کنید.",
      );

      return;
    }

    try {
      setResettingTeacherId(teacher.id);

      const result = await resetTeacherPassword(teacher.id);

      if (result.status === "error") {
        toast.error(result.error);
        return;
      }

      toast.success(result.data.message);
      setResetPasswordTeacher(null);
    } catch (error) {
      console.error(error);
      toast.error("خطا در ریست کلمه عبور معلم.");
    } finally {
      setResettingTeacherId(null);
    }
  };

  return (
    <div className="p-2">
      <TitlePage>لیست معلمان</TitlePage>

      <div className="container mx-auto px-4 py-2">
        <DataTableLayout
          totalCount={totalCount}
          action={
            <ActionModal
              desc="جست‌وجو با کد ملی یا ثبت معلم جدید"
              open={openCreate}
              setOpen={setOpenCreate}
              title="ثبت معلم جدید"
              trigger={<CreateBtn>ثبت معلم جدید</CreateBtn>}
              contentClassName="w-[95vw] max-w-5xl"
            >
              <TeacherCreateAssignForm
                setOpen={setOpenCreate}
                schoolId={schoolId}
                academicYearId={academicYearId}
                mode="create"
              />
            </ActionModal>
          }
        >
          <Table>
            <thead>
              <HeadTr>
                <SortableTh field="nationalCode" sortable title="کد ملی">
                  <ColumnSearch field="nationalCode" />
                </SortableTh>

                <SortableTh field="firstName" sortable title="نام">
                  <ColumnSearch field="firstName" />
                </SortableTh>

                <SortableTh field="lastName" sortable title="نام خانوادگی">
                  <ColumnSearch field="lastName" />
                </SortableTh>

                <SortableTh field="personnelCode" sortable title="کد پرسنلی">
                  <ColumnSearch field="personnelCode" />
                </SortableTh>

                <SortableTh field="phone" sortable title="شماره تماس">
                  <ColumnSearch field="phone" />
                </SortableTh>

                <SortableTh
                  field="createdAt"
                  sortable
                  title="آخرین وضعیت انتساب"
                >
                  <span className="text-xs text-gray-400">
                    مدرسه / سال تحصیلی
                  </span>
                </SortableTh>

                <ThActions>عملیات</ThActions>
              </HeadTr>
            </thead>

            <Tbody>
              {listItems.length === 0 ? (
                <Tr>
                  <Td>
                    <div className="py-4 text-center text-gray-500">
                      معلمی برای نمایش وجود ندارد.
                    </div>
                  </Td>
                </Tr>
              ) : (
                listItems.map((teacher) => {
                  const latestAssignment = teacher.assignments?.[0];

                  /*
                   * Edit انتساب فقط وقتی فعال است که انتساب نمایش‌داده‌شده
                   * متعلق به مدرسه و سال تحصیلی فعال مدیر باشد.
                   */
                  const canEditAssignment =
                    latestAssignment &&
                    latestAssignment.schoolId === schoolId &&
                    latestAssignment.academicYearId === academicYearId;

                  const isEditModalOpen = editingTeacherId === teacher.id;

                  return (
                    <Tr key={teacher.id}>
                      <Td>{teacher.nationalCode}</Td>
                      <Td>{teacher.firstName}</Td>
                      <Td>{teacher.lastName}</Td>
                      <Td>{teacher.personnelCode || "-"}</Td>
                      <Td>{teacher.phone || "-"}</Td>

                      <Td>
                        {latestAssignment ? (
                          <div className="flex flex-col gap-1 text-xs">
                            <span>{latestAssignment.school?.title || "-"}</span>

                            <span className="text-gray-500">
                              سال تحصیلی:{" "}
                              {latestAssignment.academicYear?.title || "-"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-amber-600">
                            فاقد سابقه انتساب
                          </span>
                        )}
                      </Td>

                      <TdActions>
                        <div className="flex items-center justify-center gap-2">
                          {canEditAssignment ? (
                            <ActionModal
                              title="ویرایش معلم"
                              desc="ویرایش اطلاعات معلم و انتساب سال تحصیلی جاری"
                              open={isEditModalOpen}
                              setOpen={(isOpen) => {
                                setEditingTeacherId(isOpen ? teacher.id : null);
                              }}
                              contentClassName="w-[95vw] max-w-5xl"
                              trigger={
                                <span
                                  onClick={() => {
                                    setEditingTeacherId(teacher.id);
                                  }}
                                >
                                  <EditBtn />
                                </span>
                              }
                            >
                              <TeacherCreateAssignForm
                                key={`${teacher.id}-${latestAssignment.id}`}
                                setOpen={(isOpen) => {
                                  if (!isOpen) {
                                    setEditingTeacherId(null);
                                  }
                                }}
                                schoolId={schoolId}
                                academicYearId={academicYearId}
                                mode="edit"
                                initialTeacher={{
                                  id: teacher.id,
                                  nationalCode: teacher.nationalCode,
                                  firstName: teacher.firstName,
                                  lastName: teacher.lastName,
                                  personnelCode: teacher.personnelCode,
                                  phone: teacher.phone,
                                  address: teacher.address,
                                }}
                                initialAssignment={{
                                  id: latestAssignment.id,
                                }}
                              />
                            </ActionModal>
                          ) : (
                            <EditBtn disabled />
                          )}

                          <ConfirmModal
                            title="ریست کلمه عبور معلم"
                            desc="پس از تأیید، کلمه عبور معلم تغییر خواهد کرد."
                            open={resetPasswordTeacher?.id === teacher.id}
                            setOpen={(isOpen) => {
                              setResetPasswordTeacher(isOpen ? teacher : null);
                            }}
                            onConfirm={() =>
                              handleResetTeacherPassword(teacher)
                            }
                            confirmText="تأیید ریست رمز"
                            cancelText="انصراف"
                            loading={resettingTeacherId === teacher.id}
                            contentClassName="w-[95vw] max-w-md"
                            trigger={
                              <button
                                type="button"
                                disabled={
                                  resettingTeacherId === teacher.id ||
                                  !teacher.phone?.trim()
                                }
                                title={
                                  !teacher.phone?.trim()
                                    ? "شماره تماس معلم ثبت نشده است"
                                    : "ریست کلمه عبور"
                                }
                                className="inline-flex h-9 items-center justify-center rounded-md border border-amber-300 px-2 text-xs text-amber-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {resettingTeacherId === teacher.id
                                  ? "در حال انجام..."
                                  : "ریست رمز"}
                              </button>
                            }
                          >
                            <div className="px-4 py-3 text-sm leading-7 text-gray-700">
                              آیا مطمئن هستید که کلمه عبور معلم{" "}
                              <strong>
                                {teacher.firstName} {teacher.lastName}
                              </strong>{" "}
                              به شماره تماس زیر تغییر کند؟
                              <div className="mt-2 font-semibold" dir="ltr">
                                {teacher.phone}
                              </div>
                            </div>
                          </ConfirmModal>
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
