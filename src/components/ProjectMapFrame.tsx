import React, { useState, useEffect } from "react";
import StatusMessage from "./ui/StatusMessage";

interface ProjectMapFrameProps {
  mapUrl: string;
  title?: string;
}

export default function ProjectMapFrame({
  mapUrl,
  title = "Mapa del proyecto",
}: ProjectMapFrameProps) {
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [mapAvailable, setMapAvailable] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verificar si el servidor del mapa está disponible
    const checkMapServer = async () => {
      try {
        // Extraer el dominio base de la URL del mapa
        const url = new URL(mapUrl);
        const baseUrl = `${url.protocol}//${url.host}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(baseUrl, {
          method: "HEAD",
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          if (
            response.status === 502 ||
            response.status === 503 ||
            response.status === 504
          ) {
            setMapAvailable(false);
            setError(
              "El servidor del mapa está temporalmente desconectado. Intenta de nuevo más tarde.",
            );
          } else {
            setMapAvailable(false);
            setError(
              `El servidor del mapa no está disponible (${response.status}).`,
            );
          }
        } else {
          setMapAvailable(true);
        }
      } catch (e) {
        // Error de red, timeout o servidor no disponible
        setMapAvailable(false);
        setError(
          "El servidor del mapa está temporalmente desconectado. Intenta de nuevo más tarde.",
        );
      } finally {
        setChecking(false);
      }
    };

    checkMapServer();
  }, [mapUrl]);

  const handleMapLoad = () => {
    setLoading(false);
  };

  useEffect(() => {
    if (mapAvailable && !checking) {
      setLoading(true);
    }
  }, [mapAvailable, checking]);

  if (checking) {
    return (
      <div className="aspect-video">
        <div className="flex flex-col justify-center items-center w-full h-full bg-gray-100 dark:bg-[#1b3124]">
          <div className="mb-4 loading-spinner"></div>
          <p className="font-medium text-gray-600 dark:text-[#96c5a9]">
            Verificando servidor del mapa...
          </p>
          <p className="mt-2 text-sm text-gray-600 dark:text-[#96c5a9]">
            Esto puede tomar unos segundos
          </p>
        </div>
      </div>
    );
  }

  if (!mapAvailable) {
    return (
      <div className="aspect-video">
        <div className="flex justify-center items-center w-full h-full p-6 bg-gray-100 dark:bg-[#1b3124]">
          <div className="w-full max-w-xl">
            <StatusMessage
              type="offline"
              message={
                error ||
                "El servidor del mapa está temporalmente desconectado. Intenta de nuevo más tarde."
              }
              title="Mapa no disponible"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-video relative">
      {loading && (
        <div className="absolute inset-0 flex flex-col justify-center items-center z-10 bg-gray-100 dark:bg-[#1b3124] transition-opacity duration-500">
          <div className="mb-4 loading-spinner"></div>
          <p className="font-medium text-gray-600 dark:text-[#96c5a9]">
            Cargando mapa...
          </p>
        </div>
      )}
      <iframe
        src={mapUrl}
        title={title}
        className="w-full h-full"
        frameBorder="0"
        allowFullScreen
        onLoad={handleMapLoad}
      />
    </div>
  );
}
