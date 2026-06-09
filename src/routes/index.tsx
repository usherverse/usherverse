import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Intro } from "@/components/ushur/Intro";
import { Nav } from "@/components/ushur/Nav";
import { Hero } from "@/components/ushur/Hero";
// import { Marquee } from "@/components/ushur/Marquee";
import { About } from "@/components/ushur/About";
import { Services } from "@/components/ushur/Services";
// import { Work } from "@/components/ushur/Work";
import { Process } from "@/components/ushur/Process";
import { Stack } from "@/components/ushur/Stack";
import { Blog } from "@/components/ushur/Blog";
import { Why } from "@/components/ushur/Why";
import { Contact } from "@/components/ushur/Contact";
import { Footer } from "@/components/ushur/Footer";
import { LazySection } from "@/components/ushur/LazySection";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Usherverse — Websites, Systems & Automations" },
      { name: "description", content: "Usherverse is a one-person studio designing websites, building systems, and automating the work that slows businesses down. Big Little World." },
      { property: "og:title", content: "Usherverse — Big Little World" },
      { property: "og:description", content: "Editorial websites, bespoke business systems, and intelligent automations. Built with restraint, shipped with care." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Index,
});

function Index() {
  const [introDone, setIntroDone] = useState(false);
  useEffect(() => {
    if (introDone) document.body.style.overflow = "auto";
    else document.body.style.overflow = "hidden";
  }, [introDone]);
  return (
    <>
      {!introDone && <Intro onDone={() => setIntroDone(true)} />}
      <div className="relative bg-[var(--background)] text-[var(--foreground)]">
        <Nav />
        {/* Hero is always rendered — it's above the fold */}
        <Hero />

        {/* Every section below the fold is lazy — only mounts when near viewport */}
        <LazySection minHeight="600px" id="about">
          <About />
        </LazySection>

        <LazySection minHeight="600px" id="services">
          <Services />
        </LazySection>

        {/* <LazySection minHeight="600px"><Work /></LazySection> */}

        <LazySection minHeight="500px" id="process">
          <Process />
        </LazySection>

        {/* <LazySection minHeight="120px"><Marquee /></LazySection> */}

        <LazySection minHeight="700px">
          <Stack />
        </LazySection>

        <LazySection minHeight="400px">
          <Why />
        </LazySection>

        <LazySection minHeight="600px">
          <Blog />
        </LazySection>

        <LazySection minHeight="500px" id="contact">
          <Contact />
        </LazySection>

        <LazySection minHeight="200px">
          <Footer />
        </LazySection>
      </div>
    </>
  );
}
