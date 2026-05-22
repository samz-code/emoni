import { useState } from "react";
import { FiUser, FiMail, FiPhone, FiLayers, FiDollarSign, FiFileText, FiSend, FiCheckCircle } from "react-icons/fi";

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
  const [status, setStatus] = useState("idle");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setStatus("success");
  };

  if (status === "success") {
    return (
      <div className="bg-forest/10 border border-olive rounded-[4px] p-4 mt-4 flex items-center gap-3">
        <FiCheckCircle className="text-forest text-lg flex-shrink-0" />
        <p className="font-body text-sm text-forest">
          Message sent. I'll be in touch within 24 hours.
        </p>
      </div>
    );
  }

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
        <label className={labelClass}>Full Name *</label>
        <div className="relative">
          <FiUser className={iconClass} />
          <input
            name="name"
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
        <label className={labelClass}>Email Address *</label>
        <div className="relative">
          <FiMail className={iconClass} />
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
      </div>

      {/* Phone */}
      <div>
        <label className={labelClass}>Phone Number</label>
        <div className="relative">
          <FiPhone className={iconClass} />
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className={inputClass}
            placeholder="+254 ..."
          />
        </div>
      </div>

      {/* Service */}
      <div>
        <label className={labelClass}>Service Interested In *</label>
        <div className="relative">
          <FiLayers className={iconClass} />
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
      </div>

      {/* Budget */}
      <div>
        <label className={labelClass}>Budget Range</label>
        <div className="relative">
          <FiDollarSign className={iconClass} />
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
      </div>

      {/* Details */}
      <div>
        <label className={labelClass}>Project Details *</label>
        <div className="relative">
          <FiFileText className={`${iconClass} bottom-auto top-3`} />
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
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-ember text-snow rounded-[4px] py-4 font-body text-[15px] font-medium hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {status === "loading" ? (
          "Sending..."
        ) : (
          <>
            Send Message
            <FiSend className="text-[15px]" />
          </>
        )}
      </button>
    </form>
  );
};

export default ContactForm;