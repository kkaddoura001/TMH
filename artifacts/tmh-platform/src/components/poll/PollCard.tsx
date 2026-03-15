import { useState } from "react"
import { Link } from "wouter"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Share2, X, Linkedin } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useVotePoll } from "@workspace/api-client-react"
import type { Poll, PollOption } from "@workspace/api-client-react/src/generated/api.schemas"
import { useVoter } from "@/hooks/use-voter"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { ResultsBreakdown } from "./ResultsBreakdown"
import { generateShareCard, getPollUrl, getWhatsAppUrl, getLinkedInUrl } from "@/lib/shareCard"


interface PollCardProps {
  poll: Poll
  featured?: boolean
}

export function PollCard({ poll, featured = false }: PollCardProps) {
  const { hasVoted, getVotedOption, recordVote, token } = useVoter()
  const { toast } = useToast()
  const voteMutation = useVotePoll()
  const [mobileStripDismissed, setMobileStripDismissed] = useState(false)

  const [localOptions, setLocalOptions] = useState<PollOption[]>(poll.options ?? [])
  const [localTotal, setLocalTotal] = useState(poll.totalVotes ?? 0)
  const [isSharing, setIsSharing] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const isVoted = hasVoted(poll.id)
  const votedOptionId = getVotedOption(poll.id)

  const handleVote = (optionId: number) => {
    if (isVoted) return

    recordVote(poll.id, optionId)
    const newTotal = localTotal + 1
    const newOptions = localOptions.map(opt => {
      const newCount = opt.id === optionId ? opt.voteCount + 1 : opt.voteCount
      return {
        ...opt,
        voteCount: newCount,
        percentage: Math.round((newCount / newTotal) * 100)
      }
    })
    setLocalOptions(newOptions)
    setLocalTotal(newTotal)

    voteMutation.mutate(
      { id: poll.id, data: { optionId, voterToken: token } },
      {
        onSuccess: (data) => {
          if (data.success) {
            setLocalOptions(data.options)
            setLocalTotal(data.totalVotes)
          }
        },
        onError: () => {
          toast({
            title: "Vote failed",
            description: "Could not record your vote. Please try again.",
            variant: "destructive"
          })
        }
      }
    )
  }

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const url = getPollUrl(poll.id)
    if (navigator.share) {
      navigator.share({ title: poll.question, url })
    } else {
      navigator.clipboard.writeText(url)
      toast({ title: "Link copied!", description: "Poll link copied to clipboard." })
    }
  }

  const handleShareStance = async () => {
    const pollUrl = getPollUrl(poll.id)
    const votedOption = localOptions.find(o => o.id === votedOptionId)
    if (!votedOption) return
    setIsSharing(true)
    try {
      const blob = await generateShareCard({
        question: poll.question,
        votedOptionText: votedOption.text,
        votedPct: votedOption.percentage ?? 0,
        totalVotes: localTotal,
      })
      const isMobile = /Mobi|Android/i.test(navigator.userAgent)
      if (isMobile && blob && navigator.canShare && navigator.canShare({ files: [new File([blob], "tmh-poll.png", { type: "image/png" })] })) {
        const file = new File([blob], "tmh-poll.png", { type: "image/png" })
        await navigator.share({ title: poll.question, url: pollUrl, files: [file] })
      } else {
        await navigator.clipboard.writeText(pollUrl)
        toast({ title: "Link copied — share your take.", description: "Paste it anywhere to spread the debate." })
      }
    } catch {
      await navigator.clipboard.writeText(pollUrl).catch(() => {})
      toast({ title: "Link copied!", description: "Share your stance." })
    } finally {
      setIsSharing(false)
    }
  }

  const handleCopyLink = () => {
    const pollUrl = getPollUrl(poll.id)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2500)
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(pollUrl).catch(() => {})
    } else {
      try {
        const ta = document.createElement("textarea")
        ta.value = pollUrl
        ta.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none"
        document.body.appendChild(ta)
        ta.select()
        document.execCommand("copy")
        document.body.removeChild(ta)
      } catch {}
    }
  }

  const isLive = !poll.endsAt || new Date(poll.endsAt) > new Date()
  const showMobileStrip = !isVoted && !mobileStripDismissed && isLive

  return (
    <>
      <div className={cn(
        "bg-card border border-border flex flex-col transition-all duration-300",
        featured ? "md:flex-row md:items-stretch" : ""
      )}>
        {/* Left: question + metadata */}
        <div className={cn("p-6 sm:p-8 flex-1 flex flex-col", featured ? "md:p-12 md:w-1/2" : "")}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="px-2 py-1 bg-foreground text-background text-[10px] font-bold rounded-sm uppercase tracking-[0.25em]">
                {poll.category}
              </span>
              {isLive && (
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-[0.25em]">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  LIVE
                </span>
              )}
            </div>
            <button
              onClick={handleShare}
              className="text-muted-foreground hover:text-foreground transition-colors p-2"
              aria-label="Share poll"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          <Link href={`/polls/${poll.id}`}>
            <h3 className={cn(
              "font-serif font-black text-foreground uppercase tracking-tight hover:text-primary transition-colors cursor-pointer mb-4",
              featured ? "text-4xl md:text-5xl leading-none" : "text-3xl leading-none"
            )}>
              {poll.question}
            </h3>
          </Link>

          {poll.context && (
            <p className="text-muted-foreground text-sm line-clamp-3 mb-4 font-sans">
              {poll.context}
            </p>
          )}

          <div className="mt-auto pt-6 border-t border-border flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>{localTotal.toLocaleString()} votes</span>
              {poll.endsAt && (
                <span>{isLive ? `Ends ${formatDistanceToNow(new Date(poll.endsAt))}` : 'Ended'}</span>
              )}
            </div>
            {!featured && (
              <Link href={`/polls/${poll.id}`} className="text-foreground hover:text-primary flex items-center gap-1 transition-colors font-bold">
                VIEW <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>

        {/* Right: voting panel */}
        <div className={cn(
          "p-6 sm:p-8 bg-background border-t border-border flex flex-col justify-center",
          featured ? "md:w-1/2 md:border-t-0 md:border-l" : ""
        )}>
          <AnimatePresence mode="wait">
            {!isVoted ? (
              <motion.div
                key="voting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Cast your vote prompt */}
                <div className="flex items-center gap-3 mb-4 border-l-4 border-primary pl-3">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                    Cast Your Vote
                  </span>
                </div>
                <div className="space-y-3">
                  {localOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleVote(option.id)}
                      disabled={!isLive}
                      className={cn(
                        "group w-full text-left px-5 py-4 border border-border transition-all duration-150 font-medium text-sm font-sans",
                        "bg-background text-foreground",
                        "hover:bg-foreground hover:text-background hover:border-foreground hover:border-l-4 hover:border-l-primary",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                        !isLive && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <span className="block transition-transform duration-150 group-hover:translate-x-1">
                        {option.text}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {localOptions.map((option) => (
                  <div key={option.id} className="relative">
                    <div className="flex justify-between items-end mb-1">
                      <span className={cn(
                        "text-sm font-sans",
                        option.id === votedOptionId ? "text-primary font-bold" : "text-foreground font-medium"
                      )}>
                        {option.text}
                      </span>
                      <span className="font-serif font-bold text-lg text-foreground leading-none">{option.percentage}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${option.percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={cn(
                          "h-full",
                          option.id === votedOptionId ? "bg-primary" : "bg-foreground/20"
                        )}
                      />
                    </div>
                  </div>
                ))}

                {/* Prominent confirmation */}
                <div className="pt-4 border-t border-border flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse flex-shrink-0" />
                  <p className="font-serif font-black uppercase tracking-widest text-sm text-primary">
                    Voted — Results Live
                  </p>
                </div>

                {/* Share your stance */}
                <div className="pt-4 space-y-3">
                  {/* Primary share button */}
                  <button
                    onClick={handleShareStance}
                    disabled={isSharing}
                    className={cn(
                      "w-full flex items-center justify-center gap-2.5 px-5 py-3.5",
                      "bg-foreground text-background text-[11px] font-black uppercase tracking-[0.2em]",
                      "hover:bg-primary hover:text-white transition-colors duration-150",
                      "disabled:opacity-60 disabled:cursor-not-allowed"
                    )}
                  >
                    <Share2 className="w-3.5 h-3.5 flex-shrink-0" />
                    {isSharing ? "Generating…" : "Share Your Stance"}
                  </button>

                  {/* Quick-share row */}
                  <div className="grid grid-cols-3 gap-2">
                    {/* WhatsApp — most important for this audience */}
                    <a
                      href={getWhatsAppUrl(poll.question, getPollUrl(poll.id))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "flex flex-col items-center gap-1.5 px-2 py-3 border border-border",
                        "hover:border-[#25D366] hover:bg-[#25D366]/5 transition-all duration-150 group"
                      )}
                    >
                      <svg className="w-4 h-4 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      <span className="text-[9px] uppercase tracking-[0.15em] font-bold text-muted-foreground group-hover:text-[#25D366] transition-colors">WhatsApp</span>
                    </a>

                    {/* LinkedIn */}
                    <a
                      href={getLinkedInUrl(getPollUrl(poll.id))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "flex flex-col items-center gap-1.5 px-2 py-3 border border-border",
                        "hover:border-[#0A66C2] hover:bg-[#0A66C2]/5 transition-all duration-150 group"
                      )}
                    >
                      <Linkedin className="w-4 h-4 text-[#0A66C2]" />
                      <span className="text-[9px] uppercase tracking-[0.15em] font-bold text-muted-foreground group-hover:text-[#0A66C2] transition-colors">LinkedIn</span>
                    </a>

                    {/* Copy Link */}
                    <button
                      onClick={handleCopyLink}
                      className={cn(
                        "flex flex-col items-center gap-1.5 px-2 py-3 border transition-all duration-150 group",
                        linkCopied
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-foreground hover:bg-foreground/5"
                      )}
                    >
                      {linkCopied ? (
                        <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                          <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
                        </svg>
                      )}
                      <span className={cn(
                        "text-[9px] uppercase tracking-[0.15em] font-bold transition-colors",
                        linkCopied ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                      )}>
                        {linkCopied ? "Copied!" : "Copy Link"}
                      </span>
                    </button>
                  </div>
                </div>

                <ResultsBreakdown pollId={poll.id} totalVotes={localTotal} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile sticky bottom strip */}
      <AnimatePresence>
        {showMobileStrip && (
          <motion.div
            key="mobile-strip"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t-2 border-foreground shadow-2xl"
          >
            <div className="px-4 pt-4 pb-2 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Cast Your Vote
                </p>
                <p className="font-serif font-black uppercase text-sm leading-tight text-foreground truncate">
                  {poll.question}
                </p>
              </div>
              <button
                onClick={() => setMobileStripDismissed(true)}
                className="text-muted-foreground hover:text-foreground p-1 flex-shrink-0 mt-0.5"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-4 pb-4 pt-2">
              <div className="space-y-2">
                {localOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => { handleVote(option.id); setMobileStripDismissed(true) }}
                    disabled={!isLive}
                    className={cn(
                      "group w-full text-left px-5 py-3 border border-border transition-all duration-150 font-medium text-xs font-sans",
                      "bg-background text-foreground",
                      "hover:bg-foreground hover:text-background hover:border-foreground hover:border-l-4 hover:border-l-primary",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      !isLive && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <span className="block transition-transform duration-150 group-hover:translate-x-1">
                      {option.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
