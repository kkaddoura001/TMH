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
        a: "The Middle East Hustle (TMH) is the region's first premium opinion and polling platform — built specifically for the people driving change across the Arab world. We ask the questions everyone in the region is thinking but nobody's asking at scale. Founders, operators, investors, and professionals vote anonymously on debates that matter: the future of work, regional identity, AI, geopolitics, culture, and more. Think The Economist meets Instagram, built for MENA.",
      },
      {
        q: "Is TMH free to use?",
        a: "Voting is completely free. The platform will always be free to participate in. We may introduce a premium tier in the future for deeper data access, but core participation — voting, reading profiles, following debates — will remain free.",
      },
      {
        q: "Who is behind TMH?",
        a: "TMH was founded by Kareem Kaddoura, a Dubai-based entrepreneur. The platform is editorially independent — no government, political party, or corporate entity funds or influences the questions we ask or the results we publish.",
      },
      {
        q: "Are the polls scientific?",
        a: "No. TMH polls are not statistically representative surveys. They represent the self-selected opinions of people who visit the platform. They should be understood as sentiment indicators, not scientific research. We never present results as nationally representative data.",
      },
    ],
  },
  {
    category: "Polls & Voting",
    questions: [
      {
        q: "How do the polls work?",
        a: "Every poll is a single question with 3–5 options. You click your answer. Your vote is anonymised — we don't store your IP address or personally identify you. After voting, you unlock full results either by sharing the poll on social media (WhatsApp, X, LinkedIn, Telegram) or entering your email. This Share Gate is what makes TMH viral — the results spread with every share.",
      },
      {
        q: "Can I vote more than once?",
        a: "No. Each device can cast one vote per poll. We use browser storage (not cookies) to remember your votes. Using VPNs or private browsing to vote multiple times violates our Terms and skews results for everyone — please don't do it.",
      },
      {
        q: "How are poll questions chosen?",
        a: "Questions are selected by the TMH editorial team based on what's trending in the region, what our Voices are talking about, and what sparks genuine debate. We use a mix of editorial judgment, Voice submissions, and AI-assisted monitoring of regional news trends. All questions are reviewed and approved by a human before going live.",
      },
      {
        q: "Can I suggest a poll question?",
        a: "Yes — if you're a Voice (a verified profile on the platform), you can submit your own poll question from your dashboard. Your question goes into an editorial review queue. If approved, it goes live with a 'Question by [Your Name]' badge that links back to your profile.",
      },
      {
        q: "What is the Share Gate?",
        a: "The Share Gate is the mechanic that sits between your vote and the full results. After you vote, you're shown the Share Gate — you can unlock results immediately by sharing the poll on WhatsApp, X, LinkedIn, or Telegram, or by entering your email. It's our viral engine: every share brings new voters. You can also skip it if you've shared before.",
      },
      {
        q: "What is the Country Breakdown?",
        a: "Once you unlock results, you see how votes broke down by country — UAE, Saudi, Egypt, Jordan, and so on. This is the tribal engagement layer. Knowing that Egyptians voted differently from Emiratis on the same question tells a real story. Country is derived from your IP at the moment of voting — it's never stored as personal data.",
      },
    ],
  },
  {
    category: "The Voices",
    questions: [
      {
        q: "What is a Voice?",
        a: "A Voice is a verified profile on TMH — a curated founder, operator, investor, or change-maker with a real story and verifiable impact in the Middle East. There are currently 94 Voice profiles and growing. Being a Voice means your story is featured on the platform, you appear in the power rankings, and your questions can go live with your name on them.",
      },
      {
        q: "How do I become a Voice?",
        a: "Apply at /apply. The bar is intentionally high. You need: real, verifiable impact (not just a job title), an active MENA connection, a unique story (pivots, failures, non-linear paths), something you've built or founded, and a LinkedIn profile we can verify. Applications are reviewed by our AI qualification system and then by the TMH editorial team. If you pass, you'll be contacted within 7 days.",
      },
      {
        q: "How are Voices ranked?",
        a: "The TMH Power Rankings are updated weekly based on: number of associated poll votes (questions you've voted on or submitted), profile view count, share count, and editorial selection. Rankings are meant to spark debate — they're not a permanent leaderboard.",
      },
      {
        q: "Can a Voice submit their own poll question?",
        a: "Yes. Voices can submit questions from their profile dashboard. The question is tagged with their name, goes through editorial review, and if approved, goes live on the platform with a 'Question by [Voice Name]' badge linking back to their profile. This is one of the most powerful features — Voices share their own questions with their networks and drive significant traffic.",
      },
    ],
  },
  {
    category: "Data & Privacy",
    questions: [
      {
        q: "What data do you collect?",
        a: "When you vote: your vote selection, the poll ID, timestamp, and your approximate country (derived from IP at voting time — the IP itself is never stored). When you give us your email: your email address and how you signed up. We don't use tracking pixels, retargeting, or cross-site analytics. See our Terms & Conditions for the full breakdown.",
      },
      {
        q: "Does TMH track my IP address?",
        a: "We use your IP address briefly at the moment of voting to determine your country (e.g., 'UAE,' 'Egypt'). The IP itself is discarded immediately. Only the country name/code is stored with your vote. We never log, store, or share full IP addresses.",
      },
      {
        q: "How does the Newsletter work?",
        a: "The Weekly Pulse is a free Tuesday newsletter. One debate breakdown. One country split. One Voice you need to know. It goes to everyone who's signed up via the share gate, the /join page, or the footer. You can unsubscribe at any time via the link in every email. We never share your email with third parties.",
      },
      {
        q: "Where does the country data in results come from?",
        a: "Every vote is tagged with the country associated with the voter's IP at the moment of voting, using a third-party geolocation API (ip-api.com). VPN users may show an incorrect country. Country data is presented in aggregate — you can never identify an individual voter from our published breakdowns.",
      },
    ],
  },
  {
    category: "Referrals & Rewards",
    questions: [
      {
        q: "Does TMH have a referral system?",
        a: "Yes — coming soon. Each registered user will get a unique referral link. Refer friends and move through tiers: Explorer (0 referrals) → Insider (5) → Ambassador (15) → Founding Voice (30). Tier upgrades unlock badges and early access to new features. The referral system launches with the full user accounts feature in Q2 2026.",
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
      <div className="bg-foreground text-background py-16 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary mb-4 font-serif">Help</p>
          <h1 className="font-display font-black text-4xl md:text-6xl uppercase tracking-tight">
            FAQ
          </h1>
          <p className="text-background/60 font-sans text-base mt-4 max-w-xl">
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
