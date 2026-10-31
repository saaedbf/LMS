import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type {
  StudentDisciplinaryReport,
  MonthlyStats,
  WeekdayStats,
  LessonAbsenceStats,
} from "@/actions/disciplinaryReportActions";

let fontsRegistered = false;

function ensureFonts(regularFont: string, boldFont: string) {
  if (fontsRegistered) return;
  Font.register({
    family: "IRANSans",
    fonts: [
      { src: regularFont, fontWeight: "normal" },
      { src: boldFont, fontWeight: "bold" },
    ],
  });
  fontsRegistered = true;
}

function toJalali(date: Date): string {
  return new Date(date).toLocaleDateString("fa-IR");
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 18,
    fontFamily: "IRANSans",
    fontSize: 9,
    direction: "rtl",
  },
  headerBox: {
    borderWidth: 1.2,
    borderColor: "#000",
    marginBottom: 6,
  },
  headerRow: { flexDirection: "row-reverse" },
  headerCell: {
    flex: 1,
    padding: 4,
    borderLeftWidth: 1,
    borderLeftColor: "#000",
    textAlign: "center",
    fontSize: 8,
    lineHeight: 1.5,
  },
  headerCellLast: {
    flex: 1,
    padding: 4,
    textAlign: "center",
    fontSize: 8,
    lineHeight: 1.5,
  },
  bold: { fontWeight: "bold" },
  titleBar: {
    borderTopWidth: 1,
    borderTopColor: "#000",
    paddingVertical: 3,
    backgroundColor: "#f0f0f0",
  },
  titleText: { fontSize: 11, fontWeight: "bold", textAlign: "center" },

  /* کارت آمار */
  statsRow: {
    flexDirection: "row-reverse",
    gap: 6,
    marginBottom: 6,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#000",
    padding: 6,
    alignItems: "center",
  },
  statNumber: { fontSize: 18, fontWeight: "bold" },
  statLabel: { fontSize: 8, marginTop: 2 },

  /* بخش */
  section: {
    borderWidth: 1,
    borderColor: "#000",
    marginBottom: 6,
    padding: 6,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#999",
    paddingBottom: 3,
  },

  /* نمودار میله‌ای عمودی */
  chart: {
    flexDirection: "row-reverse",
    alignItems: "flex-end",
    height: 80,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    paddingBottom: 0,
  },
  barSlot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    height: "100%",
  },
  bar: {
    width: "60%",
    backgroundColor: "#3b82f6",
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  barLabel: { fontSize: 6, marginTop: 2, textAlign: "center" },
  chartLegend: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    gap: 12,
    marginTop: 3,
  },
  legendDot: { width: 6, height: 6, marginLeft: 3, borderRadius: 3 },
  legendText: { fontSize: 7 },

  /* جدول ریز */
  table: { width: "100%", borderWidth: 1, borderColor: "#000" },
  tableHeader: {
    flexDirection: "row-reverse",
    backgroundColor: "#e5e7eb",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    height: 22,
  },
  tableRow: {
    flexDirection: "row-reverse",
    borderBottomWidth: 0.5,
    borderBottomColor: "#666",
    minHeight: 18,
  },
  th: {
    padding: 2,
    borderLeftWidth: 0.5,
    borderLeftColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  thLast: { padding: 2, justifyContent: "center", alignItems: "center" },
  thText: { fontSize: 7, fontWeight: "bold", textAlign: "center" },
  td: {
    padding: 2,
    borderLeftWidth: 0.5,
    borderLeftColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  tdLast: { padding: 2, justifyContent: "center", alignItems: "center" },
  tdText: { fontSize: 7, textAlign: "center" },
  tdTextRight: { fontSize: 7, textAlign: "right", paddingRight: 2 },

  emptyText: {
    textAlign: "center",
    fontSize: 7,
    color: "#888",
    paddingVertical: 4,
  },
});

/* ═══════════════════════════════════════════════
   نمودار میله‌ای ساده
   ═══════════════════════════════════════════════ */
function BarChart({
  data,
  color = "#3b82f6",
  unit = "",
}: {
  data: { label: string; value: number }[];
  color?: string;
  unit?: string;
}) {
  if (data.length === 0) {
    return <Text style={styles.emptyText}>داده‌ای برای نمایش نیست</Text>;
  }
  const max = Math.max(...data.map((d) => d.value), 1);
  const maxBarHeight = 60;

  return (
    <View>
      <View style={styles.chart}>
        {data.map((d, i) => {
          const h = (d.value / max) * maxBarHeight;
          return (
            <View key={i} style={styles.barSlot}>
              {/* ⬅️ نمایش عدد بالای میله */}
              <Text
                style={{ fontSize: 6, marginBottom: 2, fontWeight: "bold" }}
              >
                {d.value}
                {unit}
              </Text>
              <View
                style={{ ...styles.bar, height: h, backgroundColor: color }}
              />
            </View>
          );
        })}
      </View>
      <View style={{ flexDirection: "row-reverse", marginTop: 2 }}>
        {data.map((d, i) => (
          <Text key={i} style={{ ...styles.barLabel, flex: 1 }}>
            {d.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

/* ═══════════════════════════════════════════════
   کامپوننت اصلی
   ═══════════════════════════════════════════════ */
export function DisciplinaryReportPdf({
  data,
  regularFont,
  boldFont,
}: {
  data: StudentDisciplinaryReport;
  regularFont: string;
  boldFont: string;
}) {
  ensureFonts(regularFont, boldFont);

  const {
    student,
    school,
    academicYear,
    klass,
    paye,
    reshtehTahsili,
    summary,
    monthly,
    weekdays,
    lessonAbsences,
    details,
  } = data;

  // داده‌های نمودار ماهانه (سه سری)
  const monthlyChart = monthly.flatMap((m) => [
    { label: m.monthLabel.split(" ")[0], value: m.absence, type: "غیبت" },
    { label: "", value: m.tardiness, type: "تاخیر" },
    { label: "", value: m.disciplinary, type: "انضباطی" },
  ]);

  return (
    <Document>
      {/* ═══════════════════ صفحه ۱: آمار + نمودارها ═══════════════════ */}
      <Page size="A4" style={styles.page}>
        {/* هدر */}
        <View style={styles.headerBox} fixed>
          <View style={styles.headerRow}>
            <View style={styles.headerCell}>
              <Text>جمهوری اسلامی ایران</Text>
              <Text>وزارت آموزش و پرورش</Text>
              <Text>سال تحصیلی: {academicYear.title}</Text>
              <Text style={styles.bold}>کارنامه انضباطی</Text>
            </View>
            <View style={styles.headerCell}>
              <Text>مدرسه: {school.title}</Text>
              <Text>کلاس: {klass.title}</Text>
              <Text>پایه: {paye.title}</Text>
              <Text>رشته: {reshtehTahsili.title}</Text>
            </View>
            <View style={styles.headerCellLast}>
              <Text style={styles.bold}>
                {student.firstName} {student.lastName}
              </Text>

              <Text>کد ملی: {student.nationalCode}</Text>
            </View>
          </View>
          <View style={styles.titleBar}>
            <Text style={styles.titleText}>
              کارنامه انضباطی - صفحه ۱ (آمار کلی)
            </Text>
          </View>
        </View>

        {/* آمار کلی */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{summary.absences}</Text>
            <Text style={styles.statLabel}>غیبت (روز کامل)</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{summary.tardiness}</Text>
            <Text style={styles.statLabel}>تاخیر</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{summary.disciplinary}</Text>
            <Text style={styles.statLabel}>موارد انضباطی</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{summary.encouragements}</Text>
            <Text style={styles.statLabel}>تشویق</Text>
          </View>
        </View>

        {/* نمودار ماهانه */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            آمار ماهانه (غیبت / تاخیر / انضباطی)
          </Text>
          {monthly.length === 0 ? (
            <Text style={styles.emptyText}>داده‌ای برای نمایش نیست</Text>
          ) : (
            <>
              <View style={styles.chart}>
                {monthly.map((m, i) => {
                  const max = Math.max(
                    ...monthly.flatMap((x) => [
                      x.absence,
                      x.tardiness,
                      x.disciplinary,
                    ]),
                    1,
                  );
                  const h1 = (m.absence / max) * 60;
                  const h2 = (m.tardiness / max) * 60;
                  const h3 = (m.disciplinary / max) * 60;
                  return (
                    <View key={i} style={styles.barSlot}>
                      <View
                        style={{
                          flexDirection: "row-reverse",
                          alignItems: "flex-end",
                          width: "100%",
                          justifyContent: "center",
                          gap: 1,
                        }}
                      >
                        {/* ⬅️ میله غیبت */}
                        <View style={{ width: "30%", alignItems: "center" }}>
                          <Text style={{ fontSize: 6, fontWeight: "bold" }}>
                            {m.absence > 0 ? m.absence : ""}
                          </Text>
                          <View
                            style={{
                              width: "100%",
                              height: h1,
                              backgroundColor: "#ef4444",
                            }}
                          />
                        </View>

                        {/* ⬅️ میله تاخیر */}
                        <View style={{ width: "30%", alignItems: "center" }}>
                          <Text style={{ fontSize: 6, fontWeight: "bold" }}>
                            {m.tardiness > 0 ? m.tardiness : ""}
                          </Text>
                          <View
                            style={{
                              width: "100%",
                              height: h2,
                              backgroundColor: "#f59e0b",
                            }}
                          />
                        </View>

                        {/* ⬅️ میله انضباطی */}
                        <View style={{ width: "30%", alignItems: "center" }}>
                          <Text style={{ fontSize: 6, fontWeight: "bold" }}>
                            {m.disciplinary > 0 ? m.disciplinary : ""}
                          </Text>
                          <View
                            style={{
                              width: "100%",
                              height: h3,
                              backgroundColor: "#8b5cf6",
                            }}
                          />
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
              {/* برچسب ماه‌ها */}
              <View style={{ flexDirection: "row-reverse" }}>
                {monthly.map((m, i) => (
                  <Text key={i} style={{ ...styles.barLabel, flex: 1 }}>
                    {m.monthLabel}
                  </Text>
                ))}
              </View>

              <View style={styles.chartLegend}>
                <View
                  style={{ flexDirection: "row-reverse", alignItems: "center" }}
                >
                  <View
                    style={{ ...styles.legendDot, backgroundColor: "#ef4444" }}
                  />
                  <Text style={styles.legendText}>غیبت</Text>
                </View>
                <View
                  style={{ flexDirection: "row-reverse", alignItems: "center" }}
                >
                  <View
                    style={{ ...styles.legendDot, backgroundColor: "#f59e0b" }}
                  />
                  <Text style={styles.legendText}>تاخیر</Text>
                </View>
                <View
                  style={{ flexDirection: "row-reverse", alignItems: "center" }}
                >
                  <View
                    style={{ ...styles.legendDot, backgroundColor: "#8b5cf6" }}
                  />
                  <Text style={styles.legendText}>انضباطی</Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* نمودار روز هفته */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>غیبت‌ها به تفکیک روز هفته</Text>
          <BarChart
            data={weekdays.map((w) => ({ label: w.day, value: w.count }))}
            color="#ef4444"
          />
        </View>

        {/* نمودار درس */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>غیبت‌ها به تفکیک درس</Text>
          <BarChart
            data={lessonAbsences.map((l) => ({
              label: l.lesson,
              value: l.count,
            }))}
            color="#10b981"
          />
        </View>
      </Page>

      {/* ═══════════════════ صفحه ۲: ریز جزئیات ═══════════════════ */}
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBox} fixed>
          <View style={styles.headerRow}>
            <View style={styles.headerCell}>
              <Text>کارنامه انضباطی</Text>
              <Text>
                {student.firstName} {student.lastName}
              </Text>
            </View>
            <View style={styles.headerCell}>
              <Text>مدرسه: {school.title}</Text>
              <Text>کلاس: {klass.title}</Text>
            </View>
            <View style={styles.headerCellLast}>
              <Text>سال: {academicYear.title}</Text>
              <Text>تاریخ: {new Date().toLocaleDateString("fa-IR")}</Text>
            </View>
          </View>
          <View style={styles.titleBar}>
            <Text style={styles.titleText}>صفحه ۲ - ریز جزئیات</Text>
          </View>
        </View>

        {/* غیبت‌ها */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            غیبت‌ها (روز کامل) - {details.absences.length} مورد
          </Text>
          {details.absences.length === 0 ? (
            <Text style={styles.emptyText}>غیبت روز کامل ثبت نشده است</Text>
          ) : (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <View style={{ ...styles.th, width: "6%" }}>
                  <Text style={styles.thText}>#</Text>
                </View>
                <View style={{ ...styles.th, width: "18%" }}>
                  <Text style={styles.thText}>تاریخ</Text>
                </View>
                <View style={{ ...styles.th, width: "14%" }}>
                  <Text style={styles.thText}>روز</Text>
                </View>
                <View style={{ ...styles.th, width: "30%" }}>
                  <Text style={styles.thText}>دروس غیبت‌شده</Text>
                </View>
                <View style={{ ...styles.thLast, width: "32%" }}>
                  <Text style={styles.thText}>علت</Text>
                </View>
              </View>
              {details.absences.map((a, i) => (
                <View key={i} style={styles.tableRow} wrap={false}>
                  <View style={{ ...styles.td, width: "6%" }}>
                    <Text style={styles.tdText}>{i + 1}</Text>
                  </View>
                  <View style={{ ...styles.td, width: "18%" }}>
                    <Text style={styles.tdText}>{toJalali(a.date)}</Text>
                  </View>
                  <View style={{ ...styles.td, width: "14%" }}>
                    <Text style={styles.tdText}>
                      {a.date.toLocaleDateString("fa-IR", { weekday: "long" })}
                    </Text>
                  </View>
                  <View style={{ ...styles.td, width: "30%" }}>
                    <Text style={styles.tdTextRight}>
                      {a.lessons.join("، ") || "-"}
                    </Text>
                  </View>
                  <View style={{ ...styles.tdLast, width: "32%" }}>
                    <Text style={styles.tdTextRight}>{a.reason || "-"}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* تاخیرها */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            تاخیرها - {details.tardiness.length} مورد
          </Text>
          {details.tardiness.length === 0 ? (
            <Text style={styles.emptyText}>تاخیری ثبت نشده است</Text>
          ) : (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <View style={{ ...styles.th, width: "6%" }}>
                  <Text style={styles.thText}>#</Text>
                </View>
                <View style={{ ...styles.th, width: "20%" }}>
                  <Text style={styles.thText}>تاریخ</Text>
                </View>
                <View style={{ ...styles.th, width: "14%" }}>
                  <Text style={styles.thText}>روز</Text>
                </View>
                <View style={{ ...styles.th, width: "18%" }}>
                  <Text style={styles.thText}>ساعت</Text>
                </View>
                <View style={{ ...styles.thLast, width: "42%" }}>
                  <Text style={styles.thText}>علت</Text>
                </View>
              </View>
              {details.tardiness.map((t, i) => (
                <View key={i} style={styles.tableRow} wrap={false}>
                  <View style={{ ...styles.td, width: "6%" }}>
                    <Text style={styles.tdText}>{i + 1}</Text>
                  </View>
                  <View style={{ ...styles.td, width: "20%" }}>
                    <Text style={styles.tdText}>{toJalali(t.date)}</Text>
                  </View>
                  <View style={{ ...styles.td, width: "14%" }}>
                    <Text style={styles.tdText}>
                      {t.date.toLocaleDateString("fa-IR", { weekday: "long" })}
                    </Text>
                  </View>
                  <View style={{ ...styles.td, width: "18%" }}>
                    <Text style={styles.tdText}>{t.startTime ?? "-"}</Text>
                  </View>
                  <View style={{ ...styles.tdLast, width: "42%" }}>
                    <Text style={styles.tdTextRight}>{t.reason || "-"}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* موارد انضباطی */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            موارد انضباطی - {details.disciplinary.length} مورد
          </Text>
          {details.disciplinary.length === 0 ? (
            <Text style={styles.emptyText}>مورد انضباطی ثبت نشده است</Text>
          ) : (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <View style={{ ...styles.th, width: "6%" }}>
                  <Text style={styles.thText}>#</Text>
                </View>
                <View style={{ ...styles.th, width: "20%" }}>
                  <Text style={styles.thText}>تاریخ</Text>
                </View>
                <View style={{ ...styles.th, width: "14%" }}>
                  <Text style={styles.thText}>ساعت</Text>
                </View>
                <View style={{ ...styles.thLast, width: "60%" }}>
                  <Text style={styles.thText}>شرح</Text>
                </View>
              </View>
              {details.disciplinary.map((d, i) => (
                <View key={i} style={styles.tableRow} wrap={false}>
                  <View style={{ ...styles.td, width: "6%" }}>
                    <Text style={styles.tdText}>{i + 1}</Text>
                  </View>
                  <View style={{ ...styles.td, width: "20%" }}>
                    <Text style={styles.tdText}>{toJalali(d.date)}</Text>
                  </View>
                  <View style={{ ...styles.td, width: "14%" }}>
                    <Text style={styles.tdText}>{d.startTime}</Text>
                  </View>
                  <View style={{ ...styles.tdLast, width: "60%" }}>
                    <Text style={styles.tdTextRight}>{d.reason}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* تشویق‌ها */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            تشویق‌ها - {details.encouragements.length} مورد
          </Text>
          {details.encouragements.length === 0 ? (
            <Text style={styles.emptyText}>تشویقی ثبت نشده است</Text>
          ) : (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <View style={{ ...styles.th, width: "6%" }}>
                  <Text style={styles.thText}>#</Text>
                </View>
                <View style={{ ...styles.th, width: "18%" }}>
                  <Text style={styles.thText}>تاریخ</Text>
                </View>
                <View style={{ ...styles.th, width: "14%" }}>
                  <Text style={styles.thText}>نوع</Text>
                </View>
                <View style={{ ...styles.thLast, width: "62%" }}>
                  <Text style={styles.thText}>شرح</Text>
                </View>
              </View>
              {details.encouragements.map((e, i) => (
                <View key={i} style={styles.tableRow} wrap={false}>
                  <View style={{ ...styles.td, width: "6%" }}>
                    <Text style={styles.tdText}>{i + 1}</Text>
                  </View>
                  <View style={{ ...styles.td, width: "18%" }}>
                    <Text style={styles.tdText}>{toJalali(e.date)}</Text>
                  </View>
                  <View style={{ ...styles.td, width: "14%" }}>
                    <Text style={styles.tdText}>{e.type}</Text>
                  </View>
                  <View style={{ ...styles.tdLast, width: "62%" }}>
                    <Text style={styles.tdTextRight}>{e.reason}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
}
