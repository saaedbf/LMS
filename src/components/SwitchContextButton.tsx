"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeftRight } from "lucide-react";
import { getUserAssignments } from "@/actions/authActions";

type Props = {
  className?: string;
};

export default function SwitchContextButton({ className }: Props) {
  const [isPending, startTransition] = useTransition();
  const [count, setCount] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    getUserAssignments(false)
      .then((a) => setCount(a.length))
      .catch(() => setCount(0));
  }, []);

  // ⬇⬇ تک‌نقشه یا هنوز لود نشده → هیچ چیز رندر نکن
  if (count === null || count <= 1) return null;

  const handleSwitch = () => {
    startTransition(async () => {
      router.push("/select-context");
    });
  };

  return (
    <button
      type="button"
      onClick={handleSwitch}
      disabled={isPending}
      className={
        className ||
        "inline-flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs text-white transition disabled:opacity-50"
      }
    >
      {isPending ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <ArrowLeftRight size={14} />
      )}
      تعویض نقش
    </button>
  );
}
