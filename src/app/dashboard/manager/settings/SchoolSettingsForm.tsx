// app/dashboard/manager/settings/SchoolSettingsForm.tsx
"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Wallet,
  AlertTriangle,
  CalendarX,
  FileText,
  Save,
} from "lucide-react";

import FormContainer from "@/components/widgets/Elements/FormContainer";
import { handleFormServerErrors } from "@/lib/utils";
import {
  updateSchoolSettingsSchema,
  UpdateSchoolSettingsInput,
} from "@/lib/schemas/schoolSettings";
import { updateSchoolSettings } from "@/actions/schoolSettingsActions";

type Props = {
  initialData: {
    gradingType: "DESCRIPTIVE" | "NUMERIC";
    showTuitionInStudentPanel: boolean;
    showDisciplinaryInStudentPanel: boolean;
    showAbsencesInStudentPanel: boolean;
    showReportCardsInStudentPanel: boolean;
  };
};

export default function SchoolSettingsForm({ initialData }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isDirty },
  } = useForm<UpdateSchoolSettingsInput>({
    resolver: zodResolver(updateSchoolSettingsSchema),
    defaultValues: initialData,
  });

  const gradingType = watch("gradingType");

  const onSubmit = (data: UpdateSchoolSettingsInput) => {
    startTransition(async () => {
      const res = await updateSchoolSettings(data);

      if (res.status === "error") {
        handleFormServerErrors(res, setError);
      } else {
        toast.success("تنظیمات با موفقیت ذخیره شد");
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* ==========================================
          بخش ۱: نوع نمره‌دهی
      ========================================== */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-4 flex items-center gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800">
          <BookOpen size={20} className="text-blue-600" />
          <h2 className="text-base font-bold text-zinc-800 dark:text-zinc-100">
            نوع نمره‌دهی
          </h2>
        </div>

        <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
          نحوه ثبت نمرات در این مدرسه را مشخص کنید. این تنظیم روی تمام دوره‌های
          ثبت نمره اعمال می‌شود.
        </p>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {/* توصیفی */}
          <label
            className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition-all ${
              gradingType === "DESCRIPTIVE"
                ? "border-emerald-500 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-950/30"
                : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600"
            }`}
          >
            <input
              type="radio"
              value="DESCRIPTIVE"
              {...register("gradingType")}
              className="mt-1 h-4 w-4"
            />
            <div className="flex flex-col">
              <span className="font-medium text-zinc-800 dark:text-zinc-200">
                توصیفی (کیفی)
              </span>
              <span className="mt-1 text-xs text-zinc-500">
                نمرات به صورت عبارات کیفی مثل "خیلی خوب"، "خوب"، "قابل قبول" ثبت
                می‌شوند.
              </span>
            </div>
          </label>

          {/* نمره‌ای */}
          <label
            className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition-all ${
              gradingType === "NUMERIC"
                ? "border-blue-500 bg-blue-50 dark:border-blue-600 dark:bg-blue-950/30"
                : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600"
            }`}
          >
            <input
              type="radio"
              value="NUMERIC"
              {...register("gradingType")}
              className="mt-1 h-4 w-4"
            />
            <div className="flex flex-col">
              <span className="font-medium text-zinc-800 dark:text-zinc-200">
                نمره‌ای (کمی)
              </span>
              <span className="mt-1 text-xs text-zinc-500">
                نمرات به صورت عددی از ۰ تا ۲۰ ثبت می‌شوند.
              </span>
            </div>
          </label>
        </div>

        {errors.gradingType && (
          <p className="mt-2 text-xs text-rose-600">
            {errors.gradingType.message}
          </p>
        )}
      </div>

      {/* ==========================================
          بخش ۲: نمایش در پنل دانش‌آموز
      ========================================== */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-4 flex items-center gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800">
          <FileText size={20} className="text-purple-600" />
          <h2 className="text-base font-bold text-zinc-800 dark:text-zinc-100">
            نمایش در پنل دانش‌آموز
          </h2>
        </div>

        <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
          مشخص کنید کدام بخش‌ها در پنل دانش‌آموز نمایش داده شوند.
        </p>

        <div className="space-y-3">
          {/* شهریه */}
          <SettingToggle
            icon={<Wallet size={18} className="text-emerald-600" />}
            title="پنل شهریه"
            description="نمایش اطلاعات شهریه و پرداخت‌ها در پنل دانش‌آموز"
            checked={watch("showTuitionInStudentPanel")}
            onChange={(checked) =>
              setValue("showTuitionInStudentPanel", checked, {
                shouldDirty: true,
              })
            }
          />

          {/* انضباطی */}
          <SettingToggle
            icon={<AlertTriangle size={18} className="text-amber-600" />}
            title="موارد انضباطی"
            description="نمایش موارد انضباطی ثبت‌شده برای دانش‌آموز"
            checked={watch("showDisciplinaryInStudentPanel")}
            onChange={(checked) =>
              setValue("showDisciplinaryInStudentPanel", checked, {
                shouldDirty: true,
              })
            }
          />

          {/* غیبت‌ها */}
          <SettingToggle
            icon={<CalendarX size={18} className="text-rose-600" />}
            title="غیبت‌ها"
            description="نمایش لیست غیبت‌های دانش‌آموز"
            checked={watch("showAbsencesInStudentPanel")}
            onChange={(checked) =>
              setValue("showAbsencesInStudentPanel", checked, {
                shouldDirty: true,
              })
            }
          />

          {/* کارنامه‌ها */}
          <SettingToggle
            icon={<FileText size={18} className="text-blue-600" />}
            title="کارنامه‌ها"
            description="نمایش کارنامه‌ها و نمرات در پنل دانش‌آموز"
            checked={watch("showReportCardsInStudentPanel")}
            onChange={(checked) =>
              setValue("showReportCardsInStudentPanel", checked, {
                shouldDirty: true,
              })
            }
          />
        </div>
      </div>

      {/* ==========================================
          دکمه ذخیره
      ========================================== */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending || !isDirty}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <Save size={16} />
          {isPending ? "در حال ذخیره..." : "ذخیره تنظیمات"}
        </button>
      </div>
    </form>
  );
}

// ==========================================
// کامپوننت کمکی: Toggle Setting
// ==========================================
function SettingToggle({
  icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-lg border p-4 transition-colors ${
        checked
          ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20"
          : "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{icon}</div>
        <div>
          <div className="font-medium text-zinc-800 dark:text-zinc-200">
            {title}
          </div>
          <div className="mt-0.5 text-xs text-zinc-500">{description}</div>
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          checked ? "bg-emerald-600" : "bg-zinc-300 dark:bg-zinc-600"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? "-translate-x-5" : "translate-x-0"
          }`}
          style={{ transform: checked ? "translateX(-20px)" : "translateX(0)" }}
        />
      </button>
    </div>
  );
}
