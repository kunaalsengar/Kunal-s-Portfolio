import { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const PRIMARY_EMAIL = 'kunaalsengar27@gmail.com';
const SECONDARY_EMAIL = 'decodzyy@gmail.com';
const AVAILABILITY_STATUS = 'AVAILABLE FOR FREELANCE & FULL-TIME OPPORTUNITIES';

const SERVICES = [
  'Full Stack Website Development',
  'Shopify & WooCommerce Development',
  'AI Chatbots & AI Agents',
  'LLM & RAG Integration',
  'API Development & Integration',
  'Mobile App Development',
  'WordPress Development',
];

const MAX_LENGTHS = {
  name: 100,
  email: 254,
  subject: 150,
  message: 3000,
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const INITIAL_FORM_STATE = {
  name: '',
  email: '',
  subject: '',
  message: '',
  website: '',
};

function buildMailtoDraftHref({ name, email, subject, message }) {
  const cleanSubject = subject.trim() || 'Portfolio Inquiry';
  const bodyLines = [
    message.trim(),
    '',
    '---',
    `From: ${name.trim() || 'Portfolio Visitor'}`,
    email.trim() ? `Reply Email: ${email.trim()}` : null,
  ].filter((line) => line !== null);

  return `mailto:${PRIMARY_EMAIL}?subject=${encodeURIComponent(cleanSubject)}&body=${encodeURIComponent(bodyLines.join('\n'))}`;
}

function validateContactForm(values) {
  const errors = {};
  const trimmedName = values.name.trim();
  const trimmedEmail = values.email.trim();
  const trimmedSubject = values.subject.trim();
  const trimmedMessage = values.message.trim();

  if (!trimmedName) {
    errors.name = 'Name is required.';
  } else if (trimmedName.length < 2) {
    errors.name = 'Please enter at least 2 characters.';
  } else if (trimmedName.length > MAX_LENGTHS.name) {
    errors.name = `Name must be ${MAX_LENGTHS.name} characters or fewer.`;
  }

  if (!trimmedEmail) {
    errors.email = 'Email address is required.';
  } else if (trimmedEmail.length > MAX_LENGTHS.email || !EMAIL_PATTERN.test(trimmedEmail)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!trimmedSubject) {
    errors.subject = 'Subject is required.';
  } else if (trimmedSubject.length < 3) {
    errors.subject = 'Please enter a subject of at least 3 characters.';
  } else if (trimmedSubject.length > MAX_LENGTHS.subject) {
    errors.subject = `Subject must be ${MAX_LENGTHS.subject} characters or fewer.`;
  }

  if (!trimmedMessage) {
    errors.message = 'Message is required.';
  } else if (trimmedMessage.length < 10) {
    errors.message = 'Please enter at least 10 characters.';
  } else if (trimmedMessage.length > MAX_LENGTHS.message) {
    errors.message = `Message must be ${MAX_LENGTHS.message} characters or fewer.`;
  }

  return errors;
}

const Contact = () => {
  const ref = useRef(null);
  const contactApiUrl = import.meta.env.VITE_CONTACT_API_URL?.trim() || '';

  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [fallbackDraftHref, setFallbackDraftHref] = useState('');

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Parallax translation for the big background text
  const y = useTransform(scrollYProgress, [0, 1], ['-10%', '20%']);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }

    if (submitStatus) {
      setSubmitStatus(null);
      setFallbackDraftHref('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateContactForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setSubmitStatus({
        type: 'error',
        message: 'Please correct the highlighted fields before sending.',
      });
      setFallbackDraftHref('');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      subject: formData.subject.trim(),
      message: formData.message.trim(),
      website: formData.website,
    };

    const draftHref = buildMailtoDraftHref(payload);

    if (!contactApiUrl) {
      setFallbackDraftHref(draftHref);
      setSubmitStatus({
        type: 'unconfigured',
        message: `Contact API endpoint is not configured yet. Use the email draft button below to send directly to ${PRIMARY_EMAIL}.`,
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);
    setFallbackDraftHref('');

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(contactApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data?.success !== false) {
        setFormData(INITIAL_FORM_STATE);
        setFieldErrors({});
        setSubmitStatus({
          type: 'success',
          message:
            data?.message ||
            'Your message has been delivered successfully. I will respond shortly.',
        });
        return;
      }

      if (data?.errors && typeof data.errors === 'object') {
        const serverFieldErrors = {};
        for (const key of ['name', 'email', 'subject', 'message']) {
          if (typeof data.errors[key] === 'string' && data.errors[key].trim()) {
            serverFieldErrors[key] = data.errors[key];
          }
        }
        if (Object.keys(serverFieldErrors).length > 0) {
          setFieldErrors(serverFieldErrors);
        }
      }

      if (response.status === 429) {
        setFallbackDraftHref(draftHref);
        setSubmitStatus({
          type: 'error',
          message:
            data?.message ||
            `Too many requests sent recently. Please wait before retrying or email ${PRIMARY_EMAIL} directly.`,
        });
        return;
      }

      if (response.status === 400 || response.status === 422) {
        setSubmitStatus({
          type: 'error',
          message: data?.message || 'Submitted details could not be validated. Please check your entries.',
        });
        return;
      }

      setFallbackDraftHref(draftHref);
      setSubmitStatus({
        type: 'error',
        message:
          data?.message ||
          `Unable to deliver via the contact server right now. You can send directly to ${PRIMARY_EMAIL} below.`,
      });
    } catch (error) {
      setFallbackDraftHref(draftHref);
      setSubmitStatus({
        type: 'error',
        message:
          error?.name === 'AbortError'
            ? `Request timed out while reaching the contact server. Use the email draft option to reach ${PRIMARY_EMAIL}.`
            : `Network error reaching the contact service. Use the email draft option below to email ${PRIMARY_EMAIL}.`,
      });
    } finally {
      window.clearTimeout(timeoutId);
      setIsSubmitting(false);
    }
  };

  return (
    <section
      ref={ref}
      id="contact"
      className="bg-[#0b0b0b] w-full min-h-screen relative overflow-hidden flex items-end pt-32 pb-0 border-t border-white/10 select-none"
    >
      {/* Background Cinematic Red Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/15 rounded-full blur-[160px] pointer-events-none z-0"></div>

      {/* Huge Background Parallax Netflix Watermark Text */}
      <motion.div
        style={{ y }}
        className="absolute top-0 left-0 w-full h-full flex flex-col justify-start items-center overflow-hidden pointer-events-none z-0 pt-16 md:pt-12 opacity-10"
      >
        <h1
          className="text-[25vw] leading-[0.75] font-black text-red-600 uppercase tracking-tighter select-none scale-y-[1.6] origin-top"
          style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif" }}
        >
          CONTACT
        </h1>
      </motion.div>

      {/* Form Card Overlay */}
      <div className="relative z-10 w-full flex justify-end items-end">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="bg-[#141414]/95 backdrop-blur-2xl border-t border-l border-white/15 w-full md:w-[90%] lg:w-[82%] p-6 sm:p-8 md:p-14 lg:p-16 text-white flex flex-col justify-between rounded-tl-[2.5rem] sm:rounded-tl-[3rem] shadow-[0_-25px_60px_rgba(0,0,0,0.9)] relative overflow-hidden"
        >
          {/* Subtle internal top crimson highlight glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-90"></div>

          {/* Header Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 md:mb-10">
            <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded bg-red-600/10 border border-red-600/30 text-xs font-mono uppercase tracking-widest text-red-500">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" aria-hidden="true"></span>
              <span>EPISODE 04 // GET IN TOUCH</span>
            </div>
            <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" aria-hidden="true"></span>
              <span>{AVAILABILITY_STATUS}</span>
            </div>
          </div>

          {/* Direct Email & Services Information */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-8 mb-8 md:mb-10 border-b border-white/10">
            <div className="lg:col-span-5 flex flex-col gap-3">
              <div>
                <span className="block text-[10px] font-mono uppercase tracking-widest text-white/40 mb-1">
                  Primary Email
                </span>
                <a
                  href={`mailto:${PRIMARY_EMAIL}`}
                  className="text-sm sm:text-base font-mono text-white hover:text-red-500 transition-colors select-text break-all focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-500 rounded-sm"
                >
                  {PRIMARY_EMAIL}
                </a>
              </div>
              <div>
                <span className="block text-[10px] font-mono uppercase tracking-widest text-white/40 mb-1">
                  Secondary Email
                </span>
                <a
                  href={`mailto:${SECONDARY_EMAIL}`}
                  className="text-sm sm:text-base font-mono text-white/80 hover:text-red-500 transition-colors select-text break-all focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-500 rounded-sm"
                >
                  {SECONDARY_EMAIL}
                </a>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-2.5">
              <span className="block text-[10px] font-mono uppercase tracking-widest text-white/40">
                Services
              </span>
              <div className="flex flex-wrap gap-2">
                {SERVICES.map((service) => (
                  <span
                    key={service}
                    className="text-[11px] font-mono text-white/80 bg-white/[0.04] border border-white/10 px-2.5 py-1 rounded"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-10 md:gap-12 w-full">
            {/* Visually hidden honeypot field for automated spam protection */}
            <div
              style={{
                position: 'absolute',
                left: '-9999px',
                width: '1px',
                height: '1px',
                overflow: 'hidden',
              }}
              aria-hidden="true"
            >
              <label htmlFor="contact-website">Website</label>
              <input
                type="text"
                id="contact-website"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={formData.website}
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col md:flex-row gap-10 md:gap-16 w-full">
              {/* Left Column: Name, Email, Subject */}
              <div className="flex-1 flex flex-col gap-8">
                <div className="relative">
                  <label
                    htmlFor="contact-name"
                    className="block text-[11px] font-mono uppercase tracking-widest text-white/60 mb-2"
                  >
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="contact-name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    required
                    maxLength={MAX_LENGTHS.name}
                    autoComplete="name"
                    aria-invalid={Boolean(fieldErrors.name)}
                    aria-describedby={fieldErrors.name ? 'contact-name-error' : undefined}
                    className="w-full bg-transparent border-b border-white/20 pb-3 text-base md:text-lg focus:outline-none focus:border-red-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-500 transition-colors placeholder-white/30 font-medium rounded-none text-white"
                  />
                  {fieldErrors.name && (
                    <p id="contact-name-error" role="alert" className="mt-1.5 text-xs font-mono text-red-400">
                      {fieldErrors.name}
                    </p>
                  )}
                </div>

                <div className="relative">
                  <label
                    htmlFor="contact-email"
                    className="block text-[11px] font-mono uppercase tracking-widest text-white/60 mb-2"
                  >
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="contact-email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    maxLength={MAX_LENGTHS.email}
                    autoComplete="email"
                    aria-invalid={Boolean(fieldErrors.email)}
                    aria-describedby={fieldErrors.email ? 'contact-email-error' : undefined}
                    className="w-full bg-transparent border-b border-white/20 pb-3 text-base md:text-lg focus:outline-none focus:border-red-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-500 transition-colors placeholder-white/30 font-medium rounded-none text-white"
                  />
                  {fieldErrors.email && (
                    <p id="contact-email-error" role="alert" className="mt-1.5 text-xs font-mono text-red-400">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                <div className="relative">
                  <label
                    htmlFor="contact-subject"
                    className="block text-[11px] font-mono uppercase tracking-widest text-white/60 mb-2"
                  >
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="contact-subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Project inquiry or opportunity"
                    required
                    maxLength={MAX_LENGTHS.subject}
                    autoComplete="off"
                    aria-invalid={Boolean(fieldErrors.subject)}
                    aria-describedby={fieldErrors.subject ? 'contact-subject-error' : undefined}
                    className="w-full bg-transparent border-b border-white/20 pb-3 text-base md:text-lg focus:outline-none focus:border-red-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-500 transition-colors placeholder-white/30 font-medium rounded-none text-white"
                  />
                  {fieldErrors.subject && (
                    <p id="contact-subject-error" role="alert" className="mt-1.5 text-xs font-mono text-red-400">
                      {fieldErrors.subject}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column: Message */}
              <div className="flex-1 flex flex-col">
                <div className="relative h-full flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="contact-message"
                      className="block text-[11px] font-mono uppercase tracking-widest text-white/60"
                    >
                      Message <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] font-mono text-white/40">
                      {formData.message.length}/{MAX_LENGTHS.message}
                    </span>
                  </div>
                  <textarea
                    id="contact-message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell me about your project scope, timeline, or role..."
                    required
                    rows={5}
                    maxLength={MAX_LENGTHS.message}
                    autoComplete="off"
                    aria-invalid={Boolean(fieldErrors.message)}
                    aria-describedby={fieldErrors.message ? 'contact-message-error' : undefined}
                    className="w-full h-full min-h-[160px] bg-transparent border-b border-white/20 pb-3 text-base md:text-lg focus:outline-none focus:border-red-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-500 transition-colors placeholder-white/30 font-medium resize-none rounded-none text-white"
                  ></textarea>
                  {fieldErrors.message && (
                    <p id="contact-message-error" role="alert" className="mt-1.5 text-xs font-mono text-red-400">
                      {fieldErrors.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Inline Status / Feedback Announcement */}
            {submitStatus && (
              <div
                role={submitStatus.type === 'error' ? 'alert' : 'status'}
                aria-live="polite"
                className={`p-4 rounded-xl border text-xs sm:text-sm font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  submitStatus.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : submitStatus.type === 'unconfigured'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                      : 'bg-red-600/10 border-red-600/40 text-red-300'
                }`}
              >
                <p className="leading-relaxed select-text">{submitStatus.message}</p>
                {fallbackDraftHref && (
                  <a
                    href={fallbackDraftHref}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded bg-white/10 hover:bg-red-600 border border-white/20 hover:border-red-600 text-white font-bold uppercase tracking-wider text-[11px] whitespace-nowrap transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
                  >
                    Open Email Draft
                    <span aria-hidden="true">&#8599;</span>
                  </a>
                )}
              </div>
            )}

            {/* Bottom Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-6 border-t border-white/10">
              <div className="space-y-1.5 text-xs text-white/50 font-light max-w-md">
                <p className="leading-relaxed">
                  Messages are validated server-side and delivered directly to {PRIMARY_EMAIL} and{' '}
                  {SECONDARY_EMAIL}.
                </p>
                {!contactApiUrl && (
                  <p className="font-mono text-[11px] text-amber-400/90">
                    Contact API URL (VITE_CONTACT_API_URL) is not configured in this build — submitting opens an email draft.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                className="px-8 py-3.5 rounded bg-red-600 text-white font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 group whitespace-nowrap shadow-[0_0_20px_rgba(229,9,20,0.6)] hover:scale-105 disabled:hover:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white self-start md:self-auto"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
                <svg
                  className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
