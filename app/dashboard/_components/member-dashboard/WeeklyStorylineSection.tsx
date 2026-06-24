import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MemberDashboardViewModel } from "./useMemberDashboardViewModel";

interface WeeklyStorylineSectionProps {
  viewModel: MemberDashboardViewModel;
}

export function WeeklyStorylineSection({ viewModel }: WeeklyStorylineSectionProps) {
  const {
    crossFeatureSignals,
    crossFeatureCompletion,
    weeklyCrossFeatureNarrative,
    weakestSignal,
  } = viewModel.storyline;

  return (
    <motion.section
      initial={viewModel.theme.prefersReducedMotion ? undefined : { opacity: 0, y: 14 }}
      animate={viewModel.theme.prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      className="rounded-3xl border border-theme-story-border bg-linear-to-br from-theme-story-from via-white to-theme-story-to p-5 md:p-6 shadow-sm"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-theme-story-heading">Alur Cerita Mingguan</p>
          <h2 className="font-brand-display text-xl md:text-2xl font-bold text-gray-900 mt-1">
            Narasi Progres Mingguan Lintas Fitur
          </h2>
          <p className="text-sm text-gray-600 mt-2 max-w-2xl">{weeklyCrossFeatureNarrative}</p>
        </div>

        <div className="rounded-2xl border border-theme-story-border bg-white px-4 py-3 min-w-40">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-theme-story-heading">Loop Weekly Fit</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{crossFeatureCompletion}%</p>
          <p className="text-[11px] text-gray-500 mt-1">keterisian sinyal lintas fitur</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 xs:grid-cols-2 lg:grid-cols-5">
        {crossFeatureSignals.map((signal) => {
          const progress = Math.round(Math.min(signal.count / signal.target, 1) * 100);
          return (
            <Link key={signal.key} href={signal.href}>
              <div className="rounded-2xl border border-white bg-white/90 p-3.5 hover:shadow-md hover:border-theme-story-border transition-all h-full">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-theme-story-heading">{signal.windowLabel}</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{signal.label}</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{signal.count}<span className="text-xs text-gray-500">/{signal.target}</span></p>
                <div className="mt-2 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full bg-linear-to-r from-theme-story-icon to-theme-story-heading" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {weakestSignal && (
        <div className="mt-4 rounded-xl border border-theme-story-border bg-white px-4 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-theme-story-heading">
            Prioritas minggu ini: perkuat <strong>{weakestSignal.label.toLowerCase()}</strong> agar progres lintas fitur lebih seimbang.
          </p>
          <Button asChild size="sm" variant="outline" className="bg-white border-theme-story-border text-theme-story-heading hover:bg-theme-story-from">
            <Link href={weakestSignal.href} className="inline-flex items-center gap-1.5">
              Fokus ke {weakestSignal.label}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
      )}
    </motion.section>
  );
}
