import { useState, useEffect, useRef, useCallback } from "react"
import { Layout } from "@/components/layout/Layout"
import { useLocation, Link } from "wouter"
import { Send, Users, LogOut, ChevronDown, Shield, ArrowDown, MessageSquare, BarChart3, TrendingUp, Activity } from "lucide-react"
import { cn } from "@/lib/utils"

interface MajlisUser {
  id: number
  displayName: string
  email: string
  profileId: number
  profile?: {
    name: string
    role: string
    company: string | null
    imageUrl: string | null
    isVerified: boolean
  }
}

interface Message {
  id: number
  content: string
  replyToId: number | null
  isEdited: boolean
  createdAt: string
  userId: number
  userName: string
  profileId: number
  profileName: string
  profileRole: string
  profileCompany: string | null
  profileImage: string | null
  profileVerified: boolean
}

interface Member {
  id: number
  displayName: string
  profileId: number
  isOnline: boolean
  profileName: string
  profileRole: string
  profileCompany: string | null
  profileImage: string | null
  profileVerified: boolean
  profileCountry: string
}

function getUser(): MajlisUser | null {
  try {
    const raw = localStorage.getItem("majlis_user")
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

const MOCK_MEMBERS: Member[] = [
  { id: 1, displayName: "Mohammed Al Zaben", profileId: 219, isOnline: true, profileName: "Mohammed Al Zaben", profileRole: "Founder & CEO", profileCompany: "The Tribunal", profileImage: null, profileVerified: true, profileCountry: "Saudi Arabia" },
  { id: 2, displayName: "Layla Hassan", profileId: 220, isOnline: true, profileName: "Layla Hassan", profileRole: "Managing Partner", profileCompany: "Crescent Ventures", profileImage: null, profileVerified: true, profileCountry: "UAE" },
  { id: 3, displayName: "Omar Khalil", profileId: 221, isOnline: true, profileName: "Omar Khalil", profileRole: "Chief Strategy Officer", profileCompany: "NEOM Tech", profileImage: null, profileVerified: true, profileCountry: "Saudi Arabia" },
  { id: 4, displayName: "Fatima Al-Rashid", profileId: 222, isOnline: false, profileName: "Fatima Al-Rashid", profileRole: "Founder", profileCompany: "Souq Labs", profileImage: null, profileVerified: true, profileCountry: "Kuwait" },
  { id: 5, displayName: "Youssef Mansour", profileId: 223, isOnline: false, profileName: "Youssef Mansour", profileRole: "VP of Growth", profileCompany: "Careem", profileImage: null, profileVerified: true, profileCountry: "Egypt" },
  { id: 6, displayName: "Nadia Belhaj", profileId: 224, isOnline: true, profileName: "Nadia Belhaj", profileRole: "CEO", profileCompany: "Atlas Digital", profileImage: null, profileVerified: true, profileCountry: "Morocco" },
  { id: 7, displayName: "Tariq Al-Farsi", profileId: 225, isOnline: false, profileName: "Tariq Al-Farsi", profileRole: "Investor", profileCompany: "Gulf Capital", profileImage: null, profileVerified: true, profileCountry: "Oman" },
  { id: 8, displayName: "Rania Jaber", profileId: 226, isOnline: false, profileName: "Rania Jaber", profileRole: "Head of Policy", profileCompany: "MENA Council", profileImage: null, profileVerified: true, profileCountry: "Jordan" },
]

function buildMockMessages(): Message[] {
  const now = Date.now()
  const msgs: Message[] = [
    { id: 1, content: "Salam everyone. Excited to finally have a private space for real talk about the MENA ecosystem.", replyToId: null, isEdited: false, createdAt: new Date(now - 3600000 * 5).toISOString(), userId: 2, userName: "Layla Hassan", profileId: 220, profileName: "Layla Hassan", profileRole: "Managing Partner", profileCompany: "Crescent Ventures", profileImage: null, profileVerified: true },
    { id: 2, content: "Agreed. Too much noise on public channels. This feels like it could be the real deal for founders who actually build.", replyToId: null, isEdited: false, createdAt: new Date(now - 3600000 * 4.8).toISOString(), userId: 3, userName: "Omar Khalil", profileId: 221, profileName: "Omar Khalil", profileRole: "Chief Strategy Officer", profileCompany: "NEOM Tech", profileImage: null, profileVerified: true },
    { id: 3, content: "Question for the group — anyone seeing deal flow slow down in Q1? We're seeing a 30% dip in Series A activity across the Gulf.", replyToId: null, isEdited: false, createdAt: new Date(now - 3600000 * 4).toISOString(), userId: 2, userName: "Layla Hassan", profileId: 220, profileName: "Layla Hassan", profileRole: "Managing Partner", profileCompany: "Crescent Ventures", profileImage: null, profileVerified: true },
    { id: 4, content: "Not slowing here. Actually the opposite — we're seeing more cross-border deals. UAE-Saudi corridor is hotter than ever.", replyToId: 3, isEdited: false, createdAt: new Date(now - 3600000 * 3.5).toISOString(), userId: 6, userName: "Nadia Belhaj", profileId: 224, profileName: "Nadia Belhaj", profileRole: "CEO", profileCompany: "Atlas Digital", profileImage: null, profileVerified: true },
    { id: 5, content: "Same. North Africa is quietly booming. Morocco alone had 4 exits last quarter. The ecosystem is maturing faster than people realize.", replyToId: 3, isEdited: false, createdAt: new Date(now - 3600000 * 3.2).toISOString(), userId: 5, userName: "Youssef Mansour", profileId: 223, profileName: "Youssef Mansour", profileRole: "VP of Growth", profileCompany: "Careem", profileImage: null, profileVerified: true },
    { id: 6, content: "The talent gap is the real bottleneck though. Every founder I talk to says hiring senior engineers is their #1 pain point.", replyToId: null, isEdited: false, createdAt: new Date(now - 3600000 * 2.5).toISOString(), userId: 3, userName: "Omar Khalil", profileId: 221, profileName: "Omar Khalil", profileRole: "Chief Strategy Officer", profileCompany: "NEOM Tech", profileImage: null, profileVerified: true },
    { id: 7, content: "We solved that by building a remote-first engineering hub in Amman. Jordan has incredible talent at a fraction of the cost. Happy to share our playbook.", replyToId: 6, isEdited: false, createdAt: new Date(now - 3600000 * 2).toISOString(), userId: 8, userName: "Rania Jaber", profileId: 226, profileName: "Rania Jaber", profileRole: "Head of Policy", profileCompany: "MENA Council", profileImage: null, profileVerified: true },
    { id: 8, content: "Would love that. Can you share more details here or should we set up a call?", replyToId: 7, isEdited: false, createdAt: new Date(now - 3600000 * 1.5).toISOString(), userId: 1, userName: "Mohammed Al Zaben", profileId: 219, profileName: "Mohammed Al Zaben", profileRole: "Founder & CEO", profileCompany: "The Tribunal", profileImage: null, profileVerified: true },
    { id: 9, content: "Let's do it here. Transparency is what makes The Majlis special. Quick summary: we partnered with 3 universities in Amman, run a 12-week accelerator for junior devs, and our retention rate is 92%.", replyToId: 8, isEdited: false, createdAt: new Date(now - 3600000 * 1).toISOString(), userId: 8, userName: "Rania Jaber", profileId: 226, profileName: "Rania Jaber", profileRole: "Head of Policy", profileCompany: "MENA Council", profileImage: null, profileVerified: true },
    { id: 10, content: "That's brilliant. We need more of this cross-market collaboration. This is exactly why this room exists.", replyToId: null, isEdited: false, createdAt: new Date(now - 3600000 * 0.5).toISOString(), userId: 7, userName: "Tariq Al-Farsi", profileId: 225, profileName: "Tariq Al-Farsi", profileRole: "Investor", profileCompany: "Gulf Capital", profileImage: null, profileVerified: true },
    { id: 11, content: "By the way — there's a private dinner happening at LEAP next week. I can get invites for anyone here. DM me your details.", replyToId: null, isEdited: false, createdAt: new Date(now - 600000).toISOString(), userId: 4, userName: "Fatima Al-Rashid", profileId: 222, profileName: "Fatima Al-Rashid", profileRole: "Founder", profileCompany: "Souq Labs", profileImage: null, profileVerified: true },
  ]
  return msgs
}

interface SharedContent {
  type: "debate" | "prediction" | "pulse"
  id: string
  title: string
  stat?: string
  category?: string
}

function parseSharedContent(content: string): { text: string; shared: SharedContent | null } {
  const shareRegex = /\[share:(debate|prediction|pulse):(\d+)\|([^\]]+)\]/
  const match = content.match(shareRegex)
  if (!match) return { text: content, shared: null }
  const text = content.replace(shareRegex, "").trim()
  const [, type, id, payload] = match
  const parts = payload.split("|")
  return {
    text,
    shared: {
      type: type as SharedContent["type"],
      id,
      title: parts[0] || "",
      stat: parts[1],
      category: parts[2],
    },
  }
}

function SharedCard({ shared }: { shared: SharedContent }) {
  const colorMap = { debate: "#DC143C", prediction: "#3B82F6", pulse: "#10B981" }
  const iconMap = { debate: BarChart3, prediction: TrendingUp, pulse: Activity }
  const linkMap = { debate: `/polls/${shared.id}`, prediction: `/predictions`, pulse: `/mena-pulse` }
  const labelMap = { debate: "DEBATE", prediction: "PREDICTION", pulse: "PULSE" }
  const Icon = iconMap[shared.type]
  const color = colorMap[shared.type]

  return (
    <Link href={linkMap[shared.type]}>
      <div
        className="mt-2 border rounded p-3 cursor-pointer hover:bg-white/[0.03] transition-colors max-w-md"
        style={{ borderColor: `${color}40` }}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <Icon className="w-3.5 h-3.5" style={{ color }} />
          <span className="text-[8px] font-serif font-bold uppercase tracking-[0.2em]" style={{ color }}>
            {labelMap[shared.type]}
          </span>
          {shared.category && (
            <span className="text-[8px] font-serif uppercase tracking-wider text-muted-foreground">
              · {shared.category}
            </span>
          )}
        </div>
        <p className="font-serif font-black uppercase text-[12px] leading-tight text-foreground">
          {shared.title}
        </p>
        {shared.stat && (
          <p className="text-[10px] mt-1 font-serif" style={{ color }}>
            {shared.stat}
          </p>
        )}
      </div>
    </Link>
  )
}

function MessageBubble({ message, isOwn, onReply }: { message: Message; isOwn: boolean; onReply: (m: Message) => void }) {
  const initials = message.profileName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
  const { text, shared } = parseSharedContent(message.content)

  return (
    <div className={cn("flex gap-3 group px-4 py-2 hover:bg-white/[0.02] transition-colors", isOwn && "flex-row-reverse")}>
      <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border border-border">
        {message.profileImage ? (
          <img src={message.profileImage} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
            {initials}
          </div>
        )}
      </div>
      <div className={cn("flex-1 min-w-0", isOwn && "text-right")}>
        <div className={cn("flex items-baseline gap-2 mb-0.5", isOwn && "flex-row-reverse")}>
          <span className="text-xs font-bold text-foreground">{message.profileName}</span>
          {message.profileVerified && <Shield className="w-3 h-3 text-primary flex-shrink-0" />}
          <span className="text-[9px] text-muted-foreground font-serif uppercase tracking-wider">
            {message.profileRole}{message.profileCompany ? ` · ${message.profileCompany}` : ""}
          </span>
          <span className="text-[9px] text-muted-foreground/50">
            {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
        {text && (
          <p className={cn("text-sm text-foreground/90 leading-relaxed break-words", isOwn && "text-right")}>
            {text}
          </p>
        )}
        {shared && <SharedCard shared={shared} />}
        <button
          onClick={() => onReply(message)}
          className="opacity-0 group-hover:opacity-100 text-[9px] text-muted-foreground hover:text-primary transition-all font-serif uppercase tracking-wider mt-0.5"
        >
          Reply
        </button>
      </div>
    </div>
  )
}

function MembersSidebar({ members, show, onClose }: { members: Member[]; show: boolean; onClose: () => void }) {
  const online = members.filter(m => m.isOnline)
  const offline = members.filter(m => !m.isOnline)

  return (
    <div className={cn(
      "w-72 border-l border-border bg-card flex-shrink-0 flex flex-col overflow-hidden transition-all",
      show ? "block" : "hidden lg:block"
    )}>
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="text-[10px] font-serif font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Members ({members.length})
        </h3>
        <button onClick={onClose} className="lg:hidden text-muted-foreground hover:text-foreground">
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {online.length > 0 && (
          <>
            <p className="px-2 py-1 text-[9px] font-serif font-bold uppercase tracking-[0.2em] text-green-400">
              Online — {online.length}
            </p>
            {online.map(m => (
              <MemberItem key={m.id} member={m} />
            ))}
          </>
        )}
        {offline.length > 0 && (
          <>
            <p className="px-2 py-1 text-[9px] font-serif font-bold uppercase tracking-[0.2em] text-muted-foreground mt-3">
              Offline — {offline.length}
            </p>
            {offline.map(m => (
              <MemberItem key={m.id} member={m} />
            ))}
          </>
        )}
      </div>
    </div>
  )
}

function MemberItem({ member }: { member: Member }) {
  const initials = member.profileName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()

  return (
    <div className="flex items-center gap-2.5 px-2 py-1.5 hover:bg-white/[0.03] transition-colors">
      <div className="relative flex-shrink-0">
        <div className="w-7 h-7 rounded-full overflow-hidden border border-border">
          {member.profileImage ? (
            <img src={member.profileImage} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-primary/20 flex items-center justify-center text-[8px] font-bold text-primary">
              {initials}
            </div>
          )}
        </div>
        <div className={cn(
          "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card",
          member.isOnline ? "bg-green-400" : "bg-muted-foreground/30"
        )} />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-xs font-medium text-foreground truncate">{member.profileName}</span>
          {member.profileVerified && <Shield className="w-2.5 h-2.5 text-primary flex-shrink-0" />}
        </div>
        <span className="text-[9px] text-muted-foreground truncate block">
          {member.profileRole}{member.profileCountry ? ` · ${member.profileCountry}` : ""}
        </span>
      </div>
    </div>
  )
}

export default function Majlis() {
  const [, navigate] = useLocation()
  const [user, setUser] = useState<MajlisUser | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [members] = useState<Member[]>(MOCK_MEMBERS)
  const [input, setInput] = useState("")
  const [replyTo, setReplyTo] = useState<Message | null>(null)
  const [sending, setSending] = useState(false)
  const [showMembers, setShowMembers] = useState(false)
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const [newMsgCount, setNewMsgCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const isAtBottomRef = useRef(true)
  const nextIdRef = useRef(100)

  useEffect(() => {
    const token = localStorage.getItem("majlis_token")
    const u = getUser()
    if (!token || !u) {
      navigate("/majlis/login")
      return
    }
    setUser(u)
    setMessages(buildMockMessages())
  }, [navigate])

  useEffect(() => {
    if (user && messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    }
  }, [user, messages.length === 0])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    setNewMsgCount(0)
  }, [])

  const checkIfAtBottom = useCallback(() => {
    const container = messagesContainerRef.current
    if (!container) return
    const threshold = 100
    const atBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold
    isAtBottomRef.current = atBottom
    setShowScrollBtn(!atBottom)
    if (atBottom) setNewMsgCount(0)
  }, [])

  const handleSend = async () => {
    if (!input.trim() || sending || !user) return
    setSending(true)

    await new Promise(r => setTimeout(r, 300))

    const newMsg: Message = {
      id: nextIdRef.current++,
      content: input.trim(),
      replyToId: replyTo?.id ?? null,
      isEdited: false,
      createdAt: new Date().toISOString(),
      userId: user.id,
      userName: user.displayName,
      profileId: user.profileId,
      profileName: user.profile?.name ?? user.displayName,
      profileRole: user.profile?.role ?? "",
      profileCompany: user.profile?.company ?? null,
      profileImage: user.profile?.imageUrl ?? null,
      profileVerified: user.profile?.isVerified ?? true,
    }

    setMessages(prev => [...prev, newMsg])
    setInput("")
    setReplyTo(null)
    setSending(false)
    setTimeout(scrollToBottom, 50)
  }

  const handleLogout = () => {
    localStorage.removeItem("majlis_token")
    localStorage.removeItem("majlis_user")
    navigate("/majlis/login")
  }

  const onlineCount = members.filter(m => m.isOnline).length

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center pt-20">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="h-screen flex flex-col pt-16">
        <div className="border-b border-border bg-card/50 backdrop-blur-sm px-4 py-2.5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-lg font-black uppercase tracking-tight text-foreground leading-none">
              The Majlis<span className="text-primary">.</span>
            </h1>
            <span className="text-[9px] font-serif uppercase tracking-[0.2em] text-muted-foreground hidden sm:inline">
              المجلس
            </span>
            <div className="flex items-center gap-1.5 ml-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="text-[9px] font-serif text-muted-foreground">
                {onlineCount} online
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMembers(!showMembers)}
              className="lg:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Users className="w-4 h-4" />
            </button>
            <span className="text-[9px] text-muted-foreground font-serif hidden sm:inline">{user.displayName}</span>
            <button
              onClick={handleLogout}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              title="Leave The Majlis"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 flex flex-col min-w-0">
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto py-4 space-y-0.5 relative"
              onScroll={checkIfAtBottom}
            >
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <MessageSquare className="w-10 h-10 text-muted-foreground/30 mb-4" />
                  <h3 className="font-display text-xl font-black uppercase text-foreground mb-1">
                    Welcome to The Majlis<span className="text-primary">.</span>
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    A private space for MENA's verified voices. Start the conversation.
                  </p>
                </div>
              ) : (
                messages.map(msg => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isOwn={msg.userId === user.id}
                    onReply={setReplyTo}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {showScrollBtn && (
              <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10">
                <button
                  onClick={scrollToBottom}
                  className="flex items-center gap-1.5 bg-primary text-white text-[10px] font-serif font-bold uppercase tracking-wider px-3 py-1.5 shadow-lg hover:bg-primary/90 transition-colors"
                >
                  <ArrowDown className="w-3 h-3" />
                  {newMsgCount > 0 ? `${newMsgCount} new` : "Latest"}
                </button>
              </div>
            )}

            <div className="border-t border-border p-3 flex-shrink-0 bg-card/30">
              {replyTo && (
                <div className="flex items-center gap-2 mb-2 px-2 py-1 bg-primary/5 border-l-2 border-primary">
                  <span className="text-[10px] text-muted-foreground flex-1 truncate">
                    Replying to <span className="text-foreground font-bold">{replyTo.profileName}</span>: {replyTo.content}
                  </span>
                  <button onClick={() => setReplyTo(null)} className="text-muted-foreground hover:text-foreground text-xs">
                    ✕
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                  placeholder="Type your message..."
                  maxLength={2000}
                  className="flex-1 bg-background border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none transition-colors"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className="bg-primary text-white px-4 py-2.5 hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <MembersSidebar members={members} show={showMembers} onClose={() => setShowMembers(false)} />
        </div>
      </div>
    </Layout>
  )
}
