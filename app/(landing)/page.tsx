import { Navbar, Footer } from "@/components/layout";
import {
  HeroSection,
  MarqueeSection,
  ArticleSection,
  LeaderboardSection,
  AboutSection,
  CTASection,
} from "./_components";
import { DailyTaskFAB } from "@/components/shared/gamification";

export default function Home() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <main>
        <HeroSection />
        <MarqueeSection />
        <ArticleSection />
        <LeaderboardSection />
        <AboutSection />
        <CTASection />
      </main>
      <Footer />
      <DailyTaskFAB />
    </div>
  );
}
