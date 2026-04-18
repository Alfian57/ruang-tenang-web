import { Navbar, Footer } from "@/components/layout";
import {
  HeroSection,
  MarqueeSection,
  FeaturesSection,
  GamificationSection,
  ArticleSection,
  StorySection,
  CommunitySection,
  LeaderboardSection,
  CTASection,
} from "./_components";
import { PWAInstallPrompt } from "@/components/pwa/PWAInstallPrompt";

export default function Home() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <main id="main-content" tabIndex={-1} className="focus:outline-none">
        <HeroSection />
        <GamificationSection />
        <MarqueeSection />
        <FeaturesSection />
        <StorySection />
        <CommunitySection />
        <LeaderboardSection />
        <ArticleSection />
        <CTASection />
      </main>
      <Footer />
      <PWAInstallPrompt />
    </div>
  );
}
