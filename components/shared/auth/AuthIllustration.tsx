"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import "./auth.css";

type AuthPose = "welcome" | "heart" | "secure" | "key";

interface AuthIllustrationProps {
  title: string;
  description: string;
  pose?: AuthPose;
}

export function AuthIllustration({ title, description, pose = "welcome" }: AuthIllustrationProps) {
  return (
    <aside className="auth-illustration" aria-label={`${title}. ${description}`}>
      <span className="auth-orbit auth-orbit-one" aria-hidden="true" />
      <span className="auth-orbit auth-orbit-two" aria-hidden="true" />
      <div className="auth-decor" aria-hidden="true">
        <span className="auth-note auth-note-one"><Heart /><span className="auth-note-lines"><i /><i /><i /></span></span>
        <span className="auth-note auth-note-two"><Heart /><span className="auth-note-lines"><i /><i /><i /></span></span>
        <span className="auth-note auth-note-three"><Heart /><span className="auth-note-lines"><i /><i /><i /></span></span>
        <span className="auth-star auth-star-one" />
        <span className="auth-star auth-star-two" />
        <span className="auth-star auth-star-three" />
        <span className="auth-orb auth-orb-one" />
        <span className="auth-orb auth-orb-two" />
      </div>
      <motion.div className="auth-mascot-stage" initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .7 }} aria-hidden="true">
        <Image src={`/images/landing/mascot/auth-${pose}-cutout.webp`} alt="" fill sizes="(max-width: 1023px) 0px, (max-width: 1279px) 56vw, (max-width: 1439px) 60vw, 58vw" priority className="auth-mascot-image" />
      </motion.div>
    </aside>
  );
}

export function AuthMascotMini({ pose }: { pose: AuthPose }) {
  return <Image src={`/images/landing/mascot/${pose}.webp`} alt="Maskot Ruang Tenang" width={76} height={114} sizes="76px" className="auth-mascot-mini" />;
}
