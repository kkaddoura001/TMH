import { Request, Response, NextFunction } from "express"

const BOT_UA_PATTERNS = [
  /Twitterbot/i,
  /facebookexternalhit/i,
  /LinkedInBot/i,
  /TelegramBot/i,
  /WhatsApp/i,
  /Slackbot/i,
  /Discordbot/i,
  /pinterest/i,
  /Googlebot/i,
  /bingbot/i,
  /Applebot/i,
  /Embedly/i,
  /vkShare/i,
  /W3C_Validator/i,
  /redditbot/i,
  /Pinterestbot/i,
  /iframely/i,
]

function isBot(ua: string): boolean {
  return BOT_UA_PATTERNS.some(p => p.test(ua))
}

const SITE = "https://themiddleeasthustle.com"
const DEFAULT_IMAGE = `${SITE}/og-cover.jpg`
const SITE_NAME = "The Tribunal, by The Middle East Hustle"

function buildHtml(meta: {
  title: string
  description: string
  url: string
  image: string
  type?: string
}): string {
  const { title, description, url, image, type = "website" } = meta
  const fullTitle = title.includes("Tribunal") || title.includes("Middle East") ? title : `${title} | ${SITE_NAME}`
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${fullTitle}</title>
  <meta name="description" content="${description}" />

  <!-- Open Graph -->
  <meta property="og:type" content="${type}" />
  <meta property="og:site_name" content="${SITE_NAME}" />
  <meta property="og:title" content="${fullTitle}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@TMHustle" />
  <meta name="twitter:title" content="${fullTitle}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />

  <!-- Redirect bots gracefully -->
  <link rel="canonical" href="${url}" />
</head>
<body>
  <h1>${fullTitle}</h1>
  <p>${description}</p>
  <a href="${url}">View on The Tribunal</a>
</body>
</html>`
}

export function ogTagsMiddleware(req: Request, res: Response, next: NextFunction) {
  const ua = req.headers["user-agent"] ?? ""
  if (!isBot(ua)) return next()

  const host = req.headers.host ?? "themiddleeasthustle.com"
  const protocol = req.secure ? "https" : "http"
  const fullUrl = `${protocol}://${host}${req.originalUrl}`

  const pollMatch = req.path.match(/^\/polls\/(\d+)/)
  if (pollMatch) {
    // We'll try to fetch poll data from the internal polls route
    const pollId = pollMatch[1]
    fetch(`http://localhost:${process.env.PORT ?? 8080}/api/polls/${pollId}`)
      .then(r => r.json())
      .then(poll => {
        const title = poll.question ?? "The Middle East's boldest question"
        const totalVotes = poll.totalVotes ?? 0
        const description = `${totalVotes.toLocaleString()} votes and counting. What do YOU think? Vote on The Tribunal — the region's most honest opinion platform.`
        const image = poll.ogImage ?? DEFAULT_IMAGE
        const html = buildHtml({ title, description, url: fullUrl, image, type: "article" })
        res.setHeader("Content-Type", "text/html")
        return res.send(html)
      })
      .catch(() => {
        const html = buildHtml({
          title: "Today's Debate | The Tribunal",
          description: "The Middle East's most honest opinion platform. Vote on what actually matters.",
          url: fullUrl,
          image: DEFAULT_IMAGE,
          type: "article",
        })
        res.setHeader("Content-Type", "text/html")
        return res.send(html)
      })
    return
  }

  const profileMatch = req.path.match(/^\/profiles\/(\d+)/)
  if (profileMatch) {
    const profileId = profileMatch[1]
    fetch(`http://localhost:${process.env.PORT ?? 8080}/api/profiles/${profileId}`)
      .then(r => r.json())
      .then(profile => {
        const name = profile.name ?? "A Hustler"
        const role = profile.role ? ` — ${profile.role}` : ""
        const company = profile.company ? ` at ${profile.company}` : ""
        const title = `${name}${role}${company}`
        const quote = profile.quote ? `"${profile.quote.slice(0, 100)}"` : ""
        const description = quote || `Meet ${name}, one of the founding Voices shaping the Middle East's future. ${profile.city ?? ""} ${profile.country ?? ""}`.trim()
        const image = profile.photoUrl ?? DEFAULT_IMAGE
        const html = buildHtml({ title, description, url: fullUrl, image })
        res.setHeader("Content-Type", "text/html")
        return res.send(html)
      })
      .catch(() => {
        const html = buildHtml({
          title: "A Voice Profile | The Tribunal",
          description: "Meet the founders, operators, and change-makers shaping the Middle East's future.",
          url: fullUrl,
          image: DEFAULT_IMAGE,
        })
        res.setHeader("Content-Type", "text/html")
        return res.send(html)
      })
    return
  }

  // Default OG for all other pages
  const pageMeta: Record<string, { title: string; description: string }> = {
    "/": {
      title: "The Tribunal — The Voice of 541 Million",
      description: "MENA's premium polling and opinion platform. Real debates. Real people. Real opinions.",
    },
    "/polls": {
      title: "All Debates | The Tribunal",
      description: "Browse every debate. 135+ questions about the future of the Arab world.",
    },
    "/profiles": {
      title: "The Voices | The Tribunal",
      description: "100+ curated founders, operators, and change-makers shaping MENA.",
    },
    "/rankings": {
      title: "Power Rankings | The Tribunal",
      description: "Who's driving the Middle East's most important conversations?",
    },
    "/join": {
      title: "Join The Tribunal",
      description: "The most honest conversation in the Middle East. Founders and operators voting every day.",
    },
    "/apply": {
      title: "Become a Voice | The Tribunal",
      description: "Think you belong? Apply now. Bar is high.",
    },
  }

  const page = pageMeta[req.path] ?? {
    title: SITE_NAME,
    description: "The voice of 541 million. Real debates. Real opinions.",
  }

  const html = buildHtml({ ...page, url: fullUrl, image: DEFAULT_IMAGE })
  res.setHeader("Content-Type", "text/html")
  return res.send(html)
}
