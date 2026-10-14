"use client";

import { useState, useTransition } from "react";
import {
  Printer,
  Loader2,
  ChevronDown,
  ChevronLeft,
  BookOpen,
  Users,
  FileDown,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  getAttendanceSheets,
  type AttendanceClassNode,
  type AttendanceSheet,
} from "@/actions/attendanceActions";
import TitlePage from "@/components/widgets/TitlePage";
import BackButton from "@/components/widgets/Elements/BackButton";

type Selection = Map<string, Set<string>>;
function sanitizeFileName(name: string): string {
  return name
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function getPersianDate(): { date: string; time: string } {
  const now = new Date();

  // تاریخ شمسی
  const dateStr = now
    .toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\//g, "-");

  // ساعت
  const timeStr = now
    .toLocaleTimeString("fa-IR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    .replace(/:/g, "-");

  return { date: dateStr, time: timeStr };
}
export default function AttendancePrintComp({
  tree,
}: {
  tree: AttendanceClassNode[];
}) {
  const [isPending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selection, setSelection] = useState<Selection>(new Map());
  const [sheets, setSheets] = useState<AttendanceSheet[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [splitLargeClasses, setSplitLargeClasses] = useState(false);

  const totalSelected = Array.from(selection.values()).reduce(
    (sum, s) => sum + s.size,
    0,
  );
  const buildFileName = (): string => {
    const { date, time } = getPersianDate();
    const selections = buildSelections();

    // شمارش کل درس‌های انتخاب‌شده
    const totalLessons = selections.reduce(
      (sum, s) => sum + s.classCourseIds.length,
      0,
    );

    // حالت ۱: فقط یک کلاس-درس انتخاب شده
    if (selections.length === 1 && selections[0].classCourseIds.length === 1) {
      const klassId = selections[0].klassId;
      const courseId = selections[0].classCourseIds[0];

      const klass = tree.find((k) => k.id === klassId);
      const lesson = klass?.lessons.find((l) => l.id === courseId);

      const klassTitle = klass ? klass.title : "کلاس";
      const lessonTitle = lesson ? lesson.darsTitle : "درس";

      const name = `حضور-غیاب-${klassTitle}-${lessonTitle}-${date}`;
      return sanitizeFileName(name) + ".pdf";
    }

    // حالت ۲: چند کلاس-درس انتخاب شده
    const name = `حضور-غیاب-${totalLessons}درس-${date}-${time}`;
    return sanitizeFileName(name) + ".pdf";
  };
  const toggleExpand = (klassId: string) => {
    const next = new Set(expanded);
    if (next.has(klassId)) next.delete(klassId);
    else next.add(klassId);
    setExpanded(next);
  };

  const toggleLesson = (klassId: string, courseId: string) => {
    const next = new Map(selection);
    const set = new Set(next.get(klassId) ?? []);
    if (set.has(courseId)) set.delete(courseId);
    else set.add(courseId);
    if (set.size === 0) next.delete(klassId);
    else next.set(klassId, set);
    setSelection(next);
  };

  const toggleAllLessonsOfKlass = (klass: AttendanceClassNode) => {
    const next = new Map(selection);
    const current = next.get(klass.id) ?? new Set<string>();
    if (current.size === klass.lessons.length) {
      next.delete(klass.id);
    } else {
      next.set(klass.id, new Set(klass.lessons.map((l) => l.id)));
    }
    setSelection(next);
  };

  const selectAll = () => {
    const next = new Map<string, Set<string>>();
    tree.forEach((k) => {
      next.set(k.id, new Set(k.lessons.map((l) => l.id)));
    });
    setSelection(next);
  };

  const clearAll = () => setSelection(new Map());

  const buildSelections = () =>
    Array.from(selection.entries()).map(([klassId, courseIds]) => ({
      klassId,
      classCourseIds: Array.from(courseIds),
    }));

  const handlePrint = () => {
    if (totalSelected === 0) {
      toast.error("حداقل یک درس انتخاب کنید");
      return;
    }

    setLoading(true);
    startTransition(async () => {
      const res = await getAttendanceSheets(buildSelections());
      setLoading(false);

      if (res.status === "error") {
        toast.error(res.error);
        return;
      }

      setSheets(res.data);
      setTimeout(() => window.print(), 400);
    });
  };

  const handlePdf = async () => {
    if (totalSelected === 0) {
      toast.error("حداقل یک درس انتخاب کنید");
      return;
    }

    setDownloading(true);
    try {
      const res = await fetch("/api/attendance-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selections: buildSelections(),
          splitLargeClasses,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "خطا در ساخت PDF");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = buildFileName(); // ⬅️ اینجا
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast.success("PDF آماده شد");
    } catch (error) {
      console.error(error);
      toast.error("خطا در دریافت PDF");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <div className="print:hidden">
        <TitlePage>لیست حضور و غیاب</TitlePage>
        <BackButton
          href="/dashboard/manager"
          label="بازگشت به پنل مدیریت"
          className="mb-3"
        />

        <div className="container mx-auto max-w-4xl space-y-4 px-4 py-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-bold text-zinc-800">
                انتخاب کلاس و درس ({totalSelected} درس انتخاب‌شده)
              </h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={selectAll}
                  className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50"
                >
                  انتخاب همه
                </button>
                <button
                  type="button"
                  onClick={clearAll}
                  className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50"
                >
                  پاک کردن
                </button>
              </div>
            </div>

            <div className="max-h-[500px] space-y-1 overflow-y-auto rounded-lg border border-zinc-200 bg-zinc-50 p-2">
              {tree.map((klass) => {
                const isExpanded = expanded.has(klass.id);
                const selectedSet = selection.get(klass.id) ?? new Set();
                const allSelected =
                  klass.lessons.length > 0 &&
                  selectedSet.size === klass.lessons.length;

                return (
                  <div
                    key={klass.id}
                    className="rounded-md border border-zinc-200 bg-white"
                  >
                    <div className="flex items-center gap-2 p-2">
                      <button
                        type="button"
                        onClick={() => toggleExpand(klass.id)}
                        className="flex h-6 w-6 items-center justify-center rounded hover:bg-zinc-100"
                      >
                        {isExpanded ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronLeft size={16} />
                        )}
                      </button>

                      <label className="flex flex-1 cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={() => toggleAllLessonsOfKlass(klass)}
                          className="h-4 w-4"
                        />
                        <Users size={16} className="text-zinc-500" />
                        <span className="font-medium">
                          {klass.payeTitle} - {klass.reshtehTitle} -{" "}
                          {klass.title}
                        </span>
                        <span className="text-xs text-zinc-500">
                          ({klass.lessons.length} درس)
                        </span>
                      </label>

                      {selectedSet.size > 0 && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                          {selectedSet.size} انتخاب
                        </span>
                      )}
                    </div>

                    {isExpanded && (
                      <div className="border-t border-zinc-100 bg-zinc-50 p-2">
                        {klass.lessons.length === 0 ? (
                          <div className="px-8 py-2 text-xs text-zinc-500">
                            درسی برای این کلاس تعریف نشده است
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                            {klass.lessons.map((lesson) => {
                              const checked = selectedSet.has(lesson.id);
                              return (
                                <label
                                  key={lesson.id}
                                  className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition ${
                                    checked
                                      ? "border-blue-400 bg-blue-50"
                                      : "border-zinc-200 bg-white hover:bg-zinc-100"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() =>
                                      toggleLesson(klass.id, lesson.id)
                                    }
                                    className="h-3.5 w-3.5"
                                  />
                                  <BookOpen
                                    size={14}
                                    className="text-zinc-400"
                                  />
                                  <span className="flex-1">
                                    {lesson.darsTitle}
                                  </span>
                                  <span className="text-xs text-zinc-500">
                                    {lesson.teacherName || "بدون معلم"}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* دکمه‌ها + چک‌باکس */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handlePdf}
              disabled={downloading || totalSelected === 0}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  در حال ساخت PDF...
                </>
              ) : (
                <>
                  <FileDown size={16} />
                  دانلود PDF ({totalSelected} برگه)
                </>
              )}
            </button>

            {/* <button
              type="button"
              onClick={handlePrint}
              disabled={loading || totalSelected === 0}
              className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-white px-5 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  در حال آماده‌سازی...
                </>
              ) : (
                <>
                  <Printer size={16} />
                  چاپ مرورگر
                </>
              )}
            </button> */}

            {/* چک‌باکس تقسیم */}
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50">
              <input
                type="checkbox"
                checked={splitLargeClasses}
                onChange={(e) => setSplitLargeClasses(e.target.checked)}
                className="h-4 w-4"
              />
              چاپ بیش از ۲۵ نفر در دو صفحه
            </label>
          </div>
        </div>
      </div>

      {/* برگه‌های چاپ مرورگر */}
      {sheets.length > 0 && (
        <div className="print:block">
          {sheets.map((sheet, idx) => (
            <Sheet
              key={`${sheet.klassId}-${sheet.darsTitle}-${idx}`}
              sheet={sheet}
            />
          ))}
        </div>
      )}

      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          body {
            background: white !important;
            font-family: "IRANSans", "Tahoma", sans-serif;
            font-size: 12pt;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print-sheet {
            page-break-after: always;
          }
          .print-sheet:last-child {
            page-break-after: auto;
          }
          .no-break {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </>
  );
}

/* ═══════════════════════════════════════════════
   برگه‌ی چاپ مرورگر (بدون تغییر)
   ═══════════════════════════════════════════════ */
function Sheet({ sheet }: { sheet: AttendanceSheet }) {
  const MIN_ROWS = 20;
  const emptyRows = Math.max(0, MIN_ROWS - sheet.students.length);

  return (
    <div
      className="print-sheet mx-auto bg-white"
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "8mm",
        fontFamily: "IRANSans, Tahoma, sans-serif",
        fontSize: "12pt",
        direction: "rtl",
      }}
    >
      <div style={{ border: "2px solid black" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            borderBottom: "1px solid black",
          }}
        >
          <div
            style={{
              padding: "6px",
              textAlign: "center",
              borderLeft: "1px solid black",
              fontSize: "10pt",
              lineHeight: 1.6,
            }}
          >
            <div>جمهوری اسلامی ایران</div>
            <div>وزارت آموزش و پرورش</div>
            <div>سال تحصیلی: {sheet.academicYearTitle}</div>
            <div style={{ fontWeight: "bold" }}>کار برگ دبیر</div>
          </div>

          <div
            style={{
              padding: "6px",
              textAlign: "center",
              borderLeft: "1px solid black",
              fontSize: "10pt",
              lineHeight: 1.7,
            }}
          >
            <div>مدرسه: {sheet.schoolTitle}</div>
            <div>کد مدرسه: {sheet.schoolId}</div>
            <div>پایه: {sheet.payeTitle}</div>
          </div>

          <div
            style={{
              padding: "6px",
              textAlign: "center",
              fontSize: "11pt",
              lineHeight: 1.7,
            }}
          >
            <div>
              <strong>درس:</strong> {sheet.darsTitle}
            </div>
            <div>
              <strong>کلاس:</strong> {sheet.klassTitle}
            </div>
            <div>
              <strong>نام دبیر:</strong>{" "}
              {sheet.teacherName || "..............."}
            </div>
          </div>
        </div>
      </div>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "6px",
          fontSize: "11pt",
        }}
      >
        <thead>
          <tr>
            <th style={thStyle(6)}>ردیف</th>
            <th style={thStyle(14)}>کد ملی</th>
            <th style={thStyle(18)}>نام و نام خانوادگی</th>
            {Array.from({ length: 6 }).map((_, i) => (
              <th key={i} style={thStyle(7)}>
                &nbsp;
              </th>
            ))}
            <th style={thStyle(18)}>توضیحات</th>
          </tr>
        </thead>
        <tbody>
          {sheet.students.map((s, i) => (
            <tr key={s.id} className="no-break">
              <td style={tdStyle(true)}>{i + 1}</td>
              <td style={{ ...tdStyle(true), fontSize: "10pt" }}>
                {s.nationalCode}
              </td>
              <td style={{ ...tdStyle(false), fontWeight: "bold" }}>
                {s.firstName} {s.lastName}
              </td>
              {Array.from({ length: 6 }).map((_, j) => (
                <td key={j} style={tdStyle(true)}>
                  &nbsp;
                </td>
              ))}
              <td style={tdStyle(false)}>&nbsp;</td>
            </tr>
          ))}

          {Array.from({ length: emptyRows }).map((_, i) => (
            <tr key={`empty-${i}`} className="no-break">
              <td style={tdStyle(true)}>{sheet.students.length + i + 1}</td>
              <td style={tdStyle(true)}>&nbsp;</td>
              <td style={tdStyle(false)}>&nbsp;</td>
              {Array.from({ length: 6 }).map((_, j) => (
                <td key={j} style={tdStyle(true)}>
                  &nbsp;
                </td>
              ))}
              <td style={tdStyle(false)}>&nbsp;</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function thStyle(widthPercent: number): React.CSSProperties {
  return {
    border: "1px solid black",
    padding: "4px 2px",
    textAlign: "center",
    backgroundColor: "#f0f0f0",
    fontWeight: "bold",
    width: `${widthPercent}%`,
    fontSize: "10pt",
  };
}

function tdStyle(center: boolean): React.CSSProperties {
  return {
    border: "1px solid black",
    padding: "3px 4px",
    textAlign: center ? "center" : "right",
    height: "22px",
  };
}
