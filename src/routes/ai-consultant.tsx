import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/ushur/Nav";
import { AIConsultant } from "@/components/ushur/AIConsultant";

export const Route = createFileRoute("/ai-consultant")({
  head: () => ({
    meta: [
      { title: "Website Discovery Questionnaire — Usherverse" },
      { name: "description", content: "Answer a few targeted questions and our AI will generate a comprehensive website specification tailored to your business needs." },
    ],
  }),
  component: AIConsultantPage,
});

function AIConsultantPage() {
  return (
    <div className="relative bg-[var(--background)] text-[var(--foreground)] min-h-screen">
      <Nav />
      <div className="pt-24">
        <AIConsultant />
      </div>
    </div>
  );
}
