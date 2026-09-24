import { ArticleEditorShell } from "../_components/ArticleEditorShell";

export default function EditArticleLoading() {
  return (
    <ArticleEditorShell backHref="/dashboard/articles?tab=mine" title="Edit artikel" description="Perbarui tulisanmu dengan tenang.">
      <div className="animate-pulse space-y-7" aria-label="Memuat editor artikel">
        <div className="space-y-2"><div className="h-4 w-28 rounded bg-slate-200" /><div className="h-11 w-full rounded-xl bg-slate-100" /></div>
        <div className="space-y-2"><div className="h-4 w-20 rounded bg-slate-200" /><div className="h-11 w-full rounded-xl bg-slate-100" /></div>
        <div className="space-y-3 rounded-2xl border border-slate-100 p-5"><div className="h-4 w-32 rounded bg-slate-200" /><div className="h-36 w-full rounded-xl bg-slate-100" /></div>
        <div className="space-y-2"><div className="h-4 w-24 rounded bg-slate-200" /><div className="h-64 w-full rounded-2xl bg-slate-100" /></div>
        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5"><div className="h-11 w-24 rounded-xl bg-slate-100" /><div className="h-11 w-36 rounded-xl bg-slate-200" /></div>
      </div>
    </ArticleEditorShell>
  );
}
