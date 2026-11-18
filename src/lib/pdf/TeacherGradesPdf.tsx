import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// ⬇⬇ فونت در سطح ماژول
Font.register({
  family: "IRANSans",
  fonts: [
    {
      src: "/fonts/iransans-fanum/ttf/IRANSansWeb(FaNum).ttf",
      fontWeight: "normal",
    },
    {
      src: "/fonts/iransans-fanum/ttf/IRANSansWeb(FaNum)_Bold.ttf",
      fontWeight: "bold",
    },
  ],
});

function getSizeConfig(count: number) {
  if (count <= 20) {
    return {
      rowFont: 11,
      headerFont: 9,
      rowHeight: 22,
      headerHeight: 34,
      padding: 18,
    };
  }
  if (count <= 25) {
    return {
      rowFont: 10,
      headerFont: 9,
      rowHeight: 20,
      headerHeight: 32,
      padding: 16,
    };
  }
  if (count <= 30) {
    return {
      rowFont: 9.5,
      headerFont: 8.5,
      rowHeight: 18,
      headerHeight: 30,
      padding: 14,
    };
  }
  if (count <= 35) {
    return {
      rowFont: 9,
      headerFont: 8,
      rowHeight: 17,
      headerHeight: 28,
      padding: 12,
    };
  }
  return {
    rowFont: 8,
    headerFont: 7.5,
    rowHeight: 16,
    headerHeight: 26,
    padding: 10,
  };
}

const A4_HEIGHT = 842;
const HEADER_APPROX = 90;

const styles = StyleSheet.create({
  page: {
    paddingTop: 14,
    paddingBottom: 14,
    paddingLeft: 18,
    paddingRight: 18,
    fontFamily: "IRANSans",
    fontSize: 9,
    direction: "rtl",
  },

  /* هدر سه ستونه */
  headerBox: {
    borderWidth: 1.5,
    borderColor: "#000",
    marginBottom: 6,
  },
  headerRow: {
    flexDirection: "row-reverse",
  },
  headerCell: {
    flex: 1,
    padding: 4,
    borderLeftWidth: 1,
    borderLeftColor: "#000",
    textAlign: "center",
    fontSize: 8,
    lineHeight: 1.5,
    fontWeight: "bold",
  },
  headerCellLast: {
    flex: 1,
    padding: 4,
    textAlign: "center",
    fontSize: 8,
    lineHeight: 1.5,
    fontWeight: "bold",
  },
  titleBar: {
    borderTopWidth: 1,
    borderTopColor: "#000",
    paddingVertical: 3,
    backgroundColor: "#f0f0f0",
  },
  titleText: {
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
  },

  /* جدول */
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#000",
  },
  tableHeader: {
    flexDirection: "row-reverse",
    backgroundColor: "#f0f0f0",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  tableRow: {
    flexDirection: "row-reverse",
    borderBottomWidth: 0.5,
    borderBottomColor: "#666",
  },
  tableRowLast: {
    flexDirection: "row-reverse",
  },
  th: {
    padding: 2,
    borderLeftWidth: 0.5,
    borderLeftColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "bold",
    textAlign: "center",
  },
  thLast: {
    padding: 2,
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "bold",
    textAlign: "center",
  },
  td: {
    padding: 1,
    borderLeftWidth: 0.5,
    borderLeftColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  tdRight: {
    padding: 1,
    borderLeftWidth: 0.5,
    borderLeftColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "right",
  },
  tdLast: {
    padding: 1,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
});

export function TeacherGradesPdf({ data }: any) {
  const config = getSizeConfig(data.students.length);
  const totalRows = data.students.length;
  const available =
    A4_HEIGHT - config.padding * 2 - HEADER_APPROX - config.headerHeight;
  const calculatedRowHeight = Math.min(
    config.rowHeight,
    Math.max(available / Math.max(totalRows, 1), 10),
  );

  // ⬇⬇ عرض ستون‌ها — یکسان در هدر و جدول
  const COL = {
    rowNo: "4%",
    name: "22%",
    nationalCode: "14%",
    correct: "8%",
    wrong: "8%",
    blank: "8%",
    score: "10%",
  };
  // مجموع: ۴ + ۲۲ + ۱۴ + ۸ + ۸ + ۸ + ۱۰ = ۷۴٪
  // ۲۶٪ باقی‌مانده → به نام اضافه می‌کنیم
  const NAME_W = "48%"; // (۱۰۰ - ۴ - ۱۴ - ۸ - ۸ - ۸ - ۱۰)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ═══ هدر سه ستونه (بدون ارتباط با جدول) ═══ */}
        <View style={styles.headerBox} fixed>
          <View style={styles.headerRow}>
            <View style={styles.headerCell}>
              <Text>جمهوری اسلامی ایران</Text>
              <Text>وزارت آموزش و پرورش</Text>
              <Text>سال تحصیلی: {data.yearTitle}</Text>
              <Text style={{ fontWeight: "bold" }}>لیست نمرات کلاس</Text>
            </View>
            <View style={styles.headerCell}>
              <Text>مدرسه: {data.schoolTitle}</Text>
              <Text>پایه: {data.payeTitle}</Text>
              <Text>رشته: {data.reshtehTitle}</Text>
              <Text>کلاس: {data.klassTitle}</Text>
            </View>
            <View style={styles.headerCellLast}>
              <Text>
                <Text style={{ fontWeight: "bold" }}>درس: </Text>
                {data.lessonTitle}
              </Text>
              <Text>
                <Text style={{ fontWeight: "bold" }}>دوره: </Text>
                {data.periodTitle}
              </Text>
              <Text>
                <Text style={{ fontWeight: "bold" }}>تعداد: </Text>
                {data.students.length} نفر
              </Text>
            </View>
          </View>
          <View style={styles.titleBar}>
            <Text style={styles.titleText}>لیست نمرات</Text>
          </View>
        </View>

        {/* ═══ جدول — با عرض ستون‌های ثابت ═══ */}
        <View style={styles.table}>
          {/* سرستون */}
          <View style={styles.tableHeader}>
            <View style={[styles.th, { width: COL.rowNo }]}>
              <Text style={{ fontSize: config.headerFont }}>#</Text>
            </View>
            <View style={[styles.th, { width: NAME_W }]}>
              <Text style={{ fontSize: config.headerFont }}>
                نام و نام خانوادگی
              </Text>
            </View>
            <View style={[styles.th, { width: COL.nationalCode }]}>
              <Text style={{ fontSize: config.headerFont }}>کد ملی</Text>
            </View>

            {data.isTest && (
              <>
                <View style={[styles.th, { width: COL.correct }]}>
                  <Text style={{ fontSize: config.headerFont }}>صحیح</Text>
                </View>
                <View style={[styles.th, { width: COL.wrong }]}>
                  <Text style={{ fontSize: config.headerFont }}>اشتباه</Text>
                </View>
                <View style={[styles.th, { width: COL.blank }]}>
                  <Text style={{ fontSize: config.headerFont }}>بی‌پاسخ</Text>
                </View>
              </>
            )}

            <View style={[styles.thLast, { width: COL.score }]}>
              <Text style={{ fontSize: config.headerFont }}>نمره نهایی</Text>
            </View>
          </View>

          {/* ردیف‌ها */}
          {data.students.map((s: any, i: number) => (
            <View
              key={i}
              style={
                i === data.students.length - 1
                  ? [styles.tableRowLast, { height: calculatedRowHeight }]
                  : [styles.tableRow, { height: calculatedRowHeight }]
              }
              wrap={false}
            >
              <View style={[styles.td, { width: COL.rowNo }]}>
                <Text style={{ fontSize: config.rowFont }}>{i + 1}</Text>
              </View>
              <View style={[styles.tdRight, { width: NAME_W }]}>
                <Text style={{ fontSize: config.rowFont, fontWeight: "bold" }}>
                  {s.fullName}
                </Text>
              </View>
              <View style={[styles.td, { width: COL.nationalCode }]}>
                <Text style={{ fontSize: config.rowFont }}>
                  {s.nationalCode}
                </Text>
              </View>

              {data.isTest && (
                <>
                  <View style={[styles.td, { width: COL.correct }]}>
                    <Text style={{ fontSize: config.rowFont }}>
                      {s.correctCount ?? "-"}
                    </Text>
                  </View>
                  <View style={[styles.td, { width: COL.wrong }]}>
                    <Text style={{ fontSize: config.rowFont }}>
                      {s.wrongCount ?? "-"}
                    </Text>
                  </View>
                  <View style={[styles.td, { width: COL.blank }]}>
                    <Text style={{ fontSize: config.rowFont }}>
                      {s.blankCount ?? "-"}
                    </Text>
                  </View>
                </>
              )}

              <View style={[styles.tdLast, { width: COL.score }]}>
                <Text
                  style={{
                    fontSize: config.rowFont,
                    fontWeight: "bold",
                  }}
                >
                  {s.score !== null && s.score !== undefined ? s.score : "-"}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
