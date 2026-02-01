import {
  Navbar,
  HeroSection,
  MarqueeSection,
  ArticleSection,
  LeaderboardSection,
  AboutSection,
  CTASection,
  Footer,
} from "@/components/landing";
import { DailyTaskFAB } from "@/components/gamification";

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
