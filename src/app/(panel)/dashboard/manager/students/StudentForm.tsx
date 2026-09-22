"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";

import CoolInput from "@/components/widgets/Elements/CoolInput";
import FormContainer from "@/components/widgets/Elements/FormContainer";
import FromActionBtns from "@/components/widgets/Elements/FromActionBtns";
import { handleFormServerErrors } from "@/lib/utils";
import {
  createStudentSchema,
  updateStudentSchema,
} from "@/lib/schemas/student";
import { createStudent, updateStudent } from "@/actions/studentActions";

type CreateStudentFormValues = {
  firstName: string;
  lastName: string;
  nationalCode: string;
  phone?: string;
  address?: string;
  fatherName?: string;
};

type EditStudentFormValues = {
  studentId: string;
  firstName: string;
  lastName: string;
  nationalCode: string;
  phone?: string;
  address?: string;
  fatherName?: string;
};

type Props = {
  mode: "create" | "edit";
  setOpen: (value: boolean) => void;
  defaultValues?: {
    studentId?: string;
    firstName: string;
    lastName: string;
    nationalCode: string;
    phone?: string | null;
    address?: string | null;
    fatherName?: string | null;
  };
};

export default function StudentForm({ mode, setOpen, defaultValues }: Props) {
  const isEdit = mode === "edit";

  const schema = isEdit ? updateStudentSchema : createStudentSchema;

  const {
    register,
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<any>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: isEdit
      ? {
          studentId: defaultValues?.studentId ?? "",
          firstName: defaultValues?.firstName ?? "",
          lastName: defaultValues?.lastName ?? "",
          nationalCode: defaultValues?.nationalCode ?? "",
          phone: defaultValues?.phone ?? "",
          address: defaultValues?.address ?? "",
          fatherName: defaultValues?.fatherName ?? "",
        }
      : {
          firstName: "",
          lastName: "",
          nationalCode: "",
          phone: "",
          address: "",
          fatherName: "",
        },
  });

  async function onSubmit(
    data: CreateStudentFormValues | EditStudentFormValues,
  ) {
    try {
      const result = isEdit
        ? await updateStudent(data)
        : await createStudent(data);

      if (result.status === "success") {
        toast.success(
          isEdit
            ? "اطلاعات دانش‌آموز با موفقیت ویرایش شد"
            : "دانش‌آموز با موفقیت ثبت شد",
        );
        reset();
        setOpen(false);
      } else {
        handleFormServerErrors(result, setError);
      }
    } catch (error) {
      console.error(error);
      toast.error("خطا در ارتباط با سرور");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormContainer>
        {isEdit && <input type="hidden" {...register("studentId")} />}

        <CoolInput
          title="نام:"
          type="text"
          placeholder="نام دانش‌آموز را وارد کنید ..."
          {...register("firstName")}
          error={errors.firstName?.message as string}
        />

        <CoolInput
          title="نام خانوادگی:"
          type="text"
          placeholder="نام خانوادگی دانش‌آموز را وارد کنید ..."
          {...register("lastName")}
          error={errors.lastName?.message as string}
        />

        <CoolInput
          title="کد ملی:"
          type="text"
          placeholder="کد ملی ۱۰ رقمی را وارد کنید ..."
          {...register("nationalCode")}
          error={errors.nationalCode?.message as string}
        />

        <CoolInput
          title="شماره تماس:"
          type="text"
          placeholder="شماره تماس را وارد کنید ..."
          {...register("phone")}
          error={errors.phone?.message as string}
        />

        <CoolInput
          title="نام پدر:"
          type="text"
          placeholder="نام پدر را وارد کنید ..."
          {...register("fatherName")}
          error={errors.fatherName?.message as string}
        />

        <CoolInput
          title="آدرس:"
          type="text"
          placeholder="آدرس را وارد کنید ..."
          {...register("address")}
          error={errors.address?.message as string}
        />

        {errors.root?.serverError && (
          <p className="text-white bg-red-600 text-sm p-2 rounded-md">
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
