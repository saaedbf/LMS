import { getDeputies } from "@/actions/deputyActions";
import { PAGE_SIZE } from "@/lib/schemas/env";
import { Props } from "@/types/myTypes";
import DeputyComp from "./DeputyComp";

export default async function DeputiesPage({ searchParams }: Props) {
  const params = await searchParams;

  const page = Number(params.page) || 1;
  const pageSize = PAGE_SIZE;

  const allDeputies = await getDeputies();

  // صفحه‌بندی دستی (چون getDeputies همه را برمی‌گرداند)
  const totalCount = allDeputies.length;
  const start = (page - 1) * pageSize;
  const listItems = allDeputies.slice(start, start + pageSize);

  return (
    <DeputyComp
      listItems={listItems}
      totalCount={totalCount}
      pageSize={pageSize}
    />
  );
}
