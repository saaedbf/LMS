"use client";

import {
  createSchoolAction,
  updateSchoolAction,
  getAllDoreha,
  getAllSchoolsForOpposite,
} from "@/actions/schoolActions";
import CoolInput from "@/components/widgets/Elements/CoolInput";
import FormContainer from "@/components/widgets/Elements/FormContainer";
import FromActionBtns from "@/components/widgets/Elements/FromActionBtns";
import SearchableSelect from "@/components/widgets/Elements/SearchableSelect";
import { schoolSchema, SchoolSchema } from "@/lib/schemas/schoolSchemas";
import { handleFormServerErrors } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

type Props = {
  mode: "create" | "edit";
  setOpen: (value: boolean) => void;
  defaultValues?: SchoolSchema;
};

export default function SchoolForm({ mode, setOpen, defaultValues }: Props) {
  const isEdit = mode === "edit";
  const [doreha, setDoreha] = useState<{ id: number; title: string }[]>([]);
  const [loadingDoreha, setLoadingDoreha] = useState(true);
  // در state:
  const [oppositeSchools, setOppositeSchools] = useState<
    { id: number; title: string }[]
  >([]);

  const {
    register,
    reset,
    setValue,
    clearErrors,
    watch,
    formState: { isSubmitting, errors },
    setError,
    handleSubmit,
  } = useForm<SchoolSchema>({
    resolver: zodResolver(schoolSchema),
    mode: "onTouched",
    defaultValues: defaultValues || {
      id: undefined,
      title: "",
      subTitle: "",
      modirName: "",
      isActive: true,
      sex: "Boy",
      schoolType: "Dolati",
      doreTahsiliId: 1,
    },
  });

  // در useEffect، مدارس دیگر را بگیر:
  useEffect(() => {
    const fetchOppositeSchools = async () => {
      const res = await getAllSchoolsForOpposite(defaultValues?.id);
      if (res.status === "success") {
        setOppositeSchools(res.data);
      }
    };
    fetchOppositeSchools();
  }, [defaultValues?.id]);
  // دریافت لیست دوره‌ها
  useEffect(() => {
    const fetchDoreha = async () => {
      try {
        const result = await getAllDoreha();
        if (result.status === "success" && result.data) {
          setDoreha(result.data);
        } else {
          toast.error("خطا در دریافت لیست دوره‌ها");
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("خطا در ارتباط با سرور");
      } finally {
        setLoadingDoreha(false);
      }
    };

    fetchDoreha();
  }, []);

  const selectedDoreId = watch("doreTahsiliId");
  useEffect(() => {
    if (selectedDoreId && selectedDoreId > 0) {
      clearErrors("doreTahsiliId");
    }
  }, [selectedDoreId, clearErrors]);

  async function onSubmit(data: SchoolSchema) {
    try {
      // اگر id را در create الزامی می‌کنی
      if (!isEdit && !data.id) {
        setError("id", { message: "کد مدرسه را وارد نمایید" });
        return;
      }

      // اگر دوره را الزامی می‌خواهی:
      // if (!data.doreTahsiliId || data.doreTahsiliId === 0) {
      //   setError("doreTahsiliId", { message: "لطفاً دوره تحصیلی را انتخاب کنید" });
      //   return;
      // }

      const result = isEdit
        ? await updateSchoolAction({ ...data, id: data.id! })
        : await createSchoolAction(data);

      if (result.status === "success") {
        toast.success(
          isEdit ? "ویرایش با موفقیت انجام شد" : "مدرسه با موفقیت ثبت شد",
        );
        reset();
        setOpen(false);
      } else {
        handleFormServerErrors(result, setError);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("خطا در ارتباط با سرور");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormContainer>
        <CoolInput
          title="کد مدرسه:"
          type="number"
          placeholder="کد مدرسه را وارد کنید ..."
          disabled={isEdit} // در حالت ویرایش غیرفعال
          {...register("id", { valueAsNumber: true })}
          error={errors.id?.message as string}
        />

        <CoolInput
          title="نام مدرسه:"
          type="text"
          placeholder="نام مدرسه را وارد کنید ..."
          {...register("title")}
          error={errors.title?.message as string}
        />

        <CoolInput
          title="نام دوم / توضیح:"
          type="text"
          placeholder="زیرعنوان مدرسه (اختیاری) ..."
          {...register("subTitle")}
          error={errors.subTitle?.message as string}
        />

        <CoolInput
          title="نام مدیر:"
          type="text"
          placeholder="نام مدیر مدرسه را وارد کنید ..."
          {...register("modirName")}
          error={errors.modirName?.message as string}
        />

        {/* انتخاب دوره تحصیلی */}
        <SearchableSelect
          title="دوره تحصیلی:"
          options={doreha}
          value={selectedDoreId ?? 0}
          onChange={(value) => setValue("doreTahsiliId", value)}
          error={errors.doreTahsiliId?.message as string}
          disabled={loadingDoreha}
          placeholder={
            loadingDoreha ? "در حال بارگذاری دوره‌ها..." : "انتخاب دوره ..."
          }
        />

        {/* انتخاب جنسیت مدرسه */}
        <SearchableSelect
          title="جنسیت مدرسه:"
          options={[
            { id: 1, title: "پسرانه" },
            { id: 2, title: "دخترانه" },
            { id: 3, title: "مختلط" },
          ]}
          value={watch("sex") === "Boy" ? 1 : watch("sex") === "Girl" ? 2 : 3}
          onChange={(value) => {
            const map: Record<number, "Boy" | "Girl" | "Mixed"> = {
              1: "Boy",
              2: "Girl",
              3: "Mixed",
            };
            setValue("sex", map[value]);
          }}
          error={errors.sex?.message as string}
          placeholder="انتخاب جنسیت مدرسه ..."
        />

        {/* نوع مدرسه */}
        <SearchableSelect
          title="نوع مدرسه:"
          options={[
            { id: 1, title: "دولتی" },
            { id: 2, title: "غیردولتی" },
            { id: 3, title: "مختلط" },
          ]}
          value={
            watch("schoolType") === "Dolati"
              ? 1
              : watch("schoolType") === "GheireDolati"
                ? 2
                : 3
          }
          onChange={(value) => {
            const map: Record<number, "Dolati" | "GheireDolati"> = {
              1: "Dolati",
              2: "GheireDolati",
            };
            setValue("schoolType", map[value]);
          }}
          error={errors.schoolType?.message as string}
          placeholder="انتخاب نوع مدرسه ..."
        />
        <SearchableSelect
          title="نوبت مخالف:"
          options={oppositeSchools}
          value={watch("oppositeSchoolId") ?? 0}
          clearValue={0}
          onChange={(value) =>
            setValue(
              "oppositeSchoolId",
              Number(value) > 0 ? Number(value) : null,
            )
          }
          error={errors.oppositeSchoolId?.message as string}
          placeholder="انتخاب مدرسه نوبت مخالف (اختیاری) ..."
        />
        {/* فعال / غیرفعال */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register("isActive")}
            className="w-4 h-4"
          />
          <span className="text-sm text-gray-700">فعال باشد</span>
        </div>

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
