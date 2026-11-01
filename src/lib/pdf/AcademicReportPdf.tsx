import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Svg,
  Polyline,
  Rect,
  Line,
  Circle,
} from "@react-pdf/renderer";
import type { AcademicReportData } from "@/actions/academicReportActions";

let fontsRegistered = false;

const styles = StyleSheet.create({
  page: { padding: 15, fontFamily: "IRANSans", fontSize: 9, direction: "rtl" },
  headerBox: { borderWidth: 1, borderColor: "#000", marginBottom: 10 },
  headerRow: { flexDirection: "row-reverse" },
  headerCell: {
    flex: 1,
    padding: 5,
    borderLeftWidth: 1,
    borderLeftColor: "#000",
    textAlign: "center",
    fontSize: 8,
  },
  headerCellLast: { flex: 1, padding: 5, textAlign: "center", fontSize: 8 },
  titleBar: {
    borderTopWidth: 1,
    borderTopColor: "#000",
    paddingVertical: 4,
    backgroundColor: "#f0f0f0",
  },
  titleText: { fontSize: 12, fontWeight: "bold", textAlign: "center" },

  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#000",
    marginBottom: 10,
  },
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
    height: 20,
  },
  th: {
    padding: 2,
    borderLeftWidth: 0.5,
    borderLeftColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  thText: { fontSize: 8, fontWeight: "bold" },
  td: {
    padding: 2,
    borderLeftWidth: 0.5,
    borderLeftColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  tdText: { fontSize: 8, textAlign: "center" },

  statsBox: { flexDirection: "row-reverse", gap: 10, marginBottom: 10 },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#000",
    padding: 5,
    alignItems: "center",
  },
  statTitle: { fontSize: 8, color: "#555" },
  statValue: { fontSize: 12, fontWeight: "bold" },

  top3Box: {
    borderWidth: 1,
    borderColor: "#000",
    marginBottom: 10,
    padding: 5,
  },
  top3Title: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
  },
  top3Row: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    paddingVertical: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
  },

  chartBox: { borderWidth: 1, borderColor: "#000", padding: 10, height: 200 },
  chartTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
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

  // داده‌های نمودار
  const maxScore = 20;
  const chartWidth = 450;
  const chartHeight = 120;
  const barWidth = (chartWidth / data.lessons.length) * 0.6;
  const gap = (chartWidth / data.lessons.length) * 0.4;
  const paddingX = 30;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* هدر */}
        <View style={styles.headerBox}>
          <View style={styles.headerRow}>
            <View style={styles.headerCell}>
              <Text>جمهوری اسلامی ایران</Text>
              <Text>وزارت آموزش و پرورش</Text>
              <Text>سال تحصیلی: {data.academicYear.title}</Text>
              <Text style={{ fontWeight: "bold" }}>کارنامه تحصیلی</Text>
            </View>
            <View style={styles.headerCell}>
              <Text>مدرسه: {data.school.title}</Text>
              <Text>کلاس: {data.klass.title}</Text>
              <Text>پایه: {data.klass.paye}</Text>
              <Text>رشته: {data.klass.reshteh}</Text>
            </View>
            <View style={styles.headerCellLast}>
              <Text style={{ fontWeight: "bold" }}>
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

        {/* آمار کلی */}
        <View style={styles.statsBox}>
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>معدل کل</Text>
            <Text style={styles.statValue}>
              {data.studentAverage.toFixed(2)}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>رتبه در کلاس</Text>
            <Text style={styles.statValue}>
              {data.classRank} از {data.classSize}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>رتبه در پایه</Text>
            <Text style={styles.statValue}>
              {data.gradeRank} از {data.gradeSize}
            </Text>
          </View>
        </View>

        {/* جدول دروس */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={[styles.th, { flex: 2 }]}>
              <Text style={styles.thText}>نام درس</Text>
            </View>
            <View style={[styles.th, { flex: 0.5 }]}>
              <Text style={styles.thText}>واحد</Text>
            </View>
            <View style={[styles.th, { flex: 1.5 }]}>
              <Text style={styles.thText}>دبیر</Text>
            </View>
            <View style={[styles.th, { flex: 0.7 }]}>
              <Text style={styles.thText}>نمره</Text>
            </View>
            <View style={[styles.th, { flex: 0.8 }]}>
              <Text style={styles.thText}>رتبه کلاس</Text>
            </View>
            <View style={[{ flex: 0.8 }]}>
              <Text>رتبه پایه</Text>
            </View>
          </View>
          {data.lessons.map((l, i) => (
            <View key={i} style={styles.tableRow}>
              <View style={[styles.td, { flex: 2 }]}>
                <Text style={{ fontSize: 8 }}>{l.lessonTitle}</Text>
              </View>
              <View style={[styles.td, { flex: 0.5 }]}>
                <Text style={styles.tdText}>{l.units}</Text>
              </View>
              <View style={[styles.td, { flex: 1.5 }]}>
                <Text style={{ fontSize: 7, textAlign: "center" }}>
                  {l.teacherName}
                </Text>
              </View>
              <View style={[styles.td, { flex: 0.7 }]}>
                <Text
                  style={{
                    fontSize: 9,
                    fontWeight: "bold",
                    color: l.score && l.score >= 10 ? "#15803d" : "#be123c",
                  }}
                >
                  {l.score ?? l.descriptiveValue ?? "-"}
                </Text>
              </View>
              <View style={[styles.td, { flex: 0.8 }]}>
                <Text style={styles.tdText}>{l.classRank ?? "-"}</Text>
              </View>
              <View style={[{ flex: 0.8 }]}>
                <Text>{l.gradeRank ?? "-"}</Text>
              </View>
            </View>
          ))}
          {/* سطر معدل */}
          <View
            style={[
              styles.tableRow,
              {
                backgroundColor: "#f3f4f6",
                borderTopWidth: 1,
                borderTopColor: "#000",
              },
            ]}
          >
            <View style={[styles.td, { flex: 4.5 }]}>
              <Text style={{ fontSize: 9, fontWeight: "bold" }}>معدل کل</Text>
            </View>
            <View style={[{ flex: 1.5 }]}>
              <Text
                style={{ fontSize: 10, fontWeight: "bold", color: "#1e3a8a" }}
              >
                {data.studentAverage.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* سه نفر اول */}
        <View
          style={{ flexDirection: "row-reverse", gap: 10, marginBottom: 10 }}
        >
          <View style={{ flex: 1, ...styles.top3Box }}>
            <Text style={styles.top3Title}>🏆 برترین‌های کلاس</Text>
            {data.top3Class.map((s, i) => (
              <View key={i} style={styles.top3Row}>
                <Text style={{ fontSize: 8 }}>
                  {i + 1}. {s.name}
                </Text>
                <Text style={{ fontSize: 8, fontWeight: "bold" }}>{s.avg}</Text>
              </View>
            ))}
          </View>
          <View style={{ flex: 1, ...styles.top3Box }}>
            <Text style={styles.top3Title}>🏆 برترین‌های پایه</Text>
            {data.top3Grade.map((s, i) => (
              <View key={i} style={styles.top3Row}>
                <Text style={{ fontSize: 8 }}>
                  {i + 1}. {s.name} ({s.klass})
                </Text>
                <Text style={{ fontSize: 8, fontWeight: "bold" }}>{s.avg}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* نمودار میله‌ای */}
        <View style={styles.chartBox}>
          <Text style={styles.chartTitle}>
            نمودار نمرات دروس (میله: نمره دانش‌آموز، خط: معدل کلاس)
          </Text>
          <Svg width={chartWidth} height={chartHeight}>
            {/* خطوط راهنما */}
            {[0, 5, 10, 15, 20].map((val) => {
              const y = chartHeight - (val / maxScore) * chartHeight;
              return (
                <React.Fragment key={val}>
                  <Line
                    x1={0}
                    y1={y}
                    x2={chartWidth}
                    y2={y}
                    stroke="#ddd"
                    strokeWidth={0.5}
                  />
                  <Text x={5} y={y} style={{ fontSize: 6 }}>
                    {val}
                  </Text>
                </React.Fragment>
              );
            })}

            {/* میله‌ها و خطوط */}
            {data.lessons.map((l, i) => {
              const x = i * (barWidth + gap) + gap / 2;
              const barHeight = ((l.score ?? 0) / maxScore) * chartHeight;
              const barY = chartHeight - barHeight;
              const classAvgY =
                chartHeight - (l.classAvg / maxScore) * chartHeight;

              return (
                <React.Fragment key={i}>
                  {/* میله نمره دانش‌آموز */}
                  <Rect
                    x={x}
                    y={barY}
                    width={barWidth}
                    height={barHeight}
                    fill="#3b82f6"
                  />
                  {/* عدد روی میله */}
                  {l.score !== null && (
                    <Text
                      x={x + barWidth / 2}
                      y={barY - 2}
                      style={{ fontSize: 6, textAnchor: "middle" }}
                    >
                      {l.score}
                    </Text>
                  )}
                  {/* نقطه معدل کلاس (خط شکسته) */}
                  <Line
                    x1={x + barWidth / 2}
                    y1={classAvgY}
                    x2={
                      i < data.lessons.length - 1
                        ? (i + 1) * (barWidth + gap) + gap / 2 + barWidth / 2
                        : x + barWidth / 2
                    }
                    y2={
                      i < data.lessons.length - 1
                        ? chartHeight -
                          (data.lessons[i + 1].classAvg / maxScore) *
                            chartHeight
                        : classAvgY
                    }
                    stroke="#f59e0b"
                    strokeWidth={1.5}
                    strokeDasharray="3,3"
                  />
                  <Circle
                    cx={x + barWidth / 2}
                    cy={classAvgY}
                    r={1.5}
                    fill="#f59e0b"
                  />
                </React.Fragment>
              );
            })}
          </Svg>
          {/* برچسب دروس */}
          <View
            style={{
              flexDirection: "row-reverse",
              width: chartWidth,
              marginTop: 5,
            }}
          >
            {data.lessons.map((l, i) => (
              <View
                key={i}
                style={{ width: barWidth + gap, alignItems: "center" }}
              >
                <Text style={{ fontSize: 6 }}>{l.lessonTitle}</Text>
              </View>
            ))}
          </View>
          {/* راهنمای نمودار */}
          <View
            style={{
              flexDirection: "row-reverse",
              justifyContent: "center",
              gap: 15,
              marginTop: 5,
            }}
          >
            <View
              style={{ flexDirection: "row-reverse", alignItems: "center" }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  backgroundColor: "#3b82f6",
                  marginLeft: 3,
                }}
              />
              <Text style={{ fontSize: 7 }}>نمره دانش‌آموز</Text>
            </View>
            <View
              style={{ flexDirection: "row-reverse", alignItems: "center" }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "#f59e0b",
                  marginLeft: 3,
                }}
              />
              <Text style={{ fontSize: 7 }}>معدل کلاس</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
