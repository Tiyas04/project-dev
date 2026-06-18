import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { Features } from "@/components/features";
import { Work } from "@/components/work";
import { About } from "@/components/about";
import { FAQ } from "@/components/faq";
import { Footer } from "@/components/footer";
import { Background } from "@/components/background";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen relative overflow-x-hidden selection:bg-blueprint-blue selection:text-white z-0">
      <Background />
      <Navbar />
      <main className="flex-1 pt-24">
        <Hero />
        <Features />
        <About />
        <Work />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
