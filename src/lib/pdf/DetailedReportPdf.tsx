import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 15, fontFamily: "IRANSans", fontSize: 9, direction: "rtl" },
  header: {
    borderWidth: 1,
    borderColor: "#000",
    padding: 8,
    marginBottom: 8,
    textAlign: "center",
  },
  title: { fontSize: 14, fontWeight: "bold" },
  table: { width: "100%", borderWidth: 1, borderColor: "#000" },

  cell: {
    padding: 4,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
    justifyContent: "center",
  },
  headerCell: {
    backgroundColor: "#f0f0f0",
  },
  textCenter: { textAlign: "center", fontSize: 8 },
  textRight: { textAlign: "right", fontSize: 8 },
  textBold: { fontWeight: "bold", fontSize: 8 },
});

let fontsRegistered = false;

export function DetailedReportPdf({ data, regularFont, boldFont }: any) {
  if (!fontsRegistered) {
    Font.register({
      family: "IRANSans",
      fonts: [{ src: regularFont }, { src: boldFont, fontWeight: "bold" }],
    });
    fontsRegistered = true;
  }

  const fixedWidths = { name: 15, code: 10, avg: 10 };
  const remaining = 100 - fixedWidths.name - fixedWidths.code - fixedWidths.avg;
  const lessonWidth =
    data.lessons.length > 0 ? remaining / data.lessons.length : 0;

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page} wrap>
        {/* ⬅️ هدر — در هر صفحه تکرار می‌شود */}
        <View style={styles.header} fixed>
          <Text style={styles.title}>گزارش تفضیلی نمرات</Text>
          <Text style={{ fontSize: 10, marginTop: 4 }}>
            کلاس: {data.klassTitle} | دوره: {data.periodTitle}
          </Text>
        </View>

        <View style={styles.table}>
          {/* ⬅️ سرستون‌ها — در هر صفحه تکرار می‌شوند */}
          <View style={{ flexDirection: "row-reverse" }} fixed>
            <View style={[styles.cell, styles.headerCell, { width: "4%" }]}>
              <Text style={[styles.textCenter, styles.textBold]}>#</Text>
            </View>
            <View
              style={[
                styles.cell,
                styles.headerCell,
                { width: `${fixedWidths.name}%` },
              ]}
            >
              <Text style={[styles.textCenter, styles.textBold]}>
                نام و نام خانوادگی
              </Text>
            </View>
            <View
              style={[
                styles.cell,
                styles.headerCell,
                { width: `${fixedWidths.code}%` },
              ]}
            >
              <Text style={[styles.textCenter, styles.textBold]}>کد ملی</Text>
            </View>

            {data.lessons.map((l: string, i: number) => (
              <View
                key={i}
                style={[
                  styles.cell,
                  styles.headerCell,
                  { width: `${lessonWidth}%` },
                ]}
              >
                <Text style={[styles.textCenter, styles.textBold]}>{l}</Text>
              </View>
            ))}

            <View
              style={[
                styles.cell,
                styles.headerCell,
                { width: `${fixedWidths.avg}%` },
              ]}
            >
              <Text style={[styles.textCenter, styles.textBold]}>معدل کل</Text>
            </View>
          </View>

          {/* ⬅️ ردیف‌ها */}
          {data.students.map((s: any, i: number) => (
            <View key={i} style={{ flexDirection: "row-reverse" }} wrap={false}>
              <View style={[styles.cell, { width: "4%" }]}>
                <Text style={styles.textCenter}>{i + 1}</Text>
              </View>
              <View style={[styles.cell, { width: `${fixedWidths.name}%` }]}>
                <Text style={styles.textRight}>{s.fullName}</Text>
              </View>
              <View style={[styles.cell, { width: `${fixedWidths.code}%` }]}>
                <Text style={styles.textCenter}>{s.nationalCode}</Text>
              </View>

              {s.scores.map((sc: any, j: number) => (
                <View
                  key={j}
                  style={[styles.cell, { width: `${lessonWidth}%` }]}
                >
                  <Text style={styles.textCenter}>
                    {sc.score !== null ? sc.score : "-"}
                  </Text>
                </View>
              ))}

              <View style={[styles.cell, { width: `${fixedWidths.avg}%` }]}>
                <Text style={[styles.textCenter, styles.textBold]}>
                  {s.average.toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
