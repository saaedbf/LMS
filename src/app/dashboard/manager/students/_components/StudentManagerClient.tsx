"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import {
  createStudent,
  findStudentByNationalCode,
  updateStudent,
} from "@/actions/studentActions";
import {
  createStudentEnrollment,
  updateStudentEnrollment,
} from "@/actions/studentEnrollmentActions";

type OptionItem = {
  id: string | number;
  title: string;
};

type KlassOptionItem = {
  id: string;
  title: string;
  schoolId: number | null;
  academicYearId: number | null;
  payeId: number | null;
  reshtehTahsiliId: number | null;
};

type EnrollmentItem = {
  id: string;
  studentId: string;
  schoolId: number;
  academicYearId: number;
  payeId: number;
  reshtehTahsiliId: number;
  klassId: string;
  school?: {
    id: number;
    title?: string;
    name?: string;
  };
  academicYear?: {
    id: number;
    title?: string;
    name?: string;
    year?: string;
  };
  paye?: {
    id: number;
    title?: string;
    name?: string;
  };
  reshtehTahsili?: {
    id: number;
    title?: string;
    name?: string;
  };
  klass?: {
    id: string;
    title?: string;
    name?: string;
    className?: string;
    klassName?: string;
  };
};

type StudentItem = {
  id: string;
  firstName: string;
  lastName: string;
  nationalCode: string;
  phone?: string | null;
  address?: string | null;
  fatherName?: string | null;
  lastEditedByUsername?: string | null;
  enrollments?: EnrollmentItem[];
};

type StudentFormState = {
  firstName: string;
  lastName: string;
  nationalCode: string;
  phone: string;
  address: string;
  fatherName: string;
};

type CreateEnrollmentFormState = {
  schoolId: string;
  academicYearId: string;
  payeId: string;
  reshtehTahsiliId: string;
  klassId: string;
};

type EditEnrollmentFormState = {
  enrollmentId: string;
  payeId: string;
  reshtehTahsiliId: string;
  klassId: string;
};

type Props = {
  schools: OptionItem[];
  academicYears: OptionItem[];
  payes: OptionItem[];
  reshtehTahsiliList: OptionItem[];
  klasses: KlassOptionItem[];
};

const emptyStudentForm: StudentFormState = {
  firstName: "",
  lastName: "",
  nationalCode: "",
  phone: "",
  address: "",
  fatherName: "",
};

const emptyCreateEnrollmentForm: CreateEnrollmentFormState = {
  schoolId: "",
  academicYearId: "",
  payeId: "",
  reshtehTahsiliId: "",
  klassId: "",
};

const emptyEditEnrollmentForm: EditEnrollmentFormState = {
  enrollmentId: "",
  payeId: "",
  reshtehTahsiliId: "",
  klassId: "",
};

function getEntityTitle(entity: any, fallback: string) {
  return (
    entity?.title ??
    entity?.name ??
    entity?.label ??
    entity?.year ??
    entity?.className ??
    entity?.klassName ??
    fallback
  );
}

function toStudentForm(student: StudentItem): StudentFormState {
  return {
    firstName: student.firstName ?? "",
    lastName: student.lastName ?? "",
    nationalCode: student.nationalCode ?? "",
    phone: student.phone ?? "",
    address: student.address ?? "",
    fatherName: student.fatherName ?? "",
  };
}

export default function StudentManagerClient({
  schools,
  academicYears,
  payes,
  reshtehTahsiliList,
  klasses,
}: Props) {
  const [isPending, startTransition] = useTransition();

  const [searchNationalCode, setSearchNationalCode] = useState("");
  const [student, setStudent] = useState<StudentItem | null>(null);
  const [studentForm, setStudentForm] =
    useState<StudentFormState>(emptyStudentForm);

  const [createEnrollmentForm, setCreateEnrollmentForm] =
    useState<CreateEnrollmentFormState>(emptyCreateEnrollmentForm);

  const [editEnrollmentForm, setEditEnrollmentForm] =
    useState<EditEnrollmentFormState>(emptyEditEnrollmentForm);

  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const isExistingStudent = Boolean(student?.id);

  const filteredCreateKlasses = useMemo(() => {
    const schoolId = Number(createEnrollmentForm.schoolId);
    const academicYearId = Number(createEnrollmentForm.academicYearId);
    const payeId = Number(createEnrollmentForm.payeId);
    const reshtehTahsiliId = Number(createEnrollmentForm.reshtehTahsiliId);

    if (!schoolId || !academicYearId || !payeId || !reshtehTahsiliId) {
      return [];
    }

    return klasses.filter(
      (klass) =>
        klass.schoolId === schoolId &&
        klass.academicYearId === academicYearId &&
        klass.payeId === payeId &&
        klass.reshtehTahsiliId === reshtehTahsiliId,
    );
  }, [createEnrollmentForm, klasses]);

  const selectedEnrollment = useMemo(() => {
    if (!student?.enrollments?.length || !editEnrollmentForm.enrollmentId) {
      return null;
    }

    return (
      student.enrollments.find(
        (item) => item.id === editEnrollmentForm.enrollmentId,
      ) ?? null
    );
  }, [student, editEnrollmentForm.enrollmentId]);

  const filteredEditKlasses = useMemo(() => {
    if (!selectedEnrollment) {
      return [];
    }

    const payeId = Number(editEnrollmentForm.payeId);
    const reshtehTahsiliId = Number(editEnrollmentForm.reshtehTahsiliId);

    if (!payeId || !reshtehTahsiliId) {
      return [];
    }

    return klasses.filter(
      (klass) =>
        klass.schoolId === selectedEnrollment.schoolId &&
        klass.academicYearId === selectedEnrollment.academicYearId &&
        klass.payeId === payeId &&
        klass.reshtehTahsiliId === reshtehTahsiliId,
    );
  }, [selectedEnrollment, editEnrollmentForm, klasses]);

  function handleStudentFormChange(
    field: keyof StudentFormState,
    value: string,
  ) {
    setStudentForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleCreateEnrollmentChange(
    field: keyof CreateEnrollmentFormState,
    value: string,
  ) {
    setCreateEnrollmentForm((prev) => {
      const next = {
        ...prev,
        [field]: value,
      };

      if (
        field === "schoolId" ||
        field === "academicYearId" ||
        field === "payeId" ||
        field === "reshtehTahsiliId"
      ) {
        next.klassId = "";
      }

      return next;
    });
  }

  function handleEditEnrollmentChange(
    field: keyof EditEnrollmentFormState,
    value: string,
  ) {
    setEditEnrollmentForm((prev) => {
      const next = {
        ...prev,
        [field]: value,
      };

      if (field === "payeId" || field === "reshtehTahsiliId") {
        next.klassId = "";
      }

      return next;
    });
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const result = await findStudentByNationalCode(searchNationalCode);

      if (result.status === "error") {
        setStudent(null);
        setStudentForm({
          ...emptyStudentForm,
          nationalCode: searchNationalCode,
        });
        setMessage({
          type: "error",
          text: result.error.toString(),
        });
        return;
      }

      if (!result.data) {
        setStudent(null);
        setStudentForm({
          ...emptyStudentForm,
          nationalCode: searchNationalCode,
        });
        setCreateEnrollmentForm(emptyCreateEnrollmentForm);
        setEditEnrollmentForm(emptyEditEnrollmentForm);
        setMessage({
          type: "info",
          text: "دانش‌آموزی با این کد ملی پیدا نشد. می‌توانید اطلاعات او را ثبت کنید.",
        });
        return;
      }

      const foundStudent = result.data as StudentItem;

      setStudent(foundStudent);
      setStudentForm(toStudentForm(foundStudent));
      setCreateEnrollmentForm(emptyCreateEnrollmentForm);
      setEditEnrollmentForm(emptyEditEnrollmentForm);
      setMessage({
        type: "success",
        text: "دانش‌آموز پیدا شد.",
      });
    });
  }

  function handleSaveStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const result =
        isExistingStudent && student
          ? await updateStudent({
              studentId: student.id,
              firstName: studentForm.firstName,
              lastName: studentForm.lastName,
              nationalCode: studentForm.nationalCode,
              phone: studentForm.phone,
              address: studentForm.address,
              fatherName: studentForm.fatherName,
            })
          : await createStudent({
              firstName: studentForm.firstName,
              lastName: studentForm.lastName,
              nationalCode: studentForm.nationalCode,
              phone: studentForm.phone,
              address: studentForm.address,
              fatherName: studentForm.fatherName,
            });

      if (result.status === "error") {
        setMessage({
          type: "error",
          text: result.error.toString(),
        });
        return;
      }

      const savedStudent = result.data as StudentItem;

      setStudent((prev) => ({
        ...savedStudent,
        enrollments: prev?.enrollments ?? savedStudent.enrollments ?? [],
      }));

      setStudentForm(toStudentForm(savedStudent));
      setSearchNationalCode(savedStudent.nationalCode);

      setMessage({
        type: "success",
        text: isExistingStudent
          ? "اطلاعات دانش‌آموز با موفقیت ویرایش شد."
          : "دانش‌آموز با موفقیت ایجاد شد. اکنون می‌توانید او را ثبت‌نام کنید.",
      });
    });
  }

  function handleCreateEnrollment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!student) {
      setMessage({
        type: "error",
        text: "ابتدا دانش‌آموز را ایجاد یا جست‌وجو کنید.",
      });
      return;
    }

    setMessage(null);

    startTransition(async () => {
      const result = await createStudentEnrollment({
        studentId: student.id,
        schoolId: Number(createEnrollmentForm.schoolId),
        academicYearId: Number(createEnrollmentForm.academicYearId),
        payeId: Number(createEnrollmentForm.payeId),
        reshtehTahsiliId: Number(createEnrollmentForm.reshtehTahsiliId),
        klassId: createEnrollmentForm.klassId,
      });

      if (result.status === "error") {
        setMessage({
          type: "error",
          text: result.error.toString(),
        });
        return;
      }

      const newEnrollment = result.data as EnrollmentItem;

      setStudent((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          enrollments: [newEnrollment, ...(prev.enrollments ?? [])],
        };
      });

      setCreateEnrollmentForm(emptyCreateEnrollmentForm);
      setMessage({
        type: "success",
        text: "ثبت‌نام دانش‌آموز با موفقیت انجام شد.",
      });
    });
  }

  function handleSelectEnrollmentForEdit(enrollmentId: string) {
    const enrollment =
      student?.enrollments?.find((item) => item.id === enrollmentId) ?? null;

    if (!enrollment) {
      setEditEnrollmentForm(emptyEditEnrollmentForm);
      return;
    }

    setEditEnrollmentForm({
      enrollmentId: enrollment.id,
      payeId: String(enrollment.payeId),
      reshtehTahsiliId: String(enrollment.reshtehTahsiliId),
      klassId: String(enrollment.klassId),
    });
  }

  function handleUpdateEnrollment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!student) {
      setMessage({
        type: "error",
        text: "ابتدا دانش‌آموز را انتخاب کنید.",
      });
      return;
    }

    if (!editEnrollmentForm.enrollmentId) {
      setMessage({
        type: "error",
        text: "ابتدا یک ثبت‌نام را برای ویرایش انتخاب کنید.",
      });
      return;
    }

    setMessage(null);

    startTransition(async () => {
      const result = await updateStudentEnrollment({
        enrollmentId: editEnrollmentForm.enrollmentId,
        payeId: Number(editEnrollmentForm.payeId),
        reshtehTahsiliId: Number(editEnrollmentForm.reshtehTahsiliId),
        klassId: editEnrollmentForm.klassId,
      });

      if (result.status === "error") {
        setMessage({
          type: "error",
          text: result.error.toString(),
        });
        return;
      }

      const updatedEnrollment = result.data as EnrollmentItem;

      setStudent((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          enrollments: (prev.enrollments ?? []).map((item) =>
            item.id === updatedEnrollment.id ? updatedEnrollment : item,
          ),
        };
      });

      setMessage({
        type: "success",
        text: "ثبت‌نام آموزشی با موفقیت ویرایش شد.",
      });
    });
  }

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={[
            "rounded-xl border p-4 text-sm",
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "",
            message.type === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "",
            message.type === "info"
              ? "border-blue-200 bg-blue-50 text-blue-700"
              : "",
          ].join(" ")}
        >
          {message.text}
        </div>
      )}

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">جست‌وجوی دانش‌آموز</h2>

        <form
          onSubmit={handleSearch}
          className="flex flex-col gap-3 md:flex-row"
        >
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium">کد ملی</label>
            <input
              value={searchNationalCode}
              onChange={(event) => setSearchNationalCode(event.target.value)}
              placeholder="مثلاً 0012345678"
              className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "در حال جست‌وجو..." : "جست‌وجو"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-1">
          <h2 className="text-lg font-semibold">
            {isExistingStudent
              ? "ویرایش اطلاعات هویتی دانش‌آموز"
              : "ثبت دانش‌آموز جدید"}
          </h2>
          <p className="text-sm text-muted-foreground">
            اطلاعات این بخش در پایگاه داده مرکزی دانش‌آموزان ذخیره می‌شود.
          </p>
        </div>

        <form
          onSubmit={handleSaveStudent}
          className="grid gap-4 md:grid-cols-2"
        >
          <div>
            <label className="mb-1 block text-sm font-medium">نام</label>
            <input
              value={studentForm.firstName}
              onChange={(event) =>
                handleStudentFormChange("firstName", event.target.value)
              }
              className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              نام خانوادگی
            </label>
            <input
              value={studentForm.lastName}
              onChange={(event) =>
                handleStudentFormChange("lastName", event.target.value)
              }
              className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">کد ملی</label>
            <input
              value={studentForm.nationalCode}
              onChange={(event) =>
                handleStudentFormChange("nationalCode", event.target.value)
              }
              placeholder="۱۰ رقم"
              className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">شماره تماس</label>
            <input
              value={studentForm.phone}
              onChange={(event) =>
                handleStudentFormChange("phone", event.target.value)
              }
              placeholder="مثلاً 09123456789"
              className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">نام پدر</label>
            <input
              value={studentForm.fatherName}
              onChange={(event) =>
                handleStudentFormChange("fatherName", event.target.value)
              }
              className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">آدرس</label>
            <input
              value={studentForm.address}
              onChange={(event) =>
                handleStudentFormChange("address", event.target.value)
              }
              className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          {student?.lastEditedByUsername && (
            <div className="md:col-span-2">
              <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                آخرین ویرایش توسط:{" "}
                <span className="font-medium">
                  {student.lastEditedByUsername}
                </span>
              </div>
            </div>
          )}

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-green-600 px-5 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending
                ? "در حال ذخیره..."
                : isExistingStudent
                  ? "ویرایش اطلاعات دانش‌آموز"
                  : "ایجاد دانش‌آموز"}
            </button>
          </div>
        </form>
      </section>

      {student && (
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-1">
            <h2 className="text-lg font-semibold">ثبت‌نام آموزشی جدید</h2>
            <p className="text-sm text-muted-foreground">
              این اطلاعات مربوط به ثبت‌نام سالانه دانش‌آموز است و از اطلاعات
              هویتی جدا ذخیره می‌شود.
            </p>
          </div>

          <form
            onSubmit={handleCreateEnrollment}
            className="grid gap-4 md:grid-cols-2"
          >
            <div>
              <label className="mb-1 block text-sm font-medium">مدرسه</label>
              <select
                value={createEnrollmentForm.schoolId}
                onChange={(event) =>
                  handleCreateEnrollmentChange("schoolId", event.target.value)
                }
                className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                <option value="">انتخاب مدرسه</option>
                {schools.map((item) => (
                  <option key={String(item.id)} value={String(item.id)}>
                    {item.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                سال تحصیلی
              </label>
              <select
                value={createEnrollmentForm.academicYearId}
                onChange={(event) =>
                  handleCreateEnrollmentChange(
                    "academicYearId",
                    event.target.value,
                  )
                }
                className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                <option value="">انتخاب سال تحصیلی</option>
                {academicYears.map((item) => (
                  <option key={String(item.id)} value={String(item.id)}>
                    {item.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">پایه</label>
              <select
                value={createEnrollmentForm.payeId}
                onChange={(event) =>
                  handleCreateEnrollmentChange("payeId", event.target.value)
                }
                className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                <option value="">انتخاب پایه</option>
                {payes.map((item) => (
                  <option key={String(item.id)} value={String(item.id)}>
                    {item.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                رشته تحصیلی
              </label>
              <select
                value={createEnrollmentForm.reshtehTahsiliId}
                onChange={(event) =>
                  handleCreateEnrollmentChange(
                    "reshtehTahsiliId",
                    event.target.value,
                  )
                }
                className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                <option value="">انتخاب رشته</option>
                {reshtehTahsiliList.map((item) => (
                  <option key={String(item.id)} value={String(item.id)}>
                    {item.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">کلاس</label>
              <select
                value={createEnrollmentForm.klassId}
                onChange={(event) =>
                  handleCreateEnrollmentChange("klassId", event.target.value)
                }
                className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                <option value="">انتخاب کلاس</option>
                {filteredCreateKlasses.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>

              {createEnrollmentForm.schoolId &&
                createEnrollmentForm.academicYearId &&
                createEnrollmentForm.payeId &&
                createEnrollmentForm.reshtehTahsiliId &&
                filteredCreateKlasses.length === 0 && (
                  <p className="mt-1 text-xs text-red-600">
                    برای این ترکیب مدرسه، سال تحصیلی، پایه و رشته، کلاسی پیدا
                    نشد.
                  </p>
                )}
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={isPending}
                className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? "در حال ثبت‌نام..." : "ثبت‌نام دانش‌آموز"}
              </button>
            </div>
          </form>
        </section>
      )}

      {student && (
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-1">
            <h2 className="text-lg font-semibold">سوابق ثبت‌نام دانش‌آموز</h2>
            <p className="text-sm text-muted-foreground">
              هر دانش‌آموز می‌تواند در سال‌های مختلف و حتی مدارس مختلف ثبت‌نام
              داشته باشد.
            </p>
          </div>

          {!student.enrollments?.length ? (
            <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
              هنوز ثبت‌نامی برای این دانش‌آموز ثبت نشده است.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] border-collapse text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 text-right">
                    <th className="p-3">مدرسه</th>
                    <th className="p-3">سال تحصیلی</th>
                    <th className="p-3">پایه</th>
                    <th className="p-3">رشته</th>
                    <th className="p-3">کلاس</th>
                    <th className="p-3">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {student.enrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="border-b">
                      <td className="p-3">
                        {getEntityTitle(
                          enrollment.school,
                          `مدرسه ${enrollment.schoolId}`,
                        )}
                      </td>
                      <td className="p-3">
                        {getEntityTitle(
                          enrollment.academicYear,
                          `سال ${enrollment.academicYearId}`,
                        )}
                      </td>
                      <td className="p-3">
                        {getEntityTitle(
                          enrollment.paye,
                          `پایه ${enrollment.payeId}`,
                        )}
                      </td>
                      <td className="p-3">
                        {getEntityTitle(
                          enrollment.reshtehTahsili,
                          `رشته ${enrollment.reshtehTahsiliId}`,
                        )}
                      </td>
                      <td className="p-3">
                        {getEntityTitle(
                          enrollment.klass,
                          `کلاس ${enrollment.klassId}`,
                        )}
                      </td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() =>
                            handleSelectEnrollmentForEdit(enrollment.id)
                          }
                          className="rounded-lg border px-3 py-1 text-xs hover:bg-slate-50"
                        >
                          ویرایش آموزشی
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {student && student.enrollments && student.enrollments.length > 0 && (
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-1">
            <h2 className="text-lg font-semibold">ویرایش ثبت‌نام آموزشی</h2>
            <p className="text-sm text-muted-foreground">
              در این بخش فقط پایه، رشته و کلاس ثبت‌نام آموزشی ویرایش می‌شود.
              مدرسه و سال تحصیلی همان ثبت‌نام قبلی باقی می‌ماند.
            </p>
          </div>

          <form
            onSubmit={handleUpdateEnrollment}
            className="grid gap-4 md:grid-cols-2"
          >
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">
                ثبت‌نام موردنظر
              </label>
              <select
                value={editEnrollmentForm.enrollmentId}
                onChange={(event) =>
                  handleSelectEnrollmentForEdit(event.target.value)
                }
                className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                <option value="">انتخاب ثبت‌نام</option>
                {student.enrollments.map((enrollment) => (
                  <option key={enrollment.id} value={enrollment.id}>
                    {getEntityTitle(
                      enrollment.school,
                      `مدرسه ${enrollment.schoolId}`,
                    )}{" "}
                    -{" "}
                    {getEntityTitle(
                      enrollment.academicYear,
                      `سال ${enrollment.academicYearId}`,
                    )}
                  </option>
                ))}
              </select>
            </div>

            {selectedEnrollment && (
              <div className="md:col-span-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                مدرسه و سال تحصیلی این ثبت‌نام تغییر نمی‌کند:{" "}
                <span className="font-medium">
                  {getEntityTitle(
                    selectedEnrollment.school,
                    `مدرسه ${selectedEnrollment.schoolId}`,
                  )}
                </span>{" "}
                -{" "}
                <span className="font-medium">
                  {getEntityTitle(
                    selectedEnrollment.academicYear,
                    `سال ${selectedEnrollment.academicYearId}`,
                  )}
                </span>
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium">پایه</label>
              <select
                value={editEnrollmentForm.payeId}
                onChange={(event) =>
                  handleEditEnrollmentChange("payeId", event.target.value)
                }
                className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                <option value="">انتخاب پایه</option>
                {payes.map((item) => (
                  <option key={String(item.id)} value={String(item.id)}>
                    {item.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                رشته تحصیلی
              </label>
              <select
                value={editEnrollmentForm.reshtehTahsiliId}
                onChange={(event) =>
                  handleEditEnrollmentChange(
                    "reshtehTahsiliId",
                    event.target.value,
                  )
                }
                className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                <option value="">انتخاب رشته</option>
                {reshtehTahsiliList.map((item) => (
                  <option key={String(item.id)} value={String(item.id)}>
                    {item.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">کلاس</label>
              <select
                value={editEnrollmentForm.klassId}
                onChange={(event) =>
                  handleEditEnrollmentChange("klassId", event.target.value)
                }
                className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                <option value="">انتخاب کلاس</option>
                {filteredEditKlasses.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>

              {editEnrollmentForm.enrollmentId &&
                editEnrollmentForm.payeId &&
                editEnrollmentForm.reshtehTahsiliId &&
                filteredEditKlasses.length === 0 && (
                  <p className="mt-1 text-xs text-red-600">
                    برای پایه و رشته انتخاب‌شده، کلاسی در مدرسه و سال تحصیلی این
                    ثبت‌نام پیدا نشد.
                  </p>
                )}
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={isPending}
                className="rounded-xl bg-amber-600 px-5 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? "در حال ویرایش..." : "ویرایش ثبت‌نام آموزشی"}
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
