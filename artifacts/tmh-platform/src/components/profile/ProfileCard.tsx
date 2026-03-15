import { Link } from "wouter"
import { MapPin } from "lucide-react"
import type { Profile } from "@workspace/api-client-react/src/generated/api.schemas"

export function ProfileCard({ profile }: { profile: Profile }) {
  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()

  return (
    <Link href={`/profiles/${profile.id}`}>
      <div className="group bg-card border border-border hover:border-primary transition-all duration-300 cursor-pointer h-full flex flex-col relative overflow-hidden">
        {/* Photo or initials */}
        {profile.imageUrl ? (
          <div className="relative overflow-hidden h-48 flex-shrink-0">
            <img
              src={profile.imageUrl}
              alt={profile.name}
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
            />
            {profile.isFeatured && (
              <span className="absolute top-3 left-3 bg-primary text-background text-[9px] uppercase tracking-widest px-2 py-1 font-bold">
                Featured Voice
              </span>
            )}
            {profile.isVerified && (
              <div className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background" title="Verified Voice" />
            )}
          </div>
        ) : (
          <div className="relative h-48 bg-secondary flex items-center justify-center flex-shrink-0">
            <span className="font-serif font-bold text-4xl text-foreground/30">
              {getInitials(profile.name)}
            </span>
            {profile.isFeatured && (
              <span className="absolute top-3 left-3 bg-primary text-background text-[9px] uppercase tracking-widest px-2 py-1 font-bold">
                Featured Voice
              </span>
            )}
            {profile.isVerified && (
              <div className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background" title="Verified Voice" />
            )}
          </div>
        )}

        <div className="p-5 flex flex-col flex-1">
          <h3 className="font-serif font-black text-xl uppercase tracking-tight text-foreground group-hover:text-primary transition-colors leading-tight mb-1">
            {profile.name}
          </h3>

          {profile.headline && (
            <p className="text-sm italic text-muted-foreground mb-2 leading-snug" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {profile.headline}
            </p>
          )}

          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
            {profile.role}{profile.company ? ` · ${profile.company}` : ''}
          </p>

          {profile.city && (
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1 mb-4">
              <MapPin className="w-3 h-3 flex-shrink-0" /> {profile.city}
            </p>
          )}

          <div className="mt-auto">
            <div className="w-full py-2 border border-foreground text-foreground text-[10px] uppercase tracking-widest font-bold hover:bg-foreground hover:text-background transition-colors text-center">
              Read Their Story →
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
