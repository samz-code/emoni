import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Phone, Mail, MapPin, Clock, Linkedin, MessageCircle, Github, Instagram,
  Calendar, Briefcase, Zap, ShieldCheck, Globe, ChevronDown,
} from "lucide-react";
import ContactForm from "@/components/ContactForm";

// Working hours in EAT (UTC+3)
const workingHours: Record<number, { open: number; close: number; label: string }> = {
  0: { open: 14, close: 20, label: "Sun · 2PM – 8PM" },     // Sunday
  1: { open: 8, close: 22, label: "Mon · 8AM – 10PM" },
  2: { open: 8, close: 22, label: "Tue · 8AM – 10PM" },
  3: { open: 8, close: 22, label: "Wed · 8AM – 10PM" },
  4: { open: 8, close: 22, label: "Thu · 8AM – 10PM" },
  5: { open: 8, close: 22, label: "Fri · 8AM – 10PM" },
  6: { open: 8, close: 22, label: "Sat · 8AM – 10PM" },
};

const hoursTable = [
  { day: "Monday", hours: "8:00 AM – 10:00 PM" },
  { day: "Tuesday", hours: "8:00 AM – 10:00 PM" },
  { day: "Wednesday", hours: "8:00 AM – 10:00 PM" },
  { day: "Thursday", hours: "8:00 AM – 10:00 PM" },
  { day: "Friday", hours: "8:00 AM – 10:00 PM" },
  { day: "Saturday", hours: "8:00 AM – 10:00 PM" },
  { day: "Sunday", hours: "2:00 PM – 8:00 PM" },
];

const engagementOptions = [
  {
    icon: Briefcase,
    title: "Project-Based",
    description: "Got a specific job with clear goals and deadlines? This is perfect for websites, branding work, or building systems. We agree on what's needed upfront and work through it step by step.",
    timeline: "2 – 12 weeks",
  },
  {
    icon: Calendar,
    title: "Monthly Retainer",
    description: "Need ongoing help with development, design, IT support, or just someone to bounce ideas off? This gives you priority access and a predictable monthly cost.",
    timeline: "3-month minimum",
  },
  {
    icon: Zap,
    title: "Project Rescue",
    description: "Stuck with a project that's gone wrong? I'll take a look, figure out what happened, and get you back on track with a working solution.",
    timeline: "1 – 4 weeks",
  },
  {
    icon: ShieldCheck,
    title: "Advisory & Audit",
    description: "Just need some expert advice or a second opinion? I do technical reviews, vendor evaluations, and strategic consultations for business leaders.",
    timeline: "By the hour or fixed",
  },
];

const responseSLA = [
  { channel: "WhatsApp", time: "Under 2 hours", note: "Within working hours" },
  { channel: "Email", time: "Within 24 hours", note: "Business days" },
  { channel: "Contact form", time: "Within 24 hours", note: "Business days" },
  { channel: "Phone call", time: "Same day", note: "If missed, returned within 4 hours" },
];

const faqs = [
  {
    q: "Do you work with clients outside Kenya?",
    a: "Absolutely! About 30% of my work is with people outside Kenya — across East Africa, the Kenyan diaspora, and even some clients in the US and Europe. I work in East African Time (UTC+3) so we can find overlapping hours that work for both of us.",
  },
  {
    q: "What does a typical engagement look like?",
    a: "We usually start with a free 30-minute chat to see if we're a good fit. If it feels right, I'll send you a clear proposal with what we'll do, how long it'll take, and the pricing within 48 hours. Once that's signed, we kick things off with some proper planning before jumping into the work.",
  },
  {
    q: "How do you handle payments?",
    a: "I accept M-Pesa, bank transfers, Stripe, or Wise — whatever makes it easiest for you. For most projects, it's 50% upfront and 50% when we're done. Bigger jobs get split into 3 milestones. We always sign an NDA and contract before any money changes hands.",
  },
  {
    q: "Do I own the code, designs, and accounts?",
    a: "100% yes. You get everything — the source code, design files, hosting access, domain, and any accounts we set up. No hidden vendor lock-in or funny business.",
  },
  {
    q: "What if I just need advice, not a full build?",
    a: "That's totally fine! Some of my favorite work is just giving advice to help people avoid building the wrong thing. We can do it by the hour or as a fixed consultation.",
  },
  {
    q: "Are you available for long-term partnerships?",
    a: "Definitely. I work with several clients on monthly retainers for ongoing development, IT support, or strategic advice. The minimum commitment is usually 3 months, but it depends on what you need.",
  },
];

const Contact = () => {
  const [now, setNow] = useState(new Date());
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Compute EAT (UTC+3) day & hour regardless of viewer's timezone
  const eatNow = new Date(now.getTime() + (now.getTimezoneOffset() + 180) * 60_000);
  const day = eatNow.getDay();
  const hour = eatNow.getHours() + eatNow.getMinutes() / 60;
  const todayHours = workingHours[day];
  const isOnline = hour >= todayHours.open && hour < todayHours.close;
  const eatTimeLabel = eatNow.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <main className="bg-paper">
      {/* PAGE INTRO */}
      <section className="pt-20 pb-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`inline-flex items-center gap-2 border rounded-[4px] px-3 py-1.5 mb-6 ${
            isOnline ? "border-olive bg-olive/10" : "border-border bg-snow"
          }`}>
            <span className="relative flex w-2 h-2">
              {isOnline && (
                <span className="absolute inline-flex w-full h-full rounded-full bg-olive opacity-60 animate-ping" />
              )}
              <span className={`relative inline-flex w-2 h-2 rounded-full ${isOnline ? "bg-olive" : "bg-[#9A9A9A]"}`} />
            </span>
            <span className="font-body text-[12px] uppercase tracking-widest text-ink">
              {isOnline ? "Online now" : "Offline"}
            </span>
            <span className="font-body text-[12px] text-[#9A9A9A]">
              · {eatTimeLabel} EAT
            </span>
          </div>
          <h1 className="font-display text-[44px] md:text-[56px] text-ink leading-tight max-w-3xl">
            Let's Work Together
          </h1>
          <p className="font-body text-lg text-[#4A4A4A] mt-4 max-w-2xl leading-relaxed">
            Got a project in mind? Whether it's building a website, fixing a broken system, or just getting some advice — check out the details below and drop me a message at the bottom.
          </p>
        </div>
      </section>

      {/* WORKING HOURS + RESPONSE TIMES */}
      <section className="bg-snow border-y border-border py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Working hours table */}
          <div>
            <p className="font-body text-[11px] uppercase tracking-widest text-ember mb-2 flex items-center gap-2">
              <Clock size={12} /> Working Hours · EAT (UTC+3)
            </p>
            <h2 className="font-display text-[30px] text-ink">When I'm Available</h2>
            <p className="font-body text-sm text-[#4A4A4A] mt-2 max-w-md">
              These are my actual working hours, not just something I put online. If I'm not available, I'll get back to you during the next working block.
            </p>

            <div className="mt-6 border border-border rounded-[4px] overflow-hidden">
              {hoursTable.map((row, i) => {
                const isToday =
                  (i === 6 && day === 0) || (i < 6 && day === i + 1);
                return (
                  <div
                    key={row.day}
                    className={`flex justify-between items-center px-4 py-3 font-body text-sm ${
                      i !== hoursTable.length - 1 ? "border-b border-border" : ""
                    } ${isToday ? "bg-paper" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-ink ${isToday ? "font-medium" : ""}`}>
                        {row.day}
                      </span>
                      {isToday && (
                        <span className="text-[10px] uppercase tracking-widest text-ember font-medium">
                          Today
                        </span>
                      )}
                    </div>
                    <span className="text-[#4A4A4A]">{row.hours}</span>
                  </div>
                );
              })}
            </div>

            <p className="font-body text-[12px] text-[#9A9A9A] mt-4">
              Public holidays observed in Kenya. Out-of-office notice posted in advance for travel.
            </p>
          </div>

          {/* Response SLA */}
          <div>
            <p className="font-body text-[11px] uppercase tracking-widest text-ember mb-2 flex items-center gap-2">
              <Zap size={12} /> Response Times
            </p>
            <h2 className="font-display text-[30px] text-ink">How Fast I Reply</h2>
            <p className="font-body text-sm text-[#4A4A4A] mt-2 max-w-md">
              I try to reply quickly depending on how urgent it is. Pick whatever channel works best for you.
            </p>

            <div className="mt-6 space-y-3">
              {responseSLA.map((row) => (
                <div
                  key={row.channel}
                  className="border border-border rounded-[4px] p-4 flex items-start justify-between gap-4 bg-paper"
                >
                  <div>
                    <p className="font-body text-sm text-ink font-medium">{row.channel}</p>
                    <p className="font-body text-[12px] text-[#9A9A9A] mt-0.5">{row.note}</p>
                  </div>
                  <span className="font-display text-[18px] text-forest whitespace-nowrap">
                    {row.time}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 border-l-4 border-ember bg-paper p-4 rounded-[4px]">
              <p className="font-body text-[13px] text-ink">
                <strong className="font-medium">Need something urgent?</strong>{" "}
                <a
                  href="https://wa.me/254727492545"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ember hover:underline"
                >
                  Shoot me a WhatsApp message
                </a>{" "}
                — this is usually the fastest way to reach me during work hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WAYS TO WORK TOGETHER */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="font-body text-[11px] uppercase tracking-widest text-ember mb-2">
            Engagement Models
          </p>
          <h2 className="font-display text-[36px] text-ink">Ways to Work Together</h2>
          <p className="font-body text-base text-[#4A4A4A] max-w-2xl mt-3">
            Not every job fits into a neat little box. Take a look at these options and see what works for you — or just ask me and I'll suggest the best approach.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            {engagementOptions.map((opt) => (
              <div
                key={opt.title}
                className="bg-snow border border-border border-l-4 border-l-olive rounded-[4px] p-6"
              >
                <opt.icon size={22} className="text-olive" />
                <h3 className="font-display text-[22px] text-ink mt-3">{opt.title}</h3>
                <p className="font-body text-sm text-[#4A4A4A] mt-2 leading-relaxed">
                  {opt.description}
                </p>
                <p className="font-body text-[11px] uppercase tracking-widest text-[#9A9A9A] mt-4">
                  Typical Length:{" "}
                  <span className="text-ink normal-case tracking-normal">{opt.timeline}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-forest py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="font-body text-[11px] uppercase tracking-widest text-ember mb-2">
            Frequently Asked
          </p>
          <h2 className="font-display text-[36px] text-cream">Before You Reach Out</h2>
          <p className="font-body text-base text-cream/70 mt-3">
            These are the questions I get asked most often. If your question isn't here, feel free to ask it in the form below.
          </p>

          <div className="mt-10 space-y-3">
            {faqs.map((item, i) => {
              const open = openFaq === i;
              return (
                <div key={item.q} className="border border-olive/30 rounded-[4px] bg-forest">
                  <button
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="w-full flex items-center justify-between gap-4 text-left p-5"
                  >
                    <span className="font-display text-[18px] text-cream">{item.q}</span>
                    <ChevronDown
                      size={18}
                      className={`text-cream/70 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
                    />
                  </button>
                  {open && (
                    <div className="px-5 pb-5">
                      <p className="font-body text-sm text-cream/80 leading-relaxed">{item.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CONTACT — last section */}
      <section className="py-24 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* Left */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-5"
            >
              <p className="font-body text-[11px] uppercase tracking-widest text-ember mb-2">
                Send a Brief
              </p>
              <h2 className="font-display text-[38px] text-ink leading-tight">
                Tell me about your project
              </h2>
              <p className="font-body text-base text-[#4A4A4A] mt-4 max-w-sm leading-relaxed">
                The more details you can share, the better I can help. Don't worry about getting it perfect — just tell me what you're trying to achieve.
              </p>

              <div className="space-y-4 mt-8">
                {[
                  { icon: Phone, text: "+254 727 492 545", href: "tel:+254727492545" },
                  { icon: Mail, text: "emonisamuel54@gmail.com", href: "mailto:emonisamuel54@gmail.com" },
                  { icon: MapPin, text: "Nairobi, Kenya · Available Remotely" },
                  { icon: Globe, text: "Working in EAT (UTC+3)" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3">
                    <item.icon size={18} className="text-olive flex-shrink-0" />
                    {item.href ? (
                      <a href={item.href} className="font-body text-sm text-ink hover:text-ember transition-colors">
                        {item.text}
                      </a>
                    ) : (
                      <span className="font-body text-sm text-ink">{item.text}</span>
                    )}
                  </div>
                ))}
              </div>

              <p className="font-body text-[13px] text-[#9A9A9A] italic mt-3">
                I usually reply within 24 hours on weekdays.
              </p>

              <div className="flex flex-wrap gap-3 mt-8">
                {[
                  { label: "LinkedIn", href: "#", bg: "bg-[#0A66C2]", icon: Linkedin },
                  { label: "WhatsApp", href: "https://wa.me/254727492545", bg: "bg-[#25D366]", icon: MessageCircle },
                  { label: "GitHub", href: "#", bg: "bg-ink", icon: Github },
                  { label: "Instagram", href: "#", bg: "bg-[#E1306C]", icon: Instagram },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${s.bg} text-snow rounded-[4px] px-4 py-2 text-sm font-body flex items-center gap-2 hover:opacity-90 transition-opacity`}
                  >
                    <s.icon size={16} />
                    {s.label}
                  </a>
                ))}
              </div>
            </motion.div>

            {/* Right */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-7"
            >
              <ContactForm />
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contact;
