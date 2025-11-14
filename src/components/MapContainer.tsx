import React, { useState, useEffect } from "react";
import StatusMessage from "./ui/StatusMessage";

const MAP_URL = "https://mapa.cubusfera.com";

export default function MapContainer() {
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [mapAvailable, setMapAvailable] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verificar si el servidor del mapa está disponible
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
  }, []);

  const handleMapLoad = () => {
    setLoading(false);
    // Ocultar el overlay de loading con fade-out
    const overlay = document.getElementById("loading-overlay");
    if (overlay) {
      overlay.classList.add("fade-out");
      setTimeout(() => {
        overlay.style.display = "none";
      }, 500);
    }
  };

  useEffect(() => {
    // Fallback: ocultar loading después de 10 segundos si no se carga
    if (mapAvailable && !checking) {
      setLoading(true);
      const timeout = setTimeout(() => {
        handleMapLoad();
      }, 10000);

      return () => clearTimeout(timeout);
    }
  }, [mapAvailable, checking]);

  if (checking) {
    return (
      <div
        className="overflow-hidden relative mt-4 w-full rounded-lg border border-gray-200 dark:border-[#366348] bg-gray-50 dark:bg-[#1b3124]"
        style={{ height: "70vh", minHeight: "600px" }}
      >
        <div className="flex absolute inset-0 flex-col justify-center items-center bg-gray-50 dark:bg-[#1b3124]">
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
      <div
        className="overflow-hidden relative mt-4 w-full rounded-lg border border-gray-200 dark:border-[#366348] bg-gray-50 dark:bg-[#1b3124]"
        style={{ height: "70vh", minHeight: "600px" }}
      >
        <div className="flex justify-center items-center h-full p-6">
          <div className="w-full max-w-2xl">
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
    <div
      className="overflow-hidden relative mt-4 w-full rounded-lg border border-gray-200 dark:border-[#366348] bg-gray-50 dark:bg-[#1b3124]"
      style={{ height: "70vh", minHeight: "600px" }}
    >
      <div
        id="loading-overlay"
        className="flex absolute inset-0 z-10 flex-col justify-center items-center bg-gray-50 dark:bg-[#1b3124] transition-opacity duration-500"
      >
        <div className="mb-4 loading-spinner"></div>
        <p className="font-medium text-gray-600 dark:text-[#96c5a9]">
          Cargando mapa...
        </p>
        <p className="mt-2 text-sm text-gray-600 dark:text-[#96c5a9]">
          Esto puede tomar unos segundos
        </p>
      </div>

      <iframe
        id="map-iframe"
        src={`${MAP_URL}/#world:0:0:0:1500:0:0:0:0:perspective`}
        className="border-0"
        style={{ width: "100%", height: "100%" }}
        title="Mapa de Cubusfera"
        loading="lazy"
        onLoad={handleMapLoad}
      />
    </div>
  );
}
