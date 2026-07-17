// lib/table-utils.ts

export type Column = {
  field: string;
  type: "string" | "number";
  searchable?: boolean;
  sortable?: boolean;
  // برای فیلدهای relation
  relation?: {
    model: string; // نام مدل در Prisma
    field: string; // نام فیلد در مدل مرتبط
    include?: {
      // ✅ include تو در تو
      [key: string]: boolean | { include: any };
    };
  };
};

// ============== ساخت Where ==============
export function buildWhere(
  columns: Column[],
  searchField?: string,
  searchValue?: string,
): any {
  if (!searchField || !searchValue) return {};

  const column = columns.find((c) => c.field === searchField && c.searchable);
  if (!column) return {};

  // 🔹 فیلد relation
  if (column.relation) {
    return {
      [column.relation.model]: {
        [column.relation.field]: {
          contains: searchValue,
          mode: "insensitive",
        },
      },
    };
  }

  // 🔹 فیلد عددی
  if (column.type === "number") {
    const num = Number(searchValue);
    if (isNaN(num)) return {};
    return { [searchField]: num };
  }

  // 🔹 فیلد متنی
  return {
    [searchField]: {
      contains: searchValue,
      mode: "insensitive",
    },
  };
}

// ============== ساخت OrderBy ==============
export function buildOrderBy(
  columns: Column[],
  sortField?: string,
  sortOrder?: "asc" | "desc",
): any {
  if (!sortField) return { id: "desc" };

  const column = columns.find((c) => c.field === sortField && c.sortable);
  if (!column) return { id: "desc" };

  // 🔹 فیلد relation
  if (column.relation) {
    return {
      [column.relation.model]: {
        [column.relation.field]: sortOrder || "asc",
      },
    };
  }

  // 🔹 فیلد معمولی
  return {
    [sortField]: sortOrder || "asc",
  };
}

// ============== ساخت Include با پشتیبانی از تو در تو ==============
export function buildInclude(columns: Column[]): any {
  const include: any = {};

  columns.forEach((col) => {
    if (col.relation) {
      // ✅ اگر include تو در تو داشته باشه
      if (col.relation.include) {
        include[col.relation.model] = {
          include: col.relation.include,
        };
      } else {
        include[col.relation.model] = true;
      }
    }
  });

  return include;
}

// lib/table-helpers.ts
export async function getTableData<T>(
  model: any,
  columns: Column[],
  page: number,
  pageSize: number,
  options: {
    sortField?: string;
    sortOrder?: "asc" | "desc";
    searchField?: string;
    searchValue?: string;
    extraInclude?: any; // ✅ اضافه کردن include اضافی
  },
): Promise<{ items: T[]; total: number }> {
  const skip = (page - 1) * pageSize;

  const where = buildWhere(columns, options.searchField, options.searchValue);
  const orderBy = buildOrderBy(columns, options.sortField, options.sortOrder);

  // ✅ ترکیب include از columns با include اضافی
  const include = {
    ...buildInclude(columns),
    ...options.extraInclude,
  };

  const [items, total] = await Promise.all([
    model.findMany({
      where,
      orderBy,
      include,
      skip,
      take: pageSize,
    }),
    model.count({ where }),
  ]);

  return { items, total };
}
