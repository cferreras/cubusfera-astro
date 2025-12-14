import React, { useState, useEffect } from "react";
import StatusMessage from "./ui/StatusMessage";
import { Loader2 } from "lucide-react";

const MAP_URL = "https://mapa.cubusfera.com";

export default function MapContainer() {
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [mapAvailable, setMapAvailable] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkMapServer = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(MAP_URL, {
          method: "HEAD",
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          setMapAvailable(false);
          setError("El servidor del mapa está temporalmente desconectado.");
        } else {
          setMapAvailable(true);
        }
      } catch (e) {
        setMapAvailable(false);
        setError("El servidor del mapa está temporalmente desconectado.");
      } finally {
        setChecking(false);
      }
    };

    checkMapServer();
  }, []);

  const handleMapLoad = () => {
    setLoading(false);
  };

  if (checking) {
    return (
      <div className="w-full h-full min-h-[600px] flex flex-col items-center justify-center bg-muted/30">
        <Loader2 className="w-10 h-10 animate-spin text-brand-green mb-4" />
        <p className="text-muted-foreground">Conectando con el servidor...</p>
      </div>
    );
  }

  if (!mapAvailable) {
    return (
      <div className="w-full h-full min-h-[600px] flex items-center justify-center bg-muted/30 p-6">
        <div className="w-full max-w-md">
          <StatusMessage
            type="offline"
            message={error || "El servidor del mapa está temporalmente desconectado."}
            title="Mapa no disponible"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[600px] bg-muted/30">
      {loading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity duration-500">
          <Loader2 className="w-10 h-10 animate-spin text-brand-green mb-4" />
          <p className="font-medium text-foreground">Cargando mapa...</p>
          <p className="mt-2 text-sm text-muted-foreground">Esto puede tomar unos segundos</p>
        </div>
      )}

      <iframe
        src={`${MAP_URL}/#world:0:0:0:1500:0:0:0:0:perspective`}
        className="w-full h-full border-0"
        title="Mapa de Cubusfera"
        loading="lazy"
        onLoad={handleMapLoad}
      />
    </div>
  );
}
