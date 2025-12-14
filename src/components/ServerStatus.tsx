import { useEffect, useState } from 'react';
import { Server, Users, Activity, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServerStatusData {
  online: boolean;
  players: {
    online: number;
    max: number;
    list: string[];
  };
  whitelist: boolean;
  motd?: string;
}

export default function ServerStatus() {
  const [status, setStatus] = useState<ServerStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  const serverIP = "cubusfera.com";

  useEffect(() => {
    const fetchServerStatus = async () => {
      try {
        const response = await fetch(`https://api.mcsrvstat.us/3/${serverIP}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        
        if (data.online) {
          const rawPlayersList = data.players?.list || [];
          const playersList = rawPlayersList.map((player: any) => 
            typeof player === 'string' ? player : (player.name || player.uuid || '')
          ).filter((name: string) => name && name.trim() !== '');
          
          setStatus({
            online: data.online,
            players: {
              online: data.players?.online || 0,
              max: data.players?.max || 0,
              list: playersList
            },
            whitelist: false, // API doesn't always return whitelist correctly, assuming false or handled elsewhere
            motd: data.motd?.clean?.[0] || "Servidor Técnico"
          });
        } else {
          setStatus({ online: false, players: { online: 0, max: 0, list: [] }, whitelist: false });
        }
      } catch (err) {
        console.error("Error fetching server status:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchServerStatus();
    const interval = setInterval(fetchServerStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const copyIP = () => {
    navigator.clipboard.writeText(serverIP);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="card-pro p-6 animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
        <div className="h-10 bg-muted rounded w-full"></div>
      </div>
    );
  }

  if (error || !status?.online) {
    return (
      <div className="card-pro p-6 border-destructive/50 bg-destructive/5">
        <div className="flex items-center gap-3 text-destructive">
          <Activity className="h-5 w-5" />
          <span className="font-medium">Servidor Offline</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card-pro p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute -inset-1 bg-brand-green/20 rounded-full blur-sm animate-pulse"></div>
            <div className="relative h-3 w-3 rounded-full bg-brand-green"></div>
          </div>
          <h3 className="font-semibold text-lg">Estado del Servidor</h3>
        </div>
        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-brand-green/10 text-brand-green border border-brand-green/20">
          Online
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Users className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Jugadores</span>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {status.players.online} <span className="text-sm text-muted-foreground font-normal">/ {status.players.max}</span>
          </div>
        </div>
        
        <div className="p-4 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Activity className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Versión</span>
          </div>
          <div className="text-2xl font-bold text-foreground">1.21+</div>
        </div>
      </div>

      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-green to-emerald-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-200"></div>
        <button
          onClick={copyIP}
          className="relative w-full flex items-center justify-between px-4 py-3 bg-background border border-border rounded-lg hover:border-brand-green/50 transition-colors group-hover:bg-accent/5"
        >
          <div className="flex items-center gap-3">
            <Server className="h-5 w-5 text-brand-green" />
            <span className="font-mono font-medium text-foreground">{serverIP}</span>
          </div>
          {copied ? (
            <Check className="h-4 w-4 text-brand-green" />
          ) : (
            <Copy className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
          )}
        </button>
      </div>

      {status.players.list.length > 0 && (
        <div className="pt-4 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
            En línea ahora
          </p>
          <div className="flex flex-wrap gap-2">
            {status.players.list.map((player) => (
              <div key={player} className="flex items-center gap-2 px-2 py-1 rounded-md bg-muted border border-border">
                <img 
                  src={`https://minotar.net/avatar/${player}/20`} 
                  alt={player}
                  className="w-5 h-5 rounded-sm"
                  loading="lazy"
                />
                <span className="text-xs font-medium">{player}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
