import { Hero } from "@/components/hero";
import { Features } from "@/components/features";
import { Work } from "@/components/work";
import { About } from "@/components/about";
import { FAQ } from "@/components/faq";
import { Background } from "@/components/background";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen relative overflow-x-hidden selection:bg-blueprint-blue selection:text-white z-0">
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
