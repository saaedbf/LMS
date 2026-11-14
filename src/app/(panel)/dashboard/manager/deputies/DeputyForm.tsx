"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";

import CoolInput from "@/components/widgets/Elements/CoolInput";
import FormContainer from "@/components/widgets/Elements/FormContainer";
import FromActionBtns from "@/components/widgets/Elements/FromActionBtns";
import { handleFormServerErrors } from "@/lib/utils";
import {
  createDeputySchema,
  CreateDeputyInput,
  DAYS,
  AttendanceDay,
} from "@/lib/schemas/deputy";
import { createDeputy, updateDeputy } from "@/actions/deputyActions";
import { PERMISSION_GROUPS } from "@/lib/permissions";

const DAYS_FA: Record<AttendanceDay, string> = {
  SATURDAY: "شنبه",
  SUNDAY: "یکشنبه",
  MONDAY: "دوشنبه",
  TUESDAY: "سه‌شنبه",
  WEDNESDAY: "چهارشنبه",
};

const ATTENDANCE_DAYS: AttendanceDay[] = [...DAYS];

type Props = {
  setOpen: (open: boolean) => void;
  mode?: "create" | "edit";
  initialData?: {
    id: string;
    firstName: string;
    lastName: string;
    nationalCode: string;
    phone: string;
    address?: string | null;
    position?: string | null;
    attendanceOrder?: number;
    attendanceDays?: string[];
    permissions: string[];
  };
};

export default function DeputyForm({
  setOpen,
  mode = "create",
  initialData,
}: Props) {
  const isEdit = mode === "edit";
  const router = useRouter();

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    initialData?.permissions || [],
  );
  const [selectedDays, setSelectedDays] = useState<AttendanceDay[]>(
    (initialData?.attendanceDays as AttendanceDay[]) || [],
  );

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateDeputyInput>({
    resolver: zodResolver(createDeputySchema) as any,
    mode: "onTouched",
    defaultValues: {
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      nationalCode: initialData?.nationalCode || "",
      phone: initialData?.phone || "",
      address: initialData?.address || "",
      position: initialData?.position || "",
      attendanceOrder: initialData?.attendanceOrder ?? 0,
      attendanceDays: (initialData?.attendanceDays as AttendanceDay[]) || [],
      permissions: initialData?.permissions || [],
    },
  });

  const togglePermission = (permission: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission],
    );
  };

  const toggleGroup = (groupPermissions: { key: string }[]) => {
    const keys = groupPermissions.map((p) => p.key);
    const allSelected = keys.every((k) => selectedPermissions.includes(k));
    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((p) => !keys.includes(p)));
    } else {
      setSelectedPermissions((prev) => Array.from(new Set([...prev, ...keys])));
    }
  };

  const handleSelectAll = () => {
    const allKeys = PERMISSION_GROUPS.flatMap((g) =>
      g.permissions.map((p) => p.key),
    );
    const allSelected = allKeys.every((k) => selectedPermissions.includes(k));
    setSelectedPermissions(allSelected ? [] : allKeys);
  };

  const toggleDay = (day: AttendanceDay) => {
    setSelectedDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : ([...prev, day] as AttendanceDay[]),
    );
  };

  const onSubmit = (data: CreateDeputyInput) => {
    const payload = {
      ...data,
      permissions: selectedPermissions,
      attendanceDays: selectedDays,
      attendanceOrder: Number(data.attendanceOrder) || 0,
    };

    if (isEdit && initialData) {
      updateDeputy({ ...payload, id: initialData.id }).then((r) => {
        if (r.status === "error") {
          handleFormServerErrors(r, setError);
        } else {
          toast.success("کادر اجرایی با موفقیت ویرایش شد");
          router.refresh();
          setOpen(false);
        }
      });
      return;
    }

    createDeputy(payload).then((r) => {
      if (r.status === "error") {
        handleFormServerErrors(r, setError);
      } else {
        toast.success("کادر اجرایی با موفقیت ایجاد شد");
        router.refresh();
        setOpen(false);
      }
    });
  };

  const allSelected = PERMISSION_GROUPS.flatMap((g) =>
    g.permissions.map((p) => p.key),
  ).every((k) => selectedPermissions.includes(k));

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormContainer className="pb-4">
        <CoolInput
          title="نام:"
          type="text"
          placeholder="نام"
          {...register("firstName")}
          error={errors.firstName?.message}
        />

        <CoolInput
          title="نام خانوادگی:"
          type="text"
          placeholder="نام خانوادگی"
          {...register("lastName")}
          error={errors.lastName?.message}
        />

        <CoolInput
          title="نام کاربری :"
          type="text"
          placeholder=""
          readOnly={isEdit}
          {...register("nationalCode")}
          error={errors.nationalCode?.message}
          className={isEdit ? "cursor-not-allowed bg-gray-100" : ""}
        />

        <CoolInput
          title="شماره تماس:"
          type="text"
          placeholder="مثلاً 09123456789"
          inputMode="numeric"
          {...register("phone")}
          error={errors.phone?.message}
        />

        <CoolInput
          title="آدرس (اختیاری):"
          type="text"
          placeholder="آدرس محل سکونت"
          {...register("address")}
          error={errors.address?.message}
        />

        <CoolInput
          title="سمت:"
          type="text"
          placeholder="مثلاً معاون آموزشی، مدیر، ..."
          {...register("position")}
          error={errors.position?.message}
        />

        <CoolInput
          title="ترتیب در دفتر حضور و غیاب:"
          type="number"
          placeholder="مثلاً ۱، ۲، ۳"
          inputMode="numeric"
          {...register("attendanceOrder", { valueAsNumber: true })}
          error={errors.attendanceOrder?.message}
        />

        {/* روزهای حضور */}
        <div className="col-span-full">
          <label className="mb-2 block text-sm font-medium text-zinc-700">
            روزهای حضور:
          </label>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
            {ATTENDANCE_DAYS.map((day) => {
              const isSelected = selectedDays.includes(day);
              return (
                <label
                  key={day}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2 text-xs transition-colors ${
                    isSelected
                      ? "border-emerald-300 bg-emerald-50"
                      : "border-zinc-200 bg-white hover:border-zinc-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleDay(day)}
                    className="h-4 w-4 rounded border-zinc-300 text-emerald-600"
                  />
                  <span className="font-medium text-zinc-700">
                    {DAYS_FA[day]}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* راهنما */}
        <div className="col-span-full rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-700">
          <p className="font-medium">🔑 راهنما:</p>
          <ul className="mt-1 list-inside list-disc space-y-0.5">
            <li>کلمه عبور اولیه = شماره تماس</li>
            <li>کادر اجرایی می‌تواند بعداً رمز خود را تغییر دهد</li>
          </ul>
        </div>

        {/* دسترسی‌ها */}
        <div className="col-span-full">
          <div className="mb-3 flex items-center justify-between border-b border-zinc-200 pb-2">
            <h3 className="flex items-center gap-2 text-sm font-bold text-zinc-800">
              <Shield size={16} className="text-indigo-600" />
              دسترسی‌ها
              <span className="mr-2 text-xs text-indigo-600">
                ({selectedPermissions.length} انتخاب شده)
              </span>
            </h3>
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-xs text-indigo-600 hover:underline"
            >
              {allSelected ? "لغو انتخاب همه" : "انتخاب همه"}
            </button>
          </div>

          <div className="space-y-3">
            {PERMISSION_GROUPS.map((group) => {
              const groupKeys = group.permissions.map((p) => p.key);
              const allGroupSelected =
                groupKeys.length > 0 &&
                groupKeys.every((k) => selectedPermissions.includes(k));

              return (
                <div
                  key={group.title}
                  className="rounded-lg border border-zinc-200 bg-zinc-50 p-3"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-700">
                      {group.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.permissions)}
                      className="text-xs text-indigo-600 hover:underline"
                    >
                      {allGroupSelected ? "لغو همه" : "انتخاب همه"}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                    {group.permissions.map((perm) => {
                      const isSelected = selectedPermissions.includes(perm.key);
                      return (
                        <label
                          key={perm.key}
                          className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2 text-xs transition-colors ${
                            isSelected
                              ? "border-indigo-300 bg-indigo-50"
                              : "border-zinc-200 bg-white hover:border-zinc-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => togglePermission(perm.key)}
                            className="h-4 w-4 rounded border-zinc-300 text-indigo-600"
                          />
                          <span className="font-medium text-zinc-700">
                            {perm.label}
                          </span>
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
        txtSubmit={isEdit ? "ذخیره تغییرات" : "ایجاد کادر اجرایی"}
        isSubmitting={isSubmitting}
        setOpen={setOpen}
      />
    </form>
  );
}
