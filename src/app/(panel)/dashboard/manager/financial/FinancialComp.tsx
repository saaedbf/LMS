"use client";

import React, { useState } from "react";
import { toast } from "react-toastify";
import CreateBtn from "@/components/widgets/Elements/CreateBtn";
import HeadTr from "@/components/widgets/Elements/table/HeaddTr";
import Table from "@/components/widgets/Elements/table/Table";
import Tbody from "@/components/widgets/Elements/table/Tbody";
import Td from "@/components/widgets/Elements/table/Td";
import Tr from "@/components/widgets/Elements/table/Tr";
import TdActions from "@/components/widgets/Elements/table/TdActions";
import ThActions from "@/components/widgets/Elements/table/ThActions";
import SortableTh from "@/components/widgets/Elements/table/SortableTh";
import TextSearch from "@/components/widgets/Elements/table/TextSearch";
import DataTableLayout from "@/components/widgets/DataTableLayout";
import Pagination from "@/components/widgets/Pagination";
import TitlePage from "@/components/widgets/TitlePage";
import ActionModal from "@/components/widgets/ActionModal";
import EditBtn from "@/components/widgets/Elements/EditBtn";
import BackButton from "@/components/widgets/Elements/BackButton";
import { Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { convertGregorianToJalali } from "@/lib/dateUtils";
import { DebtCreateForm } from "./DebtCreateForm";
import { PaymentCreateForm } from "./PaymentCreateForm";
import FinancialEditForm from "./FinancialEditForm";
import FinancialDeleteBtn from "./FinancialDeleteBtn";
import { DEBT_TYPE_LABELS, PAYMENT_METHOD_LABELS } from "@/lib/financialLabels";
import FinancialStatusModal from "./FinancialStatusModal";

type FinancialItem = {
  id: string;
  type: "DEBT" | "PAYMENT";
  amount: bigint;
  debtType: string | null;
  paymentMethod: string | null;
  date: Date;
  description: string | null;
  studentEnrollment: {
    student: { id: string; firstName: string; lastName: string };
    paye: { id: number; title: string } | null;
    klass: { id: string; title: string } | null;
    id: string; // ⬅️ این خط اضافه شود
  };
};

type Props = {
  listItems: FinancialItem[];
  totalCount: number;
  pageSize: number;
  payes: { id: number; title: string }[];
  klasses: { id: string; title: string; payeId: number }[];
};

export default function FinancialComp({
  listItems,
  totalCount,
  pageSize,
  payes,
  klasses,
}: Props) {
  const [openDebt, setOpenDebt] = useState(false);
  const [openPayment, setOpenPayment] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="p-2">
      <TitlePage>مدیریت مالی</TitlePage>
      <BackButton
        href="/dashboard/manager"
        label="بازگشت به پنل مدیریت"
        className="mb-3"
      />

      <div className="container mx-auto px-4 py-2">
        <DataTableLayout
          totalCount={totalCount}
          action={
            <div className="flex flex-wrap gap-2">
              {/* ⬅️ دکمه ثبت بدهکاری */}
              <ActionModal
                title="ثبت بدهکاری"
                desc="ثبت بدهکاری برای یک یا چند دانش‌آموز"
                open={openDebt}
                setOpen={setOpenDebt}
                trigger={
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
                  >
                    <TrendingDown size={16} />
                    ثبت بدهکاری
                  </button>
                }
                contentClassName="w-[95vw] max-w-3xl"
              >
                <DebtCreateForm
                  payes={payes}
                  klasses={klasses}
                  onCreated={() => setOpenDebt(false)}
                  setOpen={setOpenDebt}
                />
              </ActionModal>

              {/* ⬅️ دکمه ثبت پرداخت */}
              <ActionModal
                title="ثبت پرداخت"
                desc="ثبت پرداخت برای یک یا چند دانش‌آموز"
                open={openPayment}
                setOpen={setOpenPayment}
                trigger={
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                  >
                    <TrendingUp size={16} />
                    ثبت پرداخت
                  </button>
                }
                contentClassName="w-[95vw] max-w-3xl"
              >
                <PaymentCreateForm
                  payes={payes}
                  klasses={klasses}
                  onCreated={() => setOpenPayment(false)}
                  setOpen={setOpenPayment}
                />
              </ActionModal>
            </div>
          }
        >
          <Table>
            <thead>
              <HeadTr>
                <SortableTh field="studentName" sortable title="دانش‌آموز">
                  <TextSearch field="studentName" placeholder="جستجو..." />
                </SortableTh>
                <SortableTh field="paye" sortable title="پایه / کلاس">
                  <TextSearch field="paye" placeholder="جستجو..." />
                </SortableTh>
                <SortableTh field="type" title="نوع">
                  <span className="text-xs text-gray-400">
                    بدهکاری / پرداخت
                  </span>
                </SortableTh>
                <SortableTh field="category" title="دسته‌بندی">
                  <span className="text-xs text-gray-400">نوع / روش</span>
                </SortableTh>
                <SortableTh field="amount" sortable title="مبلغ (تومان)">
                  <span className="text-xs text-gray-400">تومان</span>
                </SortableTh>
                <SortableTh field="date" sortable title="تاریخ">
                  <span className="text-xs text-gray-400">شمسی</span>
                </SortableTh>
                <SortableTh field="description" title="شرح">
                  <TextSearch field="description" placeholder="جستجو..." />
                </SortableTh>
                <ThActions>عملیات</ThActions>
              </HeadTr>
            </thead>
            <Tbody>
              {listItems.length === 0 ? (
                <Tr>
                  <Td>
                    <div className="py-6 text-center text-gray-500">
                      تراکنشی برای نمایش وجود ندارد.
                    </div>
                  </Td>
                </Tr>
              ) : (
                listItems.map((item) => {
                  const isEditOpen = editingId === item.id;
                  const isDebt = item.type === "DEBT";

                  return (
                    <Tr key={item.id}>
                      <Td>
                        <div className="font-medium text-zinc-900">
                          {item.studentEnrollment.student.firstName}{" "}
                          {item.studentEnrollment.student.lastName}
                        </div>
                      </Td>
                      <Td>
                        <div className="flex flex-col text-xs">
                          <span>
                            {item.studentEnrollment.paye?.title || "-"}
                          </span>
                          <span className="text-zinc-500">
                            {item.studentEnrollment.klass?.title || "-"}
                          </span>
                        </div>
                      </Td>
                      <Td>
                        {isDebt ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700">
                            <TrendingDown size={12} />
                            بدهکاری
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                            <TrendingUp size={12} />
                            پرداخت
                          </span>
                        )}
                      </Td>
                      <Td>
                        <span className="text-xs text-zinc-600">
                          {isDebt
                            ? DEBT_TYPE_LABELS[item.debtType || ""] || "-"
                            : PAYMENT_METHOD_LABELS[item.paymentMethod || ""] ||
                              "-"}
                        </span>
                      </Td>
                      <Td>
                        <span
                          className={`font-bold ${isDebt ? "text-rose-600" : "text-emerald-600"}`}
                          dir="ltr"
                        >
                          {Number(item.amount).toLocaleString("fa-IR")}
                        </span>
                      </Td>
                      <Td>{convertGregorianToJalali(new Date(item.date))}</Td>
                      <Td>
                        <span
                          className="line-clamp-1 max-w-[180px] text-xs text-zinc-500"
                          title={item.description || "-"}
                        >
                          {item.description || "-"}
                        </span>
                      </Td>
                      <TdActions>
                        <div className="flex items-center justify-center gap-1">
                          {/* ⬅️ دکمه وضعیت مالی */}
                          <FinancialStatusModal
                            enrollmentId={item.studentEnrollment.id}
                            studentName={`${item.studentEnrollment.student.firstName} ${item.studentEnrollment.student.lastName}`}
                          />
                          <ActionModal
                            title="ویرایش تراکنش"
                            desc="ویرایش اطلاعات تراکنش مالی"
                            open={isEditOpen}
                            setOpen={(isOpen) =>
                              setEditingId(isOpen ? item.id : null)
                            }
                            contentClassName="w-[95vw] max-w-md"
                            trigger={
                              <span onClick={() => setEditingId(item.id)}>
                                <EditBtn />
                              </span>
                            }
                          >
                            <FinancialEditForm
                              key={item.id}
                              transaction={{
                                id: item.id,
                                type: item.type,
                                amount: Number(item.amount),
                                debtType: item.debtType,
                                paymentMethod: item.paymentMethod,
                                date: item.date,
                                description: item.description,
                                studentName: `${item.studentEnrollment.student.firstName} ${item.studentEnrollment.student.lastName}`,
                              }}
                              setOpen={(isOpen) => {
                                if (!isOpen) setEditingId(null);
                              }}
                            />
                          </ActionModal>

                          <FinancialDeleteBtn
                            transactionId={item.id}
                            studentName={`${item.studentEnrollment.student.firstName} ${item.studentEnrollment.student.lastName}`}
                            amount={Number(item.amount)}
                          />
                        </div>
                      </TdActions>
                    </Tr>
                  );
                })
              )}
            </Tbody>
          </Table>
        </DataTableLayout>

        <Pagination pageSize={pageSize} totalCount={totalCount} />
      </div>
    </div>
  );
}
