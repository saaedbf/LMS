"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";

import CoolInput from "@/components/widgets/Elements/CoolInput";
import FormContainer from "@/components/widgets/Elements/FormContainer";
import FromActionBtns from "@/components/widgets/Elements/FromActionBtns";
import { handleFormServerErrors } from "@/lib/utils";
import { teacherSchema, TeacherSchema } from "@/lib/schemas/teacher";
import { createTeacher, updateTeacher } from "@/actions/teacherActions";

type Props = {
  mode: "create" | "edit";
  setOpen: (value: boolean) => void;
  defaultValues?: Partial<TeacherSchema>;
};

export default function TeacherForm({ mode, setOpen, defaultValues }: Props) {
  const isEdit = mode === "edit";

  const {
    register,
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TeacherSchema>({
    resolver: zodResolver(teacherSchema),
    mode: "onTouched",
    defaultValues: isEdit
      ? {
          id: defaultValues?.id ?? "",
          firstName: defaultValues?.firstName ?? "",
          lastName: defaultValues?.lastName ?? "",
          nationalCode: defaultValues?.nationalCode ?? "",
          phone: defaultValues?.phone ?? "",
          personnelCode: defaultValues?.personnelCode ?? "",
          address: defaultValues?.address ?? "",
        }
      : {
          id: "",
          firstName: "",
          lastName: "",
          nationalCode: "",
          phone: "",
          personnelCode: "",
          address: "",
        },
  });

  async function onSubmit(data: TeacherSchema) {
    try {
      const result = isEdit
        ? await updateTeacher(data)
        : await createTeacher(data);

      if (result.status === "success") {
        toast.success(
          isEdit ? "اطلاعات معلم با موفقیت ویرایش شد" : "معلم با موفقیت ثبت شد",
        );
        reset();
        setOpen(false);
      } else {
        handleFormServerErrors(result, setError);
      }
    } catch (error) {
      console.error(error);
      toast.error("خطا در برقراری ارتباط با سرور");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormContainer>
        {isEdit && <input type="hidden" {...register("id")} />}

        <CoolInput
          title="نام:"
          type="text"
          placeholder="نام معلم را وارد نمایید"
          {...register("firstName")}
          error={errors.firstName?.message}
        />

        <CoolInput
          title="نام خانوادگی:"
          type="text"
          placeholder="نام خانوادگی را وارد نمایید"
          {...register("lastName")}
          error={errors.lastName?.message}
        />

        <CoolInput
          title="کد ملی:"
          type="text"
          placeholder="۱۰ رقم کد ملی"
          inputMode="numeric"
          readOnly={isEdit}
          className={
            isEdit ? "cursor-not-allowed bg-gray-100 text-gray-600" : ""
          }
          {...register("nationalCode")}
          error={errors.nationalCode?.message}
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

        {errors.root?.serverError && (
          <p className="col-span-full rounded-md bg-red-600 p-2 text-sm text-white">
            {errors.root.serverError.message}
          </p>
        )}
      </FormContainer>

      <FromActionBtns
        txtSubmit={isEdit ? "ویرایش" : "ذخیره"}
        isSubmitting={isSubmitting}
        setOpen={setOpen}
      />
    </form>
  );
}
