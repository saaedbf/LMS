"use client";

import { useState, useEffect, useTransition, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronLeft } from "lucide-react";

// ⬅️ اضافه کردن DatePicker فارسی
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

import CoolInput from "@/components/widgets/Elements/CoolInput";
import FormContainer from "@/components/widgets/Elements/FormContainer";
import FromActionBtns from "@/components/widgets/Elements/FromActionBtns";
import { handleFormServerErrors } from "@/lib/utils";
import {
  createGradePeriodSchema,
  CreateGradePeriodInput,
} from "@/lib/schemas/gradePeriod";
import {
  createGradePeriod,
  updateGradePeriod,
  getClassesAndLessonsForPeriod,
} from "@/actions/gradePeriodActions";

type PayeWithData = {
  payeId: number;
  payeTitle: string;
  klasses: {
    id: string;
    title: string;
    reshtehTahsiliId: number;
    reshtehTahsiliTitle: string;
  }[];
  lessons: {
    id: string;
    title: string;
    units: number;
    reshtehTahsiliId: number;
    payeId: number;
  }[];
};

type Props = {
  setOpen: (open: boolean) => void;
  mode?: "create" | "edit";
  initialData?: {
    id: string;
    title: string;
    description?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    isActive: boolean;
    klassIds: string[];
    lessonsByPaye: { payeId: number; lessonIds: string[] }[];
  };
};

export default function GradePeriodForm({
  setOpen,
  mode = "create",
  initialData,
}: Props) {
  const isEdit = mode === "edit";
  const router = useRouter();

  const [payesData, setPayesData] = useState<PayeWithData[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [expandedPayes, setExpandedPayes] = useState<number[]>([]);
  const [isPending, startTransition] = useTransition();

  // ⬅️ state برای تاریخ‌ها به صورت Date
  const [startDate, setStartDate] = useState<Date | null>(
    initialData?.startDate ? new Date(initialData.startDate) : null,
  );
  const [endDate, setEndDate] = useState<Date | null>(
    initialData?.endDate ? new Date(initialData.endDate) : null,
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<CreateGradePeriodInput>({
    resolver: zodResolver(createGradePeriodSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      // ⬅️ startDate/endDate را از فرم حذف می‌کنیم چون با state مدیریت می‌شوند
      startDate: initialData?.startDate || "",
      endDate: initialData?.endDate || "",
      isActive: initialData?.isActive ?? true,
      klassIds: initialData?.klassIds || [],
      lessonsByPaye: initialData?.lessonsByPaye || [],
    },
  });

  const selectedKlassIds = watch("klassIds") || [];
  const lessonsByPaye = watch("lessonsByPaye") || [];

  // ⬅️ sync date state با RHF
  useEffect(() => {
    setValue(
      "startDate",
      startDate ? startDate.toISOString().split("T")[0] : "",
      { shouldValidate: false },
    );
  }, [startDate, setValue]);

  useEffect(() => {
    setValue("endDate", endDate ? endDate.toISOString().split("T")[0] : "", {
      shouldValidate: false,
    });
  }, [endDate, setValue]);

  // بارگذاری اطلاعات
  useEffect(() => {
    async function loadData() {
      setLoadingData(true);
      const res = await getClassesAndLessonsForPeriod();
      if (res.status === "success") {
        setPayesData(res.data);
        setExpandedPayes(res.data.map((p) => p.payeId));
      } else {
        toast.error(res.error);
      }
      setLoadingData(false);
    }
    loadData();
  }, []);

  // توابع toggle کلاس
  const toggleKlass = (klassId: string) => {
    const current = watch("klassIds") || [];
    const updated = current.includes(klassId)
      ? current.filter((id) => id !== klassId)
      : [...current, klassId];
    setValue("klassIds", updated, { shouldValidate: true, shouldDirty: true });
  };

  // توابع toggle درس (بر اساس پایه)
  const getLessonIdsForPaye = (payeId: number): string[] => {
    const entry = lessonsByPaye.find((l) => l.payeId === payeId);
    return entry?.lessonIds || [];
  };

  const setLessonIdsForPaye = (payeId: number, lessonIds: string[]) => {
    const current = [...lessonsByPaye];
    const idx = current.findIndex((l) => l.payeId === payeId);

    if (lessonIds.length === 0) {
      if (idx >= 0) current.splice(idx, 1);
    } else if (idx >= 0) {
      current[idx] = { payeId, lessonIds };
    } else {
      current.push({ payeId, lessonIds });
    }

    setValue("lessonsByPaye", current, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const toggleLesson = (payeId: number, lessonId: string) => {
    const current = getLessonIdsForPaye(payeId);
    const updated = current.includes(lessonId)
      ? current.filter((id) => id !== lessonId)
      : [...current, lessonId];
    setLessonIdsForPaye(payeId, updated);
  };

  const toggleAllLessonsInPaye = (paye: PayeWithData) => {
    const current = getLessonIdsForPaye(paye.payeId);
    const payeLessonIds = paye.lessons.map((l) => l.id);
    const allSelected = payeLessonIds.every((id) => current.includes(id));

    const updated = allSelected
      ? []
      : Array.from(new Set([...current, ...payeLessonIds]));
    setLessonIdsForPaye(paye.payeId, updated);
  };

  const toggleAllKlasses = () => {
    const current = watch("klassIds") || [];
    const allIds = payesData.flatMap((p) => p.klasses.map((k) => k.id));
    const allSelected = allIds.every((id) => current.includes(id));
    setValue("klassIds", allSelected ? [] : allIds, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const toggleAllLessonsForAllPayes = () => {
    const allPayesSelected = payesData.every((paye) => {
      const current = getLessonIdsForPaye(paye.payeId);
      return (
        paye.lessons.length > 0 &&
        paye.lessons.every((l) => current.includes(l.id))
      );
    });

    if (allPayesSelected) {
      setValue("lessonsByPaye", [], {
        shouldValidate: true,
        shouldDirty: true,
      });
    } else {
      const all = payesData
        .filter((p) => p.lessons.length > 0)
        .map((p) => ({
          payeId: p.payeId,
          lessonIds: p.lessons.map((l) => l.id),
        }));
      setValue("lessonsByPaye", all, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  const onSubmit = (data: CreateGradePeriodInput) => {
    if (!data.klassIds || data.klassIds.length === 0) {
      setError("klassIds", {
        type: "manual",
        message: "حداقل یک کلاس را انتخاب کنید",
      });
      return;
    }

    if (!data.lessonsByPaye || data.lessonsByPaye.length === 0) {
      setError("lessonsByPaye", {
        type: "manual",
        message: "حداقل برای یک پایه درس انتخاب کنید",
      });
      return;
    }

    startTransition(async () => {
      // ⬅️ ارسال تاریخ‌ها به صورت ISO
      const payload = {
        ...data,
        startDate: startDate ? startDate.toISOString() : "",
        endDate: endDate ? endDate.toISOString() : "",
      };

      const res = isEdit
        ? await updateGradePeriod({ ...payload, id: initialData!.id })
        : await createGradePeriod(payload);

      if (res.status === "error") {
        handleFormServerErrors(res, setError);
      } else {
        toast.success(
          isEdit ? "دوره با موفقیت ویرایش شد" : "دوره با موفقیت ایجاد شد",
        );
        router.refresh();
        setOpen(false);
      }
    });
  };

  const allKlassesSelected = useMemo(() => {
    if (payesData.length === 0) return false;
    const allIds = payesData.flatMap((p) => p.klasses.map((k) => k.id));
    return (
      allIds.length > 0 && allIds.every((id) => selectedKlassIds.includes(id))
    );
  }, [payesData, selectedKlassIds]);

  const allLessonsForAllPayesSelected = useMemo(() => {
    if (payesData.length === 0) return false;
    return payesData.every((paye) => {
      const current = getLessonIdsForPaye(paye.payeId);
      return (
        paye.lessons.length > 0 &&
        paye.lessons.every((l) => current.includes(l.id))
      );
    });
  }, [payesData, lessonsByPaye]);

  if (loadingData) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="text-sm text-zinc-500">در حال بارگذاری...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormContainer className="pb-4">
        {/* اطلاعات پایه */}
        <CoolInput
          title="عنوان دوره:"
          type="text"
          placeholder="مثلاً: نمرات مهرماه"
          {...register("title")}
          error={errors.title?.message as string}
        />

        <CoolInput
          title="توضیحات (اختیاری):"
          type="text"
          placeholder="توضیحات..."
          {...register("description")}
          error={errors.description?.message as string}
        />

        {/* ⬅️ تاریخ شروع با DatePicker فارسی */}
        <div className="col-span-full md:col-span-1">
          <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            تاریخ شروع (اختیاری)
          </label>
          <DatePicker
            value={startDate}
            onChange={(selectedDate: any) => {
              if (selectedDate) {
                if (selectedDate.toDate) {
                  setStartDate(selectedDate.toDate());
                } else {
                  setStartDate(new Date(selectedDate));
                }
              } else {
                setStartDate(null);
              }
            }}
            calendar={persian}
            locale={persian_fa}
            calendarPosition="bottom-right"
            format="YYYY/MM/DD"
            containerClassName="w-full"
            inputClass="w-full rounded-lg border border-zinc-300 p-2 text-sm text-right dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            placeholder="انتخاب تاریخ شمسی..."
            editable={false}
          />
        </div>

        {/* ⬅️ تاریخ پایان با DatePicker فارسی */}
        <div className="col-span-full md:col-span-1">
          <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            تاریخ پایان (اختیاری)
          </label>
          <DatePicker
            value={endDate}
            onChange={(selectedDate: any) => {
              if (selectedDate) {
                if (selectedDate.toDate) {
                  setEndDate(selectedDate.toDate());
                } else {
                  setEndDate(new Date(selectedDate));
                }
              } else {
                setEndDate(null);
              }
            }}
            calendar={persian}
            locale={persian_fa}
            calendarPosition="bottom-right"
            format="YYYY/MM/DD"
            containerClassName="w-full"
            inputClass="w-full rounded-lg border border-zinc-300 p-2 text-sm text-right dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            placeholder="انتخاب تاریخ شمسی..."
            editable={false}
          />
        </div>

        <div className="col-span-full flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            {...register("isActive")}
            className="h-4 w-4 rounded border-zinc-300"
          />
          <label
            htmlFor="isActive"
            className="text-sm text-zinc-700 dark:text-zinc-300"
          >
            دوره فعال باشد
          </label>
        </div>

        {/* بخش کلاس‌ها */}
        <div className="col-span-full">
          <div className="mb-2 flex items-center justify-between border-b border-zinc-200 pb-2 dark:border-zinc-700">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              انتخاب کلاس‌ها
              <span className="mr-2 text-xs text-blue-600">
                ({selectedKlassIds.length} انتخاب شده)
              </span>
            </h3>
            <button
              type="button"
              onClick={toggleAllKlasses}
              className="text-xs text-blue-600 hover:underline"
            >
              {allKlassesSelected ? "لغو انتخاب همه" : "انتخاب همه"}
            </button>
          </div>

          {errors.klassIds && (
            <p className="mb-2 text-xs text-rose-600">
              {errors.klassIds.message as string}
            </p>
          )}

          <div className="space-y-2">
            {payesData.map((paye) => {
              const isExpanded = expandedPayes.includes(paye.payeId);
              const payeSelectedCount = paye.klasses.filter((k) =>
                selectedKlassIds.includes(k.id),
              ).length;
              const allPayeSelected =
                paye.klasses.length > 0 &&
                payeSelectedCount === paye.klasses.length;

              return (
                <div
                  key={paye.payeId}
                  className="rounded-lg border border-zinc-200 dark:border-zinc-700"
                >
                  <div className="flex items-center justify-between bg-zinc-50 p-2 dark:bg-zinc-800">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedPayes((prev) =>
                          prev.includes(paye.payeId)
                            ? prev.filter((id) => id !== paye.payeId)
                            : [...prev, paye.payeId],
                        )
                      }
                      className="flex flex-1 items-center gap-2 text-right"
                    >
                      {isExpanded ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronLeft size={16} />
                      )}
                      <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                        {paye.payeTitle}
                      </span>
                      <span className="text-xs text-zinc-500">
                        ({paye.klasses.length} کلاس)
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const current = watch("klassIds") || [];
                        const payeKlassIds = paye.klasses.map((k) => k.id);
                        const allSelected = payeKlassIds.every((id) =>
                          current.includes(id),
                        );
                        const updated = allSelected
                          ? current.filter((id) => !payeKlassIds.includes(id))
                          : Array.from(new Set([...current, ...payeKlassIds]));
                        setValue("klassIds", updated, {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                      }}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      {allPayeSelected ? "لغو همه" : "انتخاب همه"}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="grid grid-cols-2 gap-2 p-3 md:grid-cols-3">
                      {paye.klasses.map((klass) => {
                        const isSelected = selectedKlassIds.includes(klass.id);
                        return (
                          <label
                            key={klass.id}
                            className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2 text-xs transition-colors ${
                              isSelected
                                ? "border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/30"
                                : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleKlass(klass.id)}
                              className="h-4 w-4 rounded border-zinc-300 text-blue-600"
                            />
                            <div className="flex flex-col">
                              <span className="font-medium text-zinc-800 dark:text-zinc-200">
                                {klass.title}
                              </span>
                              <span className="text-[10px] text-zinc-500">
                                {klass.reshtehTahsiliTitle}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* بخش دروس */}
        <div className="col-span-full">
          <div className="mb-2 flex items-center justify-between border-b border-zinc-200 pb-2 dark:border-zinc-700">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              انتخاب دروس (برای هر پایه یک بار)
              <span className="mr-2 text-xs text-emerald-600">
                {lessonsByPaye.reduce((sum, l) => sum + l.lessonIds.length, 0)}{" "}
                درس انتخاب شده
              </span>
            </h3>
            <button
              type="button"
              onClick={toggleAllLessonsForAllPayes}
              className="text-xs text-blue-600 hover:underline"
            >
              {allLessonsForAllPayesSelected
                ? "لغو انتخاب همه"
                : "انتخاب همه برای همه پایه‌ها"}
            </button>
          </div>

          {errors.lessonsByPaye && (
            <p className="mb-2 text-xs text-rose-600">
              {errors.lessonsByPaye.message as string}
            </p>
          )}

          <div className="space-y-2">
            {payesData.map((paye) => {
              const payeLessonIds = getLessonIdsForPaye(paye.payeId);
              const allPayeSelected =
                paye.lessons.length > 0 &&
                paye.lessons.every((l) => payeLessonIds.includes(l.id));

              return (
                <div
                  key={paye.payeId}
                  className="rounded-lg border border-zinc-200 dark:border-zinc-700"
                >
                  <div className="flex items-center justify-between bg-zinc-50 p-2 dark:bg-zinc-800">
                    <div className="flex flex-1 items-center gap-2">
                      <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                        {paye.payeTitle}
                      </span>
                      <span className="text-xs text-zinc-500">
                        ({payeLessonIds.length} از {paye.lessons.length} درس)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleAllLessonsInPaye(paye)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      {allPayeSelected ? "لغو همه" : "انتخاب همه"}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-3 md:grid-cols-3">
                    {paye.lessons.map((lesson) => {
                      const isSelected = payeLessonIds.includes(lesson.id);
                      return (
                        <label
                          key={lesson.id}
                          className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2 text-xs transition-colors ${
                            isSelected
                              ? "border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30"
                              : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() =>
                              toggleLesson(paye.payeId, lesson.id)
                            }
                            className="h-4 w-4 rounded border-zinc-300 text-emerald-600"
                          />
                          <div className="flex flex-col">
                            <span className="font-medium text-zinc-800 dark:text-zinc-200">
                              {lesson.title}
                            </span>
                            <span className="text-[10px] text-zinc-500">
                              {lesson.units} واحد
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </FormContainer>

      <FromActionBtns
        txtSubmit={isEdit ? "ذخیره تغییرات" : "ایجاد دوره"}
        isSubmitting={isPending}
        setOpen={setOpen}
      />
    </form>
  );
}
