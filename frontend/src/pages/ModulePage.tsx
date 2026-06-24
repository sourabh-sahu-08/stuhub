import { ArrowLeft, Cpu } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { navItems } from "../components/layout/navigation";
import { useAuth } from "../context/AuthContext";

export function ModulePage() {
  const { module } = useParams();
  const { user } = useAuth();

  const currentItem = navItems.find((item) => item.path === `/${module}`);

  if (!currentItem) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Module Not Found</h2>
        <Link to="/" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
          <ArrowLeft size={16} /> Return to Dashboard
        </Link>
      </div>
    );
  }

  const Icon = currentItem.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50"
          aria-label="Back to Dashboard"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            {user?.role} Workspace
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {currentItem.label}
          </h1>
        </div>
      </div>

      {/* Feature Construction Canvas */}
      <div className="relative overflow-hidden rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 p-12 text-center min-h-[60vh] flex flex-col items-center justify-center">
        {/* Decorative Grid Pattern */}
        <div className="absolute inset-0 -z-10 opacity-30 dark:opacity-[0.15] bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="max-w-md space-y-5">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 shadow-md">
            <Icon size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Ready for Implementation
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              This module's placeholders and dummy data have been removed. The route is set up, authenticated, and ready to be built from scratch.
            </p>
          </div>

          <div className="rounded-lg bg-indigo-500/5 border border-indigo-500/10 p-4 text-left">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <Cpu size={14} /> Developer checklist
            </h3>
            <ul className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-400 list-disc list-inside">
              <li>Define database model in <code className="text-indigo-600 dark:text-indigo-400">backend/src/models/</code></li>
              <li>Create Express routes in <code className="text-indigo-600 dark:text-indigo-400">backend/src/routes/</code></li>
              <li>Mount routes in <code className="text-indigo-600 dark:text-indigo-400">backend/src/app.ts</code></li>
              <li>Build user interface components right here</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
