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
      <div className="bg-foreground text-background py-20 lg:py-32 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary mb-8 font-serif">
            Est. 2026 · Founded by Kareem Kaddoura
          </div>
          <h1 className="font-display font-black text-5xl md:text-7xl lg:text-8xl leading-none tracking-tight mb-8">
            About TMH<span className="text-primary">.</span>
          </h1>
          <p className="text-xl text-background/60 font-sans max-w-2xl leading-relaxed italic font-display" style={{ maxWidth: "760px" }}>
            "The more I know, the more I don't. But at least now we're asking out loud."
          </p>
        </div>
      </div>

      {/* Founder Statement */}
      <div className="max-w-3xl mx-auto px-4 py-20 border-b border-border">
        <p className="text-xl font-sans leading-relaxed text-foreground mb-8">
          This started as a question I kept asking at dinner tables, in taxis, in boardrooms, and in WhatsApp groups at midnight: what does the Middle East actually think?
        </p>

        <p className="text-base text-muted-foreground font-sans leading-relaxed mb-6">
          Not what we're told it thinks. Not what leaders say it thinks. Not what Western media assumes it thinks. What the 400 million people who live here, work here, raise children here, and build things here — actually think.
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
          We are not a media company. We are not a polling firm. We are the region's first collective mirror — holding up questions and letting 400 million people answer for themselves.
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
              { num: "67", label: "Founding Voices" },
              { num: "135+", label: "Active Debates" },
              { num: "12", label: "Topic Categories" },
              { num: "400M", label: "Potential Voices" },
            ].map(stat => (
              <div key={stat.label}>
                <div className="font-display font-black text-4xl md:text-5xl text-primary leading-none mb-2">{stat.num}</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-background/50 font-serif">{stat.label}</div>
              </div>
            ))}
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
