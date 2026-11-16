import { getDeputies } from "@/actions/deputyActions";
import { PAGE_SIZE } from "@/lib/schemas/env";
import { Props } from "@/types/myTypes";
import DeputyComp from "./DeputyComp";
import { getCurrentContext } from "@/actions/authActions";

export default async function DeputiesPage({ searchParams }: Props) {
  const params = await searchParams;

  const page = Number(params.page) || 1;
  const pageSize = PAGE_SIZE;

  const allDeputies = await getDeputies();
  const context = await getCurrentContext();
  // صفحه‌بندی دستی (چون getDeputies همه را برمی‌گرداند)
  const totalCount = allDeputies.length;
  const start = (page - 1) * pageSize;
  const listItems = allDeputies.slice(start, start + pageSize);
  if (!context.schoolId || !context.academicYearId) {
    return <div>کانتکست یافت نشد</div>;
  }
  return (
    <DeputyComp
      listItems={listItems}
      totalCount={totalCount}
      pageSize={pageSize}
      schoolId={context.schoolId}
      academicYearId={context.academicYearId}
    />
  );
}
