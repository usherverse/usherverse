import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Intro } from "@/components/ushur/Intro";
import { Nav } from "@/components/ushur/Nav";
import { Hero } from "@/components/ushur/Hero";
import { Marquee } from "@/components/ushur/Marquee";
import { About } from "@/components/ushur/About";
import { Services } from "@/components/ushur/Services";
import { Work } from "@/components/ushur/Work";
import { Process } from "@/components/ushur/Process";
import { Stack } from "@/components/ushur/Stack";
import { Testimonials } from "@/components/ushur/Testimonials";
import { Why } from "@/components/ushur/Why";
import { Contact } from "@/components/ushur/Contact";
import { TrustedBy } from "@/components/ushur/TrustedBy";
import { Footer } from "@/components/ushur/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ushurverse — Websites, Systems & Automations" },
      { name: "description", content: "Ushurverse is a one-person studio designing websites, building systems, and automating the work that slows businesses down. Big Little World." },
      { property: "og:title", content: "Ushurverse — Big Little World" },
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
        <Hero />
        <Marquee />
        <About />
        <Services />
        <Work />
        <Process />
        <Stack />
        <Testimonials />
        <Why />
        <Contact />
        <TrustedBy />
        <Footer />
      </div>
    </>
  );
}
