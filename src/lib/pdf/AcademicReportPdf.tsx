import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Svg,
  Rect,
  Line,
  Circle,
} from "@react-pdf/renderer";
import type { AcademicReportData } from "@/actions/academicReportActions";
import { toPersianNum } from "../utils";

let fontsRegistered = false;

const styles = StyleSheet.create({
  page: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    fontFamily: "IRANSans",
    fontSize: 9,
    direction: "rtl",
  },
  headerBox: {
    borderWidth: 1,
    borderColor: "#000",
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: "row-reverse",
  },
  headerCell: {
    flex: 1,
    padding: 5,
    borderLeftWidth: 1,
    borderLeftColor: "#000",
    textAlign: "center",
    fontSize: 8,
    lineHeight: 1.4,
  },
  headerCellLast: {
    flex: 1,
    padding: 5,
    textAlign: "center",
    fontSize: 8,
    lineHeight: 1.4,
  },
  titleBar: {
    borderTopWidth: 1,
    borderTopColor: "#000",
    paddingVertical: 4,
    backgroundColor: "#f0f0f0",
  },
  titleText: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  bold: {
    fontWeight: "bold",
  },

  // آمار کلی
  statsBox: {
    flexDirection: "row-reverse",
    gap: 10,
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#000",
    padding: 6,
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  statTitle: {
    fontSize: 8,
    color: "#475569",
    marginBottom: 2,
  },
  statValue: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#0f172a",
  },

  // جدول دروس
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#000",
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: "row-reverse",
    backgroundColor: "#e2e8f0",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    height: 24,
  },
  tableRow: {
    flexDirection: "row-reverse",
    borderBottomWidth: 0.5,
    borderBottomColor: "#94a3b8",
    height: 22,
  },
  th: {
    padding: 2,
    borderLeftWidth: 0.5,
    borderLeftColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  thText: {
    fontSize: 8,
    fontWeight: "bold",
    textAlign: "center",
  },
  td: {
    padding: 2,
    borderLeftWidth: 0.5,
    borderLeftColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  tdText: {
    fontSize: 8,
    textAlign: "center",
  },

  // سه نفر اول
  top3Container: {
    flexDirection: "row-reverse",
    gap: 10,
    marginBottom: 12,
  },
  top3Box: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#000",
    padding: 6,
    backgroundColor: "#fff",
  },
  top3Title: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 6,
    textAlign: "center",
    color: "#1e3a8a",
    borderBottomWidth: 0.5,
    borderBottomColor: "#cbd5e1",
    paddingBottom: 3,
  },
  top3Row: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: "#f1f5f9",
  },
  top3Text: {
    fontSize: 8,
  },
  top3Avg: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#0f172a",
  },

  // نمودار
  chartBox: {
    borderWidth: 1,
    borderColor: "#000",
    padding: 10,
    alignItems: "center",
  },
  chartTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  chartLegend: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    gap: 20,
    marginTop: 10,
  },
  legendItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  legendDot: {
    width: 10,
    height: 10,
    marginLeft: 4,
  },
  legendText: {
    fontSize: 8,
    color: "#333",
  },
});

export function AcademicReportPdf({
  data,
  regularFont,
  boldFont,
}: {
  data: AcademicReportData;
  regularFont: string;
  boldFont: string;
}) {
  if (!fontsRegistered) {
    Font.register({
      family: "IRANSans",
      fonts: [
        { src: regularFont, fontWeight: "normal" },
        { src: boldFont, fontWeight: "bold" },
      ],
    });
    fontsRegistered = true;
  }

  // تنظیمات نمودار
  const maxScore = 20;
  const chartWidth = 480;
  const chartHeight = 130;
  const barWidth = 25;
  const gap =
    (chartWidth - data.lessons.length * barWidth) / (data.lessons.length + 1);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ═══════════ هدر ═══════════ */}
        <View style={styles.headerBox}>
          <View style={styles.headerRow}>
            <View style={styles.headerCell}>
              <Text>جمهوری اسلامی ایران</Text>
              <Text>وزارت آموزش و پرورش</Text>
              <Text>سال تحصیلی: {data.academicYear.title}</Text>
              <Text style={styles.bold}>کارنامه تحصیلی</Text>
            </View>
            <View style={styles.headerCell}>
              <Text>مدرسه: {data.school.title}</Text>
              <Text>کلاس: {data.klass.title}</Text>
              <Text>پایه: {data.klass.paye}</Text>
              <Text>رشته: {data.klass.reshteh}</Text>
            </View>
            <View style={styles.headerCellLast}>
              <Text style={styles.bold}>
                {data.student.firstName} {data.student.lastName}
              </Text>
              <Text>نام پدر: {data.student.fatherName || "-"}</Text>
              <Text>کد ملی: {data.student.nationalCode}</Text>
            </View>
          </View>
          <View style={styles.titleBar}>
            <Text style={styles.titleText}>
              کارنامه دوره: {data.period.title}
            </Text>
          </View>
        </View>

        {/* ═══════════ آمار کلی ═══════════ */}

        <View style={styles.statsBox}>
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>معدل کل</Text>
            <Text style={styles.statValue}>
              {data.studentAverage.toFixed(2)}
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statTitle}>رتبه در کلاس</Text>
            <View
              style={{
                flexDirection: "row-reverse",
                alignItems: "center",
                marginTop: 2,
              }}
            >
              <Text style={styles.statValue}>{data.classRank}</Text>
              <Text
                style={{ fontSize: 9, color: "#475569", marginHorizontal: 3 }}
              >
                از
              </Text>
              <Text style={styles.statValue}>{data.classSize}</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statTitle}>رتبه در پایه</Text>
            <View
              style={{
                flexDirection: "row-reverse",
                alignItems: "center",
                marginTop: 2,
              }}
            >
              <Text style={styles.statValue}>{data.gradeRank}</Text>
              <Text
                style={{ fontSize: 9, color: "#475569", marginHorizontal: 3 }}
              >
                از
              </Text>
              <Text style={styles.statValue}>{data.gradeSize}</Text>
            </View>
          </View>
        </View>

        {/* ═══════════ جدول دروس ═══════════ */}
        <View style={styles.table}>
          {/* سرستون‌ها */}
          <View style={styles.tableHeader}>
            <View style={[styles.th, { flex: 2.5 }]}>
              <Text style={styles.thText}>نام درس</Text>
            </View>
            <View style={[styles.th, { flex: 0.6 }]}>
              <Text style={styles.thText}>واحد</Text>
            </View>
            <View style={[styles.th, { flex: 1.8 }]}>
              <Text style={styles.thText}>دبیر</Text>
            </View>
            <View style={[styles.th, { flex: 0.8 }]}>
              <Text style={styles.thText}>نمره</Text>
            </View>
            <View style={[styles.th, { flex: 0.8 }]}>
              <Text style={styles.thText}>رتبه کلاس</Text>
            </View>
            <View style={[styles.th, { flex: 0.8 }]}>
              <Text style={styles.thText}>رتبه پایه</Text>
            </View>
          </View>

          {/* ردیف‌های دروس */}
          {data.lessons.map((l, i) => (
            <View key={i} style={styles.tableRow}>
              <View style={[styles.td, { flex: 2.5 }]}>
                <Text
                  style={{ fontSize: 8, textAlign: "right", paddingRight: 4 }}
                >
                  {l.lessonTitle}
                </Text>
              </View>
              <View style={[styles.td, { flex: 0.6 }]}>
                <Text style={styles.tdText}>{l.units}</Text>
              </View>
              <View style={[styles.td, { flex: 1.8 }]}>
                <Text style={{ fontSize: 7, textAlign: "center" }}>
                  {l.teacherName}
                </Text>
              </View>
              <View style={[styles.td, { flex: 0.8 }]}>
                <Text
                  style={{
                    fontSize: 9,
                    fontWeight: "bold",
                    textAlign: "center",
                    color: l.score && l.score >= 10 ? "#15803d" : "#be123c",
                  }}
                >
                  {l.score ?? l.descriptiveValue ?? "-"}
                </Text>
              </View>
              <View style={[styles.td, { flex: 0.8 }]}>
                <Text style={styles.tdText}>{l.classRank ?? "-"}</Text>
              </View>
              <View style={[styles.td, { flex: 0.8 }]}>
                <Text style={styles.tdText}>{l.gradeRank ?? "-"}</Text>
              </View>
            </View>
          ))}

          {/* سطر معدل کل */}
          <View
            style={[
              styles.tableRow,
              {
                backgroundColor: "#f1f5f9",
                borderTopWidth: 1,
                borderTopColor: "#000",
              },
            ]}
          >
            <View style={[styles.td, { flex: 5.7 }]}>
              <Text
                style={{
                  fontSize: 9,
                  fontWeight: "bold",
                  textAlign: "left",
                  paddingLeft: 10,
                }}
              >
                معدل کل دانش‌آموز
              </Text>
            </View>
            <View style={[styles.td, { flex: 0.8 }]}>
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "bold",
                  color: "#1e3a8a",
                  textAlign: "center",
                }}
              >
                {data.studentAverage.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* ═══════════ سه نفر اول ═══════════ */}
        <View style={styles.top3Container}>
          <View style={styles.top3Box}>
            <Text style={styles.top3Title}> برترین‌های کلاس</Text>
            {data.top3Class.map((s, i) => (
              <View key={i} style={styles.top3Row}>
                <Text style={styles.top3Text}>
                  {i + 1}. {s.name}
                </Text>
                <Text style={styles.top3Avg}>{s.avg}</Text>
              </View>
            ))}
          </View>
          <View style={styles.top3Box}>
            <Text style={styles.top3Title}> برترین‌های پایه</Text>
            {data.top3Grade.map((s, i) => (
              <View key={i} style={styles.top3Row}>
                <Text style={styles.top3Text}>
                  {i + 1}. {s.name}{" "}
                  <Text style={{ fontSize: 7, color: "#64748b" }}>
                    ({s.klass})
                  </Text>
                </Text>
                <Text style={styles.top3Avg}>{s.avg}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ═══════════ نمودار میله‌ای ═══════════ */}

        {/* محوطه نمودار */}
        <View style={{ flexDirection: "row-reverse", width: chartWidth }}>
          {/* محوطه اصلی نمودار */}
          <View style={{ flex: 1, height: chartHeight, position: "relative" }}>
            {/* خطوط راهنمای افقی */}
            {[5, 10, 15, 20].map((val) => (
              <View
                key={val}
                style={{
                  position: "absolute",
                  bottom: (val / 20) * chartHeight,
                  left: 0,
                  right: 0,
                  borderTopWidth: 0.5,
                  borderTopColor: "#e2e8f0",
                  borderStyle: "dashed",
                }}
              />
            ))}
            {/* خط شکسته معدل کلاس */}
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 10,
              }}
            >
              <Svg width="100%" height="100%">
                {data.lessons.map((l, i) => {
                  if (i === data.lessons.length - 1) return null;

                  // مختصات مرکز میله‌ها با ترتیب راست به چپ
                  const currentX =
                    chartWidth -
                    25 -
                    (i * (barWidth + gap) + (barWidth + gap) / 2);

                  const nextX =
                    chartWidth -
                    25 -
                    ((i + 1) * (barWidth + gap) + (barWidth + gap) / 2);

                  const currentY =
                    chartHeight - ((l.classAvg ?? 0) / 20) * chartHeight;

                  const nextY =
                    chartHeight -
                    ((data.lessons[i + 1].classAvg ?? 0) / 20) * chartHeight;

                  return (
                    <Line
                      key={i}
                      x1={currentX + 26}
                      y1={currentY + 13}
                      x2={nextX + 26}
                      y2={nextY + 13}
                      stroke="#f59e0b"
                      strokeWidth={1.5}
                    />
                  );
                })}

                {/* نقاط معدل کلاس */}
                {data.lessons.map((l, i) => {
                  const x =
                    chartWidth -
                    25 -
                    (i * (barWidth + gap) + (barWidth + gap) / 2) +
                    26;

                  const y =
                    chartHeight - ((l.classAvg ?? 0) / 20) * chartHeight + 13;

                  return (
                    <Circle
                      key={i}
                      cx={x}
                      cy={y}
                      r={3}
                      fill="#f59e0b"
                      stroke="#ffffff"
                      strokeWidth={1}
                    />
                  );
                })}
              </Svg>
            </View>
            {/* میله‌ها */}
            <View
              style={{
                flexDirection: "row-reverse",
                width: "100%",
                height: "100%",
                alignItems: "flex-end",
                position: "absolute",
                top: 0,
                left: 0,
                zIndex: 2,
                opacity: 0.75, // ⬅️ این خط را اضافه کنید
              }}
            >
              {data.lessons.map((l, i) => {
                const score = l.score ?? 0;
                const barHeight = (score / 20) * chartHeight;

                return (
                  <View
                    key={i}
                    style={{
                      width: barWidth + gap,
                      height: "100%",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      position: "relative",
                      opacity: 0.75, // ⬅️ این خط را اضافه کنید
                    }}
                  >
                    {/* عدد نمره */}
                    <Text
                      style={{
                        fontSize: 7,
                        fontWeight: "bold",
                        color: "#0f172a",
                        position: "absolute",
                        bottom: barHeight,
                        marginBottom: 2,
                        zIndex: 3,
                      }}
                    >
                      {l.score !== null ? l.score : "-"}
                    </Text>

                    {/* بدنه میله */}
                    <View
                      style={{
                        width: barWidth,
                        height: barHeight,
                        backgroundColor: "#3b82f6",
                        borderTopLeftRadius: 2,
                        borderTopRightRadius: 2,
                      }}
                    />
                  </View>
                );
              })}
            </View>
            {/* محور Y */}
            <View
              style={{
                width: 25,
                height: chartHeight,
                justifyContent: "space-between",
                alignItems: "center",
                borderRightWidth: 1,
                borderRightColor: "#cbd5e1",
              }}
            >
              {[20, 15, 10, 5, 0].map((val) => (
                <Text
                  key={val}
                  style={{
                    fontSize: 6,
                    color: "#64748b",
                    height: 10,
                    textAlign: "center",
                  }}
                >
                  {val}
                </Text>
              ))}
            </View>
          </View>
        </View>
        {/* نام دروس زیر نمودار */}
        <View
          style={{
            flexDirection: "row-reverse",
            width: chartWidth,
            marginTop: 4,
            alignItems: "flex-start",
          }}
        >
          <View style={{ flex: 1, flexDirection: "row-reverse" }}>
            {data.lessons.map((l, i) => (
              <View
                key={i}
                style={{
                  width: barWidth + gap,
                  alignItems: "center",
                  paddingHorizontal: 1,
                }}
              >
                <Text
                  style={{
                    fontSize: 6,
                    textAlign: "center",
                    color: "#475569",
                    fontWeight: "bold",
                  }}
                >
                  {l.lessonTitle}
                </Text>
              </View>
            ))}
          </View>
          <View style={{ width: 25 }} />
        </View>
        {/* راهنمای نمودار */}
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View
              style={{
                ...styles.legendDot,
                backgroundColor: "#3b82f6",
              }}
            />
            <Text style={styles.legendText}>نمره دانش‌آموز</Text>
          </View>

          <View style={styles.legendItem}>
            <View
              style={{
                ...styles.legendDot,
                backgroundColor: "#f59e0b",
                borderRadius: 5,
              }}
            />
            <Text style={styles.legendText}>معدل کلاس</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
