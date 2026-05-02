import Link from "next/link";
import { motion } from "framer-motion";
import type { MemberDashboardViewModel } from "./useMemberDashboardViewModel";

interface SignatureLoopSectionProps {
  viewModel: MemberDashboardViewModel;
}

export function SignatureLoopSection({ viewModel }: SignatureLoopSectionProps) {
  const { loopStages, loopCompletion } = viewModel.loop;

  return (
    <motion.section
      initial={viewModel.theme.prefersReducedMotion ? undefined : { opacity: 0, y: 14 }}
      animate={viewModel.theme.prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      className="rounded-3xl border border-rose-200 bg-linear-to-br from-rose-50 via-white to-orange-50 p-5 md:p-6 shadow-sm"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-rose-600">Signature Loop</p>
          <h2 className="font-brand-display text-xl md:text-2xl font-bold text-gray-900 mt-1">
            Refleksi {"->"} Progres {"->"} Reward {"->"} Komunitas
          </h2>
          <p className="text-sm text-gray-600 mt-2 max-w-2xl">
            Ini bukan deretan menu. Setiap langkah otomatis mendorong langkah berikutnya agar perjalananmu terasa terarah.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="relative h-16 w-16 rounded-full"
            style={{
              background: `conic-gradient(var(--color-primary) ${loopCompletion * 3.6}deg, #E5E7EB 0deg)`,
            }}
          >
            <div className="absolute inset-1.25 rounded-full bg-white grid place-items-center text-sm font-bold text-gray-900">
              {loopCompletion}%
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Loop Completion</p>
            <p className="text-xs text-gray-500">Target minimal harian: 50%+</p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {loopStages.map((stage) => (
          <Link key={stage.key} href={stage.href}>
            <div className="rounded-2xl border border-white bg-white/85 p-3.5 hover:shadow-md hover:border-rose-200 transition-all h-full">
              <div className="flex items-center justify-between gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 grid place-items-center">
                  <stage.icon className="w-4 h-4" />
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-1 rounded-full ${stage.completed
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                    }`}
                >
                  {stage.completed ? "Done" : "Next"}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mt-2">{stage.title}</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">{stage.detail}</p>
            </div>
          </Link>
        ))}
      </div>
    </motion.section>
  );
}
