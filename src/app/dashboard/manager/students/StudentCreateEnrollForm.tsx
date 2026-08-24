"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

import CoolInput from "@/components/widgets/Elements/CoolInput";
import FormContainer from "@/components/widgets/Elements/FormContainer";
import FromActionBtns from "@/components/widgets/Elements/FromActionBtns";
import SearchableSelect from "@/components/widgets/Elements/SearchableSelect";
import { handleFormServerErrors } from "@/lib/utils";
import {
  studentCreateEnrollSchema,
  StudentCreateEnrollInput,
} from "@/lib/schemas/studentEnroll";
import {
  findStudentByNationalCode,
  createStudent,
  updateStudent,
} from "@/actions/studentActions";
import {
  createStudentEnrollment,
  updateStudentEnrollment,
} from "@/actions/studentEnrollmentActions";

type Option = {
  value: number | string;
  label: string;
};

type KlassOption = {
  value: string;
  label: string;
  schoolId: number | string;
  academicYearId: number | string;
  payeId: number | string;
  reshtehTahsiliId: number | string;
};

type FormMode = "create" | "edit";

type InitialStudent = {
  id: string;
  nationalCode: string;
  firstName: string;
  lastName: string;
  fatherName: string | null;
  phone: string | null;
  address: string | null;
};

type InitialEnrollment = {
  id: string;
  payeId: number;
  reshtehTahsiliId: number;
  klassId: string;
};

type Props = {
  setOpen: (value: boolean) => void;
  schoolId: number;
  academicYearId: number;
  payes: Option[];
  reshtehTahsilis: Option[];
  klasses: KlassOption[];

  /**
   * create:
   * جست‌وجوی کد ملی و ساخت ثبت‌نام جدید.
   *
   * edit:
   * حذف جست‌وجوی کد ملی و نمایش مستقیم اطلاعات دانش‌آموز.
   */
  mode?: FormMode;

  initialStudent?: InitialStudent;
  initialEnrollment?: InitialEnrollment;
};

const emptyFormValues: StudentCreateEnrollInput = {
  nationalCode: "",
  studentId: "",
  firstName: "",
  lastName: "",
  fatherName: "",
  phone: "",
  address: "",
  payeId: 0,
  reshtehTahsiliId: 0,
  klassId: "",
};

export default function StudentCreateEnrollForm({
  setOpen,
  schoolId,
  academicYearId,
  payes,
  reshtehTahsilis,
  klasses,
  mode = "create",
  initialStudent,
  initialEnrollment,
}: Props) {
  const router = useRouter();

  const isEditMode = mode === "edit";

  const [studentFound, setStudentFound] = React.useState(isEditMode);
  const [studentId, setStudentId] = React.useState<string | null>(
    initialStudent?.id ?? null,
  );
  const [loadingSearch, setLoadingSearch] = React.useState(false);
  const [showForm, setShowForm] = React.useState(isEditMode);

  const {
    register,
    watch,
    setValue,
    setError,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StudentCreateEnrollInput>({
    resolver: zodResolver(studentCreateEnrollSchema),
    mode: "onTouched",
    defaultValues: emptyFormValues,
  });

  /*
   * در حالت Edit، فرم بدون جست‌وجوی کد ملی و با مقادیر قبلی باز می‌شود.
   */
  React.useEffect(() => {
    if (!isEditMode || !initialStudent || !initialEnrollment) {
      return;
    }

    reset({
      studentId: initialStudent.id,
      nationalCode: initialStudent.nationalCode,
      firstName: initialStudent.firstName,
      lastName: initialStudent.lastName,
      fatherName: initialStudent.fatherName ?? "",
      phone: initialStudent.phone ?? "",
      address: initialStudent.address ?? "",
      payeId: Number(initialEnrollment.payeId),
      reshtehTahsiliId: Number(initialEnrollment.reshtehTahsiliId),
      klassId: String(initialEnrollment.klassId),
    });

    setStudentId(initialStudent.id);
    setStudentFound(true);
    setShowForm(true);
  }, [isEditMode, initialStudent, initialEnrollment, reset]);

  const watchedPayeId = watch("payeId");
  const watchedReshtehTahsiliId = watch("reshtehTahsiliId");
  const watchedKlassId = watch("klassId");

  const filteredKlasses = React.useMemo(() => {
    const hasSelectedPaye =
      watchedPayeId !== undefined &&
      watchedPayeId !== null &&
      Number(watchedPayeId) > 0;

    const hasSelectedReshteh =
      watchedReshtehTahsiliId !== undefined &&
      watchedReshtehTahsiliId !== null &&
      Number(watchedReshtehTahsiliId) > 0;

    if (!hasSelectedPaye || !hasSelectedReshteh) {
      return [];
    }

    return klasses.filter((klass) => {
      return (
        Number(klass.schoolId) === Number(schoolId) &&
        Number(klass.academicYearId) === Number(academicYearId) &&
        Number(klass.payeId) === Number(watchedPayeId) &&
        Number(klass.reshtehTahsiliId) === Number(watchedReshtehTahsiliId)
      );
    });
  }, [
    klasses,
    schoolId,
    academicYearId,
    watchedPayeId,
    watchedReshtehTahsiliId,
  ]);

  /*
   * اگر کلاس انتخاب‌شده با پایه/رشته جدید سازگار نبود،
   * اولین کلاس مجاز انتخاب می‌شود.
   *
   * در Edit اگر کلاس قبلی معتبر باشد، بدون تغییر حفظ خواهد شد.
   */
  React.useEffect(() => {
    if (filteredKlasses.length === 0) {
      if (watchedKlassId !== "") {
        setValue("klassId", "");
      }

      return;
    }

    const isCurrentKlassValid = filteredKlasses.some(
      (klass) => String(klass.value) === String(watchedKlassId),
    );

    if (!isCurrentKlassValid) {
      setValue("klassId", String(filteredKlasses[0].value), {
        shouldValidate: true,
      });
    }
  }, [filteredKlasses, setValue, watchedKlassId]);

  function checkStudentEnrollmentInCurrentYear(student: any): boolean {
    return (
      student.enrollments?.some(
        (enrollment: any) =>
          Number(enrollment.schoolId) === Number(schoolId) &&
          Number(enrollment.academicYearId) === Number(academicYearId),
      ) ?? false
    );
  }

  async function handleSearchByNationalCode() {
    const nationalCode = String(watch("nationalCode") ?? "").trim();

    if (!/^\d{10}$/.test(nationalCode)) {
      setError("nationalCode", {
        type: "manual",
        message: "کد ملی باید دقیقاً ۱۰ رقم باشد",
      });
      setShowForm(false);
      return;
    }

    setLoadingSearch(true);

    try {
      const res = await findStudentByNationalCode({ nationalCode });

      if (res.status === "error") {
        toast.error(res.error);
        setShowForm(false);
        return;
      }

      if (!res.data) {
        setStudentFound(false);
        setStudentId(null);

        setValue("studentId", "");
        setValue("firstName", "");
        setValue("lastName", "");
        setValue("fatherName", "");
        setValue("phone", "");
        setValue("address", "");
        setValue("payeId", 0);
        setValue("reshtehTahsiliId", 0);
        setValue("klassId", "");

        toast.info("دانش‌آموزی با این کد ملی پیدا نشد. می‌توانید ایجادش کنید.");
        setShowForm(true);
        return;
      }

      const student = res.data;

      if (checkStudentEnrollmentInCurrentYear(student)) {
        toast.error(
          "این دانش‌آموز در سال تحصیلی جاری در این مدرسه ثبت‌نام شده است.",
        );

        setTimeout(() => {
          setOpen(false);
        }, 500);

        return;
      }

      setStudentFound(true);
      setStudentId(student.id);

      setValue("studentId", student.id);
      setValue("firstName", student.firstName);
      setValue("lastName", student.lastName);
      setValue("fatherName", student.fatherName ?? "");
      setValue("nationalCode", student.nationalCode);
      setValue("phone", student.phone ?? "");
      setValue("address", student.address ?? "");
      setValue("payeId", 0);
      setValue("reshtehTahsiliId", 0);
      setValue("klassId", "");

      toast.success("دانش‌آموز پیدا شد.");
      setShowForm(true);
    } catch (error) {
      console.error("findStudentByNationalCode error:", error);
      toast.error("خطای غیرمنتظره در جست‌وجوی دانش‌آموز.");
      setShowForm(false);
    } finally {
      setLoadingSearch(false);
    }
  }

  async function onSubmit(data: StudentCreateEnrollInput) {
    try {
      const nationalCode = String(data.nationalCode ?? "").trim();

      if (!/^\d{10}$/.test(nationalCode)) {
        setError("nationalCode", {
          type: "manual",
          message: "کد ملی باید دقیقاً ۱۰ رقم باشد",
        });
        return;
      }

      if (!data.klassId || data.klassId.trim() === "") {
        setError("klassId", {
          type: "manual",
          message: "لطفاً یک کلاس را انتخاب کنید",
        });
        return;
      }

      /*
       * حالت ویرایش:
       * 1) اطلاعات مرکزی Student ویرایش می‌شود.
       * 2) پایه، رشته و کلاس StudentEnrollment ویرایش می‌شوند.
       */
      if (isEditMode) {
        if (!initialStudent || !initialEnrollment) {
          toast.error("اطلاعات لازم برای ویرایش دانش‌آموز موجود نیست.");
          return;
        }

        const updateStudentRes = await updateStudent({
          studentId: initialStudent.id,
          firstName: data.firstName,
          lastName: data.lastName,
          fatherName: data.fatherName,
          nationalCode,
          phone: data.phone || undefined,
          address: data.address || undefined,
        });

        if (updateStudentRes.status !== "success") {
          handleFormServerErrors(updateStudentRes, setError);
          return;
        }

        const updateEnrollmentRes = await updateStudentEnrollment({
          enrollmentId: initialEnrollment.id,
          payeId: Number(data.payeId),
          reshtehTahsiliId: Number(data.reshtehTahsiliId),
          klassId: data.klassId,
        });

        if (updateEnrollmentRes.status !== "success") {
          handleFormServerErrors(updateEnrollmentRes, setError);
          return;
        }

        toast.success("اطلاعات دانش‌آموز و ثبت‌نام او با موفقیت ویرایش شد.");

        router.refresh();
        setOpen(false);
        return;
      }

      /*
       * حالت ایجاد:
       * ابتدا بررسی می‌کنیم دانش‌آموز با کد ملی واردشده وجود دارد یا خیر.
       */
      const checkRes = await findStudentByNationalCode({ nationalCode });

      if (checkRes.status === "error") {
        toast.error(checkRes.error);
        return;
      }

      let savedStudentId = data.studentId || studentId || null;
      let existingStudent = false;

      if (checkRes.data) {
        existingStudent = true;

        const updateRes = await updateStudent({
          studentId: checkRes.data.id,
          firstName: data.firstName,
          lastName: data.lastName,
          fatherName: data.fatherName,
          nationalCode,
          phone: data.phone || undefined,
          address: data.address || undefined,
        });

        if (updateRes.status !== "success") {
          handleFormServerErrors(updateRes, setError);
          return;
        }

        savedStudentId = updateRes.data.id;
      } else {
        const createRes = await createStudent({
          firstName: data.firstName,
          lastName: data.lastName,
          fatherName: data.fatherName,
          nationalCode,
          phone: data.phone || undefined,
          address: data.address || undefined,
        });

        if (createRes.status !== "success") {
          handleFormServerErrors(createRes, setError);
          return;
        }

        savedStudentId = createRes.data.id;
      }

      if (!savedStudentId) {
        toast.error("شناسه دانش‌آموز پیدا نشد.");
        return;
      }

      const enrollRes = await createStudentEnrollment({
        studentId: savedStudentId,
        schoolId,
        academicYearId,
        payeId: Number(data.payeId),
        reshtehTahsiliId: Number(data.reshtehTahsiliId),
        klassId: data.klassId,
      });

      if (enrollRes.status !== "success") {
        handleFormServerErrors(enrollRes, setError);
        return;
      }

      toast.success(
        existingStudent
          ? "اطلاعات دانش‌آموز به‌روزرسانی و ثبت‌نام شد."
          : "دانش‌آموز ایجاد و ثبت‌نام شد.",
      );

      router.refresh();
      handleResetAndHide();
    } catch (error) {
      console.error("student create/enroll error:", error);
      toast.error("خطای غیرمنتظره در ثبت یا ویرایش دانش‌آموز.");
    }
  }

  const payeOptions = payes.map((item) => ({
    id: Number(item.value),
    title: item.label,
  }));

  const reshtehOptions = reshtehTahsilis.map((item) => ({
    id: Number(item.value),
    title: item.label,
  }));

  const klassOptions = filteredKlasses.map((klass) => ({
    id: String(klass.value),
    title: klass.label,
  }));

  const hasSelectedPaye = Number(watchedPayeId) > 0;
  const hasSelectedReshteh = Number(watchedReshtehTahsiliId) > 0;
  const hasKlasses = filteredKlasses.length > 0;

  const isKlassDisabled =
    !hasSelectedPaye || !hasSelectedReshteh || !hasKlasses;

  const klassValue = isKlassDisabled ? undefined : watchedKlassId || "";

  function handleResetAndHide() {
    reset(emptyFormValues);
    setStudentFound(false);
    setStudentId(null);
    setShowForm(false);
    setOpen(false);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormContainer className="pb-40">
        {/* این بخش فقط در افزودن دانش‌آموز نمایش داده می‌شود. */}
        {!isEditMode && (
          <div className="col-span-full flex flex-col gap-1 rounded-md border bg-gray-50 p-3">
            <div className="flex flex-col gap-2 md:flex-row md:items-end">
              <div className="h-full flex-1">
                <CoolInput
                  title="کد ملی:"
                  type="text"
                  placeholder="۱۰ رقم کد ملی"
                  inputMode="numeric"
                  {...register("nationalCode")}
                  error={errors.nationalCode?.message as string}
                />
              </div>

              <button
                type="button"
                onClick={handleSearchByNationalCode}
                disabled={loadingSearch}
                className="h-10 whitespace-nowrap rounded-md bg-blue-600 px-4 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loadingSearch ? "در حال جست‌وجو..." : "جست‌وجو"}
              </button>
            </div>

            {!showForm && !loadingSearch && (
              <p className="mt-1 text-sm text-gray-500">
                برای شروع، کد ملی را وارد کرده و دکمه جست‌وجو را بزنید.
              </p>
            )}

            {studentFound && showForm && (
              <p className="text-sm text-green-600">
                دانش‌آموز پیدا شد. اطلاعات او را در صورت نیاز ویرایش کنید.
              </p>
            )}

            {!studentFound && showForm && (
              <p className="text-sm text-amber-700">
                اگر دانش‌آموز وجود ندارد، اطلاعات او را وارد کنید و ثبت‌نام را
                انجام دهید.
              </p>
            )}
          </div>
        )}

        {/* در Edit فرم مستقیم نمایش داده می‌شود. */}
        {showForm && (
          <>
            <input type="hidden" {...register("studentId")} />

            {/* کد ملی در حالت Edit نمایش داده و قابل ویرایش است. */}
            {isEditMode && (
              <CoolInput
                title="کد ملی:"
                type="text"
                inputMode="numeric"
                readOnly
                {...register("nationalCode")}
                error={errors.nationalCode?.message as string}
                className="cursor-not-allowed bg-gray-100 text-gray-600"
              />
            )}

            <CoolInput
              title="نام:"
              type="text"
              placeholder="نام دانش‌آموز"
              {...register("firstName")}
              error={errors.firstName?.message as string}
            />

            <CoolInput
              title="نام خانوادگی:"
              type="text"
              placeholder="نام خانوادگی دانش‌آموز"
              {...register("lastName")}
              error={errors.lastName?.message as string}
            />

            <CoolInput
              title="نام پدر:"
              type="text"
              placeholder="نام پدر"
              {...register("fatherName")}
              error={errors.fatherName?.message as string}
            />

            <CoolInput
              title="شماره تماس:"
              type="text"
              placeholder="مثلاً 09123456789"
              inputMode="numeric"
              {...register("phone")}
              error={errors.phone?.message as string}
            />

            {/* <CoolInput
              title="آدرس:"
              type="text"
              placeholder="آدرس محل سکونت"
              {...register("address")}
              error={errors.address?.message as string}
            /> */}

            <SearchableSelect
              title="پایه"
              options={payeOptions}
              value={watchedPayeId}
              onChange={(value) => {
                setValue("payeId", Number(value), {
                  shouldValidate: true,
                  shouldDirty: true,
                });

                setValue("klassId", "", {
                  shouldValidate: true,
                });
              }}
              error={errors.payeId?.message as string}
              placeholder="انتخاب پایه..."
            />

            <SearchableSelect
              title="رشته تحصیلی"
              options={reshtehOptions}
              value={watchedReshtehTahsiliId}
              onChange={(value) => {
                setValue("reshtehTahsiliId", Number(value), {
                  shouldValidate: true,
                  shouldDirty: true,
                });

                setValue("klassId", "", {
                  shouldValidate: true,
                });
              }}
              error={errors.reshtehTahsiliId?.message as string}
              placeholder="انتخاب رشته تحصیلی..."
            />

            <SearchableSelect
              title="کلاس"
              options={klassOptions}
              value={klassValue}
              clearValue=""
              onChange={(value) => {
                setValue("klassId", String(value), {
                  shouldValidate: true,
                  shouldDirty: true,
                });
              }}
              error={errors.klassId?.message as string}
              disabled={isKlassDisabled}
              placeholder={
                !hasSelectedPaye
                  ? "ابتدا پایه را انتخاب کنید"
                  : !hasSelectedReshteh
                    ? "ابتدا رشته تحصیلی را انتخاب کنید"
                    : !hasKlasses
                      ? "کلاسی موجود نیست"
                      : "انتخاب کلاس..."
              }
            />

            {hasSelectedPaye && hasSelectedReshteh && !hasKlasses && (
              <p className="mt-1 text-sm text-red-600">
                برای پایه و رشته انتخاب‌شده، کلاسی در این مدرسه و سال تحصیلی
                وجود ندارد.
              </p>
            )}
          </>
        )}
      </FormContainer>

      {showForm && (
        <FromActionBtns
          txtSubmit={
            isEditMode
              ? "ذخیره تغییرات"
              : studentFound
                ? "ذخیره و ثبت‌نام"
                : "ایجاد و ثبت‌نام"
          }
          isSubmitting={isSubmitting}
          setOpen={handleResetAndHide}
        />
      )}
    </form>
  );
}
