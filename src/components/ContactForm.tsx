import { useState } from "react";

const serviceOptions = [
  "Web Development",
  "Graphic Design & Branding",
  "System Design",
  "API Integration",
  "Process Automation",
  "IT Support",
  "Courses",
  "Other",
];

const budgetOptions = [
  "Under $500",
  "$500–$1,500",
  "$1,500–$5,000",
  "$5,000+",
  "Let's Discuss",
];

const ContactForm = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    budget: "",
    details: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setStatus("success");
  };

  if (status === "success") {
    return (
      <div className="bg-forest/10 border border-olive rounded-[4px] p-4 mt-4">
        <p className="font-body text-sm text-forest">
          ✓ Message sent. I'll be in touch within 24 hours.
        </p>
      </div>
    );
  }

  const inputClass =
    "w-full bg-transparent border-b-2 border-forest font-body text-[15px] text-ink py-3 outline-none focus:border-ember transition-colors";
  const labelClass = "block font-body text-[11px] uppercase tracking-widest text-[#9A9A9A] mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className={labelClass}>Full Name *</label>
        <input
          name="name"
          required
          value={form.name}
          onChange={handleChange}
          className={inputClass}
          placeholder="Your full name"
        />
      </div>
      <div>
        <label className={labelClass}>Email Address *</label>
        <input
          name="email"
          type="email"
          required
          value={form.email}
          onChange={handleChange}
          className={inputClass}
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label className={labelClass}>Phone Number</label>
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          className={inputClass}
          placeholder="+254 ..."
        />
      </div>
      <div>
        <label className={labelClass}>Service Interested In *</label>
        <select
          name="service"
          required
          value={form.service}
          onChange={handleChange}
          className={`${inputClass} cursor-pointer`}
        >
          <option value="">Select a service</option>
          {serviceOptions.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>Budget Range</label>
        <select
          name="budget"
          value={form.budget}
          onChange={handleChange}
          className={`${inputClass} cursor-pointer`}
        >
          <option value="">Select budget range</option>
          {budgetOptions.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>Project Details *</label>
        <textarea
          name="details"
          required
          rows={5}
          value={form.details}
          onChange={handleChange}
          className={`${inputClass} resize-none`}
          placeholder="Tell me about your project..."
        />
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-ember text-snow rounded-[4px] py-4 font-body text-[15px] font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {status === "loading" ? "Sending..." : "Send Message →"}
      </button>
    </form>
  );
};

export default ContactForm;
