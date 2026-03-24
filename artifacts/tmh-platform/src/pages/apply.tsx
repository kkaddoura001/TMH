import { useState } from "react"
import { Layout } from "@/components/layout/Layout"
import { CheckCircle2, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

const CRITERIA = [
  "Real, verifiable impact — named outcomes, not just job titles",
  "Based in MENA or with a deep, ongoing connection to the region",
  "A unique story — pivots, failures, non-linear journeys",
  "Built, led, or founded something tangible",
  "An original quote — specific to your experience, not a LinkedIn cliché",
  "A public profile verifiable on LinkedIn or in the press",
]

const COUNTRIES = [
  "UAE", "Saudi Arabia", "Egypt", "Jordan", "Lebanon", "Kuwait",
  "Bahrain", "Qatar", "Oman", "Morocco", "Tunisia", "Iraq",
  "Palestine", "Other MENA", "Diaspora"
]

const SECTORS = [
  "Technology / AI", "Fintech", "Startups & VC", "Media & Creative",
  "Healthcare / MedTech", "Education", "Real Estate", "Consulting",
  "Social Enterprise", "Government / Policy", "Arts & Culture", "Other"
]

type Status = "idle" | "submitting" | "success" | "error"

export default function Apply() {
  const [status, setStatus] = useState<Status>("idle")
  const [form, setForm] = useState({
    name: "", email: "", title: "", company: "",
    city: "", country: "", sector: "",
    bio: "", quote: "", linkedin: "", impact: "",
  })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("submitting")
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error("Server error")
      setStatus("success")
    } catch {
      setStatus("error")
    }
  }

  return (
    <Layout>
      {/* Hero */}
      <div className="bg-foreground text-background py-16 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary mb-4 font-serif">The Voices</p>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "clamp(2rem, 5vw, 3.5rem)", textTransform: "uppercase", color: "var(--background)", letterSpacing: "-0.01em", lineHeight: 1.05, marginBottom: "0.5rem" }}>
            Think You Belong<br />In The Voices?
          </h1>
          <p className="text-background/60 font-sans text-base mt-4 max-w-xl">
            We're building the most credible founder directory in the Middle East. Not everyone makes the cut. The bar is high — because our audience is discerning.
          </p>
        </div>
      </div>

      {/* Criteria */}
      <div className="border-b border-border bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="font-serif font-black uppercase text-xl tracking-widest text-foreground mb-8 border-l-4 border-primary pl-4">
            The Bar
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {CRITERIA.map((c, i) => (
              <div key={i} className="flex items-start gap-3 p-4 border border-border bg-card">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm font-sans text-foreground/80 leading-relaxed">{c}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form or Success */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        {status === "success" ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 border-2 border-primary mb-8">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-display font-black text-4xl uppercase tracking-tight text-foreground mb-4">
              Application Received.
            </h2>
            <p className="text-lg text-muted-foreground font-sans max-w-md mx-auto mb-2">
              Our AI review runs in minutes. You'll hear back within 48 hours.
            </p>
            <p className="text-sm text-muted-foreground font-sans">
              In the meantime — go vote on something that matters.
            </p>
            <a
              href="/join"
              className="inline-flex items-center gap-2 mt-8 bg-primary text-white font-bold uppercase tracking-widest text-xs px-8 py-3 hover:bg-primary/90 transition-colors"
            >
              Join The Tribunal <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-10">
            <div>
              <h2 className="font-serif font-black uppercase text-xl tracking-widest text-foreground mb-8 border-l-4 border-primary pl-4">
                Your Details
              </h2>
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Full Name *" required>
                  <input required type="text" placeholder="Kareem Kaddoura" value={form.name} onChange={set("name")}
                    className={inputCn} />
                </Field>
                <Field label="Email *" required>
                  <input required type="email" placeholder="you@company.com" value={form.email} onChange={set("email")}
                    className={inputCn} />
                </Field>
                <Field label="Title / Role *" required>
                  <input required type="text" placeholder="Founder & CEO" value={form.title} onChange={set("title")}
                    className={inputCn} />
                </Field>
                <Field label="Company / Organisation *" required>
                  <input required type="text" placeholder="Your Company" value={form.company} onChange={set("company")}
                    className={inputCn} />
                </Field>
                <Field label="City">
                  <input type="text" placeholder="Dubai" value={form.city} onChange={set("city")}
                    className={inputCn} />
                </Field>
                <Field label="Country *" required>
                  <select required value={form.country} onChange={set("country")} className={inputCn}>
                    <option value="">Select country…</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Sector *" required className="sm:col-span-2">
                  <select required value={form.sector} onChange={set("sector")} className={inputCn}>
                    <option value="">Select sector…</option>
                    {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
              </div>
            </div>

            <div>
              <h2 className="font-serif font-black uppercase text-xl tracking-widest text-foreground mb-8 border-l-4 border-primary pl-4">
                Your Story
              </h2>
              <div className="space-y-5">
                <Field label="One-Line Tagline *" required hint="Max 50 words. Think: 'Built X, scaled it to Y, now building Z.' Specific. Punchy. No LinkedIn clichés.">
                  <textarea required rows={3} value={form.bio} onChange={set("bio")}
                    placeholder="e.g. 'Co-founded MUNCH:ON (2017), scaled to 50,000 corporate users across the Gulf, sold to Careem in 2022. Now building the next one.'"
                    className={cn(inputCn, "resize-none")} />
                </Field>
                <Field label="Signature Quote *" required hint="One sentence. First person. Specific to your experience. Not a motivational poster.">
                  <input required type="text" value={form.quote} onChange={set("quote")}
                    placeholder='"The best time to build in the Middle East was 10 years ago. The second best time is now." — make it yours.'
                    className={inputCn} />
                </Field>
                <Field label="Impact Statement *" required hint="What is the one most impressive thing you have built, led, or achieved?">
                  <textarea required rows={3} value={form.impact} onChange={set("impact")}
                    placeholder="Named outcomes: revenue generated, users reached, employees hired, exits completed, publications, awards."
                    className={cn(inputCn, "resize-none")} />
                </Field>
              </div>
            </div>

            <div>
              <h2 className="font-serif font-black uppercase text-xl tracking-widest text-foreground mb-8 border-l-4 border-primary pl-4">
                Verification
              </h2>
              <Field label="LinkedIn Profile URL *" required hint="Must match your name and current role.">
                <input required type="url" placeholder="https://linkedin.com/in/yourprofile" value={form.linkedin} onChange={set("linkedin")}
                  className={inputCn} />
              </Field>
            </div>

            <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-6">
              <p className="text-xs text-muted-foreground font-sans leading-relaxed max-w-sm">
                By submitting you agree to The Tribunal's editorial standards. Applications are reviewed by our AI scoring system within minutes, then by our editorial team within 48 hours.
              </p>
              <button
                type="submit"
                disabled={status === "submitting"}
                className={cn(
                  "flex items-center gap-3 bg-primary text-white font-black uppercase tracking-[0.2em] text-sm px-10 py-4 transition-colors",
                  status === "submitting" ? "opacity-60 cursor-not-allowed" : "hover:bg-primary/90"
                )}
              >
                {status === "submitting" ? "Submitting…" : (
                  <>Submit Application <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>

            {status === "error" && (
              <p className="text-sm text-primary font-sans">Something went wrong. Please try again or email us directly.</p>
            )}
          </form>
        )}
      </div>
    </Layout>
  )
}

const inputCn = "w-full px-4 py-3 bg-background border border-border focus:outline-none focus:border-primary text-foreground text-sm font-sans transition-colors placeholder:text-muted-foreground/60 appearance-none"

function Field({ label, required, hint, children, className }: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-foreground font-serif">
        {label}
      </label>
      {hint && <p className="text-[11px] text-muted-foreground font-sans mb-1">{hint}</p>}
      {children}
    </div>
  )
}
