import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiLayers,
  FiDollarSign,
  FiFileText,
  FiSend,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import { supabase } from "@/lib/supabase";

interface Service {
  id: string;
  label: string;
}

interface Currency {
  code: string;
  label: string;
  symbol: string;
}

interface BudgetRange {
  id: string;
  currency_code: string;
  label: string;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  service: string;
  currency: string;
  budget: string;
  details: string;
  website: string; // honeypot, must stay empty
}

type ConfigStatus = "loading" | "ready" | "error";
type SubmitStatus = "idle" | "submitting" | "success" | "error";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const emptyForm: FormState = {
  name: "",
  email: "",
  phone: "",
  service: "",
  currency: "",
  budget: "",
  details: "",
  website: "",
};

const ContactForm = () => {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [services, setServices] = useState<Service[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [budgetRanges, setBudgetRanges] = useState<BudgetRange[]>([]);
  const [configStatus, setConfigStatus] = useState<ConfigStatus>("loading");
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const loadConfig = useCallback(async () => {
    setConfigStatus("loading");
    try {
      const [servicesRes, currenciesRes, budgetsRes] = await Promise.all([
        supabase
          .from("contact_services")
          .select("id,label")
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),
        supabase
          .from("contact_currencies")
          .select("code,label,symbol")
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),
        supabase
          .from("contact_budget_ranges")
          .select("id,currency_code,label")
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),
      ]);

      const firstError = servicesRes.error ?? currenciesRes.error ?? budgetsRes.error;
      if (firstError) throw firstError;

      const loadedCurrencies = (currenciesRes.data ?? []) as Currency[];

      setServices((servicesRes.data ?? []) as Service[]);
      setCurrencies(loadedCurrencies);
      setBudgetRanges((budgetsRes.data ?? []) as BudgetRange[]);
      setForm((current) => ({
        ...current,
        currency:
          current.currency && loadedCurrencies.some((c) => c.code === current.currency)
            ? current.currency
            : loadedCurrencies[0]?.code ?? "",
      }));
      setConfigStatus("ready");
    } catch (err) {
      console.error("Failed to load contact form options:", err);
      setConfigStatus("error");
    }
  }, []);

  useEffect(() => {
    void loadConfig();
  }, [loadConfig]);

  const budgetsForCurrency = useMemo(
    () => budgetRanges.filter((b) => b.currency_code === form.currency),
    [budgetRanges, form.currency],
  );

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((current) => {
      const next = { ...current, [name]: value };
      // A budget label belongs to one currency, so reset it when the currency changes.
      if (name === "currency") next.budget = "";
      return next;
    });
    if (submitStatus === "error") {
      setSubmitStatus("idle");
      setErrorMessage("");
    }
  };

  const validate = (): string | null => {
    const name = form.name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();
    const details = form.details.trim();

    if (!name) return "Please enter your full name.";
    if (name.length > 120) return "Your name is too long (120 characters maximum).";
    if (!EMAIL_PATTERN.test(email) || email.length > 200) return "Please enter a valid email address.";
    if (phone.length > 40) return "Your phone number is too long (40 characters maximum).";
    if (!form.service) return "Please select a service.";
    if (details.length < 10) return "Please describe your project in at least 10 characters.";
    if (details.length > 5000) return "Project details are too long (5,000 characters maximum).";
    return null;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitStatus === "submitting") return;

    // Honeypot: bots fill hidden fields. Pretend it worked without saving anything.
    if (form.website) {
      setSubmitStatus("success");
      return;
    }

    const validationError = validate();
    if (validationError) {
      setErrorMessage(validationError);
      setSubmitStatus("error");
      return;
    }

    setSubmitStatus("submitting");
    setErrorMessage("");

    const { error } = await supabase.from("contact_submissions").insert({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      service: form.service,
      currency: form.budget ? form.currency || null : null,
      budget: form.budget || null,
      details: form.details.trim(),
    });

    if (error) {
      console.error("Contact submission failed:", error);
      setErrorMessage("We could not send your message. Please check your connection and try again.");
      setSubmitStatus("error");
      return;
    }

    setForm({ ...emptyForm, currency: form.currency });
    setSubmitStatus("success");
  };

  const inputClass =
    "w-full bg-transparent border-b-2 border-forest font-body text-[15px] text-ink py-3 outline-none focus:border-ember transition-colors pl-7 disabled:opacity-60";
  const labelClass = "block font-body text-[11px] uppercase tracking-widest text-[#9A9A9A] mb-1";
  const iconClass = "absolute left-0 bottom-3 text-[#9A9A9A] text-[16px] pointer-events-none";

  if (submitStatus === "success") {
    return (
      <div role="status" className="py-10 text-center space-y-4">
        <FiCheckCircle className="mx-auto text-forest text-[40px]" />
        <h3 className="font-body text-xl font-medium text-ink">Message sent successfully</h3>
        <p className="font-body text-[15px] text-forest">
          Thank you for reaching out. I have received your project details and will reply to your email shortly.
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitStatus("idle");
            setErrorMessage("");
          }}
          className="font-body text-sm font-medium underline underline-offset-4 text-ember"
        >
          Send another message
        </button>
      </div>
    );
  }

  if (configStatus === "error") {
    return (
      <div role="alert" className="py-8 space-y-4">
        <p className="font-body text-sm text-forest flex items-center gap-2">
          <FiAlertCircle className="shrink-0" />
          The contact form could not load. Please check your connection and try again.
        </p>
        <button
          type="button"
          onClick={() => void loadConfig()}
          className="bg-ember text-snow rounded-[4px] px-6 py-3 font-body text-[15px] font-medium hover:opacity-90 transition-opacity"
        >
          Retry
        </button>
      </div>
    );
  }

  const isLoading = configStatus === "loading";
  const isSubmitting = submitStatus === "submitting";
  const selectedCurrency = currencies.find((c) => c.code === form.currency);

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Honeypot (hidden from people and screen readers) */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={handleChange}
        />
      </div>

      {/* Full Name */}
      <div>
        <label htmlFor="contact-name" className={labelClass}>Full Name *</label>
        <div className="relative">
          <FiUser className={iconClass} />
          <input
            name="name"
            id="contact-name"
            required
            maxLength={120}
            autoComplete="name"
            value={form.name}
            onChange={handleChange}
            disabled={isSubmitting}
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
            maxLength={200}
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            disabled={isSubmitting}
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
            type="tel"
            maxLength={40}
            autoComplete="tel"
            value={form.phone}
            onChange={handleChange}
            disabled={isSubmitting}
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
            disabled={isLoading || isSubmitting}
            className={`${inputClass} cursor-pointer`}
          >
            <option value="">{isLoading ? "Loading services..." : "Select a service"}</option>
            {services.map((s) => (
              <option key={s.id} value={s.label}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Currency + Budget */}
      <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-6">
        <div>
          <label htmlFor="contact-currency" className={labelClass}>Currency</label>
          <div className="relative">
            <FiDollarSign className={iconClass} />
            <select
              name="currency"
              id="contact-currency"
              value={form.currency}
              onChange={handleChange}
              disabled={isLoading || isSubmitting || currencies.length === 0}
              className={`${inputClass} cursor-pointer`}
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}{c.symbol !== c.label ? ` (${c.symbol})` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="contact-budget" className={labelClass}>
            Budget Range{selectedCurrency ? ` (${selectedCurrency.code})` : ""}
          </label>
          <div className="relative">
            <FiDollarSign className={iconClass} />
            <select
              name="budget"
              id="contact-budget"
              value={form.budget}
              onChange={handleChange}
              disabled={isLoading || isSubmitting || budgetsForCurrency.length === 0}
              className={`${inputClass} cursor-pointer`}
            >
              <option value="">Select budget range</option>
              {budgetsForCurrency.map((b) => (
                <option key={b.id} value={b.label}>{b.label}</option>
              ))}
            </select>
          </div>
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
            minLength={10}
            maxLength={5000}
            value={form.details}
            onChange={handleChange}
            disabled={isSubmitting}
            className={`${inputClass} resize-none`}
            placeholder="Tell me about your project..."
          />
        </div>
      </div>

      {submitStatus === "error" && errorMessage && (
        <p role="alert" className="font-body text-sm text-ember flex items-center gap-2">
          <FiAlertCircle className="shrink-0" />
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading || isSubmitting}
        className="w-full bg-ember text-snow rounded-[4px] py-4 font-body text-[15px] font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Sending..." : "Send Message"}
        {!isSubmitting && <FiSend className="text-[15px]" />}
      </button>
    </form>
  );
};

export default ContactForm;