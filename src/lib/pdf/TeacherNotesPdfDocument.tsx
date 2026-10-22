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

const GUTTER_WIDTH = 25;
const ROWS_PER_PAGE = 20;

const styles = StyleSheet.create({
  page: {
    paddingVertical: 15,
    fontFamily: "IRANSans",
    fontSize: 9,
    direction: "rtl",
    backgroundColor: "#ffffff",
    flexDirection: "column",
  },
  header: {
    borderWidth: 1.5,
    borderColor: "#000000",
    padding: 6,
    marginBottom: 8,
    backgroundColor: "#ffffff",
    flexDirection: "column",
  },
  headerRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#000000",
  },
  headerSubtitle: {
    fontSize: 9,
    color: "#000000",
  },

  /* ═══ جدول ═══ */
  table: {
    flex: 1,
    width: "100%",
    borderWidth: 1,
    borderColor: "#000000",
    borderStyle: "solid",
  },
  tableHeaderRow: {
    flexDirection: "row-reverse",
    backgroundColor: "#f0f0f0", // ⬅️ خاکستری روشن، در سیاه و سفید واضح
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    borderBottomStyle: "solid",
    height: 28,
  },
  th: {
    padding: 4,
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center",
    color: "#000000",
    borderLeftWidth: 1,
    borderLeftColor: "#000000",
    borderLeftStyle: "solid",
    justifyContent: "center",
  },
  tr: {
    flexDirection: "row-reverse",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    borderBottomStyle: "solid",
    flex: 1,
  },
  td: {
    padding: 2,
    borderLeftWidth: 1,
    borderLeftColor: "#000000",
    borderLeftStyle: "solid",
    justifyContent: "center",
  },
  tdText: {
    fontSize: 8,
    textAlign: "center",
    color: "#000000",
  },
});

/* ═══════════════════════════════════════════════ */
let fontsRegistered = false;

type Props = {
  sheets: AttendanceSheet[];
  regularFont: string;
  boldFont: string;
};

export function TeacherNotesPdfDocument({
  sheets,
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

  return (
    <Document>
      {sheets.map((sheet, idx) => (
        <React.Fragment key={idx}>
          <NotesPage sheet={sheet} pageNumber={1} gutterSide="right" />
          <NotesPage sheet={sheet} pageNumber={2} gutterSide="left" />
        </React.Fragment>
      ))}
    </Document>
  );
}

/* ═══════════════════════════════════════════════ */
function NotesPage({
  sheet,
  pageNumber,
  gutterSide,
}: {
  sheet: AttendanceSheet;
  pageNumber: number;
  gutterSide: "right" | "left";
}) {
  const paddingLeft = gutterSide === "left" ? 15 + GUTTER_WIDTH : 15;
  const paddingRight = gutterSide === "right" ? 15 + GUTTER_WIDTH : 15;

  // ⬅️ عرض ستون‌ها (جمع = ۱۰۰٪)
  const COLS = {
    index: "5%",
    date: "15%",
    current: "56%", // ⬅️ ۷۰٪ از فضای باقی‌مانده (80%) = 56%
    next: "24%", // ⬅️ ۳۰٪ از فضای باقی‌مانده (80%) = 24%
  };

  return (
    <Page size="A4" style={{ ...styles.page, paddingLeft, paddingRight }}>
      {/* هدر */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>{sheet.schoolTitle}</Text>
          <Text style={styles.headerTitle}>کلاس: {sheet.klassTitle}</Text>
        </View>
        <View style={styles.headerRow}>
          <Text style={styles.headerSubtitle}>درس: {sheet.darsTitle}</Text>
          <Text style={styles.headerSubtitle}>
            دبیر: {sheet.teacherName || "....................."}
          </Text>
        </View>
      </View>

      {/* جدول */}
      <View style={styles.table}>
        {/* سرستون */}
        <View style={styles.tableHeaderRow}>
          <View style={[styles.th, { width: COLS.index }]}>
            <Text>#</Text>
          </View>
          <View style={[styles.th, { width: COLS.date }]}>
            <Text>تاریخ</Text>
          </View>
          <View style={[styles.th, { width: COLS.current }]}>
            <Text>توضیحات جلسه جاری</Text>
          </View>
          <View style={[styles.th, { width: COLS.next }]}>
            <Text>توضیحات جلسه آینده</Text>
          </View>
        </View>

        {/* ردیف‌ها */}
        {Array.from({ length: ROWS_PER_PAGE }).map((_, i) => {
          const rowNum = (pageNumber - 1) * ROWS_PER_PAGE + i + 1;
          return (
            <View key={i} style={styles.tr}>
              <View style={[styles.td, { width: COLS.index }]}>
                <Text style={styles.tdText}>{rowNum}</Text>
              </View>
              <View style={[styles.td, { width: COLS.date }]} />
              <View style={[styles.td, { width: COLS.current }]} />
              <View style={[styles.td, { width: COLS.next }]} />
            </View>
          );
        })}
      </View>
    </Page>
  );
}
