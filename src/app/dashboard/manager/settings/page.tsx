// app/dashboard/manager/settings/page.tsx
import { getSchoolSettings } from "@/actions/schoolSettingsActions";
import TitlePage from "@/components/widgets/TitlePage";
import SchoolSettingsForm from "./SchoolSettingsForm";

export default async function SettingsPage() {
  const res = await getSchoolSettings();

  if (res.status === "error") {
    return (
      <div className="p-4">
        <TitlePage>تنظیمات مدرسه</TitlePage>
        <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
          {res.error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-2">
      <TitlePage>تنظیمات مدرسه</TitlePage>

      <div className="container mx-auto max-w-3xl px-4 py-4">
        <SchoolSettingsForm
          initialData={{
            gradingType: res.data.gradingType,
            showTuitionInStudentPanel: res.data.showTuitionInStudentPanel,
            showDisciplinaryInStudentPanel:
              res.data.showDisciplinaryInStudentPanel,
            showAbsencesInStudentPanel: res.data.showAbsencesInStudentPanel,
            showReportCardsInStudentPanel:
              res.data.showReportCardsInStudentPanel,
          }}
        />
      </div>
    </div>
  );
}
