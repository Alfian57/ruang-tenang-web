import { Navbar, Footer } from "@/components/layout";
import { PWAInstallPrompt } from "@/components/pwa/PWAInstallPrompt";
import { LandingStatic } from "./_components/LandingStatic";
import { LandingCommunity } from "./_components/LandingCommunity";
import { LandingArticles } from "./_components/LandingArticles";
import "./landing.css";

export default function Home() {
  return (
    <div className="landing-page min-h-screen overflow-x-clip bg-[#fffcfa] text-slate-800">
      <Navbar />
      <main id="main-content" tabIndex={-1} className="focus:outline-none">
        <LandingStatic part="intro" />
        <LandingCommunity />
        <LandingArticles />
        <LandingStatic part="outro" />
      </main>
      <Footer variant="landing" />
      <PWAInstallPrompt />
    </div>
  );
}
