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
    </div>
  );
}
