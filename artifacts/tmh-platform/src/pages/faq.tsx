import { useState } from "react"
import { Layout } from "@/components/layout/Layout"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Link } from "wouter"

const FAQ_SECTIONS = [
  {
    category: "The Platform",
    questions: [
      {
        q: "What is The Middle East Hustle?",
        a: "The Middle East Hustle (TMH) is MENA's first opinion intelligence platform — part editorial, part data engine, part social experiment. We cover 19 countries and 541 million people across the Middle East and North Africa. The platform has five core sections: Debates (anonymous polling), Predictions (a Bloomberg-style prediction market), The Pulse (data-driven trend tracking, like Exploding Topics for MENA), The Voices (a curated directory of 94 regional leaders), and About (our manifesto and mission).",
      },
      {
        q: "Is TMH free to use?",
        a: "Yes. Voting on debates, making predictions, browsing The Pulse trends, and exploring Voice profiles are all completely free. We may introduce a premium tier in the future for deeper data access, but core participation will always remain free.",
      },
      {
        q: "Who is behind TMH?",
        a: "TMH was founded by Kareem Kaddoura. The platform is editorially independent — no government, political party, or corporate entity funds or influences the questions we ask or the results we publish.",
      },
      {
        q: "Are the polls scientific?",
        a: "No. TMH polls are not statistically representative surveys. They represent the self-selected opinions of people who visit the platform. They should be understood as sentiment indicators, not scientific research. We never present results as nationally representative data.",
      },
    ],
  },
  {
    category: "Debates",
    questions: [
      {
        q: "How do the debates work?",
        a: "Every debate is a single question with multiple options. You click your answer. Your vote is anonymous — we don't store your IP address or personally identify you. After voting, you unlock full results either by sharing the debate on social media (WhatsApp, X, LinkedIn, Telegram) or entering your email. This Share Gate is what makes TMH viral — the results spread with every share.",
      },
      {
        q: "Can I vote more than once?",
        a: "No. Each device can cast one vote per debate. We use browser storage (not cookies) to remember your votes. Using VPNs or private browsing to vote multiple times violates our Terms and skews results for everyone.",
      },
      {
        q: "How are debate questions chosen?",
        a: "Questions are selected by the TMH editorial team based on what's trending in the region, what our Voices are talking about, and what sparks genuine debate. We cover identity, money, religion, gender, power, AI, geopolitics, culture, and the future of the region. All questions are reviewed and approved by a human before going live.",
      },
      {
        q: "What is the Share Gate?",
        a: "The Share Gate sits between your vote and the full results. After you vote, you can unlock results immediately by sharing the debate on WhatsApp, X, LinkedIn, or Telegram, or by entering your email. It's our growth engine: every share brings new voters.",
      },
      {
        q: "What is the Country Breakdown?",
        a: "Once you unlock results, you see how votes broke down by country across all 19 MENA nations. Knowing that Egyptians voted differently from Emiratis on the same question tells a real story. Country is derived from your IP at the moment of voting — the IP itself is never stored.",
      },
    ],
  },
  {
    category: "Predictions",
    questions: [
      {
        q: "What is the Predictions page?",
        a: "Predictions is TMH's Bloomberg-style prediction market for MENA's biggest questions. Instead of asking 'what should happen,' we ask 'what will happen.' You track confidence levels over time, watch consensus shift, and see where the region thinks it's headed — on topics like oil prices, tech IPOs, geopolitical shifts, and more.",
      },
      {
        q: "How do predictions work?",
        a: "Each prediction card shows a question about the future, a current confidence percentage based on collective votes, and how that confidence has changed over time. You can vote on whether you think something will or won't happen, and watch the consensus evolve.",
      },
    ],
  },
  {
    category: "The Pulse",
    questions: [
      {
        q: "What is The Pulse?",
        a: "The Pulse is TMH's data-driven trend tracking page — think 'Exploding Topics' but built specifically for the MENA region. It features 12 trend cards tracking what's actually moving across the region, from the $1.2B creator economy to the 312% surge in mental health searches. Each card includes real data, growth metrics, and context.",
      },
      {
        q: "How are Pulse trends selected?",
        a: "Trends are selected through a mix of data analysis, regional news monitoring, and editorial judgment. We track search volumes, investment flows, demographic shifts, and cultural movements across all 19 MENA countries. Every trend card includes sourced data and growth percentages.",
      },
    ],
  },
  {
    category: "The Voices",
    questions: [
      {
        q: "What is a Voice?",
        a: "A Voice is a verified profile on TMH — a curated founder, operator, investor, or change-maker with a real story and verifiable impact in the Middle East. There are currently 94 Voice profiles across 10+ countries. Being a Voice means your story is featured on the platform with a full profile including your background, a personal quote, a lesson learned, and your key tags.",
      },
      {
        q: "How do I become a Voice?",
        a: "Apply through the Join The Voices page. The bar is intentionally high. You need: real, verifiable impact (not just a job title), an active MENA connection, a unique story (pivots, failures, non-linear paths), something you've built or founded, and a LinkedIn profile we can verify. Applications are reviewed and you'll be contacted if you pass.",
      },
      {
        q: "How are Voices organized?",
        a: "The Voices directory can be browsed by country, industry, and tags. Each profile includes the person's name, title, country, industry, a personal quote, a key lesson, and descriptive tags. The directory features a live ticker showing Voice stats and a real-time population counter for the MENA region.",
      },
    ],
  },
  {
    category: "Data & Privacy",
    questions: [
      {
        q: "What data do you collect?",
        a: "When you vote: your vote selection, the debate ID, timestamp, and your approximate country (derived from IP at voting time — the IP itself is never stored). When you give us your email: your email address and how you signed up. We don't use tracking pixels, retargeting, or cross-site analytics. See our Terms & Conditions for the full breakdown.",
      },
      {
        q: "Does TMH track my IP address?",
        a: "We use your IP address briefly at the moment of voting to determine your country (e.g., 'UAE,' 'Egypt'). The IP itself is discarded immediately. Only the country name is stored with your vote. We never log, store, or share full IP addresses.",
      },
      {
        q: "Where does the country data in results come from?",
        a: "Every vote is tagged with the country associated with the voter's IP at the moment of voting. VPN users may show an incorrect country. Country data is presented in aggregate — you can never identify an individual voter from our published breakdowns.",
      },
    ],
  },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={cn("border-b border-border transition-colors", open ? "pb-5" : "")}>
      <button
        onClick={() => setOpen(x => !x)}
        className="w-full flex items-start justify-between gap-4 py-5 text-left group"
      >
        <span className={cn("font-serif font-bold text-sm uppercase tracking-wide leading-snug transition-colors", open ? "text-primary" : "text-foreground group-hover:text-primary")}>
          {q}
        </span>
        <ChevronDown className={cn("w-4 h-4 flex-shrink-0 mt-0.5 text-muted-foreground transition-transform duration-200", open && "rotate-180 text-primary")} />
      </button>
      {open && (
        <p className="font-sans text-sm text-foreground/70 leading-relaxed pr-8">
          {a}
        </p>
      )}
    </div>
  )
}

export default function FAQ() {
  return (
    <Layout>
      <div className="bg-foreground text-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.28em", color: "#DC143C", marginBottom: "0.5rem" }}>
            Help
          </p>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "clamp(2rem, 5vw, 3.5rem)", textTransform: "uppercase", color: "var(--background)", letterSpacing: "-0.01em", lineHeight: 1.05, marginBottom: "0.5rem" }}>
            Frequently Asked<br />Questions
          </h1>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(250,250,250,0.45)" }}>
            Everything you need to know about The Middle East Hustle.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-14">
        {FAQ_SECTIONS.map(section => (
          <div key={section.category}>
            <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary mb-1 font-serif">
              {section.category}
            </h2>
            <div className="border-t-2 border-foreground">
              {section.questions.map(item => (
                <FAQItem key={item.q} {...item} />
              ))}
            </div>
          </div>
        ))}

        <div className="border-t border-border pt-10">
          <p className="font-sans text-sm text-muted-foreground mb-4">Still have questions?</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/about" className="text-[10px] uppercase tracking-widest font-bold font-serif text-primary hover:text-foreground transition-colors">
              About TMH →
            </Link>
            <Link href="/apply" className="text-[10px] uppercase tracking-widest font-bold font-serif text-muted-foreground hover:text-foreground transition-colors">
              Apply to be a Voice →
            </Link>
            <Link href="/terms" className="text-[10px] uppercase tracking-widest font-bold font-serif text-muted-foreground hover:text-foreground transition-colors">
              Terms & Conditions →
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}
