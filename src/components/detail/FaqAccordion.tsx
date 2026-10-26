import { Plus } from "lucide-react";

export interface FaqItem {
  question: string;
  answer: string;
}

/** FAQPage JSON-LD. Always render the same items visibly with <FaqAccordion />. */
export function faqSchema(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export default function FaqAccordion({
  items,
  title = "Frequently asked questions",
  id = "faq-heading",
}: {
  items: FaqItem[];
  title?: string;
  id?: string;
}) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="font-display text-2xl text-ink sm:text-3xl">
        {title}
      </h2>
      <div className="mt-6 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-snow">
        {items.map((item) => (
          <details key={item.question} className="group p-5 sm:p-6">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-base text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember sm:text-lg [&::-webkit-details-marker]:hidden">
              <span className="min-w-0 break-words">{item.question}</span>
              <Plus
                size={20}
                aria-hidden="true"
                className="shrink-0 text-ember transition-transform duration-200 group-open:rotate-45"
              />
            </summary>
            <p className="mt-3 whitespace-pre-line break-words font-body text-sm leading-relaxed text-ink/75 sm:text-base">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}