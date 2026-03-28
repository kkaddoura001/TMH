import { useState, useEffect } from "react";
import { X, Hash, Mail, Send, CheckCircle2 } from "lucide-react";

const API_BASE = import.meta.env?.VITE_API_BASE_URL ?? "";

interface Channel {
  id: number;
  name: string;
  type: string;
  displayName: string;
  isDefault: boolean;
}

interface ShareToMajlisModalProps {
  shareString: string;
  onClose: () => void;
}

export function ShareToMajlisModal({ shareString, onClose }: ShareToMajlisModalProps) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const [error, setError] = useState("");

  const token = localStorage.getItem("majlis_token");

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/majlis/channels`, {
      headers: { "Content-Type": "application/json", "x-majlis-token": token },
    })
      .then(r => r.json())
      .then(data => setChannels(data.channels ?? []))
      .catch(() => setError("Failed to load channels"))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSend = async (channel: Channel) => {
    if (!token || sending) return;
    setSending(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/majlis/channels/${channel.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-majlis-token": token },
        body: JSON.stringify({ content: shareString }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send");
      }
      setSent(channel.displayName);
      setTimeout(onClose, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-card border border-border w-full max-w-sm"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-[10px] font-serif font-bold uppercase tracking-[0.2em] text-foreground">
            Share to Majlis
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4">
          {sent ? (
            <div className="flex items-center gap-2 text-sm text-green-400 py-4 justify-center">
              <CheckCircle2 className="w-4 h-4" />
              Shared to {sent}
            </div>
          ) : loading ? (
            <p className="text-sm text-muted-foreground text-center py-4">Loading channels...</p>
          ) : error ? (
            <p className="text-sm text-red-400 text-center py-4">{error}</p>
          ) : channels.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No channels found</p>
          ) : (
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {channels.map(ch => (
                <button
                  key={ch.id}
                  onClick={() => handleSend(ch)}
                  disabled={sending}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/30 transition-colors disabled:opacity-50"
                >
                  {ch.type === "dm" ? (
                    <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <Hash className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className="text-sm text-foreground truncate flex-1">
                    {ch.displayName}
                  </span>
                  <Send className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
