import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Interfaz para el caché de tops
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

// Mapa de caché en memoria
const cache = new Map<string, CacheEntry<any>>();

// Función para obtener datos del caché o ejecutar la función si no existe/expiró
export async function getCachedData<T>(
  key: string,
  fetchFunction: () => Promise<T>,
  cacheTimeMinutes: number = 30
): Promise<T> {
  const now = Date.now();
  const cached = cache.get(key);
  
  // Si existe en caché y no ha expirado, devolver datos del caché
  if (cached && (now - cached.timestamp) < cached.expiresIn) {
    return cached.data;
  }
  
  // Si no existe o expiró, obtener datos frescos
  try {
    const freshData = await fetchFunction();
    
    // Guardar en caché
    cache.set(key, {
      data: freshData,
      timestamp: now,
      expiresIn: cacheTimeMinutes * 60 * 1000 // convertir minutos a milisegundos
    });
    
    return freshData;
  } catch (error) {
    // Si hay error y tenemos datos en caché (aunque expirados), usarlos
    if (cached) {
      return cached.data;
    }
    throw error;
  }
}

// Función para limpiar el caché
export function clearCache(key?: string) {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}

// Función para obtener el tamaño del caché
export function getCacheSize(): number {
  return cache.size;
}
