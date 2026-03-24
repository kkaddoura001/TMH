import { Link } from "wouter"
import { Layout } from "@/components/layout/Layout"

const PILLARS = [
  {
    num: "01",
    title: "Debates",
    body: "The questions no one asks out loud — about identity, money, religion, gender, power, and the future. Every debate is anonymous. Every vote is permanent. What the region thinks stays on record.",
    link: "/polls",
    cta: "Enter the Debates",
  },
  {
    num: "02",
    title: "Predictions",
    body: "Not what should happen — what will. A Bloomberg-style prediction market for MENA's biggest questions. Track confidence over time, watch consensus shift, and bet on where the region is headed.",
    link: "/predictions",
    cta: "Make a Prediction",
  },
  {
    num: "03",
    title: "The Pulse",
    body: "Exploding Topics for MENA. 12 data-driven trend cards tracking what's actually moving — from the $1.2B creator economy to the 312% surge in mental health searches. Real-time population counter. Live tickers. The region's vital signs.",
    link: "/mena-pulse",
    cta: "Read The Pulse",
  },
  {
    num: "04",
    title: "The Voices",
    body: "94 founders, operators, and changemakers from 10 countries — curated, not applied-for. Each Voice has a story, a lesson, and a quote. This is the region's leadership index, built one profile at a time.",
    link: "/profiles",
    cta: "Meet The Voices",
  },
]

const BELIEFS = [
  {
    num: "01",
    title: "A Social Experiment",
    body: "Every question is a controlled provocation. The point is not agreement. The point is honesty.",
  },
  {
    num: "02",
    title: "No Editorial Agenda",
    body: "We write the questions. We never write the answers. What the region thinks is the region's business.",
  },
  {
    num: "03",
    title: "Private Opinions, Public Data",
    body: "Your vote is anonymous. The aggregate is not. That gap is where the truth lives.",
  },
  {
    num: "04",
    title: "The Questions No One Asks",
    body: "Not because they're dangerous. Because nobody built the room yet. We built the room.",
  },
  {
    num: "05",
    title: "Youngest Region on Earth",
    body: "60% of MENA is under 30. 541 million people. That's not a demographic stat — it's 541 million opinions waiting to be heard.",
  },
  {
    num: "06",
    title: "Real People Only",
    body: "No bots. No astroturfing. No sponsored opinions. Just the region, speaking for itself.",
  },
]

export default function About() {
  return (
    <Layout>
      {/* Hero */}
      <div className="bg-foreground text-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.28em", color: "#DC143C", marginBottom: "0.5rem" }}>
            Est. 2026 · Founded by Kareem Kaddoura
          </p>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "clamp(2rem, 5vw, 3.5rem)", textTransform: "uppercase", color: "var(--background)", letterSpacing: "-0.01em", lineHeight: 1.05, marginBottom: "0.5rem" }}>
            The Region's First<br />Collective Mirror<span style={{ color: "#DC143C" }}>.</span>
          </h1>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(250,250,250,0.45)" }}>
            541 million people. Zero platforms asking what they think. Until now.
          </p>
        </div>
      </div>

      {/* What TMH Is */}
      <div className="max-w-3xl mx-auto px-4 py-20 border-b border-border">
        <h2 className="font-serif font-black uppercase text-2xl text-foreground mb-8 border-l-4 border-primary pl-4">
          What Is The Tribunal?
        </h2>
        <p className="text-xl font-sans leading-relaxed text-foreground mb-8">
          The Tribunal is MENA's first opinion intelligence platform — part editorial, part data engine, part social experiment. A product by The Middle East Hustle.
        </p>
        <p className="text-base text-muted-foreground font-sans leading-relaxed mb-6">
          We ask the questions nobody else asks. We collect anonymous votes from across 19 countries. We track predictions over time. We surface the trends reshaping the region. And we profile the people building it.
        </p>
        <p className="text-base text-muted-foreground font-sans leading-relaxed mb-6">
          Think of it as the WSJ of MENA opinion — editorial in presentation, ruthlessly neutral in methodology, and built for the 541 million people who live, work, and build in the Middle East and North Africa.
        </p>
        <p className="text-base text-muted-foreground font-sans leading-relaxed">
          Everything on The Tribunal — every debate, every prediction, every trend, every Voice — adds to a living dataset of what the region actually thinks. Not what governments report. Not what Western media assumes. What real people vote for when nobody's watching.
        </p>
      </div>

      {/* The Four Pillars */}
      <div className="py-20 bg-secondary/20 border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif font-black uppercase text-3xl border-b-2 border-foreground pb-4 mb-12 text-foreground">
            The Platform
          </h2>
          <div className="grid md:grid-cols-2 gap-10">
            {PILLARS.map(p => (
              <div key={p.num} className="relative">
                <span className="text-6xl font-display font-black text-foreground/8 leading-none select-none block">{p.num}</span>
                <div className="-mt-3">
                  <h3 className="font-serif font-black uppercase text-lg border-b border-border pb-2 mb-3 text-foreground tracking-wide">
                    {p.title}
                  </h3>
                  <p className="text-sm text-muted-foreground font-sans leading-relaxed mb-4">{p.body}</p>
                  <Link
                    href={p.link}
                    className="inline-block text-xs font-serif font-bold uppercase tracking-widest text-primary hover:text-foreground transition-colors border-b border-primary pb-0.5"
                  >
                    {p.cta} →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Numbers */}
      <div className="bg-foreground text-background py-16 border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { num: "94", label: "Founding Voices" },
              { num: "135+", label: "Active Debates" },
              { num: "19", label: "MENA Countries" },
              { num: "541M", label: "People in MENA" },
            ].map(stat => (
              <div key={stat.label}>
                <div className="font-display font-black text-4xl md:text-5xl text-primary leading-none mb-2">{stat.num}</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-background/50 font-serif">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Founder Statement */}
      <div className="max-w-3xl mx-auto px-4 py-20 border-b border-border">
        <h2 className="font-serif font-black uppercase text-2xl text-foreground mb-8 border-l-4 border-primary pl-4">
          From the Founder
        </h2>
        <p className="text-xl font-sans leading-relaxed text-foreground mb-8">
          This started as a question I kept asking at dinner tables, in taxis, in boardrooms, and in WhatsApp groups at midnight: what does the Middle East actually think?
        </p>

        <p className="text-base text-muted-foreground font-sans leading-relaxed mb-6">
          Not what we're told it thinks. Not what leaders say it thinks. Not what Western media assumes it thinks. What the 541 million people who live here, work here, raise children here, and build things here — actually think.
        </p>

        <p className="text-base text-muted-foreground font-sans leading-relaxed mb-6">
          There was no single place to find out. So I built one.
        </p>

        <blockquote className="font-display text-2xl md:text-3xl border-l-4 border-primary pl-6 py-4 my-12 text-foreground leading-snug">
          "The Tribunal is a social experiment disguised as a platform. Every debate is a room I'm placing the region inside. Every vote is a voice that would otherwise never be counted. Every prediction is a bet on where we're headed."
        </blockquote>

        <p className="text-base text-muted-foreground font-sans leading-relaxed mb-6">
          I don't have the answers. Nobody does. But for the first time, we're collecting them — honestly, anonymously, at scale. Every vote, every prediction, every profile adds to a picture of the region that has never existed before.
        </p>

        <p className="text-base font-sans leading-relaxed text-foreground font-bold">
          — Kareem Kaddoura, Founder
        </p>
      </div>

      {/* Beliefs */}
      <div className="py-20 bg-secondary/20 border-t border-border border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif font-black uppercase text-3xl border-b-2 border-foreground pb-4 mb-12 text-foreground">
            What We Stand For
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {BELIEFS.map(b => (
              <div key={b.num} className="relative">
                <span className="text-6xl font-display font-black text-foreground/8 leading-none select-none block">{b.num}</span>
                <div className="-mt-3">
                  <h3 className="font-serif font-black uppercase text-lg border-b border-border pb-2 mb-3 text-foreground tracking-wide">
                    {b.title}
                  </h3>
                  <p className="text-sm text-muted-foreground font-sans leading-relaxed">{b.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MENA Countries */}
      <div className="py-16 border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif font-black uppercase text-2xl text-foreground mb-2 border-l-4 border-primary pl-4">
            The Region We Cover
          </h2>
          <p className="text-sm text-foreground/60 font-sans mb-8 pl-5">
            19 countries. 541 million people. One platform.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {[
              { name: "Egypt", flag: "🇪🇬", pop: "112M" },
              { name: "Iran", flag: "🇮🇷", pop: "89M" },
              { name: "Iraq", flag: "🇮🇶", pop: "44M" },
              { name: "Saudi Arabia", flag: "🇸🇦", pop: "37M" },
              { name: "Morocco", flag: "🇲🇦", pop: "37M" },
              { name: "Algeria", flag: "🇩🇿", pop: "46M" },
              { name: "Sudan", flag: "🇸🇩", pop: "48M" },
              { name: "Yemen", flag: "🇾🇪", pop: "34M" },
              { name: "Syria", flag: "🇸🇾", pop: "23M" },
              { name: "UAE", flag: "🇦🇪", pop: "10M" },
              { name: "Jordan", flag: "🇯🇴", pop: "11M" },
              { name: "Tunisia", flag: "🇹🇳", pop: "12M" },
              { name: "Libya", flag: "🇱🇾", pop: "7M" },
              { name: "Lebanon", flag: "🇱🇧", pop: "5.5M" },
              { name: "Palestine", flag: "🇵🇸", pop: "5.5M" },
              { name: "Oman", flag: "🇴🇲", pop: "4.6M" },
              { name: "Kuwait", flag: "🇰🇼", pop: "4.3M" },
              { name: "Qatar", flag: "🇶🇦", pop: "2.7M" },
              { name: "Bahrain", flag: "🇧🇭", pop: "1.5M" },
            ].map(c => (
              <div key={c.name} className="border border-border px-3 py-2.5 text-xs font-serif uppercase tracking-widest text-foreground/80 text-center hover:border-primary hover:text-primary transition-colors flex flex-col items-center gap-1">
                <span className="text-xl not-italic" style={{ fontFamily: "system-ui" }}>{c.flag}</span>
                <span>{c.name}</span>
                <span className="text-[9px] tracking-normal normal-case text-muted-foreground font-sans">{c.pop}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ethos */}
      <div className="py-16 border-b border-border bg-secondary/10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif font-black uppercase text-2xl text-foreground mb-8 border-l-4 border-primary pl-4">
            Our Ethos
          </h2>
          <div className="space-y-6 text-base text-foreground/70 font-sans leading-relaxed">
            <p>
              The Tribunal exists because the Middle East and North Africa is the most opinionated, least surveyed region on earth. There are 541 million people here — builders, dreamers, troublemakers — and no one has ever given them a single platform to say what they really think.
            </p>
            <p>
              We are not a news outlet. We are not a think tank. We do not do sponsored polls or PR research. Every question on this platform is designed to surface the truth — not a narrative.
            </p>
            <p>
              We believe that anonymous, honest data from real people is more valuable than any op-ed, any government report, any think-tank white paper. We believe the region knows itself better than anyone watching from the outside.
            </p>
            <p>
              The questions are provocative because the region deserves provocative questions. The data is honest because anything less is a waste of everyone's time.
            </p>
            <p className="text-foreground font-bold">
              This is MENA's living dataset — and it grows with every vote.
            </p>
          </div>
        </div>
      </div>

      {/* Closing */}
      <div className="py-20 border-t border-border">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="font-display text-3xl text-foreground mb-2 leading-snug italic">
            "Bringing the voices of the Middle East<br />into one room. Finally."
          </p>
          <p className="text-sm text-muted-foreground font-sans mb-12">
            — Kareem Kaddoura, Founder · The Tribunal, by The Middle East Hustle · 2026
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/polls"
              className="bg-foreground text-background px-8 py-3 font-bold uppercase tracking-widest text-xs hover:bg-primary transition-colors font-serif"
            >
              Cast Your Vote
            </Link>
            <Link
              href="/mena-pulse"
              className="border border-foreground text-foreground px-8 py-3 font-bold uppercase tracking-widest text-xs hover:bg-foreground hover:text-background transition-colors font-serif"
            >
              Read The Pulse
            </Link>
            <Link
              href="/profiles"
              className="border border-primary text-primary px-8 py-3 font-bold uppercase tracking-widest text-xs hover:bg-primary hover:text-white transition-colors font-serif"
            >
              Meet The Voices
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}
