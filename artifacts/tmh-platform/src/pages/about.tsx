import { Link } from "wouter"
import { Layout } from "@/components/layout/Layout"

const BELIEFS = [
  {
    num: "01",
    title: "Strength in Adversity",
    body: "Survival in this region isn't guaranteed. It's earned. We've faced wars, economic collapses, and systems built to slow us down. Our youth, our innovation, and our refusal to accept less is what keeps us moving.",
  },
  {
    num: "02",
    title: "Unity in Diversity",
    body: "Dozens of languages. Multiple faiths. Wildly different histories. And somehow, shared goals. We don't erase our differences here — we use them.",
  },
  {
    num: "03",
    title: "Building for Impact",
    body: "The founders and leaders in this directory didn't build for applause. They built for legacy. That's the only kind of building worth documenting.",
  },
  {
    num: "04",
    title: "Celebrating the Underdog",
    body: "The world has underestimated this region for generations. We embrace that. Underdogs build differently — with more hunger, more creativity, and less to lose.",
  },
  {
    num: "05",
    title: "No Fluff, Just Truth",
    body: "This platform doesn't do polished bios and safe opinions. We ask hard questions. We publish real answers. We show the hustle as it actually is — not as it looks on a LinkedIn post.",
  },
  {
    num: "06",
    title: "Paving the Way Forward",
    body: "By 2030, this region will need 40 million new jobs. That's not a statistic. That's a mandate. TMH exists to document the people answering it.",
  },
]

export default function About() {
  return (
    <Layout>
      {/* Section 1 — Hero */}
      <div className="bg-foreground text-background py-20 lg:py-32 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="font-serif font-black uppercase text-6xl md:text-8xl leading-none tracking-tight mb-8">
            This Isn't a Platform.<br />It's a Reckoning.
          </h1>
          <p className="text-xl text-background/60 font-sans">
            400 million people. One region. And almost nobody asking them what they actually think.
          </p>
        </div>
      </div>

      {/* Section 2 — The Real Story */}
      <div className="max-w-3xl mx-auto px-4 py-20">
        <p className="text-xl font-serif leading-relaxed text-foreground mb-8">
          I started The Middle East Hustle because I was tired. Tired of the region being defined by its crises instead of its people. Tired of watching the world's conversation about us happen without us. Tired of founders, creatives, and builders doing extraordinary things in complete silence while the noise came from everywhere else.
        </p>

        <p className="text-base text-muted-foreground font-sans leading-relaxed mb-8">
          This region has $3.6 trillion in economic potential. Half its population is under 30. It's producing unicorns, Oscar-shortlisted films, world-class scientists, and the kind of entrepreneurs who build companies in the middle of wars, economic collapses, and systems designed to stop them. And yet the dominant narrative is still conflict, oil, and monarchy.
        </p>

        <blockquote className="font-serif italic text-2xl md:text-3xl border-l-4 border-primary pl-6 py-4 my-12 text-foreground">
          The Middle East Hustle exists to ask the questions nobody else is asking — and to let the people of this region answer them.
        </blockquote>

        <p className="text-base text-muted-foreground font-sans leading-relaxed mb-8">
          Every poll on this platform is a small act of documentation. What do founders in Cairo really think about brain drain? What does a 25-year-old in Riyadh actually believe about AI and her job? Where does the region's most influential talent want to be in 10 years — and why are so many of them hedging their answer? These aren't abstract questions. They're the pulse of a region in motion.
        </p>

        <p className="text-base text-muted-foreground font-sans leading-relaxed">
          The TMH Directory is a record of the people actually building this place. Not the ones with the best PR. Not the ones with the most followers. The ones who stayed, who came back, who built something real in conditions that would have broken most people.
        </p>
      </div>

      {/* Section 3 — What We Stand For */}
      <div className="py-20 bg-secondary/30 border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif font-black uppercase text-4xl border-b-2 border-foreground pb-4 mb-12 text-foreground">
            What We Stand For
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {BELIEFS.map(b => (
              <div key={b.num} className="relative">
                <span className="text-5xl font-serif font-black text-foreground/10 leading-none select-none">{b.num}</span>
                <div className="-mt-2">
                  <h3 className="font-serif font-bold uppercase text-lg border-b border-border pb-2 mb-3 text-foreground">
                    {b.title}
                  </h3>
                  <p className="text-sm text-muted-foreground font-sans leading-relaxed">{b.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 4 — Signed Close */}
      <div className="py-16 border-t border-border text-center">
        <div className="max-w-2xl mx-auto px-4">
          <p className="font-serif italic text-2xl text-foreground mb-4">
            "Real People. Real Hustle. Real Change."
          </p>
          <p className="text-sm text-muted-foreground font-sans mb-10">
            — Kareem Kaddoura, Founder · The Middle East Hustle
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/polls"
              className="bg-foreground text-background px-8 py-3 font-bold uppercase tracking-widest text-xs hover:bg-primary transition-colors"
            >
              Cast Your Vote
            </Link>
            <Link
              href="/profiles"
              className="border border-foreground text-foreground px-8 py-3 font-bold uppercase tracking-widest text-xs hover:bg-foreground hover:text-background transition-colors"
            >
              Meet the Hustlers
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}
