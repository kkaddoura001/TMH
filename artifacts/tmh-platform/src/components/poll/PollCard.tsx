import { useState } from "react"
import { Link } from "wouter"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Share2, X } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useVotePoll } from "@workspace/api-client-react"
import type { Poll, PollOption } from "@workspace/api-client-react/src/generated/api.schemas"
import { useVoter } from "@/hooks/use-voter"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface PollCardProps {
  poll: Poll
  featured?: boolean
}

export function PollCard({ poll, featured = false }: PollCardProps) {
  const { hasVoted, getVotedOption, recordVote, token } = useVoter()
  const { toast } = useToast()
  const voteMutation = useVotePoll()
  const [mobileStripDismissed, setMobileStripDismissed] = useState(false)

  const [localOptions, setLocalOptions] = useState<PollOption[]>(poll.options)
  const [localTotal, setLocalTotal] = useState(poll.totalVotes)
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
    const url = `${window.location.origin}/polls/${poll.id}`
    if (navigator.share) {
      navigator.share({ title: poll.question, url })
    } else {
      navigator.clipboard.writeText(url)
      toast({ title: "Link copied!", description: "Poll link copied to clipboard." })
    }
  }

  const isLive = !poll.endsAt || new Date(poll.endsAt) > new Date()
  const showMobileStrip = !isVoted && !mobileStripDismissed && isLive

  const VotingOptions = ({ inStrip = false }: { inStrip?: boolean }) => (
    <div className={cn("space-y-3", inStrip && "space-y-2")}>
      {localOptions.map((option) => (
        <button
          key={option.id}
          onClick={() => {
            handleVote(option.id)
            if (inStrip) setMobileStripDismissed(true)
          }}
          disabled={!isLive}
          className={cn(
            "group w-full text-left px-5 py-4 border border-border transition-all duration-150 font-medium text-sm font-sans",
            "bg-background text-foreground",
            "hover:bg-foreground hover:text-background hover:border-foreground hover:border-l-4 hover:border-l-primary",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            !isLive && "opacity-50 cursor-not-allowed",
            inStrip && "py-3 text-xs"
          )}
        >
          <span className="block transition-transform duration-150 group-hover:translate-x-1">
            {option.text}
          </span>
        </button>
      ))}
    </div>
  )

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
            <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-1 font-sans">
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
                <VotingOptions />
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
            <div className="px-4 pb-4 pt-2 space-y-2">
              <VotingOptions inStrip />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
