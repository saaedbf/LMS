import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Svg,
  Circle,
  Path,
} from "@react-pdf/renderer";
import type { TeacherCoverSheet } from "@/actions/attendanceActions";

/* ═══════════════════════════════════════════════
   استایل‌ها
   ═══════════════════════════════════════════════ */
const styles = StyleSheet.create({
  page: {
    paddingVertical: 20, // ⬅️ ۳۰ → ۲۰
    paddingHorizontal: 20, // ⬅️ ۳۰ → ۲۰
    fontFamily: "Vazirmatn",
    fontSize: 10,
    direction: "rtl",
    backgroundColor: "#ffffff",
  },

  card: {
    borderWidth: 2,
    borderColor: "#1e3a8a",
    borderStyle: "solid",
    borderRadius: 12,
    overflow: "hidden",
    flex: 1, // ⬅️ جدید
  },

  header: {
    backgroundColor: "#1e3a8a",
    paddingVertical: 20, // ⬅️ ۲۴ → ۲۰
    paddingHorizontal: 16,
    textAlign: "center",
  },
  headerTop: {
    fontSize: 11,
    color: "#c7d2fe",
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
  },
  headerTitle: {
    fontSize: 20, // ⬅️ ۲۲ → ۲۰
    color: "#ffffff",
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#c7d2fe",
    textAlign: "center",
  },

  schoolBox: {
    backgroundColor: "#eff6ff",
    borderBottomWidth: 1,
    borderBottomColor: "#bfdbfe",
    borderBottomStyle: "solid",
    padding: 14, // ⬅️ ۱۶ → ۱۴
    flexDirection: "row-reverse",
    justifyContent: "space-between",
  },
  schoolItem: {
    flex: 1,
    textAlign: "center",
    alignItems: "center",
  },
  schoolLabel: {
    fontSize: 9,
    color: "#64748b",
    marginBottom: 4,
    textAlign: "center",
  },
  schoolValue: {
    fontSize: 12, // ⬅️ ۱۳ → ۱۲
    color: "#1e3a8a",
    fontWeight: "bold",
    textAlign: "center",
  },

  teacherBox: {
    backgroundColor: "#f0fdf4",
    borderBottomWidth: 1,
    borderBottomColor: "#bbf7d0",
    borderBottomStyle: "solid",
    padding: 16, // ⬅️ ۲۰ → ۱۶
    alignItems: "center",
  },
  teacherLabel: {
    fontSize: 10,
    color: "#166534",
    marginBottom: 4,
    textAlign: "center",
  },
  teacherName: {
    fontSize: 20, // ⬅️ ۲۴ → ۲۰
    color: "#15803d",
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
  },
  teacherMeta: {
    fontSize: 10,
    color: "#4b5563",
    textAlign: "center",
  },

  classesSection: {
    padding: 14, // ⬅️ ۱۶ → ۱۴
    direction: "rtl",
    flex: 1, // ⬅️ جدید
  },
  classesTitle: {
    fontSize: 13, // ⬅️ ۱۴ → ۱۳
    color: "#1e3a8a",
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },

  classCard: {
    backgroundColor: "#fef3c7",
    borderRightWidth: 4,
    borderRightColor: "#f59e0b",
    borderRightStyle: "solid",
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    direction: "rtl",
  },
  classHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  classTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#92400e",
    textAlign: "right", // ⬅️ مستقیم روی Text
  },
  classBadge: {
    fontSize: 9,
    color: "#78350f",
    backgroundColor: "#fde68a",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  classDars: {
    fontSize: 9,
    color: "#44403c",
    marginTop: 4,
    textAlign: "right", // ⬅️ مستقیم روی Text
  },
  classMeta: {
    fontSize: 9,
    color: "#78716c",
    marginBottom: 2,
    textAlign: "right", // ⬅️ مستقیم روی Text
  },

  footer: {
    backgroundColor: "#f8fafc",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    borderTopStyle: "solid",
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  footerText: {
    fontSize: 9,
    color: "#64748b",
    textAlign: "center",
  },
  footerBrand: {
    fontSize: 8,
    color: "#94a3b8",
    marginTop: 3,
    textAlign: "center",
  },

  decorativeRow: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    marginTop: 10,
  },
  badge: {
    backgroundColor: "#dbeafe",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginHorizontal: 3,
  },
  badgeText: {
    fontSize: 9,
    color: "#1e40af",
    fontWeight: "bold",
    textAlign: "center",
  },
});

/* ═══════════════════════════════════════════════
   آیکون‌های SVG ساده
   ═══════════════════════════════════════════════ */
function BookIcon({ color = "#1e3a8a", size = 24 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M4 4h7v16H4zM13 4h7v16h-7z"
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function TeacherIcon({ color = "#15803d", size = 32 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="8" r="4" fill="none" stroke={color} strokeWidth={2} />
      <Path
        d="M4 20c0-4 4-6 8-6s8 2 8 6"
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/* ═══════════════════════════════════════════════
   ثبت فونت
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
      family: "Vazirmatn",
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
  return (
    <Page size="A4" style={styles.page} wrap>
      <View style={styles.card}>
        {/* ═══ هدر ═══ */}
        <View style={styles.header}>
          <Text style={styles.headerTop}>جمهوری اسلامی ایران</Text>
          <Text style={styles.headerTitle}>کاربرگ دبیر</Text>
          <Text style={styles.headerSubtitle}>
            سال تحصیلی {teacher.academicYearTitle}
          </Text>

          {/* المان تزئینی */}
          <View style={styles.decorativeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>📚 آموزشی</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>✏️ دبیر</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>🎓 مدرسه</Text>
            </View>
          </View>
        </View>

        {/* ═══ مدرسه ═══ */}
        <View style={styles.schoolBox}>
          <View style={styles.schoolItem}>
            <Text style={styles.schoolLabel}>مدرسه</Text>
            <Text style={styles.schoolValue}>{teacher.schoolTitle}</Text>
          </View>
          <View style={styles.schoolItem}>
            <Text style={styles.schoolLabel}>کد مدرسه</Text>
            <Text style={styles.schoolValue}>{teacher.schoolId}</Text>
          </View>
          <View style={styles.schoolItem}>
            <Text style={styles.schoolLabel}>سال تحصیلی</Text>
            <Text style={styles.schoolValue}>{teacher.academicYearTitle}</Text>
          </View>
        </View>

        {/* ═══ دبیر ═══ */}
        <View style={styles.teacherBox}>
          <TeacherIcon color="#15803d" size={36} />
          <Text style={[styles.teacherLabel, { marginTop: 8 }]}>نام دبیر</Text>
          <Text style={styles.teacherName}>
            {teacher.teacherLastName} {teacher.teacherFirstName}
          </Text>
          <Text style={styles.teacherMeta}>
            کد ملی: {teacher.teacherNationalCode}
            {teacher.teacherPersonnelCode
              ? `  |  کد پرسنلی: ${teacher.teacherPersonnelCode}`
              : ""}
          </Text>
        </View>

        {/* ═══ کلاس‌ها ═══ */}
        <View style={styles.classesSection}>
          <View
            style={{
              flexDirection: "row-reverse",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
            }}
          >
            <BookIcon color="#1e3a8a" size={20} />
            <Text style={[styles.classesTitle, { marginRight: 8 }]}>
              کلاس‌ها و دروس
            </Text>
          </View>

          {teacher.classes.map((klass, idx) => (
            <View key={klass.klassId} style={styles.classCard}>
              <View style={styles.classHeader}>
                <Text style={styles.classTitle}>
                  {idx + 1}. {klass.klassTitle}
                </Text>
                <View style={styles.classBadge}>
                  <Text style={{ fontSize: 9, color: "#78350f" }}>
                    {klass.payeTitle}
                  </Text>
                </View>
              </View>
              <Text style={{ fontSize: 9, color: "#78716c", marginBottom: 4 }}>
                رشته: {klass.reshtehTitle}
              </Text>
              <Text style={styles.classDars}>
                📖 دروس: {klass.darsTitles.join("، ")}
              </Text>
            </View>
          ))}
        </View>

        {/* ═══ فوتر ═══ */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            این کاربرگ جهت استفاده در امور آموزشی صادر شده است
          </Text>
          <Text style={styles.footerBrand}>
            سیستم مدیریت مدرسه — {new Date().getFullYear()}
          </Text>
        </View>
      </View>
    </Page>
  );
}
