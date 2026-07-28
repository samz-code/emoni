import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Globe, MessageCircle } from "lucide-react";
import ContactForm from "@/components/ContactForm";

// Working hours in EAT (UTC+3) — used only for the online/offline badge
const workingHours: Record<number, { open: number; close: number }> = {
  0: { open: 14, close: 20 }, // Sunday
  1: { open: 8, close: 22 },
  2: { open: 8, close: 22 },
  3: { open: 8, close: 22 },
  4: { open: 8, close: 22 },
  5: { open: 8, close: 22 },
  6: { open: 8, close: 22 },
};

const Contact = () => {
  const [now, setNow] = useState(new Date());

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

  const contactItems = [
    { icon: Phone, text: "+254 727 492 545", href: "tel:+254727492545" },
    { icon: Mail, text: "emonisamuel54@gmail.com", href: "mailto:emonisamuel54@gmail.com" },
    { icon: MapPin, text: "Nairobi, Kenya · Available Remotely" },
    { icon: Globe, text: "Working in EAT (UTC+3)" },
  ];

  return (
    <main className="bg-paper">
      <section className="py-20 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Status badge */}
          <div
            className={`inline-flex items-center gap-2 border rounded-[4px] px-3 py-1.5 mb-6 ${
              isOnline ? "border-olive bg-olive/10" : "border-border bg-snow"
            }`}
          >
            <span className="relative flex w-2 h-2">
              {isOnline && (
                <span className="absolute inline-flex w-full h-full rounded-full bg-olive opacity-60 animate-ping" />
              )}
              <span className={`relative inline-flex w-2 h-2 rounded-full ${isOnline ? "bg-olive" : "bg-[#9A9A9A]"}`} />
            </span>
            <span className="font-body text-[12px] uppercase tracking-widest text-ink">
              {isOnline ? "Online now" : "Offline"}
            </span>
            <span className="font-body text-[12px] text-[#9A9A9A]">· {eatTimeLabel} EAT</span>
          </div>

          <h1 className="font-display text-[44px] md:text-[56px] text-ink leading-tight max-w-3xl">
            Let's Work Together
          </h1>
          <p className="font-body text-lg text-[#4A4A4A] mt-4 max-w-2xl leading-relaxed">
            Got a project in mind, a broken system to fix, or just need some advice? Drop me a message below and I'll usually get back to you within 24 hours on weekdays.
          </p>

          {/* Contact grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mt-14">

            {/* Left — quick contact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-5"
            >
              <p className="font-body text-[11px] uppercase tracking-widest text-ember mb-2">
                Reach Me Directly
              </p>
              <h2 className="font-display text-[30px] text-ink leading-tight">
                A few ways to say hello
              </h2>

              <div className="space-y-4 mt-8">
                {contactItems.map((item) => (
                  <div key={item.text} className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-[4px] border border-border bg-snow flex items-center justify-center flex-shrink-0">
                      <item.icon size={16} className="text-olive" />
                    </span>
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

              

              <p className="font-body text-[13px] text-[#9A9A9A] italic mt-4">
                Fastest way to reach me during working hours.
              </p>
            </motion.div>

            {/* Right — form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
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