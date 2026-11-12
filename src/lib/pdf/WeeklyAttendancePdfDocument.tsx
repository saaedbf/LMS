import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import {
  WEEK_DAYS,
  WEEK_DAYS_FA,
  type WeeklyAttendanceData,
  type WeeklyTeacherRow,
} from "@/types/weeklyTeacherAttendanceTypes";

let fontsRegistered = false;

/* ═══════════ فقط ۵ روز: شنبه تا چهارشنبه ═══════════ */
const DAY_IDX = [0, 1, 2, 3, 4];

/* ═══════════ عرض ستون‌ها — پهن‌تر ═══════════ */
const ROWNO_W = "4%";
const NAME_W = "17%";
const DAY_W = "15.8%"; // (100 - 4 - 17) / 5
const IN_W = "18%";
const OUT_W = "18%";
const SIGN_W = "64%";

/* ═══════════ تعداد ردیف در هر صفحه ═══════════ */
const ROWS_PER_PAGE = 12;

/* ═══════════ استایل‌ها ═══════════ */
const styles = StyleSheet.create({
  page: {
    paddingTop: 14,
    paddingBottom: 14,
    paddingLeft: 20,
    paddingRight: 20,
    fontFamily: "IRANSans",
    fontSize: 8,
    direction: "rtl",
  },
  headerBox: {
    borderWidth: 1,
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
    fontSize: 7,
    lineHeight: 1.4,
  },
  headerCellLast: {
    flex: 1,
    padding: 4,
    textAlign: "center",
    fontSize: 7,
    lineHeight: 1.4,
  },
  titleBar: {
    borderTopWidth: 1,
    borderTopColor: "#000",
    paddingVertical: 2,
    backgroundColor: "#f0f0f0",
  },
  titleText: { fontSize: 9, fontWeight: "bold", textAlign: "center" },
  bold: { fontWeight: "bold" },

  table: { width: "100%", borderWidth: 1, borderColor: "#000" },

  headerRow1: {
    flexDirection: "row-reverse",
    backgroundColor: "#e5e7eb",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  headerRow2: {
    flexDirection: "row-reverse",
    backgroundColor: "#f3f4f6",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  thRowNo: {
    width: ROWNO_W,
    borderLeftWidth: 0.5,
    borderLeftColor: "#000",
    paddingVertical: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  thName: {
    width: NAME_W,
    borderLeftWidth: 0.5,
    borderLeftColor: "#000",
    paddingVertical: 4,
    paddingHorizontal: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  thDay: {
    width: DAY_W,
    borderLeftWidth: 0.5,
    borderLeftColor: "#000",
    paddingVertical: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  thSubIn: {
    width: IN_W,
    borderLeftWidth: 0.5,
    borderLeftColor: "#000",
    paddingVertical: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  thSubOut: {
    width: OUT_W,
    borderLeftWidth: 0.5,
    borderLeftColor: "#000",
    paddingVertical: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  thSubSign: {
    width: SIGN_W,
    borderLeftWidth: 0.5,
    borderLeftColor: "#000",
    paddingVertical: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  thText: { fontSize: 7, fontWeight: "bold", textAlign: "center" },
  thTextSm: { fontSize: 6.5, fontWeight: "bold", textAlign: "center" },
  dateText: {
    fontSize: 6,
    color: "#374151",
    textAlign: "center",
    marginTop: 1,
  },

  /* ارتفاع ردیف — بیشتر برای ۱۲ ردیف */
  row: {
    flexDirection: "row-reverse",
    borderBottomWidth: 0.5,
    borderBottomColor: "#000",
    minHeight: 34,
  },
  rowLast: {
    flexDirection: "row-reverse",
    minHeight: 34,
  },
  tdRowNo: {
    width: ROWNO_W,
    borderLeftWidth: 0.5,
    borderLeftColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  tdRowNoText: { fontSize: 8, textAlign: "center" },
  tdName: {
    width: NAME_W,
    borderLeftWidth: 0.5,
    borderLeftColor: "#000",
    justifyContent: "center",
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  tdNameText: { fontSize: 8.5, textAlign: "right", fontWeight: "bold" },
  tdDayWrap: {
    width: DAY_W,
    borderLeftWidth: 0.5,
    borderLeftColor: "#000",
    flexDirection: "row-reverse",
  },
  tdIn: {
    width: IN_W,
    borderLeftWidth: 0.5,
    borderLeftColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  tdOut: {
    width: OUT_W,
    borderLeftWidth: 0.5,
    borderLeftColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  tdSign: {
    width: SIGN_W,
    justifyContent: "center",
    alignItems: "center",
  },
});

/* ═══════════ کامپوننت اصلی ═══════════ */
type Props = {
  data: WeeklyAttendanceData;
  regularFont: string;
  boldFont: string;
};

export function WeeklyAttendancePdfDocument({
  data,
  regularFont,
  boldFont,
}: Props) {
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

  // فقط دبیرانی که در حداقل یکی از این ۵ روز درس دارند
  const rows: WeeklyTeacherRow[] = data.rows.filter((r) =>
    DAY_IDX.some((i) => r.days[i] !== null),
  );

  // تقسیم به صفحات ۱۲ ردیفی
  const chunks: WeeklyTeacherRow[][] = [];
  for (let i = 0; i < rows.length; i += ROWS_PER_PAGE) {
    chunks.push(rows.slice(i, i + ROWS_PER_PAGE));
  }
  if (chunks.length === 0) chunks.push([]);

  return (
    <Document>
      {chunks.map((chunk, pageIdx) => (
        <WeeklyPage
          key={pageIdx}
          data={data}
          chunk={chunk}
          pageIdx={pageIdx}
          totalPages={chunks.length}
          globalStartIndex={pageIdx * ROWS_PER_PAGE}
          totalRows={rows.length}
        />
      ))}
    </Document>
  );
}

/* ═══════════ یک صفحه ═══════════ */
function WeeklyPage({
  data,
  chunk,
  pageIdx,
  totalPages,
  globalStartIndex,
  totalRows,
}: {
  data: WeeklyAttendanceData;
  chunk: WeeklyTeacherRow[];
  pageIdx: number;
  totalPages: number;
  globalStartIndex: number;
  totalRows: number;
}) {
  const empty = Math.max(0, ROWS_PER_PAGE - chunk.length);

  return (
    <Page size="A4" orientation="landscape" style={styles.page} wrap={false}>
      {/* ═══ هدر ═══ */}
      <View style={styles.headerBox}>
        <View style={styles.headerRow}>
          <View style={styles.headerCell}>
            <Text>جمهوری اسلامی ایران</Text>
            <Text>وزارت آموزش و پرورش</Text>
            <Text>سال تحصیلی: {data.academicYearTitle}</Text>
            <Text style={styles.bold}>دفتر حضور و غیاب هفتگی دبیران</Text>
          </View>
          <View style={styles.headerCell}>
            <Text>مدرسه: {data.schoolTitle}</Text>
            <Text>کد مدرسه: {data.schoolId}</Text>
            <Text>تعداد دبیران: {totalRows}</Text>
          </View>
          <View style={styles.headerCellLast}>
            <View
              style={{
                flexDirection: "row-reverse",
                justifyContent: "flex-end",
                gap: 10,
                marginTop: 4,
              }}
            >
              <Text style={{ fontSize: 9 }}>
                از تاریخ: .........................
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row-reverse",
                justifyContent: "flex-end",
                gap: 10,
                marginTop: 8,
              }}
            >
              <Text style={{ fontSize: 9 }}>
                تا تاریخ: .........................
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.titleBar}>
          <Text style={styles.titleText}>
            حضور و غیاب هفتگی دبیران —{" "}
            {DAY_IDX.map((i) => WEEK_DAYS_FA[WEEK_DAYS[i]]).join("، ")}
          </Text>
        </View>
      </View>

      {/* ═══ جدول ═══ */}
      <View style={styles.table}>
        {/* سرستون سطح ۱ */}
        <View style={styles.headerRow1}>
          <View style={styles.thRowNo}>
            <Text style={styles.thText}>#</Text>
          </View>
          <View style={styles.thName}>
            <Text style={styles.thText}>نام و نام خانوادگی</Text>
          </View>
          {DAY_IDX.map((i) => (
            <View key={i} style={styles.thDay}>
              <Text style={styles.thText}>{WEEK_DAYS_FA[WEEK_DAYS[i]]}</Text>
              <Text style={styles.dateText}>
                تاریخ: {data.weekDates[i] ?? ".............."}
              </Text>
            </View>
          ))}
        </View>

        {/* سرستون سطح ۲ */}
        <View style={styles.headerRow2}>
          <View style={styles.thRowNo} />
          <View style={styles.thName} />
          {DAY_IDX.map((i) => (
            <View
              key={i}
              style={{ width: DAY_W, flexDirection: "row-reverse" }}
            >
              <View style={styles.thSubIn}>
                <Text style={styles.thTextSm}>ورود</Text>
              </View>
              <View style={styles.thSubOut}>
                <Text style={styles.thTextSm}>خروج</Text>
              </View>
              <View style={styles.thSubSign}>
                <Text style={styles.thTextSm}>امضا</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ردیف‌های دبیران */}
        {chunk.map((r, i) => {
          const rowNumber = globalStartIndex + i + 1;
          return (
            <View key={r.teacherId} style={styles.row}>
              <View style={styles.tdRowNo}>
                <Text style={styles.tdRowNoText}>{rowNumber}</Text>
              </View>
              <View style={styles.tdName}>
                <Text style={styles.tdNameText}>
                  {r.lastName} {r.firstName}
                </Text>
              </View>
              {DAY_IDX.map((d) => {
                const hasClass = r.days[d] !== null;
                return (
                  <View key={d} style={styles.tdDayWrap}>
                    {hasClass ? (
                      <>
                        <View style={styles.tdIn} />
                        <View style={styles.tdOut} />
                        <View style={styles.tdSign} />
                      </>
                    ) : (
                      <>
                        <HatchedCell type="in" />
                        <HatchedCell type="out" />
                        <HatchedCell type="sign" />
                      </>
                    )}
                  </View>
                );
              })}
            </View>
          );
        })}

        {/* ردیف‌های خالی */}
        {Array.from({ length: empty }).map((_, i) => {
          const rowNumber = globalStartIndex + chunk.length + i + 1;
          return (
            <View
              key={`e-${i}`}
              style={i === empty - 1 ? styles.rowLast : styles.row}
            >
              <View style={styles.tdRowNo}>
                <Text style={styles.tdRowNoText}>{rowNumber}</Text>
              </View>
              <View style={styles.tdName}>
                <Text style={styles.tdNameText}> </Text>
              </View>
              {DAY_IDX.map((d) => (
                <View key={d} style={styles.tdDayWrap}>
                  <View style={styles.tdIn} />
                  <View style={styles.tdOut} />
                  <View style={styles.tdSign} />
                </View>
              ))}
            </View>
          );
        })}
      </View>
    </Page>
  );
}

/* ═══════════ سلول هاشوردار ═══════════ */
function HatchedCell({ type }: { type: "in" | "out" | "sign" }) {
  const width = type === "in" ? IN_W : type === "out" ? OUT_W : SIGN_W;
  const hasLeftBorder = type !== "sign";

  const diagLines = Array.from({ length: 6 });
  return (
    <View
      style={{
        width,
        borderLeftWidth: hasLeftBorder ? 0.5 : 0,
        borderLeftColor: "#000",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#e5e7eb",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {diagLines.map((_, i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            top: -8,
            left: i * 8 - 8,
            width: 0.5,
            height: "160%",
            backgroundColor: "#9ca3af",
            transform: "rotate(45deg)",
          }}
        />
      ))}
    </View>
  );
}
