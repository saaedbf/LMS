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

/**
 * تبدیل questionRange مثل "1-10" یا "1-10,15-20" یا "1 تا 10" به آرایه شماره سوال
 */
function expandQuestionRange(range: string | null | undefined): number[] {
  if (!range) return [];
  const nums: number[] = [];
  const parts = range.split(/[,،\s]+/).filter(Boolean);
  for (const part of parts) {
    const m = part.match(/^(\d+)\s*[-–—تا]+\s*(\d+)$/);
    if (m) {
      const a = parseInt(m[1], 10);
      const b = parseInt(m[2], 10);
      if (!isNaN(a) && !isNaN(b)) {
        const [from, to] = a <= b ? [a, b] : [b, a];
        for (let i = from; i <= to; i++) nums.push(i);
      }
      continue;
    }
    const single = part.match(/^(\d+)$/);
    if (single) nums.push(parseInt(single[1], 10));
  }
  return Array.from(new Set(nums)).sort((a, b) => a - b);
}

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
    fontSize: 7.5,
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
    fontSize: 7.5,
    textAlign: "center",
  },
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
    alignItems: "center",
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

// ⬅️ ۱. کامپوننت سازنده یک صفحه
function AcademicReportPage({ data }: { data: AcademicReportData }) {
  const maxScore = 20;
  const chartWidth = 480;
  const chartHeight = 130;
  const barWidth = 25;
  const gap =
    (chartWidth - 25 - data.lessons.length * barWidth) /
    (data.lessons.length + 1);

  return (
    <Page size="A4" style={styles.page}>
      {/* هدر */}
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

      {/* آمار */}
      <View style={styles.statsBox}>
        <View style={styles.statCard}>
          <Text style={styles.statTitle}>معدل کل</Text>
          <Text style={styles.statValue}>{data.studentAverage.toFixed(2)}</Text>
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

      {/* جدول */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <View style={[styles.th, { flex: 2.5 }]}>
            <Text style={styles.thText}>نام درس</Text>
          </View>
          <View style={[styles.th, { flex: 0.6 }]}>
            <Text style={styles.thText}>واحد</Text>
          </View>
          <View style={[styles.th, { flex: 1.2 }]}>
            <Text style={styles.thText}>دبیر</Text>
          </View>

          {data.period.examType === "TEST" && (
            <>
              <View style={[styles.th, { flex: 0.9 }]}>
                <Text style={styles.thText}>تعداد سوال</Text>
              </View>
              <View style={[styles.th, { flex: 0.9 }]}>
                <Text style={styles.thText}>صحیح</Text>
              </View>
              <View style={[styles.th, { flex: 0.6 }]}>
                <Text style={styles.thText}>اشتباه</Text>
              </View>
              <View style={[styles.th, { flex: 0.6 }]}>
                <Text style={styles.thText}>بی‌پاسخ</Text>
              </View>
              <View style={[styles.th, { flex: 0.6 }]}>
                <Text style={styles.thText}>درصد</Text>
              </View>
            </>
          )}

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

        {data.lessons.map((l, i) => (
          <View key={i} style={styles.tableRow}>
            <View style={[styles.td, { flex: 2.5 }]}>
              <Text
                style={{ fontSize: 7.5, textAlign: "right", paddingRight: 4 }}
              >
                {l.lessonTitle}
              </Text>
            </View>
            <View style={[styles.td, { flex: 0.6 }]}>
              <Text style={styles.tdText}>{l.units}</Text>
            </View>
            <View style={[styles.td, { flex: 1.2 }]}>
              <Text style={{ fontSize: 7, textAlign: "center" }}>
                {l.teacherName}
              </Text>
            </View>

            {data.period.examType === "TEST" && (
              <>
                <View style={[styles.td, { flex: 0.9 }]}>
                  <Text style={styles.tdText}>{l.questionCount ?? "-"}</Text>
                </View>
                <View style={[styles.td, { flex: 0.9 }]}>
                  <Text style={styles.tdText}>{l.correctCount ?? "-"}</Text>
                </View>
                <View style={[styles.td, { flex: 0.6 }]}>
                  <Text style={styles.tdText}>{l.wrongCount ?? "-"}</Text>
                </View>
                <View style={[styles.td, { flex: 0.6 }]}>
                  <Text style={styles.tdText}>{l.blankCount ?? "-"}</Text>
                </View>
                <View style={[styles.td, { flex: 0.6 }]}>
                  <Text style={styles.tdText}>
                    {l.percentage !== null
                      ? `${l.percentage.toFixed(1)}%`
                      : "-"}
                  </Text>
                </View>
              </>
            )}

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
      </View>

      {/* سه نفر اول */}
      <View style={styles.top3Container}>
        <View style={styles.top3Box}>
          <Text style={styles.top3Title}>برترین‌های کلاس</Text>
          {data.top3Class.map((s, i) => (
            <View key={i} style={styles.top3Row}>
              <View
                style={{
                  flexDirection: "row-reverse",
                  alignItems: "center",
                  flex: 1,
                }}
              >
                <Text
                  style={[
                    styles.top3Text,
                    { fontWeight: "bold", marginLeft: 4 },
                  ]}
                >
                  . {toPersianNum(i + 1)}
                </Text>
                <Text style={styles.top3Text}>{s.name}</Text>
              </View>
              <Text style={styles.top3Avg}>{s.avg}</Text>
            </View>
          ))}
        </View>
        <View style={styles.top3Box}>
          <Text style={styles.top3Title}>برترین‌های پایه</Text>
          {data.top3Grade.map((s, i) => (
            <View key={i} style={styles.top3Row}>
              <View
                style={{
                  flexDirection: "row-reverse",
                  alignItems: "center",
                  flex: 1,
                }}
              >
                <Text
                  style={[
                    styles.top3Text,
                    { fontWeight: "bold", marginLeft: 4 },
                  ]}
                >
                  .{toPersianNum(i + 1)}
                </Text>
                <Text style={styles.top3Text}>
                  {s.name}{" "}
                  <Text style={{ fontSize: 7, color: "#64748b" }}>
                    ({s.klass})
                  </Text>
                </Text>
              </View>
              <Text style={styles.top3Avg}>{s.avg}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* نمودار */}
      <View style={{ width: chartWidth, alignSelf: "flex-start" }}>
        <View style={{ flexDirection: "row", width: chartWidth }}>
          <View
            style={{
              width: 25,
              height: chartHeight,
              justifyContent: "space-between",
              alignItems: "center",
              borderLeftWidth: 1,
              borderLeftColor: "#cbd5e1",
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
                {toPersianNum(val)}
              </Text>
            ))}
          </View>

          <View style={{ flex: 1, height: chartHeight, position: "relative" }}>
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

            <View
              style={{
                flexDirection: "row-reverse",
                width: "100%",
                height: "100%",
                alignItems: "flex-end",
                position: "absolute",
                top: 0,
                left: 0,
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
                    }}
                  >
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
                      {l.score !== null && l.score !== undefined
                        ? toPersianNum(l.score)
                        : "-"}
                    </Text>
                    <View
                      style={{
                        width: barWidth,
                        height: barHeight,
                        backgroundColor: "#3b82f6",
                        opacity: 0.5,
                        borderTopLeftRadius: 2,
                        borderTopRightRadius: 2,
                      }}
                    />
                  </View>
                );
              })}
            </View>

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
                  const step = barWidth + gap;
                  const plotWidth = chartWidth - 25;
                  const currentXFromRight = step * i + step / 2;
                  const nextXFromRight = step * (i + 1) + step / 2;
                  const currentX = plotWidth - currentXFromRight;
                  const nextX = plotWidth - nextXFromRight;
                  const currentY =
                    chartHeight - ((l.classAvg ?? 0) / 20) * chartHeight;
                  const nextY =
                    chartHeight -
                    ((data.lessons[i + 1].classAvg ?? 0) / 20) * chartHeight;
                  return (
                    <Line
                      key={i}
                      x1={currentX}
                      y1={currentY}
                      x2={nextX}
                      y2={nextY}
                      stroke="#f59e0b"
                      strokeWidth={1.5}
                    />
                  );
                })}
                {data.lessons.map((l, i) => {
                  const step = barWidth + gap;
                  const plotWidth = chartWidth - 25;
                  const xFromRight = step * i + step / 2;
                  const x = plotWidth - xFromRight;
                  const y =
                    chartHeight - ((l.classAvg ?? 0) / 20) * chartHeight;
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
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            width: chartWidth,
            marginTop: 4,
            alignItems: "flex-start",
          }}
        >
          <View style={{ width: 25 }} />
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
        </View>
      </View>

      <View style={styles.chartLegend}>
        <View style={styles.legendItem}>
          <View style={{ ...styles.legendDot, backgroundColor: "#3b82f6" }} />
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

      {/* ═══════════ پاسخ‌نامه (فقط آزمون تستی) ═══════════ */}
      {/* ⬅️ صفحه جدید + نمایش هر درس با عنوان و سوالات همون درس */}
      {data.period.examType === "TEST" &&
        data.lessons.some((l) => l.answerKey) && (
          <View style={{ marginTop: 15 }} break>
            <Text
              style={{
                fontSize: 11,
                fontWeight: "bold",
                marginBottom: 8,
                textAlign: "center",
                backgroundColor: "#e2e8f0",
                paddingVertical: 4,
                borderWidth: 1,
                borderColor: "#000",
              }}
            >
              پاسخ‌نامه آزمون
            </Text>

            {data.lessons.map((lesson, lessonIdx) => {
              if (!lesson.answerKey) return null;

              const lessonRange = expandQuestionRange(
                (lesson as any).questionRange,
              );
              const allKeyNums = Object.keys(lesson.answerKey)
                .map((k) => parseInt(k, 10))
                .filter((n) => !isNaN(n))
                .sort((a, b) => a - b);

              const qNums =
                lessonRange.length > 0
                  ? allKeyNums.filter((n) => lessonRange.includes(n))
                  : allKeyNums;

              if (qNums.length === 0) return null;

              return (
                <View key={lessonIdx} style={{ marginBottom: 10 }} wrap={false}>
                  {/* عنوان درس */}
                  <View
                    style={{
                      flexDirection: "row-reverse",
                      alignItems: "center",
                      backgroundColor: "#f1f5f9",
                      borderWidth: 1,
                      borderColor: "#000",
                      paddingHorizontal: 6,
                      paddingVertical: 3,
                      marginBottom: 4,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 9,
                        fontWeight: "bold",
                        color: "#1e3a8a",
                      }}
                    >
                      {lesson.lessonTitle}
                    </Text>
                    {lessonRange.length > 0 && (
                      <Text
                        style={{
                          fontSize: 7,
                          color: "#64748b",
                          marginRight: 6,
                        }}
                      >
                        (سوالات {toPersianNum(lessonRange[0])} تا{" "}
                        {toPersianNum(lessonRange[lessonRange.length - 1])})
                      </Text>
                    )}
                  </View>

                  {/* گرید ۴ ستونی سوالات */}
                  <View
                    style={{
                      flexDirection: "row-reverse",
                      flexWrap: "wrap",
                    }}
                  >
                    {qNums.map((qNum) => {
                      const keyAns = Number(
                        (lesson.answerKey as Record<string, number>)[qNum],
                      );
                      const rawStudent = (
                        lesson.studentAnswers as Record<string, number> | null
                      )?.[qNum];
                      const studentAns =
                        rawStudent === undefined || rawStudent === null
                          ? 0
                          : Number(rawStudent);

                      const isBlank = !studentAns || studentAns === 0;
                      const isCorrect = !isBlank && studentAns === keyAns;

                      return (
                        <View
                          key={qNum}
                          style={{
                            width: "25%",
                            flexDirection: "row-reverse",
                            alignItems: "center",
                            borderBottomWidth: 0.5,
                            borderBottomColor: "#e2e8f0",
                            paddingVertical: 2,
                            paddingHorizontal: 2,
                          }}
                        >
                          <Text
                            style={{
                              width: 16,
                              fontSize: 7,
                              fontWeight: "bold",
                              textAlign: "center",
                            }}
                          >
                            {toPersianNum(qNum)}
                          </Text>

                          {[1, 2, 3, 4].map((opt) => {
                            const isStudentChoice = studentAns === opt;
                            const isKeyChoice = keyAns === opt;
                            return (
                              <View
                                key={opt}
                                style={{
                                  width: 10,
                                  height: 10,
                                  borderRadius: 5,
                                  borderWidth: 0.8,
                                  borderColor: "#000",
                                  backgroundColor: isStudentChoice
                                    ? "#000"
                                    : "transparent",
                                  marginHorizontal: 1,
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                {isKeyChoice && (
                                  <Text
                                    style={{
                                      fontSize: 7,
                                      color: isStudentChoice
                                        ? "#fff"
                                        : "#16a34a",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    ✓
                                  </Text>
                                )}
                              </View>
                            );
                          })}

                          <Text
                            style={{
                              fontSize: 6,
                              marginRight: 2,
                              fontWeight: "bold",
                              color: isBlank
                                ? "#888"
                                : isCorrect
                                  ? "#16a34a"
                                  : "#dc2626",
                            }}
                          >
                            {isBlank ? "سفید" : isCorrect ? "صحیح" : "اشتباه"}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>
        )}
    </Page>
  );
}

// ⬅️ ۲. کامپوننت تکی
export function AcademicReportPdf({ data, regularFont, boldFont }: any) {
  if (!fontsRegistered) {
    Font.register({
      family: "IRANSans",
      fonts: [{ src: regularFont }, { src: boldFont, fontWeight: "bold" }],
    });
    fontsRegistered = true;
  }
  return (
    <Document>
      <AcademicReportPage data={data} />
    </Document>
  );
}

// ⬅️ ۳. کامپوننت چندتایی
export function MultiAcademicReportPdf({
  dataList,
  regularFont,
  boldFont,
}: any) {
  if (!fontsRegistered) {
    Font.register({
      family: "IRANSans",
      fonts: [{ src: regularFont }, { src: boldFont, fontWeight: "bold" }],
    });
    fontsRegistered = true;
  }
  return (
    <Document>
      {dataList.map((data: any, idx: number) => (
        <AcademicReportPage key={idx} data={data} />
      ))}
    </Document>
  );
}
