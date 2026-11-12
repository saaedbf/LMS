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
  Circle,
  Line,
} from "@react-pdf/renderer";

let fontsRegistered = false;

const COLORS = {
  primary: "#1e3a8a",
  secondary: "#0f766e",
  gold: "#b45309",
  goldLight: "#fbbf24",
  light: "#f8fafc",
  text: "#0f172a",
  muted: "#475569",
  border: "#cbd5e1",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
    fontFamily: "IRANSans",
    fontSize: 10,
    direction: "rtl",
    backgroundColor: COLORS.light,
  },

  /* ═══ نوار بالا — وسط‌چین ═══ */
  topBand: {
    height: 90,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  topBandTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
  },
  topBandSubtitle: {
    fontSize: 10,
    color: COLORS.goldLight,
    marginTop: 4,
    textAlign: "center",
  },
  topBandMeta: {
    fontSize: 9,
    color: "#cbd5e1",
    marginTop: 2,
    textAlign: "center",
  },

  /* ═══ محتوا ═══ */
  content: {
    flex: 1,
    paddingHorizontal: 60,
    paddingTop: 24,
    paddingBottom: 24,
  },

  crestBox: {
    alignSelf: "center",
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: COLORS.gold,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },

  mainTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: 4,
  },
  mainSubtitle: {
    fontSize: 12,
    color: COLORS.muted,
    textAlign: "center",
    marginBottom: 14,
  },

  divider: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    gap: 8,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.gold },
  dividerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gold,
  },

  /* کارت مشخصات */
  infoCard: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 8,
    padding: 14,
    backgroundColor: "#ffffff",
  },
  infoCardTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  /* دو ستون موازی */
  infoGrid: {
    flexDirection: "row-reverse",
    gap: 16,
  },
  infoCol: {
    flex: 1,
  },

  /* ⬇⬇ ردیف‌ها: راست‌چین با «عنوان : مقدار» */
  infoRow: {
    flexDirection: "row-reverse",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e2e8f0",
  },
  infoRowLast: {
    flexDirection: "row-reverse",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 9.5,
    color: COLORS.muted,
    fontWeight: "bold",
  },
  infoColon: {
    fontSize: 9.5,
    color: COLORS.muted,
    fontWeight: "bold",
    marginHorizontal: 4,
  },
  infoValue: {
    fontSize: 10,
    color: COLORS.text,
    fontWeight: "bold",
    marginRight: 4,
  },

  /* نوار پایین */
  bottomBand: {
    height: 55,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 12,
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bottomText: { fontSize: 9, color: "#e2e8f0" },
  bottomBold: { fontSize: 11, color: COLORS.goldLight, fontWeight: "bold" },
});

type CoverData = {
  schoolTitle: string;
  schoolSubTitle: string | null;
  schoolId: number;
  academicYearTitle: string;
  managerName: string | null;
  deputyName: string | null;
  address: string | null;
  phone: string | null;
  doreTitle: string | null;
  teachersCount: number;
};

type Props = {
  data: CoverData;
  regularFont: string;
  boldFont: string;
};

export function WeeklyAttendanceCoverPdf({
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

  const today = new Date().toLocaleDateString("fa-IR");

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* ═══ نوار بالا — وسط‌چین ═══ */}
        <View style={styles.topBand}>
          <Text style={styles.topBandTitle}>جمهوری اسلامی ایران</Text>
          <Text style={styles.topBandSubtitle}>وزارت آموزش و پرورش</Text>
          <Text style={styles.topBandMeta}>
            سال تحصیلی {data.academicYearTitle}
          </Text>
        </View>

        {/* ═══ محتوا ═══ */}
        <View style={styles.content}>
          {/* نشان */}
          <View style={styles.crestBox}>
            <Svg width={60} height={60} viewBox="0 0 70 70">
              <Rect
                x={10}
                y={25}
                width={50}
                height={35}
                fill={COLORS.primary}
                rx={3}
              />
              <Line
                x1={35}
                y1={25}
                x2={35}
                y2={60}
                stroke={COLORS.goldLight}
                strokeWidth={2}
              />
              <Line
                x1={14}
                y1={32}
                x2={32}
                y2={32}
                stroke="#ffffff"
                strokeWidth={1.5}
              />
              <Line
                x1={14}
                y1={38}
                x2={32}
                y2={38}
                stroke="#ffffff"
                strokeWidth={1.5}
              />
              <Line
                x1={14}
                y1={44}
                x2={32}
                y2={44}
                stroke="#ffffff"
                strokeWidth={1.5}
              />
              <Line
                x1={38}
                y1={32}
                x2={56}
                y2={32}
                stroke="#ffffff"
                strokeWidth={1.5}
              />
              <Line
                x1={38}
                y1={38}
                x2={56}
                y2={38}
                stroke="#ffffff"
                strokeWidth={1.5}
              />
              <Line
                x1={38}
                y1={44}
                x2={56}
                y2={44}
                stroke="#ffffff"
                strokeWidth={1.5}
              />
              <Circle cx={35} cy={15} r={8} fill={COLORS.gold} />
              <Circle cx={35} cy={15} r={4} fill="#ffffff" />
            </Svg>
          </View>

          <Text style={styles.mainTitle}>دفتر حضور و غیاب دبیران</Text>
          <Text style={styles.mainSubtitle}>
            سال تحصیلی {data.academicYearTitle}
          </Text>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <View style={styles.dividerDot} />
            <View style={styles.dividerLine} />
          </View>

          {/* کارت مشخصات — دو ستونه */}
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>مشخصات مدرسه</Text>

            <View style={styles.infoGrid}>
              {/* ستون راست */}
              <View style={styles.infoCol}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>نام مدرسه</Text>
                  <Text style={styles.infoColon}>:</Text>
                  <Text style={styles.infoValue}>{data.schoolTitle}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>کد مدرسه</Text>
                  <Text style={styles.infoColon}>:</Text>
                  <Text style={styles.infoValue}>{data.schoolId}</Text>
                </View>

                {data.doreTitle && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>دوره تحصیلی</Text>
                    <Text style={styles.infoColon}>:</Text>
                    <Text style={styles.infoValue}>{data.doreTitle}</Text>
                  </View>
                )}

                <View style={styles.infoRowLast}>
                  <Text style={styles.infoLabel}>سال تحصیلی</Text>
                  <Text style={styles.infoColon}>:</Text>
                  <Text style={styles.infoValue}>{data.academicYearTitle}</Text>
                </View>
              </View>

              {/* ستون چپ */}
              <View style={styles.infoCol}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>تعداد دبیران</Text>
                  <Text style={styles.infoColon}>:</Text>
                  <Text style={styles.infoValue}>{data.teachersCount} نفر</Text>
                </View>

                {data.schoolSubTitle && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>عنوان دوم</Text>
                    <Text style={styles.infoColon}>:</Text>
                    <Text style={styles.infoValue}>{data.schoolSubTitle}</Text>
                  </View>
                )}

                {data.managerName && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>مدیر مدرسه</Text>
                    <Text style={styles.infoColon}>:</Text>
                    <Text style={styles.infoValue}>{data.managerName}</Text>
                  </View>
                )}

                {data.deputyName && (
                  <View style={styles.infoRowLast}>
                    <Text style={styles.infoLabel}>معاون</Text>
                    <Text style={styles.infoColon}>:</Text>
                    <Text style={styles.infoValue}>{data.deputyName}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* ═══ نوار پایین ═══ */}
        <View style={styles.bottomBand}>
          <Text style={styles.bottomText}>تهیه شده در واحد آموزش مدرسه</Text>
          <Text style={styles.bottomBold}>تاریخ تنظیم: {today}</Text>
        </View>
      </Page>
    </Document>
  );
}
