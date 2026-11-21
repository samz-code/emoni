import type { ReactNode } from "react";

export const inp =
  "w-full rounded-lg border border-[#E8E2D6] bg-white px-3.5 py-2.5 text-sm text-[#1A1A16] placeholder:text-[#524646]/40 focus:border-[#007979] focus:outline-none focus:ring-2 focus:ring-[#007979]/30";

export const num = (s: string) => Number(s.replace(/[^\d.]/g, "")) || 0;

export const errMsg = (e: unknown) =>
  (e as { message?: string })?.message || (typeof e === "string" ? e : "Something went wrong. Try again.");

export function Field({
  label,
  required,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-[#1A1A16]">
        {label}
        {required && <span className="text-[#EC5B38]"> *</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-[#524646]/60">{hint}</span>}
    </label>
  );
}

export function Section({ id, title, intro, children }: { id: string; title: string; intro?: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 rounded-2xl border border-[#E8E2D6] bg-white p-5 shadow-sm sm:p-8">
      <h2 className="font-display text-xl font-bold text-[#1A1A16]">{title}</h2>
      {intro && <p className="mt-1 text-sm text-[#524646]/80">{intro}</p>}
      <div className="mt-6 space-y-5">{children}</div>
    </section>
  );
}