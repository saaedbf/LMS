"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

import CoolInput from "@/components/widgets/Elements/CoolInput";
import FormContainer from "@/components/widgets/Elements/FormContainer";
import FromActionBtns from "@/components/widgets/Elements/FromActionBtns";
import { handleFormServerErrors } from "@/lib/utils";
import { teacherSchema, TeacherSchema } from "@/lib/schemas/teacher";
import {
  findTeacherByNationalCode,
  createTeacher,
  updateTeacher,
} from "@/actions/teacherActions";
import { createTeacherAssignment } from "@/actions/teacherAssignmentActions";

type FormMode = "create" | "edit";

type InitialTeacher = {
  id: string;
  nationalCode: string;
  firstName: string;
  lastName: string;
  phone: string;
  personnelCode?: string | null;
  address?: string | null;
};

type InitialAssignment = {
  id: string;
};

type Props = {
  setOpen: (value: boolean) => void;
  schoolId: number;
  academicYearId: number;
  mode?: FormMode;
  initialTeacher?: InitialTeacher;
  initialAssignment?: InitialAssignment;
};

const emptyFormValues: TeacherSchema = {
  id: "",
  nationalCode: "",
  firstName: "",
  lastName: "",
  phone: "",
  personnelCode: "",
  address: "",
};

export default function TeacherCreateAssignForm({
  setOpen,
  schoolId,
  academicYearId,
  mode = "create",
  initialTeacher,
  initialAssignment,
}: Props) {
  const router = useRouter();
  const isEditMode = mode === "edit";

  const [teacherFound, setTeacherFound] = React.useState(isEditMode);
  const [teacherId, setTeacherId] = React.useState<string | null>(
    initialTeacher?.id ?? null,
  );
  const [loadingSearch, setLoadingSearch] = React.useState(false);
  const [showForm, setShowForm] = React.useState(isEditMode);

  const {
    register,
    watch,
    setValue,
    setError,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TeacherSchema>({
    resolver: zodResolver(teacherSchema),
    mode: "onTouched",
    defaultValues: emptyFormValues,
  });

  // بارگذاری داده‌ها در صورت ورود به حالت ویرایش
  React.useEffect(() => {
    if (!isEditMode || !initialTeacher || !initialAssignment) {
      return;
    }

    reset({
      id: initialTeacher.id,
      nationalCode: initialTeacher.nationalCode,
      firstName: initialTeacher.firstName,
      lastName: initialTeacher.lastName,
      phone: initialTeacher.phone ?? "",
      personnelCode: initialTeacher.personnelCode ?? "",
      address: initialTeacher.address ?? "",
    });

    setTeacherId(initialTeacher.id);
    setTeacherFound(true);
    setShowForm(true);
  }, [isEditMode, initialTeacher, initialAssignment, reset]);

  // بررسی تکراری نبودن انتساب در همین مدرسه و همین سال تحصیلی
  function checkTeacherAssignmentInCurrentYear(teacher: any): boolean {
    return (
      teacher.assignments?.some(
        (assignment: any) =>
          Number(assignment.schoolId) === Number(schoolId) &&
          Number(assignment.academicYearId) === Number(academicYearId),
      ) ?? false
    );
  }

  async function handleSearchByNationalCode() {
    const nationalCode = String(watch("nationalCode") ?? "").trim();

    if (!/^\d{10}$/.test(nationalCode)) {
      setError("nationalCode", {
        type: "manual",
        message: "کد ملی باید ۱۰ رقم باشد",
      });
      setShowForm(false);
      return;
    }

    setLoadingSearch(true);

    try {
      const res = await findTeacherByNationalCode({ nationalCode });

      if (res.status === "error") {
        toast.error(res.error);
        setShowForm(false);
        return;
      }

      if (!res.data) {
        setTeacherFound(false);
        setTeacherId(null);

        setValue("id", "");
        setValue("firstName", "");
        setValue("lastName", "");
        setValue("phone", "");
        setValue("personnelCode", "");
        setValue("address", "");

        toast.info("معلمی با این کد ملی پیدا نشد. اطلاعات را وارد کنید.");
        setShowForm(true);
        return;
      }

      const teacher = res.data;

      if (checkTeacherAssignmentInCurrentYear(teacher)) {
        toast.error(
          "این معلم قبلاً در این سال تحصیلی در مدرسه شما ثبت شده است.",
        );
        setTimeout(() => setOpen(false), 500);
        return;
      }

      setTeacherFound(true);
      setTeacherId(teacher.id);

      setValue("id", teacher.id);
      setValue("firstName", teacher.firstName);
      setValue("lastName", teacher.lastName);
      setValue("nationalCode", teacher.nationalCode);
      setValue("phone", teacher.phone ?? "");
      setValue("personnelCode", teacher.personnelCode ?? "");
      setValue("address", teacher.address ?? "");

      toast.success("معلم پیدا شد.");
      setShowForm(true);
    } catch (error) {
      console.error("findTeacherByNationalCode error:", error);
      toast.error("خطای غیرمنتظره در جست‌وجوی معلم.");
      setShowForm(false);
    } finally {
      setLoadingSearch(false);
    }
  }

  async function onSubmit(data: TeacherSchema) {
    try {
      const nationalCode = String(data.nationalCode ?? "").trim();

      // ۱. ویرایش معلم موجود
      if (isEditMode) {
        if (!initialTeacher || !initialAssignment) {
          toast.error("اطلاعات لازم جهت ویرایش معلم موجود نیست.");
          return;
        }

        const updateTeacherRes = await updateTeacher({
          ...data,
          id: initialTeacher.id,
          nationalCode,
        });

        if (updateTeacherRes.status !== "success") {
          handleFormServerErrors(updateTeacherRes, setError);
          return;
        }

        toast.success("اطلاعات معلم با موفقیت ویرایش شد.");
        router.refresh();
        setOpen(false);
        return;
      }

      // ۲. ایجاد یا به‌روزرسانی و سپس انتساب
      let currentTeacherId = data.id || teacherId;
      let isExisting = false;

      // بررسی مجدد وجود معلم
      const checkRes = await findTeacherByNationalCode({ nationalCode });
      if (checkRes.status === "error") {
        toast.error(checkRes.error);
        return;
      }

      if (checkRes.data) {
        isExisting = true;
        const updateRes = await updateTeacher({
          ...data,
          id: checkRes.data.id,
          nationalCode,
        });

        if (updateRes.status !== "success") {
          handleFormServerErrors(updateRes, setError);
          return;
        }
        currentTeacherId = updateRes.data.id;
      } else {
        const createRes = await createTeacher({
          firstName: data.firstName,
          lastName: data.lastName,
          nationalCode,
          phone: data.phone,
          personnelCode: data.personnelCode || null,
          address: data.address || null,
        });

        if (createRes.status !== "success") {
          handleFormServerErrors(createRes, setError);
          return;
        }
        currentTeacherId = createRes.data.id;
      }

      if (!currentTeacherId) {
        toast.error("شناسه معلم معتبر نیست.");
        return;
      }

      // ایجاد انتساب به مدرسه و سال تحصیلی جاری مدیر
      const assignRes = await createTeacherAssignment({
        teacherId: currentTeacherId,
        schoolId,
        academicYearId,
        isActive: true,
      });

      if (assignRes.status !== "success") {
        handleFormServerErrors(assignRes, setError);
        return;
      }

      toast.success(
        isExisting
          ? "اطلاعات معلم به‌روزرسانی و انتساب انجام شد."
          : "معلم ایجاد و به مدرسه منتسب شد.",
      );

      router.refresh();
      handleResetAndHide();
    } catch (error) {
      console.error("Teacher submit error:", error);
      toast.error("خطای غیرمنتظره در ثبت یا ویرایش اطلاعات.");
    }
  }

  function handleResetAndHide() {
    reset(emptyFormValues);
    setTeacherFound(false);
    setTeacherId(null);
    setShowForm(false);
    setOpen(false);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormContainer className="pb-10">
        {!isEditMode && (
          <div className="col-span-full flex flex-col gap-1 rounded-md border bg-gray-50 p-3">
            <div className="flex flex-col gap-2 md:flex-row md:items-end">
              <div className="h-full flex-1">
                <CoolInput
                  title="کد ملی:"
                  type="text"
                  placeholder="۱۰ رقم کد ملی"
                  inputMode="numeric"
                  {...register("nationalCode")}
                  error={errors.nationalCode?.message}
                />
              </div>

              <button
                type="button"
                onClick={handleSearchByNationalCode}
                disabled={loadingSearch}
                className="h-10 whitespace-nowrap rounded-md bg-blue-600 px-4 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loadingSearch ? "در حال جست‌وجو..." : "جست‌وجو"}
              </button>
            </div>

            {!showForm && !loadingSearch && (
              <p className="mt-1 text-sm text-gray-500">
                برای شروع، کد ملی را وارد کرده و دکمه جست‌وجو را بزنید.
              </p>
            )}

            {teacherFound && showForm && (
              <p className="text-sm text-green-600">
                معلم پیدا شد. اطلاعات را در صورت نیاز بررسی و ذخیره کنید.
              </p>
            )}

            {!teacherFound && showForm && (
              <p className="text-sm text-amber-700">
                معلمی با این کد ملی وجود ندارد؛ اطلاعات را تکمیل و ثبت نمایید.
              </p>
            )}
          </div>
        )}

        {showForm && (
          <>
            <input type="hidden" {...register("id")} />

            {isEditMode && (
              <CoolInput
                title="کد ملی:"
                type="text"
                readOnly
                {...register("nationalCode")}
                error={errors.nationalCode?.message}
                className="cursor-not-allowed bg-gray-100 text-gray-600"
              />
            )}

            <CoolInput
              title="نام:"
              type="text"
              placeholder="نام معلم"
              {...register("firstName")}
              error={errors.firstName?.message}
            />

            <CoolInput
              title="نام خانوادگی:"
              type="text"
              placeholder="نام خانوادگی معلم"
              {...register("lastName")}
              error={errors.lastName?.message}
            />

            <CoolInput
              title="شماره تماس:"
              type="text"
              placeholder="مثال: 09123456789"
              inputMode="numeric"
              {...register("phone")}
              error={errors.phone?.message}
            />

            <CoolInput
              title="کد پرسنلی:"
              type="text"
              placeholder="اختیاری"
              {...register("personnelCode")}
              error={errors.personnelCode?.message}
            />

            <CoolInput
              title="آدرس:"
              type="text"
              placeholder="اختیاری"
              {...register("address")}
              error={errors.address?.message}
            />
          </>
        )}
      </FormContainer>

      {showForm && (
        <FromActionBtns
          txtSubmit={
            isEditMode
              ? "ذخیره تغییرات"
              : teacherFound
                ? "ذخیره و انتساب"
                : "ایجاد و انتساب"
          }
          isSubmitting={isSubmitting}
          setOpen={handleResetAndHide}
        />
      )}
    </form>
  );
}
