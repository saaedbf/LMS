"use client";

import {
  createDorehTahiliAction,
  updateDorehTahiliAction,
} from "@/actions/dorehTahsiliActions";
import CoolInput from "@/components/widgets/Elements/CoolInput";
import FormContainer from "@/components/widgets/Elements/FormContainer";
import FromActionBtns from "@/components/widgets/Elements/FromActionBtns";
import {
  createDorehSchema,
  CreateDorehSchema,
} from "@/lib/schemas/deorehSchemas";
import { handleFormServerErrors } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

type Props = {
  mode: "create" | "edit";
  setOpen: (value: boolean) => void;
  defaultValues?: CreateDorehSchema;
};

export default function DorehForm({ mode, setOpen, defaultValues }: Props) {
  const isEdit = mode === "edit";

  const {
    register,
    reset,
    formState: { isDirty, isSubmitting, isValid, errors },
    setError,
    handleSubmit,
  } = useForm<CreateDorehSchema>({
    resolver: zodResolver(createDorehSchema),
    mode: "onTouched",
    defaultValues: defaultValues || {
      id: undefined,
      title: "",
    },
  });

  async function onSubmit(data: CreateDorehSchema) {
    const result = isEdit
      ? await updateDorehTahiliAction(data)
      : await createDorehTahiliAction(data);

    if (result.status === "success") {
      toast.success(
        isEdit ? "ویرایش با موفقیت انجام شد" : "دوره با موفقیت ثبت شد",
      );

      reset(data);
      setOpen(false);
    } else {
      handleFormServerErrors(result, setError);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormContainer>
        <CoolInput
          title="کد دوره تحصیلی:"
          type="number"
          placeholder="کد دوره ..."
          disabled={isEdit} // فقط در حالت ویرایش غیرقابل تغییر
          {...register("id", { valueAsNumber: true })}
          error={errors.id?.message}
        />

        <CoolInput
          title="نام دوره تحصیلی:"
          type="text"
          placeholder="نام دوره ..."
          {...register("title")}
          error={errors.title?.message}
        />

        {errors.root?.serverError && (
          <p className="text-white bg-red-600 text-sm p-2 rounded-md">
            {errors.root?.serverError.message}
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
