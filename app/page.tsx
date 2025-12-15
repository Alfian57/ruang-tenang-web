import {
  Navbar,
  HeroSection,
  MarqueeSection,
  ArticleSection,
  AboutSection,
  CTASection,
  Footer,
} from "@/components/landing";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <MarqueeSection />
        <ArticleSection />
        <AboutSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
