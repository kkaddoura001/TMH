import type React from "react";
import { useAuth } from "@/lib/auth";
import { useLocation, Link } from "wouter";
import { LayoutDashboard, MessageSquare, TrendingUp, Users, LogOut, Home } from "lucide-react";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/homepage", label: "Homepage", icon: Home },
  { path: "/debates", label: "Debates", icon: MessageSquare },
  { path: "/predictions", label: "Predictions", icon: TrendingUp },
  { path: "/voices", label: "Voices", icon: Users },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { logout, username } = useAuth();
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-56 border-r border-border bg-card flex flex-col shrink-0">
        <div className="p-4 border-b border-border">
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 900, fontSize: "1rem", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
            <span className="text-foreground">THE TRIBUNAL</span><span className="text-primary">.</span>
          </h1>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.5rem", textTransform: "uppercase", letterSpacing: "0.2em", color: "hsl(var(--muted-foreground))", marginTop: "0.15rem" }}>
            CMS
          </p>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {NAV_ITEMS.map(item => {
            const isActive = location.startsWith(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{username}</span>
            <button onClick={logout} className="text-muted-foreground hover:text-foreground transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}
