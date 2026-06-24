import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  hint: string;
  icon: LucideIcon;
}

export function StatCard({ label, value, hint, icon: Icon }: StatCardProps) {
  return (
    <article className="panel p-4 transition duration-200 hover:-translate-y-0.5 hover:border-brand-500/60">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-normal text-slate-950 dark:text-white">{value}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{hint}</p>
        </div>
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-100">
          <Icon aria-hidden size={20} />
        </div>
      </div>
    </article>
  );
}
