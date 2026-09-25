export const DEBT_TYPE_LABELS: Record<string, string> = {
  TUITION: "شهریه",
  SCHOOL_HELP: "کمک به مدرسه",
  KLASS_TAGHVIATY: "کلاس تقویتی", // ⬅️ اضافه شد
  KLASS_ADVANVE: "کلاس پیشرفته", // ⬅️ اضافه شد
  BOOK: "کتاب",
  INSURANCE: "بیمه",
  BOOK_INSURANCE: "کتاب و بیمه",
  TRIP: "اردو و بازدید",
  SCHOOL_SERVICE: "سرویس مدرسه",
  OTHER: "سایر",
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  POS: "کارتخوان",
  CARD_TO_CARD: "کارت به کارت",
  TRANSFER: "انتقال به حساب",
  CASH: "نقدی",
  CHECK: "چک",
  OTHER: "سایر",
};

export const DEBT_TYPE_OPTIONS = Object.entries(DEBT_TYPE_LABELS).map(
  ([value, label]) => ({ value, label }),
);

export const PAYMENT_METHOD_OPTIONS = Object.entries(PAYMENT_METHOD_LABELS).map(
  ([value, label]) => ({ value, label }),
);
