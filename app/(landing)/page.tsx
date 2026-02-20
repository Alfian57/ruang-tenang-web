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

export default function Home() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <main>
        <HeroSection />
        <MarqueeSection />
        <FeaturesSection />
        <GamificationSection />
        <ArticleSection />
        <StorySection />
        <CommunitySection />
        <LeaderboardSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
