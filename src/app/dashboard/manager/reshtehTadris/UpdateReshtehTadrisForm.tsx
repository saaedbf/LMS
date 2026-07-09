/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { updateReshtehTadrisAction } from "@/actions/reshtehTadrisesActions";
import CoolInput from "@/components/widgets/Elements/CoolInput";
import FormContainer from "@/components/widgets/Elements/FormContainer";
import FromActionBtns from "@/components/widgets/Elements/FromActionBtns";
import {
  updateReshtehTadrisSchemas,
  UpdateReshtehTadrisSchemas,
} from "@/lib/schemas/reshtehTadrisSchemas";
import { handleFormServerErrors } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

type Props = {
  setOpen: (value: boolean) => void;
  defaultValues?: UpdateReshtehTadrisSchemas;
};

export default function UpdateReshteTahsiliForm({
  setOpen,
  defaultValues,
}: Props) {
  const {
    register,
    reset,
    formState: { isSubmitting, errors },
    setError,
    handleSubmit,
  } = useForm<any>({
    resolver: zodResolver(updateReshtehTadrisSchemas),
    mode: "onTouched",
    defaultValues: defaultValues || {
      id: "",
      title: "",
    },
  });

  async function onSubmit(data: UpdateReshtehTadrisSchemas) {
    const result = await updateReshtehTadrisAction(data);
    if (result.status === "success") {
      toast.success("رشته تدریس با موفقیت ویرایش شد");

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
          title="نام رشته تدریس:"
          type="text"
          placeholder="نام رشته تدریس ..."
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
        txtSubmit={"ویرایش"}
        isSubmitting={isSubmitting}
        setOpen={setOpen}
      />
    </form>
  );
}
