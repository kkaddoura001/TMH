import { useRoute, Link } from "wouter"
import { useGetProfile } from "@workspace/api-client-react"
import { Layout } from "@/components/layout/Layout"
import { PollCard } from "@/components/poll/PollCard"
import { ProfileCard } from "@/components/profile/ProfileCard"
import { ArrowLeft, MapPin, Building, Briefcase, Eye, Quote } from "lucide-react"

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

  return (
    <Layout>
      {/* Header Banner */}
      <div className="bg-background border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
          <Link href="/profiles" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground font-bold mb-10 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Directory
          </Link>

          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
            <div className="relative flex-shrink-0">
              {profile.imageUrl ? (
                <img 
                  src={profile.imageUrl} 
                  alt={profile.name} 
                  className="w-32 h-32 md:w-48 md:h-48 object-cover border border-border grayscale"
                />
              ) : (
                <div className="w-32 h-32 md:w-48 md:h-48 bg-secondary text-foreground flex items-center justify-center font-serif font-black text-5xl border border-border">
                  {profile.name.substring(0,2).toUpperCase()}
                </div>
              )}
              {profile.isVerified && (
                <div className="absolute -bottom-2 -right-2 bg-primary w-4 h-4 border-2 border-background" title="Verified Voice" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-foreground text-background text-[10px] font-bold uppercase tracking-widest">
                  {profile.sector}
                </span>
                <span className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold flex items-center gap-1 ml-auto">
                  <Eye className="w-4 h-4" /> {profile.viewCount.toLocaleString()} VIEWS
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
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-16">
          {profile.quote && (
            <div className="relative p-8 md:p-12 bg-background border border-border">
              <Quote className="absolute top-6 left-6 w-8 h-8 text-primary opacity-20 rotate-180" />
              <p className="relative z-10 font-serif text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground leading-tight pt-4">
                "{profile.quote}"
              </p>
            </div>
          )}

          <section>
            <h2 className="font-serif text-3xl font-black uppercase tracking-tight border-b-2 border-foreground pb-4 mb-6">The Story</h2>
            <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground font-sans">
              {profile.story.split('\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </section>

          {profile.lessonsLearned && profile.lessonsLearned.length > 0 && (
            <section className="bg-background border border-border p-8 md:p-12">
              <h2 className="font-serif text-2xl font-black uppercase tracking-tight mb-8 text-primary">Lessons Learned</h2>
              <ul className="space-y-6">
                {profile.lessonsLearned.map((lesson, i) => (
                  <li key={i} className="flex gap-4 items-start">
                    <span className="flex-shrink-0 text-2xl font-serif font-black text-foreground/20 leading-none">
                      {(i + 1).toString().padStart(2, '0')}
                    </span>
                    <span className="text-lg font-medium text-foreground font-sans">{lesson}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

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
        </div>
      </div>
    </Layout>
  )
}
