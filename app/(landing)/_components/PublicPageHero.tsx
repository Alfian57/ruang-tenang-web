import Image from "next/image";
import type { ReactNode } from "react";
import "../public.css";

type Pose = "read" | "listen" | "map" | "trophy" | "message" | "secure" | "key" | "heart";

interface PublicPageHeroProps {
  eyebrow: string;
  title: ReactNode;
  description: ReactNode;
  pose: Pose;
  compact?: boolean;
  headingLevel?: 1 | 2;
  children?: ReactNode;
}

export function PublicPageHero({ eyebrow, title, description, pose, compact = false, headingLevel = 1, children }: PublicPageHeroProps) {
  return (
    <section className={`public-hero ${compact ? "public-hero-compact" : ""}`}>
      <div className="public-hero-orbit public-hero-orbit-one" aria-hidden="true" />
      <div className="public-hero-orbit public-hero-orbit-two" aria-hidden="true" />
      <div className="public-hero-copy">
        <p className="public-hero-eyebrow">{eyebrow}</p>
        {headingLevel === 1 ? <h1>{title}</h1> : <h2>{title}</h2>}
        <p className="public-hero-description">{description}</p>
        {children && <div className="public-hero-actions">{children}</div>}
      </div>
      <div className="public-hero-art" aria-hidden="true">
        <span className="public-hero-art-halo" />
        <Image
          src={`/images/landing/mascot/${pose}.webp`}
          alt=""
          width={480}
          height={720}
          sizes={compact ? "(max-width: 640px) 140px, 190px" : "(max-width: 640px) 180px, 330px"}
          className="public-hero-mascot"
        />
      </div>
    </section>
  );
}
