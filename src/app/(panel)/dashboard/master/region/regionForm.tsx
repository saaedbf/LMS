// components/forms/Region/RegionForm.tsx

"use client";

import {
  CreateRegionAction,
  updateRegionAction,
  getAllOstans,
} from "@/actions/regionActions";
import CoolInput from "@/components/widgets/Elements/CoolInput";
import FormContainer from "@/components/widgets/Elements/FormContainer";
import FromActionBtns from "@/components/widgets/Elements/FromActionBtns";
import SearchableSelect from "@/components/widgets/Elements/SearchableSelect";
import { regionSchema, RegionSchema } from "@/lib/schemas/regionSchemas";
import { handleFormServerErrors } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

type Props = {
  mode: "create" | "edit";
  setOpen: (value: boolean) => void;
  defaultValues?: RegionSchema;
};

export default function RegionForm({ mode, setOpen, defaultValues }: Props) {
  const isEdit = mode === "edit";
  const [ostans, setOstans] = useState<{ id: number; title: string }[]>([]);
  const [loadingOstans, setLoadingOstans] = useState(true);

  const {
    register,
    reset,
    setValue,
    clearErrors,
    watch,
    formState: { isSubmitting, errors },
    setError,
    handleSubmit,
  } = useForm<RegionSchema>({
    resolver: zodResolver(regionSchema),
    mode: "onTouched",
    defaultValues: defaultValues || {
      id: undefined,
      title: "",
      ostanId: 0,
    },
  });

  // دریافت لیست استان‌ها
  useEffect(() => {
    const fetchOstans = async () => {
      try {
        const result = await getAllOstans();
        if (result.status === "success" && result.data) {
          setOstans(result.data);
        } else {
          toast.error("خطا در دریافت لیست استان‌ها");
        }
      } catch (error) {
        console.error("Error:", error); // ✅ استفاده از error
        toast.error("خطا در ارتباط با سرور");
      } finally {
        setLoadingOstans(false);
      }
    };

    fetchOstans();
  }, []);
  const selectedOstanId = watch("ostanId");
  useEffect(() => {
    // هر وقت ostanId تغییر کرد، error رو پاک کن
    if (selectedOstanId && selectedOstanId > 0) {
      clearErrors("ostanId");
    }
  }, [selectedOstanId, clearErrors]);

  async function onSubmit(data: RegionSchema) {
    try {
      // بررسی وجود id در حالت create
      if (!isEdit && !data.id) {
        setError("id", { message: "کد منطقه را وارد نمایید" });
        return;
      }

      // بررسی انتخاب استان
      if (!data.ostanId || data.ostanId === 0) {
        setError("ostanId", { message: "لطفاً استان را انتخاب کنید" });
        return;
      }

      const result = isEdit
        ? await updateRegionAction({ ...data, id: data.id! })
        : await CreateRegionAction(data);

      if (result.status === "success") {
        toast.success(
          isEdit ? "ویرایش با موفقیت انجام شد" : "منطقه با موفقیت ثبت شد",
        );
        reset();
        setOpen(false);
      } else {
        handleFormServerErrors(result, setError);
      }
    } catch (error) {
      console.error("Error:", error); // ✅ استفاده از error
      toast.error("خطا در ارتباط با سرور");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormContainer>
        <CoolInput
          title="کد منطقه:"
          type="number"
          placeholder="کد منطقه را وارد کنید ..."
          disabled={isEdit} // ← در حالت ویرایش غیرفعال
          {...register("id", { valueAsNumber: true })}
          error={errors.id?.message as string}
        />

        <CoolInput
          title="نام منطقه:"
          type="text"
          placeholder="نام منطقه را وارد کنید ..."
          {...register("title")}
          error={errors.title?.message as string}
        />

        <SearchableSelect
          title="استان:"
          options={ostans}
          value={selectedOstanId}
          onChange={(value) => setValue("ostanId", value)} // ← ساده
          error={errors.ostanId?.message as string}
          disabled={loadingOstans}
          placeholder={
            loadingOstans ? "در حال بارگذاری..." : "انتخاب استان ..."
          }
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
