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
  page: { padding: 20, fontFamily: "IRANSans", fontSize: 9, direction: "rtl" },
  header: {
    borderWidth: 1,
    borderColor: "#000",
    padding: 8,
    marginBottom: 10,
    textAlign: "center",
  },
  title: { fontSize: 14, fontWeight: "bold", marginBottom: 4 },
  subtitle: { fontSize: 10, marginBottom: 2 },
  table: { width: "100%", borderWidth: 1, borderColor: "#000" },
  th: {
    backgroundColor: "#f0f0f0",
    padding: 5,
    fontWeight: "bold",
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
    textAlign: "center",
  },
  td: {
    padding: 4,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
    textAlign: "center",
  },
  tdRight: {
    padding: 4,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
    textAlign: "right",
  },
});

let fontsRegistered = false;

export function TeacherGradesPdf({ data, regularFont, boldFont }: any) {
  if (!fontsRegistered) {
    Font.register({
      family: "IRANSans",
      fonts: [{ src: regularFont }, { src: boldFont, fontWeight: "bold" }],
    });
    fontsRegistered = true;
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>لیست نمرات کلاس</Text>
          <Text style={styles.subtitle}>
            مدرسه: {data.schoolTitle} | سال تحصیلی: {data.yearTitle}
          </Text>
          <Text style={styles.subtitle}>
            پایه: {data.payeTitle} | رشته: {data.reshtehTitle} | کلاس:{" "}
            {data.klassTitle}
          </Text>
          <Text
            style={{ ...styles.subtitle, fontWeight: "bold", marginTop: 4 }}
          >
            درس: {data.lessonTitle} | دوره: {data.periodTitle}
          </Text>
        </View>

        <View style={styles.table}>
          <View
            style={{ flexDirection: "row-reverse", backgroundColor: "#f0f0f0" }}
          >
            <Text style={[styles.th, { flex: 0.5 }]}>#</Text>
            <Text style={[styles.th, { flex: 2 }]}>نام و نام خانوادگی</Text>
            <Text style={[styles.th, { flex: 1.5 }]}>کد ملی</Text>

            {data.isTest ? (
              <>
                <Text style={[styles.th, { flex: 1 }]}>صحیح</Text>
                <Text style={[styles.th, { flex: 1 }]}>اشتباه</Text>
                <Text style={[styles.th, { flex: 1 }]}>بی‌پاسخ</Text>
              </>
            ) : null}

            <Text style={[styles.th, { flex: 1 }]}>نمره نهایی</Text>
          </View>

          {data.students.map((s: any, i: number) => (
            <View key={i} style={{ flexDirection: "row-reverse" }} wrap={false}>
              <Text style={[styles.td, { flex: 0.5 }]}>{i + 1}</Text>
              <Text style={[styles.tdRight, { flex: 2 }]}>{s.fullName}</Text>
              <Text style={[styles.td, { flex: 1.5 }]}>{s.nationalCode}</Text>

              {data.isTest ? (
                <>
                  <Text style={[styles.td, { flex: 1 }]}>
                    {s.correctCount ?? "-"}
                  </Text>
                  <Text style={[styles.td, { flex: 1 }]}>
                    {s.wrongCount ?? "-"}
                  </Text>
                  <Text style={[styles.td, { flex: 1 }]}>
                    {s.blankCount ?? "-"}
                  </Text>
                </>
              ) : null}

              <Text style={[styles.td, { flex: 1, fontWeight: "bold" }]}>
                {s.score !== null ? s.score : "-"}
              </Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
