export const PERMISSIONS = {
  // مدیریت دانش‌آموزان
  MANAGE_STUDENTS: "manage_students",
  VIEW_STUDENTS: "view_students",

  // مدیریت معلمان
  MANAGE_TEACHERS: "manage_teachers",
  VIEW_TEACHERS: "view_teachers",

  // مدیریت کلاس‌ها
  MANAGE_CLASSES: "manage_classes",
  VIEW_CLASSES: "view_classes",

  // تخصیص معلم به کلاس
  MANAGE_CLASS_COURSES: "manage_class_courses",

  // دوره‌های ثبت نمره
  MANAGE_GRADE_PERIODS: "manage_grade_periods",
  VIEW_GRADES: "view_grades",

  // غیبت
  MANAGE_ABSENCES: "manage_absences",
  VIEW_ABSENCES: "view_absences",
  //معلمان غیبت
  MANAGE_ABSENCES_TEACHER: "manage_absences_teacher",
  VIEW_ABSENCE_TEACHER: "view_absences_teacher",
  // انضباطی
  MANAGE_DISCIPLINARY: "manage_disciplinary",
  VIEW_DISCIPLINARY: "view_disciplinary",

  // تنظیمات
  MANAGE_SETTINGS: "manage_settings",
  // ⬅️ مدیریت مالی
  MANAGE_FINANCIAL: "manage_financial",
  VIEW_FINANCIAL: "view_financial",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// گروه‌بندی برای نمایش در UI
export const PERMISSION_GROUPS = [
  {
    title: "مدیریت دانش‌آموزان",
    permissions: [
      { key: PERMISSIONS.VIEW_STUDENTS, label: "مشاهده دانش‌آموزان" },
      { key: PERMISSIONS.MANAGE_STUDENTS, label: "مدیریت دانش‌آموزان" },
    ],
  },
  {
    title: "مدیریت معلمان",
    permissions: [
      { key: PERMISSIONS.VIEW_TEACHERS, label: "مشاهده معلمان" },
      { key: PERMISSIONS.MANAGE_TEACHERS, label: "مدیریت معلمان" },
    ],
  },
  {
    title: "مدیریت کلاس‌ها",
    permissions: [
      { key: PERMISSIONS.VIEW_CLASSES, label: "مشاهده کلاس‌ها" },
      { key: PERMISSIONS.MANAGE_CLASSES, label: "مدیریت کلاس‌ها" },
      { key: PERMISSIONS.MANAGE_CLASS_COURSES, label: "تخصیص معلم به کلاس" },
    ],
  },
  {
    title: "نمرات",
    permissions: [
      { key: PERMISSIONS.MANAGE_GRADE_PERIODS, label: "تعریف دوره ثبت نمره" },
      { key: PERMISSIONS.VIEW_GRADES, label: "مشاهده نمرات" },
    ],
  },
  {
    title: "غیبت و انضباط",
    permissions: [
      { key: PERMISSIONS.VIEW_ABSENCES, label: " مشاهده غیبت دانش آموزان" },
      { key: PERMISSIONS.MANAGE_ABSENCES, label: "مدیریت غیبت دانش آموزان" },
      {
        key: PERMISSIONS.VIEW_ABSENCE_TEACHER,
        label: " مشاهده غیبت معلمان ",
      },
      {
        key: PERMISSIONS.MANAGE_ABSENCES_TEACHER,
        label: "مدیریت غیبت  معلمان",
      },
      { key: PERMISSIONS.VIEW_DISCIPLINARY, label: "مشاهده موارد انضباطی" },
      { key: PERMISSIONS.MANAGE_DISCIPLINARY, label: "مدیریت موارد انضباطی" },
    ],
  },
  {
    title: "تنظیمات",
    permissions: [
      { key: PERMISSIONS.MANAGE_SETTINGS, label: "مدیریت تنظیمات" },
    ],
  },
  {
    title: "مدیریت مالی",
    permissions: [
      { key: PERMISSIONS.VIEW_FINANCIAL, label: "مشاهده امور مالی" },
      { key: PERMISSIONS.MANAGE_FINANCIAL, label: "مدیریت امور مالی" },
    ],
  },
];
