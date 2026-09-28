import { Link } from "react-router-dom";
import { openCookieSettings } from "@/components/CookieConsent";

const CATEGORIES = [
  {
    title: "Strictly necessary",
    body: "These keep the website secure and working, and remember your cookie choice. They cannot be switched off.",
  },
  {
    title: "Analytics",
    body: "With your permission, these give us anonymous statistics about how visitors use the site so we can improve it.",
  },
  {
    title: "Marketing",
    body: "With your permission, these help show relevant content and measure how our campaigns perform.",
  },
];

export default function Cookies() {
  return (
    <main className="min-h-screen bg-[#FBF9F5] pt-32 pb-20 px-6">
      <div className="max-w-3xl mx-auto font-body text-[#524646]">
        <h1 className="font-display text-4xl text-[#1A1A16] tracking-tight">Cookie Policy</h1>
        <p className="mt-2 text-sm text-[#524646]/60">Last updated: {new Date().toLocaleDateString()}</p>

        <section className="mt-10 space-y-3">
          <h2 className="font-display text-2xl text-[#1A1A16]">What are cookies?</h2>
          <p className="leading-relaxed">
            Cookies are small text files stored on your device when you visit a website. Similar technologies, such as
            local storage, work the same way. They help a site function, remember your preferences and understand how it
            is used.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="font-display text-2xl text-[#1A1A16]">How we use them</h2>
          {CATEGORIES.map((c) => (
            <div key={c.title} className="bg-white border border-[#E8E2D6] rounded-xl p-5">
              <h3 className="font-display text-lg text-[#1A1A16]">{c.title}</h3>
              <p className="text-sm mt-1 leading-relaxed">{c.body}</p>
            </div>
          ))}
        </section>

        <section className="mt-10 space-y-3">
          <h2 className="font-display text-2xl text-[#1A1A16]">Managing your choices</h2>
          <p className="leading-relaxed">
            You can change your consent at any time. You can also block or delete cookies in your browser settings, though
            some parts of the site may then not work properly.
          </p>
          <button
            onClick={openCookieSettings}
            className="inline-flex px-5 py-2.5 bg-[#007979] text-[#FFE2AF] rounded-lg text-sm font-medium hover:bg-[#24B1B1] transition-colors"
          >
            Change cookie settings
          </button>
        </section>

        <section className="mt-10 space-y-3">
          <h2 className="font-display text-2xl text-[#1A1A16]">Questions?</h2>
          <p className="leading-relaxed">
            See our{" "}
            <Link to="/privacy" className="text-[#007979] underline underline-offset-2">
              Privacy Policy
            </Link>{" "}
            or{" "}
            <Link to="/contact" className="text-[#007979] underline underline-offset-2">
              contact us
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  );
}