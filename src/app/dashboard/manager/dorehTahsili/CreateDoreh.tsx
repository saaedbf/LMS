import { createDorehTahiliAction } from "@/actions/dorehTahsiliActions";
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
export default function CreateDoreh({
  setOpen,
}: {
  setOpen: (arg0: boolean) => void;
}) {
  const {
    register,
    reset,
    formState: { isDirty, isSubmitting, isValid, errors },
    setError,
    handleSubmit,
  } = useForm<CreateDorehSchema>({
    resolver: zodResolver(createDorehSchema),
    mode: "onTouched",
  });
  async function onSubmit(data: CreateDorehSchema) {
    const result = await createDorehTahiliAction(data);

    if (result.status === "success") {
      toast.success("دوره با موفقیت ثبت شد");
      reset({ ...data });
      setOpen(false);
    } else {
      console.log("er");
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
          {...register("id", { valueAsNumber: true })}
          error={errors.id?.message}
        />
        <CoolInput
          title="نام دوره تحصیلی:"
          {...register("title")}
          type="text"
          placeholder=" نام دوره ..."
          error={errors.title?.message}
        />
        {errors.root?.serverError && (
          <p className="text-white bg-red-600 text-sm p-2 rounded-md">
            {errors.root?.serverError.message}
          </p>
        )}
      </FormContainer>
      <FromActionBtns
        txtSubmit="ذخیره"
        isSubmitting={isSubmitting}
        setOpen={setOpen}
      />
    </form>
  );
}
