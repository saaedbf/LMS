import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { AttendanceSheet } from "@/actions/attendanceActions";

/* ═══════════════════════════════════════════════
   تنظیمات اندازه (پویا)
   ═══════════════════════════════════════════════ */
type SizeConfig = {
  rowFont: number;
  headerFont: number;
  rowHeight: number;
  tableHeaderHeight: number;
  paddingPage: number;
};

function getSizeConfig(totalRows: number): SizeConfig {
  if (totalRows <= 20) {
    return {
      rowFont: 11,
      headerFont: 9,
      rowHeight: 22,
      tableHeaderHeight: 36,
      paddingPage: 20,
    };
  }
  if (totalRows <= 25) {
    return {
      rowFont: 10,
      headerFont: 9,
      rowHeight: 20,
      tableHeaderHeight: 34,
      paddingPage: 18,
    };
  }
  if (totalRows <= 30) {
    return {
      rowFont: 9.5,
      headerFont: 8.5,
      rowHeight: 19,
      tableHeaderHeight: 32,
      paddingPage: 16,
    };
  }
  if (totalRows <= 35) {
    return {
      rowFont: 9,
      headerFont: 8.5,
      rowHeight: 18,
      tableHeaderHeight: 30,
      paddingPage: 14,
    };
  }
  if (totalRows <= 40) {
    return {
      rowFont: 8,
      headerFont: 8,
      rowHeight: 17,
      tableHeaderHeight: 28,
      paddingPage: 12,
    };
  }
  if (totalRows <= 45) {
    return {
      rowFont: 7.5,
      headerFont: 7.5,
      rowHeight: 15,
      tableHeaderHeight: 26,
      paddingPage: 10,
    };
  }
  if (totalRows <= 50) {
    return {
      rowFont: 7,
      headerFont: 7,
      rowHeight: 14,
      tableHeaderHeight: 24,
      paddingPage: 10,
    };
  }
  return {
    rowFont: 6.5,
    headerFont: 6.5,
    rowHeight: 12,
    tableHeaderHeight: 22,
    paddingPage: 8,
  };
}

/* ═══════════════════════════════════════════════
   smartFit
   ═══════════════════════════════════════════════ */
function smartFit(
  text: string,
  baseFont: number,
  softMax: number,
  hardMax: number,
): { text: string; fontSize: number } {
  if (!text) return { text: "", fontSize: baseFont };
  const len = text.length;

  if (len <= softMax) return { text, fontSize: baseFont };

  if (len <= hardMax) {
    const overflow = len - softMax;
    const newFont = Math.max(baseFont - overflow * 0.2, baseFont - 2);
    return { text, fontSize: newFont };
  }

  return {
    text: text.slice(0, hardMax - 1) + "…",
    fontSize: Math.max(baseFont - 2, 6),
  };
}

/* ═══════════════════════════════════════════════
   محاسبه ارتفاع ردیف
   ═══════════════════════════════════════════════ */
const A4_HEIGHT = 842;
const HEADER_APPROX = 80;

function calculateRowHeight(totalRows: number, config: SizeConfig): number {
  const available =
    A4_HEIGHT -
    config.paddingPage * 2 -
    HEADER_APPROX -
    config.tableHeaderHeight;

  const rowHeight = available / totalRows;
  return Math.max(rowHeight, 10);
}

/* ═══════════════════════════════════════════════
   استایل‌ها
   ═══════════════════════════════════════════════ */
function makeStyles(config: SizeConfig, calculatedRowHeight: number) {
  return StyleSheet.create({
    page: {
      paddingVertical: config.paddingPage,
      paddingHorizontal: config.paddingPage,
      fontFamily: "IRANSans",
      fontSize: 10,
      direction: "rtl",
    },
    headerBox: {
      borderWidth: 1.5,
      borderColor: "#000",
      borderStyle: "solid",
      marginBottom: 4,
    },
    headerRow1: {
      flexDirection: "row-reverse",
    },
    headerCell: {
      flex: 1,
      padding: Math.max(2, config.headerFont / 2.5),
      borderLeftWidth: 1,
      borderLeftColor: "#000",
      borderLeftStyle: "solid",
      textAlign: "center",
      fontSize: config.headerFont,
      lineHeight: 1.5,
      fontWeight: "bold",
    },
    headerCellLast: {
      flex: 1,
      padding: Math.max(2, config.headerFont / 2.5),
      textAlign: "center",
      fontSize: config.headerFont,
      lineHeight: 1.5,
      fontWeight: "bold",
    },
    bold: {
      fontFamily: "IRANSans",
      fontWeight: "bold",
    },
    table: {
      width: "100%",
      borderWidth: 1,
      borderColor: "#000",
      borderStyle: "solid",
    },
    tableRow: {
      flexDirection: "row-reverse",
      borderBottomWidth: 1,
      borderBottomColor: "#000",
      borderBottomStyle: "solid",
      height: calculatedRowHeight,
    },
    tableRowLast: {
      flexDirection: "row-reverse",
      height: calculatedRowHeight,
    },
    tableHeader: {
      flexDirection: "row-reverse",
      borderBottomWidth: 1,
      borderBottomColor: "#000",
      borderBottomStyle: "solid",
      backgroundColor: "#f0f0f0",
      height: config.tableHeaderHeight,
    },
    cell: {
      paddingVertical: 0,
      paddingHorizontal: 1,
      borderLeftWidth: 1,
      borderLeftColor: "#000",
      borderLeftStyle: "solid",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
    },
    cellLast: {
      paddingVertical: 0,
      paddingHorizontal: 2,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
    },
    cellText: {
      fontSize: config.rowFont,
      textAlign: "center",
      width: "100%",
    },
    cellTextRight: {
      fontSize: config.rowFont,
      textAlign: "right",
      width: "100%",
      paddingRight: 4,
    },
    cellHeader: {
      paddingVertical: 1,
      paddingHorizontal: 1,
      borderLeftWidth: 1,
      borderLeftColor: "#000",
      borderLeftStyle: "solid",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
    },
    cellHeaderLast: {
      paddingVertical: 1,
      paddingHorizontal: 2,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
    },
    cellHeaderText: {
      fontSize: config.headerFont + 1,
      textAlign: "center",
      fontWeight: "bold",
      width: "100%",
    },
  });
}

/* ═══════════════════════════════════════════════
   عرض ستون‌ها
   ═══════════════════════════════════════════════ */
const COLS = {
  row: "6%",
  name: "24%",
  empty: "4%",
  desc: "10%",
};

const EMPTY_COLS_COUNT = 15;

/* ═══════════════════════════════════════════════
   تعداد ردیف کل
   ═══════════════════════════════════════════════ */
function getTotalRows(studentCount: number): number {
  if (studentCount <= 25) return 25;
  if (studentCount <= 35) return 35;
  if (studentCount <= 45) return 45;
  return 50;
}

/* ═══════════════════════════════════════════════
   کامپوننت اصلی
   ═══════════════════════════════════════════════ */
let fontsRegistered = false;

type Props = {
  sheets: AttendanceSheet[];
  regularFont: string;
  boldFont: string;
  splitLargeClasses?: boolean;
};

export function AttendancePdfDocument({
  sheets,
  regularFont,
  boldFont,
  splitLargeClasses = false,
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

  return (
    <Document>
      {sheets.map((sheet, idx) => (
        <AttendanceSheetPages
          key={idx}
          sheet={sheet}
          splitLargeClasses={splitLargeClasses}
        />
      ))}
    </Document>
  );
}

/* ═══════════════════════════════════════════════
   منطق تقسیم
   ═══════════════════════════════════════════════ */
function AttendanceSheetPages({
  sheet,
  splitLargeClasses,
}: {
  sheet: AttendanceSheet;
  splitLargeClasses: boolean;
}) {
  const studentCount = sheet.students.length;

  if (splitLargeClasses && studentCount > 25) {
    const CHUNK = 25;
    const chunks: AttendanceSheet["students"][] = [];
    for (let i = 0; i < studentCount; i += CHUNK) {
      chunks.push(sheet.students.slice(i, i + CHUNK));
    }

    return (
      <>
        {chunks.map((chunk, idx) => (
          <AttendanceSheetPage
            key={idx}
            sheet={{ ...sheet, students: chunk }}
            pageLabel={`صفحه ${idx + 1} از ${chunks.length}`}
            startRowIndex={idx * CHUNK}
            totalRowsOverride={50}
          />
        ))}
      </>
    );
  }

  return <AttendanceSheetPage sheet={sheet} />;
}

/* ═══════════════════════════════════════════════
   یک برگه
   ═══════════════════════════════════════════════ */
function AttendanceSheetPage({
  sheet,
  startRowIndex = 0,
  pageLabel,
  totalRowsOverride,
}: {
  sheet: AttendanceSheet;
  startRowIndex?: number;
  pageLabel?: string;
  totalRowsOverride?: number;
}) {
  const studentCount = sheet.students.length;
  const totalRows = totalRowsOverride ?? getTotalRows(studentCount);
  const emptyCount = Math.max(0, totalRows - studentCount);

  const config = getSizeConfig(totalRows);
  const calculatedRowHeight = calculateRowHeight(totalRows, config);
  const styles = makeStyles(config, calculatedRowHeight);

  return (
    <Page size="A4" style={styles.page} wrap={false}>
      {/* ═══ هدر ═══ */}
      <View style={styles.headerBox} fixed>
        <View style={styles.headerRow1}>
          <View style={styles.headerCell}>
            <Text>جمهوری اسلامی ایران</Text>
            <Text>وزارت آموزش و پرورش</Text>
            <Text>سال تحصیلی: {sheet.academicYearTitle}</Text>
            <Text style={styles.bold}>کار برگ دبیر</Text>
          </View>

          <View style={styles.headerCell}>
            <Text>مدرسه: {sheet.schoolTitle}</Text>
            <Text>کد مدرسه: {sheet.schoolId}</Text>
            <Text>پایه: {sheet.payeTitle}</Text>
            <Text>کلاس: {sheet.klassTitle}</Text>
          </View>

          <View style={styles.headerCellLast}>
            <Text>
              <Text style={styles.bold}>درس: </Text>
              {sheet.darsTitle}
            </Text>
            <Text>
              <Text style={styles.bold}>نام دبیر: </Text>
              {sheet.teacherName || "..............."}
            </Text>
          </View>
        </View>

        {pageLabel && (
          <View
            style={{
              paddingVertical: 3,
              paddingHorizontal: 6,
              borderTopWidth: 1,
              borderTopColor: "#000",
              borderTopStyle: "solid",
            }}
          >
            <Text
              style={{
                fontSize: config.headerFont,
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              {pageLabel}
            </Text>
          </View>
        )}
      </View>

      {/* ═══ جدول ═══ */}
      <View style={styles.table}>
        {/* سرستون */}
        <View style={styles.tableHeader} fixed>
          <View style={{ ...styles.cellHeader, width: COLS.row }}>
            <Text style={styles.cellHeaderText}>ردیف</Text>
          </View>
          <View style={{ ...styles.cellHeader, width: COLS.name }}>
            <Text style={styles.cellHeaderText}>نام خانوادگی و نام</Text>
          </View>
          {Array.from({ length: EMPTY_COLS_COUNT }).map((_, i) => (
            <View key={i} style={{ ...styles.cellHeader, width: COLS.empty }}>
              <Text style={styles.cellHeaderText}> </Text>
            </View>
          ))}
          <View style={{ ...styles.cellHeaderLast, width: COLS.desc }}>
            <Text style={styles.cellHeaderText}>توضیحات</Text>
          </View>
        </View>

        {/* دانش‌آموزان */}
        {sheet.students.map((s, i) => {
          const fullName = `${s.lastName} ${s.firstName}`;
          const nameFit = smartFit(fullName, config.rowFont, 22, 30);

          return (
            <View
              key={s.id}
              style={
                i === sheet.students.length - 1 && emptyCount === 0
                  ? styles.tableRowLast
                  : styles.tableRow
              }
            >
              <View style={{ ...styles.cell, width: COLS.row }}>
                <Text style={styles.cellText}>{startRowIndex + i + 1}</Text>
              </View>
              <View style={{ ...styles.cell, width: COLS.name }}>
                <Text
                  style={{
                    ...styles.cellTextRight,
                    fontWeight: "bold",
                    fontSize: nameFit.fontSize,
                  }}
                >
                  {nameFit.text}
                </Text>
              </View>
              {Array.from({ length: EMPTY_COLS_COUNT }).map((_, j) => (
                <View key={j} style={{ ...styles.cell, width: COLS.empty }}>
                  <Text style={styles.cellText}> </Text>
                </View>
              ))}
              <View style={{ ...styles.cellLast, width: COLS.desc }}>
                <Text style={styles.cellText}> </Text>
              </View>
            </View>
          );
        })}

        {/* ردیف‌های خالی */}
        {Array.from({ length: emptyCount }).map((_, i) => (
          <View
            key={`empty-${i}`}
            style={i === emptyCount - 1 ? styles.tableRowLast : styles.tableRow}
          >
            <View style={{ ...styles.cell, width: COLS.row }}>
              <Text style={styles.cellText}>
                {startRowIndex + sheet.students.length + i + 1}
              </Text>
            </View>
            <View style={{ ...styles.cell, width: COLS.name }}>
              <Text style={styles.cellText}> </Text>
            </View>
            {Array.from({ length: EMPTY_COLS_COUNT }).map((_, j) => (
              <View key={j} style={{ ...styles.cell, width: COLS.empty }}>
                <Text style={styles.cellText}> </Text>
              </View>
            ))}
            <View style={{ ...styles.cellLast, width: COLS.desc }}>
              <Text style={styles.cellText}> </Text>
            </View>
          </View>
        ))}
      </View>
    </Page>
  );
}
