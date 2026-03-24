import { Link } from "wouter"
import { Layout } from "@/components/layout/Layout"

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
    title: "Strength in Adversity",
    body: "With 50% of our population under 30, we are one of the youngest, most opinionated regions on earth. That is not a problem. That is the point.",
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
            About TMH
          </h1>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(250,250,250,0.45)" }}>
            The more I know, the more I don't. But at least now we're asking out loud.
          </p>
        </div>
      </div>

      {/* Founder Statement */}
      <div className="max-w-3xl mx-auto px-4 py-20 border-b border-border">
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
          "The Middle East Hustle is a social experiment disguised as a platform. Every debate is a room I'm placing the region inside. Every vote is a voice that would otherwise never be counted. Every prediction is a bet on where we're headed."
        </blockquote>

        <p className="text-base text-muted-foreground font-sans leading-relaxed mb-6">
          I don't have the answers. Nobody does. But for the first time, we're collecting them — honestly, anonymously, at scale.
        </p>

        <p className="text-base font-sans leading-relaxed text-foreground font-bold">
          — Kareem Kaddoura, Founder
        </p>
      </div>

      {/* Why This Exists */}
      <div className="max-w-3xl mx-auto px-4 pb-20 border-b border-border">
        <h2 className="font-serif font-black uppercase text-2xl text-foreground mb-6 border-l-4 border-primary pl-4">
          Why This Exists
        </h2>
        <p className="text-base text-muted-foreground font-sans leading-relaxed mb-6">
          Because the region has opinions it keeps to itself. Because the debates that matter most — about identity, money, religion, gender, power, and the future — happen in private and disappear.
        </p>
        <p className="text-base text-muted-foreground font-sans leading-relaxed mb-6">
          TMH makes them permanent. Not to provoke. Not to divide. But because a region that cannot hear itself think cannot grow.
        </p>
        <p className="text-base text-muted-foreground font-sans leading-relaxed">
          We are not a media company. We are not a polling firm. We are the region's first collective mirror — holding up questions and letting 541 million people answer for themselves.
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

      {/* Numbers */}
      <div className="bg-foreground text-background py-16 border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { num: "94", label: "Founding Voices" },
              { num: "135+", label: "Active Debates" },
              { num: "12", label: "Topic Categories" },
              { num: "541M", label: "Potential Voices" },
            ].map(stat => (
              <div key={stat.label}>
                <div className="font-display font-black text-4xl md:text-5xl text-primary leading-none mb-2">{stat.num}</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-background/50 font-serif">{stat.label}</div>
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
            20 countries. 541 million people. One platform.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {[
              "UAE", "Saudi Arabia", "Egypt", "Jordan", "Lebanon",
              "Qatar", "Bahrain", "Kuwait", "Oman", "Iraq",
              "Morocco", "Tunisia", "Algeria", "Libya", "Sudan",
              "Palestine", "Syria", "Yemen", "Iran", "Israel",
            ].map(c => (
              <div key={c} className="border border-border px-3 py-2 text-xs font-serif uppercase tracking-widest text-foreground/80 text-center hover:border-primary hover:text-primary transition-colors">
                {c}
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
              TMH exists because the Middle East and North Africa is the most opinionated, least surveyed region on earth. There are 541 million people here — builders, dreamers, troublemakers — and no one has ever given them a single platform to say what they really think.
            </p>
            <p>
              We are not a news outlet. We are not a think tank. We do not do sponsored polls or PR research. Every question on this platform is designed to surface the truth — not a narrative.
            </p>
            <p>
              We believe that anonymous, honest data from real people is more valuable than any op-ed, any government report, any think-tank white paper. We believe the region knows itself better than anyone watching from the outside.
            </p>
            <p>
              We built TMH to be the WSJ of MENA opinion — editorial in presentation, ruthlessly neutral in methodology. The questions are provocative because the region deserves provocative questions. The data is honest because anything less is a waste of everyone's time.
            </p>
            <p className="text-foreground font-bold">
              This is MENA's living dataset. Every vote, every prediction, every profile adds to a picture of the region that has never existed before.
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
            — Kareem Kaddoura, Founder · The Middle East Hustle · Dubai, 2026
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/polls"
              className="bg-foreground text-background px-8 py-3 font-bold uppercase tracking-widest text-xs hover:bg-primary transition-colors font-serif"
            >
              Cast Your Vote
            </Link>
            <Link
              href="/profiles"
              className="border border-foreground text-foreground px-8 py-3 font-bold uppercase tracking-widest text-xs hover:bg-foreground hover:text-background transition-colors font-serif"
            >
              Meet The Voices
            </Link>
            <Link
              href="/apply"
              className="border border-primary text-primary px-8 py-3 font-bold uppercase tracking-widest text-xs hover:bg-primary hover:text-white transition-colors font-serif"
            >
              Join The Voices
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}
