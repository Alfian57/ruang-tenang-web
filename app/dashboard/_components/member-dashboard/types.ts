import type { LucideIcon } from "lucide-react";

export type DashboardAction = {
  title: string;
  description: string;
  href: string;
  cta: string;
};

export type LoopStage = {
  key: string;
  title: string;
  detail: string;
  href: string;
  icon: LucideIcon;
  completed: boolean;
};

export type ActivitySignal = {
  key: string;
  label: string;
  count: number;
  href: string;
};

export type CrossFeatureSignal = ActivitySignal & {
  target: number;
  windowLabel: string;
};

export type TodayQuestStep = {
  key: string;
  label: string;
  completed: boolean;
  href: string;
  locked?: boolean;
};

export type NeedOption<TCondition extends string = string> = {
  key: TCondition;
  label: string;
  icon: LucideIcon;
};
