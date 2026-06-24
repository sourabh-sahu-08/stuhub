export function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="grid min-h-screen place-items-center bg-mist text-ink dark:bg-slate-950 dark:text-white">
      <div className="flex items-center gap-3 text-sm font-semibold">
        <span className="h-3 w-3 animate-ping rounded-full bg-brand-500" />
        {label}
      </div>
    </div>
  );
}
