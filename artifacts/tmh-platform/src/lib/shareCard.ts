interface ShareCardOptions {
  question: string
  votedOptionText: string
  votedPct: number
  totalVotes: number
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(" ")
  let line = ""
  let currentY = y
  for (let i = 0; i < words.length; i++) {
    const test = line + words[i] + " "
    if (ctx.measureText(test).width > maxWidth && i > 0) {
      ctx.fillText(line.trim(), x, currentY)
      line = words[i] + " "
      currentY += lineHeight
    } else {
      line = test
    }
  }
  ctx.fillText(line.trim(), x, currentY)
  return currentY
}

export async function generateShareCard(opts: ShareCardOptions): Promise<Blob | null> {
  const W = 1200
  const H = 630
  const PAD = 64

  const canvas = document.createElement("canvas")
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext("2d")
  if (!ctx) return null

  await document.fonts.ready

  const BLACK = "#0A0A0A"
  const WHITE = "#F2EDE4"
  const RED = "#D4001F"
  const MUTED = "#888880"

  ctx.fillStyle = BLACK
  ctx.fillRect(0, 0, W, H)

  ctx.strokeStyle = "#1a1a1a"
  ctx.lineWidth = 1
  const GRID = 60
  for (let gx = 0; gx < W; gx += GRID) {
    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke()
  }
  for (let gy = 0; gy < H; gy += GRID) {
    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke()
  }

  ctx.fillStyle = BLACK
  ctx.fillRect(0, 0, W, H)

  ctx.fillStyle = RED
  ctx.fillRect(PAD, PAD, 48, 4)

  ctx.fillStyle = WHITE
  ctx.font = `900 28px "Barlow Condensed", "Arial Narrow", Arial, sans-serif`
  ctx.letterSpacing = "4px"
  ctx.fillText("THE TRIBUNAL", PAD, PAD + 44)
  ctx.font = `600 11px "DM Sans", Arial, sans-serif`
  ctx.letterSpacing = "3px"
  ctx.fillStyle = MUTED
  ctx.fillText("BY THE MIDDLE EAST HUSTLE", PAD, PAD + 62)

  ctx.letterSpacing = "0px"
  ctx.fillStyle = WHITE
  ctx.font = `900 52px "Barlow Condensed", "Arial Narrow", Arial, sans-serif`
  const questionBottom = wrapText(ctx, opts.question.toUpperCase(), PAD, PAD + 120, W - PAD * 2, 60)

  const labelY = questionBottom + 52
  ctx.font = `700 11px "DM Sans", Arial, sans-serif`
  ctx.letterSpacing = "3px"
  ctx.fillStyle = MUTED
  ctx.fillText("I VOTED:", PAD, labelY)

  ctx.letterSpacing = "1px"
  ctx.fillStyle = RED
  ctx.font = `800 26px "Barlow Condensed", "Arial Narrow", Arial, sans-serif`
  ctx.fillText(opts.votedOptionText.toUpperCase(), PAD + ctx.measureText("I VOTED:  ").width, labelY)

  const barY = labelY + 28
  const BAR_H = 8
  const barW = W - PAD * 2

  ctx.fillStyle = "#2a2a2a"
  ctx.fillRect(PAD, barY, barW, BAR_H)

  const fillW = Math.round(barW * (opts.votedPct / 100))
  ctx.fillStyle = RED
  ctx.fillRect(PAD, barY, fillW, BAR_H)

  ctx.font = `700 12px "DM Sans", Arial, sans-serif`
  ctx.letterSpacing = "0px"
  ctx.fillStyle = MUTED
  ctx.fillText(`${opts.votedPct}%  ·  ${opts.totalVotes.toLocaleString()} votes`, PAD, barY + BAR_H + 20)

  const footerY = H - PAD
  ctx.fillStyle = "#333"
  ctx.fillRect(PAD, footerY - 20, W - PAD * 2, 1)

  ctx.font = `700 11px "DM Sans", Arial, sans-serif`
  ctx.letterSpacing = "2px"
  ctx.fillStyle = MUTED
  ctx.fillText("CAST YOUR VOTE AT THEMIDDLEEASTHUSTLE.COM", PAD, footerY)

  ctx.fillStyle = RED
  ctx.fillRect(W - PAD - 8, footerY - 5, 8, 8)

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png", 0.95)
  })
}

export async function generateStoryCard(opts: ShareCardOptions): Promise<Blob | null> {
  const W = 1080
  const H = 1920
  const PAD = 80

  const canvas = document.createElement("canvas")
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext("2d")
  if (!ctx) return null

  await document.fonts.ready

  const BLACK = "#0A0A0A"
  const WHITE = "#F2EDE4"
  const RED = "#D4001F"
  const MUTED = "#888880"

  // Background
  ctx.fillStyle = BLACK
  ctx.fillRect(0, 0, W, H)

  // Subtle grid
  ctx.strokeStyle = "#161616"
  ctx.lineWidth = 1
  const GRID = 80
  for (let gx = 0; gx < W; gx += GRID) {
    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke()
  }
  for (let gy = 0; gy < H; gy += GRID) {
    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke()
  }

  // Top red bar
  ctx.fillStyle = RED
  ctx.fillRect(PAD, 160, 64, 6)

  // Brand
  ctx.fillStyle = WHITE
  ctx.font = `900 52px "Barlow Condensed", "Arial Narrow", Arial, sans-serif`
  ctx.letterSpacing = "6px"
  ctx.fillText("THE TRIBUNAL", PAD, 260)

  ctx.font = `600 18px "DM Sans", Arial, sans-serif`
  ctx.letterSpacing = "4px"
  ctx.fillStyle = MUTED
  ctx.fillText("BY THE MIDDLE EAST HUSTLE", PAD, 296)

  // Divider
  ctx.fillStyle = "#2a2a2a"
  ctx.fillRect(PAD, 330, W - PAD * 2, 1)

  // Question
  ctx.letterSpacing = "0px"
  ctx.fillStyle = WHITE
  ctx.font = `900 72px "Barlow Condensed", "Arial Narrow", Arial, sans-serif`
  wrapText(ctx, opts.question.toUpperCase(), PAD, 460, W - PAD * 2, 82)

  // Voted label
  const voteY = 820
  ctx.font = `700 18px "DM Sans", Arial, sans-serif`
  ctx.letterSpacing = "4px"
  ctx.fillStyle = MUTED
  ctx.fillText("I VOTED:", PAD, voteY)

  ctx.fillStyle = RED
  ctx.font = `800 42px "Barlow Condensed", "Arial Narrow", Arial, sans-serif`
  ctx.letterSpacing = "1px"
  ctx.fillText(opts.votedOptionText.toUpperCase(), PAD, voteY + 52)

  // Bar
  const barY = voteY + 80
  const BAR_H = 12
  const barW = W - PAD * 2
  ctx.fillStyle = "#2a2a2a"
  ctx.fillRect(PAD, barY, barW, BAR_H)
  ctx.fillStyle = RED
  ctx.fillRect(PAD, barY, Math.round(barW * (opts.votedPct / 100)), BAR_H)

  ctx.font = `700 20px "DM Sans", Arial, sans-serif`
  ctx.letterSpacing = "0px"
  ctx.fillStyle = MUTED
  ctx.fillText(`${opts.votedPct}%  ·  ${opts.totalVotes.toLocaleString()} votes`, PAD, barY + BAR_H + 32)

  // CTA block
  const ctaY = H - 280
  ctx.fillStyle = RED
  ctx.fillRect(PAD, ctaY, W - PAD * 2, 100)
  ctx.fillStyle = WHITE
  ctx.font = `900 28px "Barlow Condensed", "Arial Narrow", Arial, sans-serif`
  ctx.letterSpacing = "4px"
  ctx.textAlign = "center"
  ctx.fillText("CAST YOUR VOTE", W / 2, ctaY + 42)
  ctx.font = `600 18px "DM Sans", Arial, sans-serif`
  ctx.letterSpacing = "2px"
  ctx.fillStyle = "rgba(255,255,255,0.7)"
  ctx.fillText("THEMIDDLEEASTHUSTLE.COM", W / 2, ctaY + 70)
  ctx.textAlign = "left"

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png", 0.95)
  })
}

export function getPollUrl(pollId: number): string {
  return `${window.location.origin}/polls/${pollId}`
}

export function getWhatsAppUrl(question: string, pollUrl: string): string {
  const msg = `${question} — cast your vote 👇 ${pollUrl}`
  return `https://wa.me/?text=${encodeURIComponent(msg)}`
}

export function getLinkedInUrl(pollUrl: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pollUrl)}`
}
