import { useState, useEffect, useCallback } from "react"
import { Layout } from "@/components/layout/Layout"
import { LiveNumber } from "@/components/live-counter/FlipDigit"
import { useI18n } from "@/lib/i18n"

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000
const BASE_DATE = new Date("2026-01-01T00:00:00Z").getTime()

interface TopicCard {
  id: string
  tag: string
  tagColor: string
  title: string
  stat: string
  delta: string
  deltaUp: boolean
  blurb: string
  source: string
  sparkData: number[]
  live?: { baseValue: number; annualGrowth: number; prefix?: string }
}

const CATEGORIES = [
  { key: "ALL", label: "All Trends", color: "#DC143C" },
  { key: "POWER", label: "Power & Politics", color: "#EF4444" },
  { key: "MONEY", label: "Money & Markets", color: "#F59E0B" },
  { key: "SOCIETY", label: "Society & Identity", color: "#EC4899" },
  { key: "TECHNOLOGY", label: "Tech & AI", color: "#3B82F6" },
  { key: "SURVIVAL", label: "Survival & Crisis", color: "#F97316" },
  { key: "MIGRATION", label: "Migration & Talent", color: "#EF4444" },
  { key: "CULTURE", label: "Culture & Religion", color: "#A855F7" },
  { key: "HEALTH", label: "Health & Youth", color: "#10B981" },
]

const EXPLODING_TOPICS: TopicCard[] = [
  {
    id: "authoritarianism-index",
    tag: "POWER",
    tagColor: "#EF4444",
    title: "Press Freedom Collapse",
    stat: "17 of 19 countries",
    delta: "Not Free",
    deltaUp: false,
    blurb: "17 of 19 MENA nations are rated \"Not Free\" or \"Partly Free\" by Freedom House. Egypt jails more journalists than any country on earth. Saudi Arabia's MBS consolidated more power than any Saudi ruler in history. The region has 0 full democracies.",
    source: "Freedom House 2026 / RSF Press Freedom Index",
    sparkData: [14, 14, 15, 15, 15, 16, 16, 16, 17, 17, 17, 17],
  },
  {
    id: "surveillance-tech",
    tag: "POWER",
    tagColor: "#EF4444",
    title: "Surveillance Tech Spending",
    stat: "$4.8B",
    delta: "+62% since 2021",
    deltaUp: true,
    blurb: "UAE deployed Pegasus spyware against its own citizens. Saudi Arabia monitors 23M social media accounts. Bahrain used facial recognition at protests. Egypt built a $45B new capital with surveillance baked into every street. MENA is the world's #1 buyer of spyware.",
    source: "Citizen Lab / Amnesty International / Carnegie Endowment",
    sparkData: [1.8, 2.1, 2.4, 2.7, 3.0, 3.3, 3.6, 3.9, 4.2, 4.5, 4.7, 4.8],
  },
  {
    id: "political-prisoners",
    tag: "POWER",
    tagColor: "#EF4444",
    title: "Political Detainees",
    stat: "60,000+",
    delta: "Across MENA",
    deltaUp: false,
    blurb: "Egypt holds 60,000+ political prisoners — more than during Mubarak. Saudi detained women's rights activists for demanding the right to drive. Bahrain imprisoned its entire opposition leadership. UAE's Ahmed Mansoor: 10 years in solitary for tweeting.",
    source: "HRW / Amnesty International / ANHRI",
    sparkData: [35, 38, 40, 42, 44, 47, 50, 52, 54, 56, 58, 60],
  },
  {
    id: "wealth-inequality",
    tag: "MONEY",
    tagColor: "#F59E0B",
    title: "Billionaire Wealth vs. GDP",
    stat: "Top 10 = $186B",
    delta: "+41%",
    deltaUp: true,
    blurb: "The 10 richest Arabs hold $186B — more than the GDP of Jordan, Lebanon, Tunisia, Libya, and Yemen combined. Saudi's PIF alone manages $930B. Meanwhile: 40% of Egyptians live below the poverty line. The gap is the widest in recorded history.",
    source: "Forbes MENA Rich List 2026 / World Bank",
    sparkData: [95, 102, 110, 118, 125, 132, 140, 150, 160, 170, 178, 186],
  },
  {
    id: "inflation-crisis",
    tag: "MONEY",
    tagColor: "#F59E0B",
    title: "Cost of Living Crisis",
    stat: "Egypt: 38% inflation",
    delta: "Peak 2024",
    deltaUp: false,
    blurb: "Egypt's pound lost 70% of its value since 2022. Lebanon's lira collapsed 98%. Tunisia's middle class shrunk by 30%. Sudan's inflation hit 256%. Meanwhile: Dubai rent up 27% YoY. The region's cost of living crisis is creating two MENAs — one that's booming, one that's collapsing.",
    source: "IMF WEO / Central Bank of Egypt / BDL",
    sparkData: [12, 15, 19, 24, 29, 33, 38, 36, 34, 32, 30, 28],
  },
  {
    id: "crypto-volume",
    tag: "MONEY",
    tagColor: "#F59E0B",
    title: "Crypto Trading Volume",
    stat: "$338B",
    delta: "+74%",
    deltaUp: true,
    blurb: "UAE is now the world's 3rd largest crypto market by volume. Dubai issued more crypto licenses in 2026 than the entire EU combined. Bahrain became the first MENA nation to regulate stablecoins. Why? Populations who don't trust banks are going on-chain.",
    source: "Chainalysis MENA Report 2026",
    sparkData: [89, 110, 125, 145, 160, 180, 210, 240, 268, 295, 318, 338],
  },
  {
    id: "sovereign-wealth",
    tag: "MONEY",
    tagColor: "#F59E0B",
    title: "Sovereign Wealth Power",
    stat: "$4.1 Trillion",
    delta: "+18%",
    deltaUp: true,
    blurb: "Gulf sovereign wealth funds now control $4.1T — more than the GDP of Germany. ADIA, PIF, QIA, Mubadala, and KIA are buying everything: Newcastle FC, Lucid Motors, Jio, Twitter debt, Silicon Valley AI labs. The Gulf is becoming the world's landlord.",
    source: "SWF Institute / PIF Annual Report 2026",
    sparkData: [2.8, 2.9, 3.0, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 4.1],
  },
  {
    id: "womens-rights",
    tag: "SOCIETY",
    tagColor: "#EC4899",
    title: "Women's Rights Gap",
    stat: "Worst region globally",
    delta: "WEF ranking",
    deltaUp: false,
    blurb: "MENA ranks last on the Global Gender Gap Index — every single year. Saudi women gained the right to drive in 2018, but male guardianship persists. Iran executed women for removing hijab. Yemen has no minimum marriage age. Kuwait: women couldn't vote until 2005. Progress is real but glacial.",
    source: "WEF Gender Gap Report 2026 / HRW",
    sparkData: [0.49, 0.50, 0.51, 0.51, 0.52, 0.52, 0.53, 0.53, 0.54, 0.54, 0.55, 0.55],
  },
  {
    id: "women-workforce",
    tag: "SOCIETY",
    tagColor: "#EC4899",
    title: "Women in the Workforce",
    stat: "33.4%",
    delta: "+9.2pp since 2019",
    deltaUp: true,
    blurb: "Saudi female workforce participation jumped from 17% to 33% in 6 years — the fastest rise in recorded history for any G20 nation. UAE boards now require 30% female representation. But: Yemen's female labor participation is 6%. Two realities.",
    source: "GASTAT / ILO 2026",
    sparkData: [17, 19, 21, 23, 25, 26, 28, 29, 30, 31, 32, 33.4],
  },
  {
    id: "honor-killings",
    tag: "SOCIETY",
    tagColor: "#EC4899",
    title: "\"Honor\"-Based Violence",
    stat: "~5,000/year",
    delta: "Underreported",
    deltaUp: false,
    blurb: "An estimated 5,000 \"honor\" killings occur annually — the real number is likely 4x higher. Jordan's penal code still offers reduced sentences. Iraq's tribal courts operate outside state law. Pakistan recorded 1,000+ cases in 2025 alone. Most cases never reach a courtroom.",
    source: "UN Women / UNFPA / HRW",
    sparkData: [5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0],
  },
  {
    id: "lgbtq-criminalization",
    tag: "SOCIETY",
    tagColor: "#EC4899",
    title: "LGBTQ+ Criminalization",
    stat: "18 of 19 countries",
    delta: "Death penalty in 6",
    deltaUp: false,
    blurb: "Homosexuality is illegal in 18 of 19 MENA countries. Six carry the death penalty (Iran, Saudi, Yemen, Qatar, UAE, Mauritania). Egypt uses dating apps to entrap gay men. Iraq passed a 15-year prison sentence law in 2024. Zero MENA countries recognize same-sex unions.",
    source: "ILGA World Database / HRW",
    sparkData: [18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18],
  },
  {
    id: "ai-adoption",
    tag: "TECHNOLOGY",
    tagColor: "#3B82F6",
    title: "AI Adoption Rate",
    stat: "68%",
    delta: "+31% YoY",
    deltaUp: true,
    blurb: "UAE ranks #1 globally in government AI readiness. Saudi Arabia's $100B AI fund is the largest sovereign AI bet on earth. Over 1,200 Arabic-language AI startups founded since 2023. But: AI is also being used for mass surveillance, deepfake propaganda, and social scoring.",
    source: "Oxford Insights / PIF / SDAIA",
    sparkData: [22, 28, 31, 35, 39, 42, 48, 52, 55, 59, 63, 68],
  },
  {
    id: "digital-censorship",
    tag: "TECHNOLOGY",
    tagColor: "#3B82F6",
    title: "Internet Censorship",
    stat: "8 countries block VPNs",
    delta: "+3 since 2022",
    deltaUp: true,
    blurb: "Iran shut down the internet during protests — 80M people went dark. Egypt blocks 600+ websites including Medium and HuffPost. Saudi Arabia monitors WhatsApp groups. UAE criminalizes VPN use for \"illegal purposes.\" The world's most connected youth lives behind the world's thickest firewalls.",
    source: "NetBlocks / Access Now / OONI",
    sparkData: [3, 4, 4, 5, 5, 5, 6, 6, 7, 7, 8, 8],
  },
  {
    id: "gaming",
    tag: "TECHNOLOGY",
    tagColor: "#3B82F6",
    title: "MENA Gaming Market",
    stat: "$6.8B",
    delta: "+28%",
    deltaUp: true,
    blurb: "Saudi Arabia is now the world's largest gaming investor through Savvy Games Group ($38B deployed). 85% of Saudi youth play daily. Riyadh hosts the world's largest esports arena. Gaming is the region's escape valve — and its governments know it.",
    source: "Newzoo / Savvy Games Group",
    sparkData: [2.1, 2.5, 2.9, 3.3, 3.7, 4.0, 4.5, 5.0, 5.5, 6.0, 6.4, 6.8],
  },
  {
    id: "water-crisis",
    tag: "SURVIVAL",
    tagColor: "#F97316",
    title: "Water Scarcity Emergency",
    stat: "12 of 19 countries",
    delta: "Below crisis threshold",
    deltaUp: false,
    blurb: "MENA has 1% of the world's freshwater but 6% of its population. Jordan has less water per capita than the Sahara. Yemen's capital Sana'a could be the first to run dry. Iraq's Tigris and Euphrates are at 30% of historical flow — Turkey and Iran are damming them. By 2040, 14 of the 33 most water-stressed countries will be in MENA.",
    source: "World Resources Institute / FAO / UNICEF",
    sparkData: [8, 9, 9, 9, 10, 10, 10, 11, 11, 11, 12, 12],
  },
  {
    id: "food-security",
    tag: "SURVIVAL",
    tagColor: "#F97316",
    title: "Food Import Dependency",
    stat: "85% imported",
    delta: "Zero change",
    deltaUp: false,
    blurb: "GCC imports 85% of its food. One disrupted shipping lane (Suez, Strait of Hormuz) and 60M people face shortages. Saudi Arabia spent $2.4B on vertical farming. Qatar built 70% food self-sufficiency from 0% after the 2017 blockade. Yemen: 17M food-insecure. Sudan: famine declared.",
    source: "FAO / KAUST / WFP",
    sparkData: [87, 87, 86, 86, 86, 85, 85, 85, 85, 85, 85, 85],
  },
  {
    id: "climate-heat",
    tag: "SURVIVAL",
    tagColor: "#F97316",
    title: "Lethal Heat Threshold",
    stat: "56°C recorded",
    delta: "Uninhabitable by 2060",
    deltaUp: true,
    blurb: "Parts of Iraq, Kuwait, and UAE are approaching the wet-bulb temperature threshold — beyond which the human body cannot cool itself. Kuwait recorded 56°C. Outdoor laborers in Qatar die at 4x the reported rate. By 2060, summer temperatures in the Gulf could exceed human survivability for 6 hours/day.",
    source: "MIT / Lancet Countdown / Nature Climate Change",
    sparkData: [48, 49, 49, 50, 51, 51, 52, 53, 53, 54, 55, 56],
  },
  {
    id: "displaced-populations",
    tag: "SURVIVAL",
    tagColor: "#F97316",
    title: "Displaced Populations",
    stat: "42 Million",
    delta: "Refugees + IDPs",
    deltaUp: false,
    blurb: "Syria: 13M displaced. Yemen: 4.5M. Iraq: 2.5M. Sudan: 9M+ (2024 war). Palestine: 6M registered refugees since 1948. Lebanon hosts more refugees per capita than any country on earth. Jordan: 1 in 3 residents is a refugee. The region produces — and absorbs — more displacement than anywhere.",
    source: "UNHCR / UNRWA / IOM 2026",
    sparkData: [28, 30, 31, 32, 33, 34, 35, 36, 38, 39, 41, 42],
    live: { baseValue: 42_000_000, annualGrowth: 0.03 },
  },
  {
    id: "kafala-system",
    tag: "MIGRATION",
    tagColor: "#EF4444",
    title: "Kafala Sponsorship System",
    stat: "23M workers affected",
    delta: "Reforms stalling",
    deltaUp: false,
    blurb: "23M migrant workers across the Gulf live under the kafala system — their visa, housing, and legal status tied to a single employer. Qatar reformed it post-World Cup; workers say nothing changed. Saudi loosened rules but enforcement is minimal. UAE's reforms exclude domestic workers. The modern workforce built on medieval contracts.",
    source: "ILO / Amnesty International / Equidem",
    sparkData: [25, 25, 24, 24, 24, 24, 23, 23, 23, 23, 23, 23],
  },
  {
    id: "brain-drain",
    tag: "MIGRATION",
    tagColor: "#EF4444",
    title: "MENA Brain Drain",
    stat: "1 in 3 graduates leave",
    delta: "Accelerating",
    deltaUp: false,
    blurb: "Lebanon lost 50% of its physicians. 77% of Tunisian engineers want to emigrate. Iraq lost 23,000 academics since 2003. Egypt loses 800+ doctors/year to the Gulf and Europe. Counter-trend: UAE and Saudi are poaching Silicon Valley talent. The region's brains are redistributing, not disappearing.",
    source: "IOM / World Bank / Arab Barometer",
    sparkData: [22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
  },
  {
    id: "expat-exodus",
    tag: "MIGRATION",
    tagColor: "#EF4444",
    title: "Nationalization vs. Expat Workforce",
    stat: "1.2M jobs nationalized",
    delta: "Since 2021",
    deltaUp: false,
    blurb: "Saudi Nitaqat reforms displaced 800K+ expat workers. UAE's Emiratisation mandate: 2% annual private sector targets. Kuwait proposed a 30% expat cap. Oman replaced 100K expats. The Gulf built its economies on imported labor — now it's trying to undo that without crashing them.",
    source: "HRDF / MOHRE / IOM",
    sparkData: [120, 250, 380, 470, 560, 650, 740, 830, 920, 1010, 1100, 1200],
  },
  {
    id: "sectarian-divide",
    tag: "CULTURE",
    tagColor: "#A855F7",
    title: "Sectarian Tension Index",
    stat: "7 active conflicts",
    delta: "Sunni–Shia fault line",
    deltaUp: false,
    blurb: "Iraq, Syria, Yemen, Lebanon, Bahrain, Iran, and Saudi Arabia all have active sectarian fault lines. Iran funds Hezbollah ($700M/yr), Hamas, and Houthis. Saudi Arabia leads a Sunni coalition. Bahrain's Shia majority is ruled by a Sunni monarchy. The 1,400-year-old divide still shapes every election, war, and alliance.",
    source: "IISS / Carnegie Middle East Center",
    sparkData: [5, 5, 6, 6, 6, 7, 7, 7, 7, 7, 7, 7],
  },
  {
    id: "religious-decline",
    tag: "CULTURE",
    tagColor: "#A855F7",
    title: "Religious Observance Decline",
    stat: "18% drop in prayer",
    delta: "Since 2013",
    deltaUp: false,
    blurb: "Arab Barometer: the share of Arabs identifying as \"not religious\" doubled in 10 years. Tunisia: 33% of youth say religion is unimportant. Lebanon: mosque attendance down 22%. Saudi Arabia opened cinemas, concerts, mixed-gender events. The most religious region on earth is quietly secularizing — and nobody's allowed to say it.",
    source: "Arab Barometer Wave VII / Pew Research",
    sparkData: [82, 80, 79, 77, 76, 74, 73, 71, 70, 68, 66, 64],
  },
  {
    id: "blasphemy-laws",
    tag: "CULTURE",
    tagColor: "#A855F7",
    title: "Blasphemy & Apostasy Laws",
    stat: "14 countries",
    delta: "Death penalty in 6",
    deltaUp: false,
    blurb: "Leaving Islam is punishable by death in 6 MENA countries. Saudi Arabia classifies atheism as terrorism. Kuwait imprisons for \"insulting religion\" on social media. Egypt jailed a teenager for posting a meme about the Quran. Blasphemy laws are the region's most powerful tool of intellectual control.",
    source: "USCIRF / Library of Congress / HRW",
    sparkData: [14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14],
  },
  {
    id: "creator-economy",
    tag: "CULTURE",
    tagColor: "#A855F7",
    title: "MENA Creator Economy",
    stat: "$1.2B",
    delta: "+42%",
    deltaUp: true,
    blurb: "Arabic is now the 4th most-used language on TikTok. Saudi Arabia alone has 28M+ active TikTok users. The average MENA influencer earns 3x more per post than their European counterpart. But creators self-censor — one wrong post and you lose your visa, your freedom, or both.",
    source: "Arab Social Media Report / TikTok 2026",
    sparkData: [0.3, 0.4, 0.5, 0.55, 0.6, 0.7, 0.78, 0.85, 0.92, 1.0, 1.1, 1.2],
  },
  {
    id: "mental-health",
    tag: "HEALTH",
    tagColor: "#10B981",
    title: "Mental Health Search Volume",
    stat: "312% increase",
    delta: "+312%",
    deltaUp: true,
    blurb: "\"Anxiety\" in Arabic is now the most-searched health term in 14 MENA countries. Saudi Arabia launched 1,600 mental health clinics. UAE made therapy sessions tax-deductible. Still: 1 psychiatrist per 250,000 people in Egypt. Suicide is illegal in 12 MENA countries. Stigma kills more than the illness.",
    source: "Google Trends MENA / WHO EMRO",
    sparkData: [30, 42, 55, 68, 82, 95, 110, 135, 168, 210, 265, 312],
  },
  {
    id: "youth-unemployment",
    tag: "HEALTH",
    tagColor: "#10B981",
    title: "Youth Unemployment",
    stat: "26%",
    delta: "Highest globally",
    deltaUp: false,
    blurb: "MENA youth unemployment is the highest on earth — 2x the global average. Tunisia: 36%. Jordan: 40%. Egypt: 29%. Libya: 50%. The region's youngest population has the fewest jobs. 10M new jobs needed annually just to keep up. Saudi Vision 2030 created 600K jobs — and needs 4M more.",
    source: "ILO Global Employment Trends 2026",
    sparkData: [25, 25, 26, 27, 28, 28, 27, 27, 26, 26, 26, 26],
  },
  {
    id: "youth-bulge",
    tag: "HEALTH",
    tagColor: "#10B981",
    title: "Population Under 30",
    stat: "60%",
    delta: "~325M people",
    deltaUp: true,
    blurb: "MENA has the youngest population on earth relative to its economy. Median age: 26 (vs. Europe: 44). Egypt adds 2M people per year. Gaza's median age is 18. This is either the region's greatest asset or a ticking time bomb — depending on whether it creates jobs or just creates frustration.",
    source: "UN Population Division / ILO",
    sparkData: [63, 63, 62, 62, 62, 61, 61, 61, 61, 60, 60, 60],
    live: { baseValue: 325_000_000, annualGrowth: 0.016 },
  },
  {
    id: "child-marriage",
    tag: "HEALTH",
    tagColor: "#10B981",
    title: "Child Marriage Rate",
    stat: "1 in 5 girls",
    delta: "Before age 18",
    deltaUp: false,
    blurb: "20% of girls in MENA are married before 18. Yemen: 32%. Sudan: 34%. Egypt: 17%. Iraq: 24%. Child marriage spiked during COVID and during conflicts — families marry daughters to reduce mouths to feed. Only Tunisia and Morocco have set 18 as the minimum with no exceptions.",
    source: "UNICEF / Girls Not Brides / UNFPA",
    sparkData: [25, 24, 24, 23, 23, 22, 22, 21, 21, 20, 20, 20],
  },
  {
    id: "oil-dependency",
    tag: "MONEY",
    tagColor: "#F59E0B",
    title: "Oil Revenue Dependency",
    stat: "70% of Gulf GDP",
    delta: "Target: 50% by 2030",
    deltaUp: false,
    blurb: "Despite Vision 2030 rhetoric, oil still funds 70%+ of Saudi, Kuwait, and Iraq government budgets. The entire Gulf economic miracle runs on a commodity that the world is trying to quit. UAE is furthest along in diversification (30% oil). Iraq is 95% oil-dependent. The clock is ticking louder than any press release admits.",
    source: "IMF Article IV Consultations / OPEC",
    sparkData: [85, 83, 82, 80, 78, 76, 75, 74, 73, 72, 71, 70],
  },
  {
    id: "sportswashing",
    tag: "POWER",
    tagColor: "#EF4444",
    title: "Sportswashing Spending",
    stat: "$75B+",
    delta: "Since 2016",
    deltaUp: true,
    blurb: "Saudi: LIV Golf ($2B), Newcastle FC ($700M), Cristiano Ronaldo ($200M/yr), WWE, Formula 1, esports. Qatar: World Cup ($220B). UAE: Man City, Formula 1, UFC. The region spent more on sports in 10 years than most nations spend on healthcare. Critics call it reputation laundering. Gulf states call it diversification.",
    source: "Grant Liberty / PlayTheGame / Forbes",
    sparkData: [8, 15, 22, 28, 35, 42, 48, 55, 60, 65, 70, 75],
  },
  {
    id: "normalization",
    tag: "POWER",
    tagColor: "#EF4444",
    title: "Arab-Israel Normalization",
    stat: "4 Abraham Accords",
    delta: "Saudi deal pending",
    deltaUp: true,
    blurb: "UAE, Bahrain, Morocco, and Sudan normalized with Israel. Saudi Arabia was reportedly weeks away before Oct 7. Trade between UAE and Israel hit $3.5B. Meanwhile: 85% of Arab public opinion still opposes normalization. The gap between governments and their people has never been wider on this issue.",
    source: "Arab Barometer / Abraham Accords Institute",
    sparkData: [0, 0, 0, 0, 2, 2, 3, 3, 4, 4, 4, 4],
  },
  {
    id: "tobacco-epidemic",
    tag: "HEALTH",
    tagColor: "#10B981",
    title: "Tobacco & Vaping Epidemic",
    stat: "42% male smoking rate",
    delta: "Vaping +180%",
    deltaUp: true,
    blurb: "MENA has the fastest-growing vaping market on earth. Jordan: 65% of men smoke — highest globally. Lebanon: 37% of teenagers vape. Egypt sells cigarettes for $1.50/pack. Saudi Arabia banned shisha in restaurants then reversed it within months. WHO calls MENA the last tobacco frontier.",
    source: "WHO EMRO / Euromonitor / Lancet",
    sparkData: [25, 27, 29, 31, 33, 34, 36, 37, 38, 39, 41, 42],
  },
  {
    id: "cannabis-debate",
    tag: "CULTURE",
    tagColor: "#A855F7",
    title: "Cannabis Reform Momentum",
    stat: "3 countries decriminalizing",
    delta: "Morocco, Lebanon, Tunisia",
    deltaUp: true,
    blurb: "Morocco legalized medical cannabis and became Africa's largest legal exporter ($420M in 2026). Lebanon passed cultivation laws for export. Tunisia is debating personal use decriminalization. Still: UAE punishes possession with prison. Saudi Arabia executes for trafficking. The war on drugs is splitting MENA in two.",
    source: "INCB / Reuters / Morocco Ministry of Interior",
    sparkData: [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 3, 3],
  },
  {
    id: "tourism-boom",
    tag: "MONEY",
    tagColor: "#F59E0B",
    title: "Saudi Tourism Revolution",
    stat: "109M visits",
    delta: "+23%",
    deltaUp: true,
    blurb: "Saudi Arabia went from 0 tourist visas to 109M visits in 5 years. NEOM's Sindalah island opens 2026. AlUla saw 500,000 visitors. Vision 2030 target: 150M by 2030. Alcohol now served in diplomatic zones. A kingdom that banned cinemas until 2018 is now building a Disneyland competitor.",
    source: "Saudi Tourism Authority / MoT",
    sparkData: [18, 27, 39, 51, 62, 70, 78, 85, 92, 98, 104, 109],
  },
  {
    id: "domestic-workers",
    tag: "MIGRATION",
    tagColor: "#EF4444",
    title: "Domestic Worker Abuse",
    stat: "3.2M+ workers",
    delta: "Minimal protections",
    deltaUp: false,
    blurb: "3.2M domestic workers across the Gulf — mostly women from Ethiopia, Philippines, and South Asia — live in employers' homes with no labor law protections. Passport confiscation is illegal but universal. Kuwait: 2 domestic worker deaths/week reported. UAE excluded domestic workers from 2022 labor reforms. The invisible workforce.",
    source: "HRW / ILO / Amnesty International",
    sparkData: [2.5, 2.6, 2.7, 2.8, 2.8, 2.9, 2.9, 3.0, 3.0, 3.1, 3.1, 3.2],
  },
]

const TICKER_ITEMS = [
  { label: "PRESS FREEDOM", value: "17/19", delta: "NOT FREE", up: false },
  { label: "SURVEILLANCE", value: "$4.8B", delta: "+62%", up: true },
  { label: "BILLIONAIRES", value: "$186B", delta: "+41%", up: true },
  { label: "CRYPTO VOL", value: "$338B", delta: "+74%", up: true },
  { label: "SWF ASSETS", value: "$4.1T", delta: "+18%", up: true },
  { label: "WATER CRISIS", value: "12/19", delta: "CRITICAL", up: false },
  { label: "DISPLACED", value: "42M", delta: "GROWING", up: false },
  { label: "BRAIN DRAIN", value: "1 in 3", delta: "LEAVING", up: false },
  { label: "MENTAL HEALTH", value: "+312%", delta: "SEARCHES", up: true },
  { label: "YOUTH JOBLESS", value: "26%", delta: "WORST", up: false },
  { label: "LGBTQ+ ILLEGAL", value: "18/19", delta: "6 DEATH", up: false },
  { label: "CHILD MARRIAGE", value: "1 in 5", delta: "GIRLS", up: false },
  { label: "SPORTSWASHING", value: "$75B+", delta: "SPENT", up: true },
  { label: "FOOD IMPORTS", value: "85%", delta: "NO CHANGE", up: false },
]

function useLiveCounter(baseValue: number, annualGrowth: number, tickMs = 1000) {
  const perMs = (baseValue * annualGrowth) / MS_PER_YEAR
  const calc = useCallback(() => {
    const elapsed = Date.now() - BASE_DATE
    return Math.floor(baseValue + elapsed * perMs)
  }, [baseValue, perMs])
  const [value, setValue] = useState(calc)
  useEffect(() => {
    const id = setInterval(() => setValue(calc()), tickMs)
    return () => clearInterval(id)
  }, [calc, tickMs])
  return value
}

function MiniSparkline({ data, color = "#DC143C", id }: { data: number[]; color?: string; id: string }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const w = 120
  const h = 32
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * (h - 4) - 2
    return `${x},${y}`
  }).join(" ")

  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <defs>
        <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${h} ${points} ${w},${h}`}
        fill={`url(#spark-${id})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TopicCardComponent({ topic, index }: { topic: TopicCard; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { t } = useI18n()
  const liveValue = useLiveCounter(
    topic.live?.baseValue ?? 0,
    topic.live?.annualGrowth ?? 0
  )

  useEffect(() => {
    const tm = setTimeout(() => setMounted(true), index * 50)
    return () => clearTimeout(tm)
  }, [index])

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      style={{
        background: "rgba(0,0,0,0.5)",
        border: "1px solid rgba(255,255,255,0.06)",
        padding: "20px 24px",
        cursor: "pointer",
        transition: "all 0.4s cubic-bezier(0.23,1,0.32,1)",
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(12px)",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = `${topic.tagColor}55`
        ;(e.currentTarget as HTMLElement).style.background = `${topic.tagColor}08`
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)"
        ;(e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.5)"
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${topic.tagColor}, transparent)`, opacity: 0.4 }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <span style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 9,
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          color: topic.tagColor,
          background: `${topic.tagColor}15`,
          padding: "2px 8px",
        }}>
          {t(topic.tag)}
        </span>
        <span style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700,
          color: topic.deltaUp ? "#10B981" : "#EF4444",
          display: "flex", alignItems: "center", gap: 3,
        }}>
          {topic.deltaUp ? "\u25B2" : "\u25BC"} {t(topic.delta)}
        </span>
      </div>

      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.65)", marginBottom: 8 }}>
        {t(topic.title)}
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
        {topic.live ? (
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", fontSize: "clamp(1.3rem, 2.5vw, 1.8rem)" }}>
            <LiveNumber
              value={liveValue}
              className="tabular-nums"
              style={{ fontFamily: "inherit", fontWeight: "inherit", fontSize: "inherit", letterSpacing: "inherit" }}
            />
          </span>
        ) : (
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", fontSize: "clamp(1.3rem, 2.5vw, 1.8rem)" }}>
            {topic.stat}
          </span>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.2)" }}>
          {topic.live ? `${(liveValue / 1_000_000).toFixed(1)}M people` : topic.stat}
        </span>
        <MiniSparkline data={topic.sparkData} color={topic.tagColor} id={topic.id} />
      </div>

      {expanded && (
        <div style={{ marginTop: 16, paddingTop: 12, borderTop: `1px solid ${topic.tagColor}20` }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: 8 }}>
            {topic.blurb}
          </p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 8, color: "rgba(255,255,255,0.15)", textTransform: "uppercase", letterSpacing: "0.15em" }}>
            {t("Source:")} {topic.source}
          </p>
        </div>
      )}
    </div>
  )
}

function PulseTicker() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS]

  return (
    <div style={{ background: "#0D0D0D", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
      <div className="tmh-ticker-scroll">
        {doubled.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex", alignItems: "center", gap: "0.6rem",
              padding: "0.7rem 2rem",
              borderRight: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(250,250,250,0.5)" }}>
              {item.label}
            </span>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "#fff" }}>
              {item.value}
            </span>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.72rem", color: item.up ? "#10B981" : "#DC143C" }}>
              {item.up ? "▲" : "▼"} {item.delta}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function BigNumber() {
  const pop = useLiveCounter(541_000_000, 0.0156, 500)
  const { t } = useI18n()

  return (
    <div style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(220,20,60,0.08)", padding: "28px 32px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, #DC143C, transparent)", opacity: 0.3 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#DC143C", animation: "pulse-glow 2s ease-in-out infinite" }} />
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "#DC143C" }}>
          {t("Live Counter")}
        </span>
      </div>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.45)", marginBottom: 6 }}>
        {t("MENA Population Right Now")}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, color: "#DC143C", letterSpacing: "-0.02em", fontSize: "clamp(2rem, 4vw, 3rem)" }}>
          <LiveNumber
            value={pop}
            className="tabular-nums"
            style={{ fontFamily: "inherit", fontWeight: "inherit", fontSize: "inherit", letterSpacing: "inherit" }}
          />
        </span>
      </div>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 8, lineHeight: 1.5 }}>
        {t("Growing by ~8.2 million per year — roughly 1 new person every 4 seconds. 60% are under 30.")}
      </p>
    </div>
  )
}

function CategoryFilter({ active, onSelect }: { active: string; onSelect: (key: string) => void }) {
  const { t } = useI18n()
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "16px 0" }}>
      {CATEGORIES.map(cat => {
        const isActive = active === cat.key
        return (
          <button
            key={cat.key}
            onClick={() => onSelect(cat.key)}
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 10,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              padding: "6px 14px",
              border: `1px solid ${isActive ? cat.color : "rgba(255,255,255,0.1)"}`,
              background: isActive ? `${cat.color}18` : "transparent",
              color: isActive ? cat.color : "rgba(255,255,255,0.4)",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {t(cat.label)}
            <span style={{ marginLeft: 6, fontSize: 9, opacity: 0.6 }}>
              {cat.key === "ALL"
                ? EXPLODING_TOPICS.length
                : EXPLODING_TOPICS.filter(tp => tp.tag === cat.key).length}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default function MenaPulse() {
  const [activeCategory, setActiveCategory] = useState("ALL")
  const { t, isAr } = useI18n()

  const filtered = activeCategory === "ALL"
    ? EXPLODING_TOPICS
    : EXPLODING_TOPICS.filter(tp => tp.tag === activeCategory)

  return (
    <Layout>
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>

      <div className="bg-foreground text-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.28em", color: "#DC143C", marginBottom: "0.5rem" }}>
            {t("The Pulse")}
          </p>
          <h1 style={{ fontFamily: isAr ? "'IBM Plex Sans Arabic', sans-serif" : "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "clamp(2rem, 5vw, 3.5rem)", textTransform: "uppercase", color: "var(--background)", letterSpacing: "-0.01em", lineHeight: 1.05, marginBottom: "0.5rem" }}>
            {isAr ? (
              <>{t("What's Actually Happening in MENA")}<span style={{ color: "#DC143C" }}>.</span></>
            ) : (
              <>What's Actually<br />Happening in MENA<span style={{ color: "#DC143C" }}>.</span></>
            )}
          </h1>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(250,250,250,0.45)" }}>
            {EXPLODING_TOPICS.length} {t("trends the region needs to confront. Updated quarterly.")}
          </p>
        </div>

        <PulseTicker />

        <div style={{ background: "#0D0D0D", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "0.65rem 0", display: "flex", alignItems: "center", gap: "2.5rem", justifyContent: "center", flexWrap: "wrap" }}>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(250,250,250,0.5)" }}>
            <span style={{ color: "#DC143C", fontWeight: 900, fontSize: "0.85rem", marginRight: 6 }}>{EXPLODING_TOPICS.length}</span> {t("Trends")}
          </span>
          <span style={{ width: 1, height: 14, background: "rgba(255,255,255,0.1)" }} />
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(250,250,250,0.5)" }}>
            <span style={{ color: "#DC143C", fontWeight: 900, fontSize: "0.85rem", marginRight: 6 }}>{CATEGORIES.length - 1}</span> {t("Categories")}
          </span>
          <span style={{ width: 1, height: 14, background: "rgba(255,255,255,0.1)" }} />
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(250,250,250,0.5)" }}>
            <span style={{ color: "#DC143C", fontWeight: 900, fontSize: "0.85rem", marginRight: 6 }}>19</span> {t("Countries")}
          </span>
          <span style={{ width: 1, height: 14, background: "rgba(255,255,255,0.1)" }} />
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(250,250,250,0.5)" }}>
            <span style={{ color: "#DC143C", fontWeight: 900, fontSize: "0.85rem", marginRight: 6 }}>541M</span> {t("People")}
          </span>
        </div>
      </div>

      <div style={{ minHeight: "100vh", background: "#0A0A0A", color: "#fff", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(220,20,60,0.04) 0%, transparent 60%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 16px" }}>
            <BigNumber />
          </div>

          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 16px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{ width: 3, height: 16, background: "#DC143C" }} />
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(255,255,255,0.5)" }}>
                {t("Exploding Trends")}
              </span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, color: "rgba(255,255,255,0.2)", marginLeft: 8, letterSpacing: "0.05em" }}>
                {t("Click any card for the full story")}
              </span>
            </div>

            <CategoryFilter active={activeCategory} onSelect={setActiveCategory} />

            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.2)", marginBottom: 16, letterSpacing: "0.05em" }}>
              {t("Showing")} {filtered.length} {t("of")} {EXPLODING_TOPICS.length} {t("trends")}
              {activeCategory !== "ALL" && (
                <button
                  onClick={() => setActiveCategory("ALL")}
                  style={{ marginLeft: 12, color: "#DC143C", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: "inherit", letterSpacing: "inherit", textDecoration: "underline" }}
                >
                  {t("Clear filter")}
                </button>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 12 }}>
              {filtered.map((topic, i) => (
                <TopicCardComponent key={topic.id} topic={topic} index={i} />
              ))}
            </div>
          </div>

          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 16px 48px", textAlign: "center" }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, color: "rgba(255,255,255,0.12)", textTransform: "uppercase", letterSpacing: "0.12em", maxWidth: 640, margin: "0 auto", lineHeight: 1.8 }}>
              Data compiled from Freedom House, World Bank, IMF, ILO, UNHCR, HRW, Amnesty International, WHO, Chainalysis, Citizen Lab, Arab Barometer, WEF, FAO, UNICEF & UN Population Division. Click any card for source attribution.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
