"use client";

import { Student } from "@prisma/client";
import React, { useState } from "react";
import BulkStudentUpload from "./BulkStudentUpload";
import { ArrowLeftRight, Trash2, Users } from "lucide-react";
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
import StudentCreateEnrollForm from "./StudentCreateEnrollForm";
import { toast } from "react-toastify";
import { resetStudentPassword } from "@/actions/studentActions";
import ConfirmModal from "@/components/widgets/ConfirmModal";
import BackButton from "@/components/widgets/Elements/BackButton";
import {
  deleteStudentEnrollment,
  transferStudentToOppositeShift,
} from "@/actions/studentEnrollmentActions";
import { getOppositeSchoolKlasses } from "@/actions/schoolActions";
import SearchableSelect from "@/components/widgets/Elements/SearchableSelect";
type EnrollmentForTable = {
  id: string;
  schoolId: number;
  academicYearId: number;
  payeId: number;
  reshtehTahsiliId: number;
  klassId: string;
  school: {
    id: number;
    title: string;
  } | null;
  academicYear: {
    id: number;
    title: string;
  } | null;
  paye: {
    id: number;
    title: string;
  } | null;
  reshtehTahsili: {
    id: number;
    title: string;
  } | null;
  klass: {
    id: string;
    title: string;
  } | null;
};

type StudentWithLatestEnrollment = Student & {
  enrollments: EnrollmentForTable[];
};

type Option = {
  value: number | string;
  label: string;
};

type KlassOption = {
  value: string;
  label: string;
  schoolId: number;
  academicYearId: number;
  payeId: number;
  reshtehTahsiliId: number;
};

type Props = {
  listItems: StudentWithLatestEnrollment[];
  totalCount: number;
  pageSize: number;

  /**
   * این مقادیر فقط از getCurrentContext در سرور می‌آیند.
   */
  schoolId: number;
  academicYearId: number;

  payes: Option[];
  reshtehTahsilis: Option[];
  klasses: KlassOption[];
  hasOppositeSchool: boolean;
};

export default function StudentComp({
  listItems,
  totalCount,
  pageSize,
  schoolId,
  academicYearId,
  payes,
  reshtehTahsilis,
  klasses,
  hasOppositeSchool,
}: Props) {
  const [openCreate, setOpenCreate] = React.useState(false);
  const [resettingStudentId, setResettingStudentId] = React.useState<
    string | null
  >(null);
  /*
   * به‌جای state جداگانه برای هر ردیف،
   * دانش‌آموز انتخاب‌شده برای ویرایش را نگه می‌داریم.
   */
  const [editingStudentId, setEditingStudentId] = React.useState<string | null>(
    null,
  );
  const [deletingEnrollmentId, setDeletingEnrollmentId] = React.useState<
    string | null
  >(null);
  const [openBulk, setOpenBulk] = React.useState(false);
  const [resetPasswordStudent, setResetPasswordStudent] =
    React.useState<Student | null>(null);
  // state
  const [transferStudent, setTransferStudent] = useState<Student | null>(null);
  const [oppositeKlasses, setOppositeKlasses] = useState<any[]>([]);
  const [oppositeSchoolTitle, setOppositeSchoolTitle] = useState("");
  const [selectedKlassId, setSelectedKlassId] = useState("");
  const [transferring, setTransferring] = useState(false);
  const [loadingOpposite, setLoadingOpposite] = useState(false);
  const handleResetStudentPassword = async (student: Student) => {
    if (!student.phone?.trim()) {
      toast.error(
        "برای این دانش‌آموز شماره تماسی ثبت نشده است؛ ابتدا شماره تماس را ثبت کنید.",
      );

      return;
    }

    try {
      setResettingStudentId(student.id);

      const result = await resetStudentPassword(student.id);

      if (result.status === "error") {
        toast.error(result.error);
        return;
      }

      toast.success(result.data.message);
      setResetPasswordStudent(null);
    } catch (error) {
      console.error(error);
      toast.error("خطا در ریست کلمه عبور دانش‌آموز.");
    } finally {
      setResettingStudentId(null);
    }
  };
  const handleDeleteEnrollment = async (enrollmentId: string) => {
    try {
      const res = await deleteStudentEnrollment(enrollmentId);

      if (res.status === "error") {
        toast.error(res.error);
        throw new Error(res.error);
      }

      toast.success("ثبت‌نام با موفقیت حذف شد");
      // ConfirmModal خودش setOpen(false) را صدا می‌زند
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
  const openTransferModal = async (student: Student) => {
    setTransferStudent(student);
    setSelectedKlassId("");
    setLoadingOpposite(true);

    try {
      const res = await getOppositeSchoolKlasses();

      if (res.status === "success") {
        setOppositeKlasses(res.data.klasses);
        setOppositeSchoolTitle(res.data.school?.title ?? "");
      } else {
        const msg = typeof res.error === "string" ? res.error : "خطای نامشخص";
        toast.error(msg);
        setTransferStudent(null);
      }
    } catch {
      toast.error("خطا در دریافت کلاس‌های نوبت مخالف");
      setTransferStudent(null);
    } finally {
      setLoadingOpposite(false);
    }
  };

  const handleTransfer = async () => {
    if (!transferStudent || !selectedKlassId) return;

    setTransferring(true);
    try {
      const latestEnrollment = (transferStudent as any).enrollments?.[0];
      if (!latestEnrollment) {
        toast.error("ثبت‌نامی برای انتقال یافت نشد");
        return;
      }

      const res = await transferStudentToOppositeShift(
        latestEnrollment.id,
        selectedKlassId,
      );

      if (res.status === "error") {
        toast.error(typeof res.error === "string" ? res.error : "خطای نامشخص");
        return;
      }

      toast.success("دانش‌آموز با موفقیت به نوبت مخالف منتقل شد");
      setTransferStudent(null);
      setSelectedKlassId("");
      setOppositeKlasses([]);
    } catch (error) {
      console.error(error);
      toast.error("خطا در انتقال دانش‌آموز");
    } finally {
      setTransferring(false);
    }
  };

  return (
    <div className="p-2">
      <TitlePage>لیست دانش‌آموزان</TitlePage>
      <BackButton
        href="/dashboard/manager"
        label="بازگشت به پنل مدیریت"
        className="mb-3"
      />
      <div className="container mx-auto px-4 py-2">
        <DataTableLayout
          totalCount={totalCount}
          action={
            <div className="flex flex-wrap gap-2">
              <ActionModal
                desc="جست‌وجو با کد ملی یا ثبت دانش‌آموز جدید"
                open={openCreate}
                setOpen={setOpenCreate}
                title="ثبت دانش‌آموز جدید"
                trigger={<CreateBtn>ثبت دانش‌آموز جدید</CreateBtn>}
                contentClassName="w-[95vw] max-w-5xl"
              >
                <StudentCreateEnrollForm
                  setOpen={setOpenCreate}
                  schoolId={schoolId}
                  academicYearId={academicYearId}
                  payes={payes}
                  reshtehTahsilis={reshtehTahsilis}
                  klasses={klasses}
                  mode="create"
                />
              </ActionModal>
              <ActionModal
                title="ثبت گروهی دانش‌آموزان"
                desc="ابتدا کلاس مقصد را انتخاب کنید، سپس فایل اکسل را آپلود کنید"
                open={openBulk}
                setOpen={setOpenBulk}
                trigger={
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
                  >
                    <Users size={16} />
                    ثبت گروهی
                  </button>
                }
                contentClassName="w-[95vw] max-w-4xl max-h-80%"
              >
                <BulkStudentUpload
                  setOpen={setOpenBulk}
                  schoolId={schoolId}
                  academicYearId={academicYearId}
                  klasses={klasses.map((k) => ({
                    id: k.value,
                    title: k.label,
                    payeId: k.payeId,
                    reshtehTahsiliId: k.reshtehTahsiliId,
                    payeTitle:
                      payes.find((p) => Number(p.value) === k.payeId)?.label ||
                      "",
                    reshtehTahsiliTitle:
                      reshtehTahsilis.find(
                        (r) => Number(r.value) === k.reshtehTahsiliId,
                      )?.label || "",
                  }))}
                />
              </ActionModal>
            </div>
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

                <SortableTh field="fatherName" sortable title="نام پدر">
                  <ColumnSearch field="fatherName" />
                </SortableTh>

                <SortableTh field="phone" sortable title="شماره تماس">
                  <ColumnSearch field="phone" />
                </SortableTh>

                <SortableTh
                  field="createdAt"
                  sortable
                  title="آخرین وضعیت تحصیلی"
                >
                  <span className="text-xs text-gray-400">
                    مدرسه / سال / پایه / رشته / کلاس
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
                      دانش‌آموزی برای نمایش وجود ندارد.
                    </div>
                  </Td>
                </Tr>
              ) : (
                listItems.map((student) => {
                  const latestEnrollment = student.enrollments[0];

                  /*
                   * Edit ثبت‌نام فقط وقتی فعال است که ثبت‌نام نمایش‌داده‌شده
                   * متعلق به مدرسه و سال تحصیلی فعال مدیر باشد.
                   */
                  const canEditEnrollment =
                    latestEnrollment &&
                    latestEnrollment.schoolId === schoolId &&
                    latestEnrollment.academicYearId === academicYearId;

                  const isEditModalOpen = editingStudentId === student.id;

                  return (
                    <Tr key={student.id}>
                      <Td>{student.nationalCode}</Td>
                      <Td>{student.firstName}</Td>
                      <Td>{student.lastName}</Td>
                      <Td>{student.fatherName || "-"}</Td>
                      <Td>{student.phone || "-"}</Td>

                      <Td>
                        {latestEnrollment ? (
                          <div className="flex flex-col gap-1 text-xs">
                            <span>{latestEnrollment.school?.title || "-"}</span>

                            <span className="text-gray-500">
                              {latestEnrollment.academicYear?.title || "-"} /{" "}
                              {latestEnrollment.paye?.title || "-"} /{" "}
                              {latestEnrollment.reshtehTahsili?.title || "-"} /{" "}
                              {latestEnrollment.klass?.title || "-"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-amber-600">
                            فاقد سابقه ثبت‌نام
                          </span>
                        )}
                      </Td>

                      <TdActions>
                        <div className="flex items-center justify-center gap-2">
                          {canEditEnrollment ? (
                            <ActionModal
                              title="ویرایش دانش‌آموز"
                              desc="ویرایش اطلاعات دانش‌آموز و ثبت‌نام سال تحصیلی جاری"
                              open={isEditModalOpen}
                              setOpen={(isOpen) => {
                                setEditingStudentId(isOpen ? student.id : null);
                              }}
                              contentClassName="w-[95vw] max-w-5xl"
                              trigger={
                                <span
                                  onClick={() => {
                                    setEditingStudentId(student.id);
                                  }}
                                >
                                  <EditBtn />
                                </span>
                              }
                            >
                              <StudentCreateEnrollForm
                                key={`${student.id}-${latestEnrollment.id}`}
                                setOpen={(isOpen) => {
                                  if (!isOpen) {
                                    setEditingStudentId(null);
                                  }
                                }}
                                schoolId={schoolId}
                                academicYearId={academicYearId}
                                payes={payes}
                                reshtehTahsilis={reshtehTahsilis}
                                klasses={klasses}
                                mode="edit"
                                initialStudent={{
                                  id: student.id,
                                  nationalCode: student.nationalCode,
                                  firstName: student.firstName,
                                  lastName: student.lastName,
                                  fatherName: student.fatherName,
                                  phone: student.phone,
                                  address: student.address,
                                }}
                                initialEnrollment={{
                                  id: latestEnrollment.id,
                                  payeId: latestEnrollment.payeId,
                                  reshtehTahsiliId:
                                    latestEnrollment.reshtehTahsiliId,
                                  klassId: latestEnrollment.klassId,
                                }}
                              />
                            </ActionModal>
                          ) : (
                            <EditBtn disabled />
                          )}

                          <ConfirmModal
                            title="ریست کلمه عبور دانش‌آموز"
                            desc="پس از تأیید، کلمه عبور دانش‌آموز تغییر خواهد کرد."
                            open={resetPasswordStudent?.id === student.id}
                            setOpen={(isOpen) => {
                              setResetPasswordStudent(isOpen ? student : null);
                            }}
                            onConfirm={() =>
                              handleResetStudentPassword(student)
                            }
                            confirmText="تأیید ریست رمز"
                            cancelText="انصراف"
                            loading={resettingStudentId === student.id}
                            contentClassName="w-[95vw] max-w-md"
                            trigger={
                              <button
                                type="button"
                                disabled={
                                  resettingStudentId === student.id ||
                                  !student.phone?.trim()
                                }
                                title={
                                  !student.phone?.trim()
                                    ? "شماره تماس دانش‌آموز ثبت نشده است"
                                    : "ریست کلمه عبور"
                                }
                                className="inline-flex h-9 items-center justify-center rounded-md border border-amber-300 px-2 text-xs text-amber-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {resettingStudentId === student.id
                                  ? "در حال انجام..."
                                  : "ریست رمز"}
                              </button>
                            }
                          >
                            <div className="px-4 py-3 text-sm leading-7 text-gray-700">
                              آیا مطمئن هستید که کلمه عبور دانش‌آموز{" "}
                              <strong>
                                {student.firstName} {student.lastName}
                              </strong>{" "}
                              به شماره تماس زیر تغییر کند؟
                              <div className="mt-2 font-semibold" dir="ltr">
                                {student.phone}
                              </div>
                            </div>
                          </ConfirmModal>
                          {/* ⬅️ دکمه انتقال به نوبت مخالف */}

                          {/* ⬅️ دکمه انتقال به نوبت مخالف */}
                          {canEditEnrollment && hasOppositeSchool && (
                            <button
                              type="button"
                              onClick={() => openTransferModal(student)}
                              title="انتقال به نوبت مخالف"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-indigo-300 text-indigo-700 transition hover:bg-indigo-50"
                            >
                              <ArrowLeftRight size={14} />
                            </button>
                          )}
                          <ConfirmModal
                            title="حذف ثبت‌نام از این مدرسه"
                            desc={`آیا از حذف ثبت‌نام دانش‌آموز "${student.firstName} ${student.lastName}" از این مدرسه و سال تحصیلی مطمئن هستید؟`}
                            open={deletingEnrollmentId === latestEnrollment.id}
                            setOpen={(isOpen) =>
                              setDeletingEnrollmentId(
                                isOpen ? latestEnrollment.id : null,
                              )
                            }
                            onConfirm={() =>
                              handleDeleteEnrollment(latestEnrollment.id)
                            }
                            confirmText="حذف ثبت‌نام"
                            cancelText="انصراف"
                            confirmButtonClassName="bg-rose-600 hover:bg-rose-700"
                            trigger={
                              <button
                                type="button"
                                title="حذف ثبت‌نام از این مدرسه"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-rose-300 text-rose-700 transition hover:bg-rose-50"
                              >
                                <Trash2 size={14} />
                              </button>
                            }
                          >
                            <div className="px-4 py-3 text-sm leading-7 text-gray-700">
                              <p className="font-medium text-rose-600">
                                ⚠️ توجه: این عملیات ثبت‌نام دانش‌آموز در این
                                مدرسه و سال تحصیلی را حذف می‌کند.
                              </p>
                              <p className="mt-2">
                                دانش‌آموز{" "}
                                <strong>
                                  {student.firstName} {student.lastName}
                                </strong>{" "}
                                در دیتابیس باقی می‌ماند و می‌تواند در سال‌های
                                بعد یا مدارس دیگر ثبت‌نام شود.
                              </p>
                              <p className="mt-2 text-xs text-zinc-500">
                                مدرسه: {latestEnrollment.school?.title} / سال:{" "}
                                {latestEnrollment.academicYear?.title}
                              </p>
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
        <ActionModal
          title="انتقال به نوبت مخالف"
          desc={
            oppositeSchoolTitle
              ? `انتخاب کلاس مقصد در ${oppositeSchoolTitle}`
              : "انتخاب کلاس مقصد"
          }
          open={!!transferStudent}
          setOpen={(v) => {
            if (!v) {
              setTransferStudent(null);
              setSelectedKlassId("");
              setOppositeKlasses([]);
            }
          }}
          trigger={null}
          contentClassName="w-[95vw] max-w-lg"
        >
          {loadingOpposite ? (
            <p className="p-4 text-center text-sm text-gray-500">
              در حال بارگذاری کلاس‌ها...
            </p>
          ) : oppositeKlasses.length === 0 ? (
            <p className="p-4 text-center text-sm text-amber-600">
              کلاسی در نوبت مخالف برای این سال تحصیلی وجود ندارد.
            </p>
          ) : (
            <div className="space-y-3 p-4">
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                <p className="font-bold">توجه:</p>
                <ul className="mt-1 list-inside list-disc space-y-0.5">
                  <li>
                    تمام غیبت‌ها، نمرات، انضباطی و مالی به نوبت مخالف منتقل
                    می‌شوند.
                  </li>
                  <li>دانش‌آموز از لیست این مدرسه حذف می‌شود.</li>
                  <li>با انتقال مجدد از سمت نوبت مخالف، برمی‌گردد.</li>
                </ul>
              </div>

              <SearchableSelect
                title="کلاس مقصد:"
                options={oppositeKlasses.map((k) => ({
                  id: k.id,
                  title: `${k.paye?.title ?? ""} - ${k.reshtehTahsili?.title ?? ""} - ${k.title}`,
                }))}
                value={selectedKlassId}
                onChange={(v) => setSelectedKlassId(String(v))}
                placeholder="انتخاب کلاس ..."
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTransferStudent(null)}
                  className="rounded-md border px-4 py-2 text-sm"
                  disabled={transferring}
                >
                  انصراف
                </button>
                <button
                  type="button"
                  onClick={handleTransfer}
                  disabled={!selectedKlassId || transferring}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {transferring ? "در حال انتقال..." : "تأیید انتقال"}
                </button>
              </div>
            </div>
          )}
        </ActionModal>
        <Pagination pageSize={pageSize} totalCount={totalCount} />
      </div>
    </div>
  );
}
