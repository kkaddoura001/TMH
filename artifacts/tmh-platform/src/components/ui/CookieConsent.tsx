import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { useSiteSettings } from "@/hooks/use-cms-data"

export function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const { data: settings } = useSiteSettings()

  const consent = settings?.cookieConsent

  useEffect(() => {
    const accepted = localStorage.getItem("tmh_cookies_accepted")
    if (!accepted) {
      const timer = setTimeout(() => setVisible(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const accept = () => {
    localStorage.setItem("tmh_cookies_accepted", "1")
    setVisible(false)
  }

  if (consent?.enabled === false) return null

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-foreground text-background border-t-2 border-primary"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
            <div className="flex-1">
              <p className="text-[11px] font-sans text-background/80 leading-relaxed">
                {consent?.message || "TMH uses cookies to remember your votes and improve your experience."}{" "}
                <a href={consent?.linkHref || "/terms"} className="underline underline-offset-2 hover:text-primary transition-colors">
                  {consent?.linkText || "No spam. Unsubscribe anytime."}
                </a>
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={accept}
                className="px-5 py-2 bg-primary text-white font-black uppercase tracking-[0.15em] text-[10px] hover:bg-primary/90 transition-colors"
              >
                {consent?.acceptLabel || "Got It"}
              </button>
              <button
                onClick={accept}
                className="text-[10px] text-background/40 hover:text-background/70 uppercase tracking-widest font-bold transition-colors"
              >
                {consent?.dismissLabel || "Dismiss"}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
