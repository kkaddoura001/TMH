import { useRoute, Link } from "wouter"
import { useGetProfile } from "@workspace/api-client-react"
import { Layout } from "@/components/layout/Layout"
import { PollCard } from "@/components/poll/PollCard"
import { ProfileCard } from "@/components/profile/ProfileCard"
import { ArrowLeft, MapPin, Building, Briefcase, Eye } from "lucide-react"

export default function ProfileDetail() {
  const [, params] = useRoute("/profiles/:id")
  const id = params?.id ? parseInt(params.id) : 0

  const { data: profile, isLoading, error } = useGetProfile(id)

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="h-8 w-24 bg-secondary animate-pulse mb-8" />
          <div className="h-[300px] bg-secondary animate-pulse mb-8 border border-border" />
          <div className="h-64 bg-secondary animate-pulse border border-border" />
        </div>
      </Layout>
    )
  }

  if (error || !profile) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl font-serif font-black uppercase tracking-tight mb-4 text-foreground">Profile not found</h1>
          <Link href="/profiles" className="text-primary hover:underline font-bold text-xs uppercase tracking-widest">
            Back to Directory
          </Link>
        </div>
      </Layout>
    )
  }

  const paragraphs = profile.story.split('\n').filter(Boolean)

  return (
    <Layout>
      {/* Full-bleed photo header */}
      {profile.imageUrl && (
        <div className="w-full max-h-80 overflow-hidden">
          <img
            src={profile.imageUrl}
            alt={profile.name}
            className="w-full max-h-80 object-cover object-top grayscale"
          />
        </div>
      )}

      {/* Name / meta strip */}
      <div className="bg-background border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Link href="/profiles" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground font-bold mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Directory
          </Link>

          {!profile.imageUrl && (
            <div className="relative w-32 h-32 md:w-48 md:h-48 bg-secondary text-foreground flex items-center justify-center font-serif font-black text-5xl border border-border mb-8">
              {profile.name.substring(0, 2).toUpperCase()}
              {profile.isVerified && (
                <div className="absolute -bottom-2 -right-2 bg-primary w-4 h-4 border-2 border-background" title="Verified Voice" />
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-foreground text-background text-[10px] font-bold uppercase tracking-widest">
              {profile.sector}
            </span>
            <span className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold flex items-center gap-1 ml-auto">
              <Eye className="w-4 h-4" /> {profile.viewCount.toLocaleString()} Views
            </span>
          </div>

          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-black uppercase text-foreground mb-4 leading-none tracking-tight">
            {profile.name}
          </h1>
          <p className="text-xl md:text-2xl text-foreground font-serif italic mb-6 leading-relaxed border-l-4 border-primary pl-4">
            {profile.headline}
          </p>

          <div className="flex flex-wrap items-center gap-6 text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-foreground" /> {profile.role}
            </div>
            {profile.company && (
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-foreground" /> {profile.company}
              </div>
            )}
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-foreground" /> {profile.city}, {profile.country}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-16">
          {/* IN THEIR OWN WORDS — above The Story */}
          {profile.quote && (
            <section>
              <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-primary mb-4">In Their Own Words</p>
              <blockquote className="font-serif italic text-2xl md:text-3xl font-black border-l-4 border-primary pl-6 py-4 text-foreground leading-snug">
                "{profile.quote}"
              </blockquote>
            </section>
          )}

          {/* The Story with drop cap */}
          <section>
            <h2 className="font-serif text-3xl font-black uppercase tracking-tight border-b-2 border-foreground pb-4 mb-6">The Story</h2>
            <div className="text-muted-foreground font-sans space-y-5 leading-relaxed">
              {paragraphs.map((para, i) => (
                <p key={i} className={i === 0 ? "first-letter-dropcap" : ""}>
                  {i === 0 ? (
                    <>
                      <span className="float-left font-serif font-black text-6xl leading-none mr-2 text-foreground" style={{ lineHeight: '0.85' }}>
                        {para[0]}
                      </span>
                      {para.slice(1)}
                    </>
                  ) : para}
                </p>
              ))}
            </div>
          </section>

          {/* Lessons Learned — large decorative numbers */}
          {profile.lessonsLearned && profile.lessonsLearned.length > 0 && (
            <section className="bg-background border border-border p-8 md:p-12">
              <h2 className="font-serif text-2xl font-black uppercase tracking-tight mb-8 text-primary">Lessons Learned</h2>
              <ul className="space-y-10">
                {profile.lessonsLearned.map((lesson, i) => (
                  <li key={i} className="relative pl-4">
                    <span className="absolute -left-2 top-0 text-6xl font-serif font-black text-foreground/10 leading-none select-none pointer-events-none" style={{ zIndex: 0 }}>
                      {(i + 1).toString().padStart(2, '0')}
                    </span>
                    <span className="relative z-10 text-lg font-medium text-foreground font-sans block pt-6">
                      {lesson}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Related Polls */}
          {profile.relatedPolls && profile.relatedPolls.length > 0 && (
            <section>
              <h2 className="font-serif text-3xl font-black uppercase tracking-tight border-b-2 border-foreground pb-4 mb-8">Associated Polls</h2>
              <div className="grid gap-10">
                {profile.relatedPolls.map(poll => (
                  <div key={poll.id}>
                    <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-primary mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      How does {profile.name.split(" ")[0]}'s network vote on this?
                    </p>
                    <PollCard poll={poll} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-8">
          {profile.similarProfiles && profile.similarProfiles.length > 0 && (
            <div className="bg-background border border-border p-6">
              <h3 className="font-serif font-black uppercase tracking-wider text-xl mb-6 border-b border-border pb-4">Similar Voices</h3>
              <div className="space-y-6">
                {profile.similarProfiles.map(similar => (
                  <ProfileCard key={similar.id} profile={similar} />
                ))}
              </div>
            </div>
          )}

          {/* Fun Fact */}
          {(profile as any).funFact && (
            <div className="bg-background border border-border p-6">
              <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-2">Fun Fact</p>
              <p className="text-sm text-muted-foreground italic font-sans">{(profile as any).funFact}</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
