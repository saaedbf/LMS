import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Svg,
  Line,
} from "@react-pdf/renderer";
import type { TeacherCoverSheet } from "@/actions/attendanceActions";

/* ═══════════════════════════════════════════════
   استایل‌ها
   ═══════════════════════════════════════════════ */
const styles = StyleSheet.create({
  page: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    fontFamily: "IRANSans",
    fontSize: 9,
    direction: "rtl",
    backgroundColor: "#ffffff",
  },
  card: {
    borderWidth: 1.5,
    borderColor: "#1e3a8a",
    borderStyle: "solid",
    borderRadius: 8,
    overflow: "hidden",
    flex: 1,
  },
  header: {
    backgroundColor: "#1e3a8a",
    paddingVertical: 12,
    textAlign: "center",
  },
  headerTitle: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "bold",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 10,
    color: "#c7d2fe",
    marginTop: 4,
    textAlign: "center",
  },

  body: {
    flexDirection: "row-reverse",
    flex: 1,
  },
  rightColumn: {
    width: "35%",
    borderLeftWidth: 1,
    borderLeftColor: "#bfdbfe",
    borderLeftStyle: "solid",
    padding: 10,
    backgroundColor: "#f8fafc",
    flexDirection: "column",
  },
  leftColumn: {
    width: "65%",
    padding: 10,
    flexDirection: "column",
  },

  infoBox: {
    backgroundColor: "#ffffff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 8,
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 8,
    color: "#64748b",
    marginBottom: 2,
    textAlign: "right",
  },
  teacherName: {
    fontSize: 12,
    color: "#15803d",
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "right",
  },
  classTitle: {
    fontSize: 12,
    color: "#1e3a8a",
    fontWeight: "bold",
    marginBottom: 6,
    textAlign: "right",
  },
  classItem: {
    backgroundColor: "#fef3c7",
    borderRightWidth: 3,
    borderRightColor: "#f59e0b",
    borderRightStyle: "solid",
    borderRadius: 4,
    padding: 6,
    marginBottom: 6,
  },
  classItemTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#92400e",
    marginBottom: 2,
    textAlign: "right",
  },
  classItemDars: {
    fontSize: 10,
    color: "#4b5563",
    textAlign: "right",
  },

  scheduleTitle: {
    fontSize: 11,
    color: "#1e3a8a",
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#1e3a8a",
    borderStyle: "solid",
    flex: 1,
  },

  /* ─── هدر و سطرها ─── */
  tableHeaderRow: {
    flexDirection: "row-reverse",
    backgroundColor: "#1e3a8a",
  },
  tableRow: {
    flexDirection: "row-reverse",
    borderBottomWidth: 1,
    borderBottomColor: "#1e3a8a",
    borderBottomStyle: "solid",
    flex: 1,
  },

  /* ستون روز — عرض صریح (12%) */
  dayCell: {
    width: "12%",
    padding: 2,
    backgroundColor: "#eff6ff",
    fontWeight: "bold",
    fontSize: 11,
    textAlign: "center",
    justifyContent: "center",
    borderLeftWidth: 1,
    borderLeftColor: "#1e3a8a",
    borderLeftStyle: "solid",
  },
  dayCellHeader: {
    width: "12%",
    paddingVertical: 4,
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 12,
    textAlign: "center",
    borderLeftWidth: 1,
    borderLeftColor: "#ffffff",
    borderLeftStyle: "solid",
  },

  /* ستون‌های زنگ — flex: 1 */
  bellCellHeader: {
    flex: 1,
    paddingVertical: 4,
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 12,
    textAlign: "center",
    borderLeftWidth: 1,
    borderLeftColor: "#ffffff",
    borderLeftStyle: "solid",
  },
  bellCell: {
    flex: 1,
    padding: 0,
    borderLeftWidth: 1,
    borderLeftColor: "#bfdbfe",
    borderLeftStyle: "solid",
    position: "relative",
  },

  scheduleKlass: {
    fontSize: 11,
    color: "#1e3a8a",
    fontWeight: "bold",
    textAlign: "center",
  },
  scheduleDars: {
    fontSize: 10,
    color: "#4b5563",
    textAlign: "center",
  },

  footer: {
    backgroundColor: "#f8fafc",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    borderTopStyle: "solid",
    paddingVertical: 6,
    alignItems: "center",
  },
  footerText: {
    fontSize: 8,
    color: "#64748b",
    textAlign: "center",
  },
});

/* ═══════════════════════════════════════════════
   کامپوننت اصلی
   ═══════════════════════════════════════════════ */
let fontsRegistered = false;

type Props = {
  teachers: TeacherCoverSheet[];
  regularFont: string;
  boldFont: string;
};

export function TeacherCoverPdfDocument({
  teachers,
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
      {teachers.map((teacher) => (
        <TeacherCoverPage key={teacher.teacherId} teacher={teacher} />
      ))}
    </Document>
  );
}

/* ═══════════════════════════════════════════════
   یک برگه
   ═══════════════════════════════════════════════ */
function TeacherCoverPage({ teacher }: { teacher: TeacherCoverSheet }) {
  const DAYS: Record<string, string> = {
    SATURDAY: "شنبه",
    SUNDAY: "یکشنبه",
    MONDAY: "دوشنبه",
    TUESDAY: "سه‌شنبه",
    WEDNESDAY: "چهارشنبه",
    THURSDAY: "پنجشنبه",
  };
  const DAYS_ORDER = [
    "SATURDAY",
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
  ];

  /* ⬅️ هر (day, bell) می‌تونه ۱ یا ۲ درس داشته باشه (نصف‌زنگ) */
  const scheduleMap = new Map<
    string,
    Array<{
      klassTitle: string;
      darsTitle: string;
      isHalfBell: boolean;
    }>
  >();

  for (const s of teacher.schedules) {
    const key = `${s.day}-${s.bellIndex}`;
    const list = scheduleMap.get(key) ?? [];
    list.push({
      klassTitle: s.klassTitle,
      darsTitle: s.darsTitle,
      isHalfBell: s.isHalfBell,
    });
    scheduleMap.set(key, list);
  }

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.card}>
        {/* هدر */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}> برنامه دبیر</Text>
          <Text style={styles.headerSubtitle}>
            سال تحصیلی {teacher.academicYearTitle} | {teacher.schoolTitle}
          </Text>
        </View>

        {/* بدنه */}
        <View style={styles.body}>
          {/* ستون راست */}
          <View style={styles.rightColumn}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>نام دبیر</Text>
              <Text style={styles.teacherName}>
                {teacher.teacherFirstName} {teacher.teacherLastName}
              </Text>
            </View>

            <Text style={styles.classTitle}>کلاس‌ها و دروس</Text>
            {teacher.classes.map((klass) => (
              <View key={klass.klassId} style={styles.classItem}>
                <Text style={styles.classItemTitle}>{klass.klassTitle}</Text>
                <Text style={styles.classItemDars}>
                  {klass.darsTitles.join("، ")}
                </Text>
              </View>
            ))}
          </View>

          {/* ستون چپ: برنامه */}
          <View style={styles.leftColumn}>
            <Text style={styles.scheduleTitle}>برنامه هفتگی</Text>
            <View style={styles.table}>
              {/* سرستون */}
              <View style={styles.tableHeaderRow}>
                <View style={styles.dayCellHeader}>
                  <Text>روز/زنگ</Text>
                </View>
                {Array.from({ length: teacher.bellCount }).map((_, idx) => (
                  <View key={idx} style={styles.bellCellHeader}>
                    <Text>زنگ {idx + 1}</Text>
                  </View>
                ))}
              </View>

              {/* سطرها */}
              {DAYS_ORDER.map((day) => (
                <View key={day} style={styles.tableRow}>
                  <View style={styles.dayCell}>
                    <Text>{DAYS[day]}</Text>
                  </View>
                  {Array.from({ length: teacher.bellCount }).map((_, idx) => {
                    const bell = idx + 1;
                    const items = scheduleMap.get(`${day}-${bell}`) ?? [];

                    return (
                      <View key={bell} style={styles.bellCell}>
                        <BellCellContent items={items} />
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* فوتر */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            سیستم مدیریت مدرسه — تولید شده در{" "}
            {new Date().toLocaleDateString("fa-IR")}
          </Text>
        </View>
      </View>
    </Page>
  );
}

/* ═══════════════════════════════════════════════
   محتوای یک سلول زنگ
   ═══════════════════════════════════════════════ */
function BellCellContent({
  items,
}: {
  items: Array<{ klassTitle: string; darsTitle: string; isHalfBell: boolean }>;
}) {
  if (items.length === 0) return null;

  /* حالت ۱: یک درسِ تمام‌زنگ */
  if (items.length === 1 && !items[0].isHalfBell) {
    return (
      <View
        style={{
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={styles.scheduleKlass}>{items[0].klassTitle}</Text>
        <Text style={styles.scheduleDars}>{items[0].darsTitle}</Text>
      </View>
    );
  }

  /* حالت ۲: یک درسِ نصف‌زنگ */
  if (items.length === 1 && items[0].isHalfBell) {
    return (
      <View style={{ width: "100%", height: "100%", position: "relative" }}>
        {/* خط مورب */}
        <Svg
          width="100%"
          height="100%"
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          <Line
            x1="0"
            y1="0"
            x2="100%"
            y2="100%"
            stroke="#f59e0b"
            strokeWidth={1}
          />
        </Svg>

        <View
          style={{ width: "100%", height: "100%", flexDirection: "column" }}
        >
          {/* نیمه اول (بالا) — راست‌چین */}
          <View
            style={{
              flex: 1,
              width: "100%",
              justifyContent: "center",
              paddingRight: 4,
              paddingTop: 4,
            }}
          >
            <Text style={[styles.scheduleKlass, { textAlign: "right" }]}>
              {items[0].klassTitle}
            </Text>
            <Text style={[styles.scheduleDars, { textAlign: "right" }]}>
              {items[0].darsTitle}
            </Text>
          </View>
          {/* نیمه دوم خالی */}
          <View style={{ flex: 1, width: "100%" }} />
        </View>
      </View>
    );
  }

  /* حالت ۳: دو درس (نصف‌زنگ کامل) */
  if (items.length === 2) {
    const top = items[0];
    const bottom = items[1];

    return (
      <View style={{ width: "100%", height: "100%", position: "relative" }}>
        {/* خط مورب */}
        <Svg
          width="100%"
          height="100%"
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          <Line
            x1="0"
            y1="0"
            x2="100%"
            y2="100%"
            stroke="#f59e0b"
            strokeWidth={1}
          />
        </Svg>

        <View
          style={{ width: "100%", height: "100%", flexDirection: "column" }}
        >
          {/* نیمه اول (بالا) — راست‌چین */}
          <View
            style={{
              flex: 1,
              width: "100%",
              justifyContent: "center",
              paddingRight: 4,
              paddingTop: 4,
            }}
          >
            <Text style={[styles.scheduleKlass, { textAlign: "right" }]}>
              {top.klassTitle}
            </Text>
            <Text style={[styles.scheduleDars, { textAlign: "right" }]}>
              {top.darsTitle}
            </Text>
          </View>

          {/* نیمه دوم (پایین) — چپ‌چین */}
          <View
            style={{
              flex: 1,
              width: "100%",
              justifyContent: "center",
              paddingLeft: 4,
              paddingBottom: 4,
            }}
          >
            <Text style={[styles.scheduleKlass, { textAlign: "left" }]}>
              {bottom.klassTitle}
            </Text>
            <Text style={[styles.scheduleDars, { textAlign: "left" }]}>
              {bottom.darsTitle}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  /* حالت ۴: بیش از ۲ درس */
  return (
    <View
      style={{
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        padding: 2,
      }}
    >
      <Text style={styles.scheduleKlass}>{items[0].klassTitle}</Text>
      <Text style={styles.scheduleDars}>+{items.length - 1}</Text>
    </View>
  );
}
