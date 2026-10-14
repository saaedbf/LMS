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
   تنظیمات اندازه (پویا بر اساس تعداد ردیف)
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
      tableHeaderHeight: 22,
      paddingPage: 24,
    };
  }
  if (totalRows <= 25) {
    return {
      rowFont: 10,
      headerFont: 9,
      rowHeight: 20,
      tableHeaderHeight: 20,
      paddingPage: 22,
    };
  }
  if (totalRows <= 30) {
    return {
      rowFont: 9.5,
      headerFont: 8.5,
      rowHeight: 19,
      tableHeaderHeight: 18,
      paddingPage: 20,
    };
  }
  if (totalRows <= 35) {
    return {
      rowFont: 9,
      headerFont: 8.5,
      rowHeight: 18,
      tableHeaderHeight: 18,
      paddingPage: 18,
    };
  }
  if (totalRows <= 40) {
    return {
      rowFont: 8,
      headerFont: 8,
      rowHeight: 17,
      tableHeaderHeight: 17,
      paddingPage: 16,
    };
  }
  if (totalRows <= 45) {
    return {
      rowFont: 7.5,
      headerFont: 7.5,
      rowHeight: 15,
      tableHeaderHeight: 16,
      paddingPage: 14,
    };
  }
  return {
    rowFont: 7,
    headerFont: 7,
    rowHeight: 14,
    tableHeaderHeight: 14,
    paddingPage: 14,
  };
}

/* ═══════════════════════════════════════════════
   smartFit: کوچک‌کردن فونت و برش متن بر اساس طول
   ═══════════════════════════════════════════════ */
function smartFit(
  text: string,
  baseFont: number,
  softMax: number,
  hardMax: number,
): { text: string; fontSize: number } {
  if (!text) return { text: "", fontSize: baseFont };

  const len = text.length;

  // کوتاه: فونت اصلی
  if (len <= softMax) {
    return { text, fontSize: baseFont };
  }

  // متوسط: فونت کوچک‌تر (تا ۲ واحد کمتر)
  if (len <= hardMax) {
    const overflow = len - softMax;
    const newFont = Math.max(baseFont - overflow * 0.2, baseFont - 2);
    return { text, fontSize: newFont };
  }

  // بلند: فونت کوچک‌تر + برش با …
  return {
    text: text.slice(0, hardMax - 1) + "…",
    fontSize: Math.max(baseFont - 2, 6),
  };
}

/* ═══════════════════════════════════════════════
   استایل‌های پویا
   ═══════════════════════════════════════════════ */
function makeStyles(config: SizeConfig) {
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
      padding: Math.max(2, config.headerFont / 3),
      borderLeftWidth: 1,
      borderLeftColor: "#000",
      borderLeftStyle: "solid",
      textAlign: "center",
      fontSize: config.headerFont,
      lineHeight: 1.4,
    },
    headerCellLast: {
      flex: 1,
      padding: Math.max(2, config.headerFont / 3),
      textAlign: "center",
      fontSize: config.headerFont,
      lineHeight: 1.4,
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
      minHeight: config.rowHeight,
    },
    tableRowLast: {
      flexDirection: "row-reverse",
      minHeight: config.rowHeight,
    },
    tableHeader: {
      flexDirection: "row-reverse",
      borderBottomWidth: 1,
      borderBottomColor: "#000",
      borderBottomStyle: "solid",
      backgroundColor: "#f0f0f0",
      minHeight: config.tableHeaderHeight,
    },
    cell: {
      paddingVertical: 0,
      paddingHorizontal: 1,
      borderLeftWidth: 1,
      borderLeftColor: "#000",
      borderLeftStyle: "solid",
      fontSize: config.rowFont,
      justifyContent: "center",
    },
    cellLast: {
      paddingVertical: 0,
      paddingHorizontal: 2,
      fontSize: config.rowFont,
      justifyContent: "center",
    },
    cellHeader: {
      paddingVertical: 1,
      paddingHorizontal: 1,
      borderLeftWidth: 1,
      borderLeftColor: "#000",
      borderLeftStyle: "solid",
      fontSize: config.headerFont - 1,
      textAlign: "center",
      fontWeight: "bold",
      justifyContent: "center",
    },
    cellHeaderLast: {
      paddingVertical: 1,
      paddingHorizontal: 2,
      fontSize: config.headerFont - 1,
      textAlign: "center",
      fontWeight: "bold",
      justifyContent: "center",
    },
    mono: {
      fontSize: config.rowFont - 0.5,
      textAlign: "center",
    },
  });
}

/* ═══════════════════════════════════════════════
   عرض ستون‌ها
   ═══════════════════════════════════════════════ */
const COLS = {
  row: "4%",
  code: "11%",
  name: "20%",
  empty: "4.5%",
  desc: "11%",
};

const EMPTY_COLS_COUNT = 12;

/* ═══════════════════════════════════════════════
   تعداد ردیف کل بر اساس تعداد دانش‌آموز
   ═══════════════════════════════════════════════ */
function getTotalRows(studentCount: number): number {
  if (studentCount <= 10) return 10;
  if (studentCount <= 15) return 15;
  if (studentCount <= 20) return 20;
  if (studentCount <= 25) return 25;
  if (studentCount <= 30) return 30;
  if (studentCount <= 35) return 35;
  if (studentCount <= 40) return 40;
  if (studentCount <= 45) return 45;
  return 45;
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
   منطق تقسیم به صفحات
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
}: {
  sheet: AttendanceSheet;
  startRowIndex?: number;
  pageLabel?: string;
}) {
  const studentCount = sheet.students.length;
  const totalRows = getTotalRows(studentCount);
  const emptyCount = Math.max(0, totalRows - studentCount);

  const config = getSizeConfig(totalRows);
  const styles = makeStyles(config);

  return (
    <Page size="A4" style={styles.page} wrap={false}>
      {/* ═══ هدر ═══ */}
      <View style={styles.headerBox} fixed>
        <View style={styles.headerRow1}>
          {/* ستون راست: وزارت + سال تحصیلی */}
          <View style={styles.headerCell}>
            <Text>جمهوری اسلامی ایران</Text>
            <Text>وزارت آموزش و پرورش</Text>
            <Text>سال تحصیلی: {sheet.academicYearTitle}</Text>
            <Text style={styles.bold}>کار برگ دبیر</Text>
          </View>

          {/* ستون وسط: مدرسه + کد + پایه + کلاس */}
          <View style={styles.headerCell}>
            <Text>مدرسه: {sheet.schoolTitle}</Text>
            <Text>کد مدرسه: {sheet.schoolId}</Text>
            <Text>پایه: {sheet.payeTitle}</Text>
            <Text>کلاس: {sheet.klassTitle}</Text>
          </View>

          {/* ستون چپ: درس + نام دبیر */}
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
          <Text style={{ ...styles.cellHeader, width: COLS.row }}>ردیف</Text>
          <Text style={{ ...styles.cellHeader, width: COLS.code }}>کد ملی</Text>
          <Text style={{ ...styles.cellHeader, width: COLS.name }}>
            نام و نام خانوادگی
          </Text>
          {Array.from({ length: EMPTY_COLS_COUNT }).map((_, i) => (
            <Text key={i} style={{ ...styles.cellHeader, width: COLS.empty }}>
              {" "}
            </Text>
          ))}
          <Text style={styles.cellHeaderLast}>توضیحات</Text>
        </View>

        {/* دانش‌آموزان */}
        {sheet.students.map((s, i) => {
          const fullName = `${s.firstName} ${s.lastName}`;
          const nameFit = smartFit(fullName, config.rowFont, 22, 30);
          const codeFit = smartFit(
            s.nationalCode,
            config.rowFont - 0.5,
            12,
            12,
          );

          return (
            <View
              key={s.id}
              style={
                i === sheet.students.length - 1 && emptyCount === 0
                  ? styles.tableRowLast
                  : styles.tableRow
              }
            >
              <Text
                style={{
                  ...styles.cell,
                  width: COLS.row,
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                {startRowIndex + i + 1}
              </Text>
              <Text
                style={{
                  ...styles.cell,
                  width: COLS.code,
                  ...styles.mono,
                  fontWeight: "bold",
                  fontSize: codeFit.fontSize,
                }}
              >
                {codeFit.text}
              </Text>
              <Text
                style={{
                  ...styles.cell,
                  width: COLS.name,
                  textAlign: "right",
                  fontWeight: "bold",
                  fontSize: nameFit.fontSize,
                }}
              >
                {nameFit.text}
              </Text>
              {Array.from({ length: EMPTY_COLS_COUNT }).map((_, j) => (
                <Text key={j} style={{ ...styles.cell, width: COLS.empty }}>
                  {" "}
                </Text>
              ))}
              <Text style={styles.cellLast}> </Text>
            </View>
          );
        })}

        {/* ردیف‌های خالی */}
        {Array.from({ length: emptyCount }).map((_, i) => (
          <View
            key={`empty-${i}`}
            style={i === emptyCount - 1 ? styles.tableRowLast : styles.tableRow}
          >
            <Text
              style={{
                ...styles.cell,
                width: COLS.row,
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              {startRowIndex + sheet.students.length + i + 1}
            </Text>
            <Text style={{ ...styles.cell, width: COLS.code }}> </Text>
            <Text style={{ ...styles.cell, width: COLS.name }}> </Text>
            {Array.from({ length: EMPTY_COLS_COUNT }).map((_, j) => (
              <Text key={j} style={{ ...styles.cell, width: COLS.empty }}>
                {" "}
              </Text>
            ))}
            <Text style={styles.cellLast}> </Text>
          </View>
        ))}
      </View>
    </Page>
  );
}
