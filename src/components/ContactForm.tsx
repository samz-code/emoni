import { useState, type ChangeEvent, type FormEvent } from "react";
import { FiUser, FiMail, FiPhone, FiLayers, FiDollarSign, FiFileText, FiSend } from "react-icons/fi";

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
  "$500 to $1,500",
  "$1,500 to $5,000",
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
  const [status, setStatus] = useState<"idle" | "draft">("idle");

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((current) => ({ ...current, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("draft");
  };

  const mailto = `mailto:emonisamuel54@gmail.com?subject=${encodeURIComponent(
    `Project inquiry: ${form.service}`,
  )}&body=${encodeURIComponent(
    `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone || "Not provided"}\nService: ${form.service}\nBudget: ${form.budget || "Not provided"}\n\nProject details:\n${form.details}`,
  )}`;

  const inputClass =
    "w-full bg-transparent border-b-2 border-forest font-body text-[15px] text-ink py-3 outline-none focus:border-ember transition-colors pl-7";
  const labelClass =
    "block font-body text-[11px] uppercase tracking-widest text-[#9A9A9A] mb-1";
  const iconClass =
    "absolute left-0 bottom-3 text-[#9A9A9A] text-[16px] pointer-events-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Full Name */}
      <div>
        <label htmlFor="contact-name" className={labelClass}>Full Name *</label>
        <div className="relative">
          <FiUser className={iconClass} />
          <input
            name="name"
            id="contact-name"
            required
            value={form.name}
            onChange={handleChange}
            className={inputClass}
            placeholder="Your full name"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="contact-email" className={labelClass}>Email Address *</label>
        <div className="relative">
          <FiMail className={iconClass} />
          <input
            name="email"
            id="contact-email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            className={inputClass}
            placeholder="you@example.com"
          />
        </div>
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="contact-phone" className={labelClass}>Phone Number</label>
        <div className="relative">
          <FiPhone className={iconClass} />
          <input
            name="phone"
            id="contact-phone"
            value={form.phone}
            onChange={handleChange}
            className={inputClass}
            placeholder="+254 ..."
          />
        </div>
      </div>

      {/* Service */}
      <div>
        <label htmlFor="contact-service" className={labelClass}>Service Interested In *</label>
        <div className="relative">
          <FiLayers className={iconClass} />
          <select
            name="service"
            id="contact-service"
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
      </div>

      {/* Budget */}
      <div>
        <label htmlFor="contact-budget" className={labelClass}>Budget Range</label>
        <div className="relative">
          <FiDollarSign className={iconClass} />
          <select
            name="budget"
            id="contact-budget"
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
      </div>

      {/* Details */}
      <div>
        <label htmlFor="contact-details" className={labelClass}>Project Details *</label>
        <div className="relative">
          <FiFileText className={`${iconClass} bottom-auto top-3`} />
          <textarea
            name="details"
            id="contact-details"
            required
            rows={5}
            value={form.details}
            onChange={handleChange}
            className={`${inputClass} resize-none`}
            placeholder="Tell me about your project..."
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-ember text-snow rounded-[4px] py-4 font-body text-[15px] font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
      >
        Prepare Message
        <FiSend className="text-[15px]" />
      </button>
      {status === "draft" && (
        <p role="status" className="font-body text-sm text-forest">
          Your message is ready. <a href={mailto} className="font-medium underline underline-offset-4">Open an email draft</a> and send it from your email app. This site cannot verify delivery.
        </p>
      )}
    </form>
  );
};

export default ContactForm;