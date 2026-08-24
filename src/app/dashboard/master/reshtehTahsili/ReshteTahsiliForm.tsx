/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  updateReshtehTahiliAction,
  CreateReshtehTahiliAction,
} from "@/actions/reshtehTahsiliActions";
import CoolInput from "@/components/widgets/Elements/CoolInput";
import FormContainer from "@/components/widgets/Elements/FormContainer";
import FromActionBtns from "@/components/widgets/Elements/FromActionBtns";
import {
  reshtehTahsiliSchema,
  ReshtehTahsiliSchema,
} from "@/lib/schemas/reshtehTahsiliSchemas";
import { handleFormServerErrors } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

type Props = {
  mode: "create" | "edit";
  setOpen: (value: boolean) => void;
  defaultValues?: ReshtehTahsiliSchema;
};

export default function ReshteTahsiliForm({
  mode,
  setOpen,
  defaultValues,
}: Props) {
  const isEdit = mode === "edit";

  const {
    register,
    reset,
    formState: { isSubmitting, errors },
    setError,
    handleSubmit,
  } = useForm<any>({
    resolver: zodResolver(reshtehTahsiliSchema),
    mode: "onTouched",
    defaultValues: defaultValues || {
      id: undefined,
      title: "",
    },
  });

  async function onSubmit(data: ReshtehTahsiliSchema) {
    const result = isEdit
      ? await updateReshtehTahiliAction(data)
      : await CreateReshtehTahiliAction(data);

    if (result.status === "success") {
      toast.success(
        isEdit ? "ویرایش با موفقیت انجام شد" : "رشته تحصیلی با موفقیت ثبت شد",
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
          title="کد رشته تحصیلی:"
          type="number"
          placeholder="کد رشته تحصیلی ..."
          disabled={isEdit} // فقط در حالت ویرایش غیرقابل تغییر
          {...register("id", { valueAsNumber: true })}
          error={errors.id?.message as string}
        />

        <CoolInput
          title="نام رشته تحصیلی:"
          type="text"
          placeholder="نام رشته تحصیلی ..."
          {...register("title")}
          error={errors.title?.message as string}
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
