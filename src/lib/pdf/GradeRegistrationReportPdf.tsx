import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { TeacherReportRow } from "@/actions/gradePeriodReportActions";

let fontsRegistered = false;

type Props = {
  rows: TeacherReportRow[];
  periodTitle: string;
  schoolTitle: string;
  academicYearTitle: string;
  regularFont: string;
  boldFont: string;
};

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

function pct(a: number, b: number) {
  if (b <= 0) return 0;
  return Math.round((a / b) * 100);
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    fontFamily: "IRANSans",
    fontSize: 9,
    direction: "rtl",
  },
  headerBox: {
    borderWidth: 1.5,
    borderColor: "#000",
    borderStyle: "solid",
    marginBottom: 6,
  },
  headerRow: { flexDirection: "row-reverse" },
  headerCell: {
    flex: 1,
    padding: 4,
    borderLeftWidth: 1,
    borderLeftColor: "#000",
    borderLeftStyle: "solid",
    textAlign: "center",
    fontSize: 9,
    lineHeight: 1.5,
  },
  headerCellLast: {
    flex: 1,
    padding: 4,
    textAlign: "center",
    fontSize: 9,
    lineHeight: 1.5,
  },
  bold: { fontWeight: "bold" },
  titleBar: {
    borderTopWidth: 1,
    borderTopColor: "#000",
    borderTopStyle: "solid",
    paddingVertical: 4,
    backgroundColor: "#f0f0f0",
  },
  titleText: { fontSize: 11, fontWeight: "bold", textAlign: "center" },
  subtitleText: {
    fontSize: 8,
    textAlign: "center",
    marginTop: 2,
    color: "#444",
  },
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
  },
  tableHeader: {
    flexDirection: "row-reverse",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    backgroundColor: "#e5e7eb",
    height: 26,
  },
  tr: {
    flexDirection: "row-reverse",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    height: 22,
  },
  trLast: { flexDirection: "row-reverse", height: 22 },
  th: {
    padding: 2,
    borderLeftWidth: 1,
    borderLeftColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  thLast: { padding: 2, justifyContent: "center", alignItems: "center" },
  thText: { fontSize: 8, fontWeight: "bold", textAlign: "center" },
  td: {
    padding: 2,
    borderLeftWidth: 1,
    borderLeftColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  tdLast: { padding: 2, justifyContent: "center", alignItems: "center" },
  tdText: { fontSize: 8, textAlign: "center" },
  tdTextGreen: { fontSize: 8, textAlign: "center", color: "#047857" },
  tdTextRed: { fontSize: 8, textAlign: "center", color: "#b91c1c" },

  /* ─── نوار پیشرفت inline ─── */
  progressCell: {
    flexDirection: "row-reverse",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 3,
    gap: 3,
  },
  progressBarOuter: {
    flex: 1,
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 2,
    overflow: "hidden",
    // نوار از راست پر می‌شه (RTL)
    flexDirection: "row-reverse",
  },
  progressBarInner: {
    height: "100%",
    borderRadius: 2,
  },
  progressLabel: {
    fontSize: 7,
    color: "#374151",
    width: 26,
    textAlign: "center",
  },
});

export function GradeRegistrationReportPdf({
  rows,
  periodTitle,
  schoolTitle,
  academicYearTitle,
  regularFont,
  boldFont,
}: Props) {
  ensureFonts(regularFont, boldFont);

  // ستون‌ها — فقط: ردیف، نام، دروس تخصیصی، ثبت‌شده، ثبت‌نشده، پیشرفت (نوار)
  const cols = {
    idx: "6%",
    name: "28%",
    total: "12%",
    submitted: "12%",
    pending: "12%",
    progress: "30%",
  };

  const ROWS_PER_PAGE = 25;
  const chunks: TeacherReportRow[][] = [];
  for (let i = 0; i < rows.length; i += ROWS_PER_PAGE) {
    chunks.push(rows.slice(i, i + ROWS_PER_PAGE));
  }
  if (chunks.length === 0) chunks.push([]);

  return (
    <Document>
      {chunks.map((chunk, pageIdx) => (
        <Page
          key={pageIdx}
          size="A4"
          orientation="portrait"
          style={styles.page}
        >
          <View style={styles.headerBox} fixed>
            <View style={styles.headerRow}>
              <View style={styles.headerCell}>
                <Text>جمهوری اسلامی ایران</Text>
                <Text>وزارت آموزش و پرورش</Text>
                <Text>سال تحصیلی: {academicYearTitle}</Text>
                <Text style={styles.bold}>گزارش ثبت نمرات</Text>
              </View>
              <View style={styles.headerCell}>
                <Text>مدرسه: {schoolTitle}</Text>
                <Text>دوره: {periodTitle}</Text>
              </View>
              <View style={styles.headerCellLast}>
                <Text>
                  <Text style={styles.bold}>تاریخ: </Text>
                  {new Date().toLocaleDateString("fa-IR")}
                </Text>
                <Text>
                  <Text style={styles.bold}>تعداد معلم: </Text>
                  {rows.length}
                </Text>
              </View>
            </View>
            <View style={styles.titleBar}>
              <Text style={styles.titleText}>گزارش ثبت نمرات دبیران</Text>
              {chunks.length > 1 && (
                <Text style={styles.subtitleText}>
                  صفحه {pageIdx + 1} از {chunks.length}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.table}>
            <View style={styles.tableHeader} fixed>
              <View style={{ ...styles.th, width: cols.idx }}>
                <Text style={styles.thText}>ردیف</Text>
              </View>
              <View style={{ ...styles.th, width: cols.name }}>
                <Text style={styles.thText}>نام معلم</Text>
              </View>
              <View style={{ ...styles.th, width: cols.total }}>
                <Text style={styles.thText}>دروس تخصیصی</Text>
              </View>
              <View style={{ ...styles.th, width: cols.submitted }}>
                <Text style={styles.thText}>ثبت‌شده</Text>
              </View>
              <View style={{ ...styles.th, width: cols.pending }}>
                <Text style={styles.thText}>ثبت‌نشده</Text>
              </View>
              <View style={{ ...styles.thLast, width: cols.progress }}>
                <Text style={styles.thText}>پیشرفت دروس</Text>
              </View>
            </View>

            {chunk.map((r, i) => {
              const globalIdx = pageIdx * ROWS_PER_PAGE + i;
              const isLast = i === chunk.length - 1;
              const percent = pct(r.submittedCount, r.totalAssignments);

              // رنگ نوار بر اساس درصد
              const barColor =
                percent >= 75
                  ? "#10b981" // سبز
                  : percent >= 40
                    ? "#f59e0b" // نارنجی
                    : "#ef4444"; // قرمز

              return (
                <View
                  key={r.teacherId}
                  style={isLast ? styles.trLast : styles.tr}
                  wrap={false}
                >
                  <View style={{ ...styles.td, width: cols.idx }}>
                    <Text style={styles.tdText}>{globalIdx + 1}</Text>
                  </View>
                  <View style={{ ...styles.td, width: cols.name }}>
                    <Text style={styles.tdText}>{r.teacherName}</Text>
                  </View>
                  <View style={{ ...styles.td, width: cols.total }}>
                    <Text style={styles.tdText}>{r.totalAssignments}</Text>
                  </View>
                  <View style={{ ...styles.td, width: cols.submitted }}>
                    <Text style={styles.tdTextGreen}>{r.submittedCount}</Text>
                  </View>
                  <View style={{ ...styles.td, width: cols.pending }}>
                    <Text style={styles.tdTextRed}>{r.pendingCount}</Text>
                  </View>
                  <View style={{ ...styles.tdLast, width: cols.progress }}>
                    <View style={styles.progressCell}>
                      <View style={styles.progressBarOuter}>
                        <View
                          style={{
                            ...styles.progressBarInner,
                            width: `${percent}%`,
                            backgroundColor: barColor,
                          }}
                        />
                      </View>
                      <Text style={styles.progressLabel}>{percent}%</Text>
                    </View>
                  </View>
                </View>
              );
            })}

            {chunk.length === 0 && (
              <View style={styles.trLast}>
                <View style={{ ...styles.tdLast, width: "100%" }}>
                  <Text style={styles.tdText}>داده‌ای موجود نیست</Text>
                </View>
              </View>
            )}
          </View>
        </Page>
      ))}
    </Document>
  );
}
