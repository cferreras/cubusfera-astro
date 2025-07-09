import { Mistral } from '@mistralai/mistralai';
import type { ContentChunk } from '@mistralai/mistralai/models/components';

class ApiKeyMissingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiKeyMissingError';
  }
}

export interface PlayerAnalysis {
  playerType: string;
  description: string;
  traits: string[];
}

interface CacheEntry {
  data: PlayerAnalysis;
  timestamp: number;
  playerStatsHash: string;
}

// Caché en memoria con TTL de 3 horas
const CACHE_TTL = 3 * 60 * 60 * 1000; // 3 horas en milisegundos
const analysisCache = new Map<string, CacheEntry>();

// Función para generar un hash simple de las estadísticas del jugador
function generateStatsHash(playerStats: any): string {
  const statsString = JSON.stringify({
    playtime: playerStats.playtime,
    deaths: playerStats.deaths,
    mobKills: playerStats.mobKills,
    playerKills: playerStats.playerKills,
    blocksPlaced: playerStats.blocksPlaced,
    blocksBroken: playerStats.blocksBroken,
    itemsCrafted: playerStats.itemsCrafted,
    itemsUsed: playerStats.itemsUsed,
    damageDealt: playerStats.damageDealt,
    damageTaken: playerStats.damageTaken,
    jumps: playerStats.jumps
  });
  
  // Hash simple usando el contenido de las estadísticas
  let hash = 0;
  for (let i = 0; i < statsString.length; i++) {
    const char = statsString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convertir a 32bit integer
  }
  return hash.toString();
}

// Función para limpiar entradas expiradas del caché
function cleanExpiredCache(): void {
  const now = Date.now();
  for (const [key, entry] of analysisCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL) {
      analysisCache.delete(key);
    }
  }
}

// Función para obtener análisis del caché o generar uno nuevo
function getCachedAnalysis(playerName: string, playerStats: any): PlayerAnalysis | null {
  cleanExpiredCache();
  
  const cacheKey = playerName.toLowerCase();
  const cachedEntry = analysisCache.get(cacheKey);
  
  if (cachedEntry) {
    const now = Date.now();
    const isExpired = now - cachedEntry.timestamp > CACHE_TTL;
    const statsHash = generateStatsHash(playerStats);
    const statsChanged = cachedEntry.playerStatsHash !== statsHash;
    
    // Si no ha expirado y las estadísticas no han cambiado, usar caché
    if (!isExpired && !statsChanged) {
      console.log(`Usando análisis en caché para ${playerName} (válido por ${Math.round((CACHE_TTL - (now - cachedEntry.timestamp)) / (60 * 1000))} minutos más)`);
      return cachedEntry.data;
    }
    
    // Si las estadísticas cambiaron o expiró, eliminar entrada
    analysisCache.delete(cacheKey);
  }
  
  return null;
}

// Función para guardar análisis en caché
function setCachedAnalysis(playerName: string, playerStats: any, analysis: PlayerAnalysis): void {
  const cacheKey = playerName.toLowerCase();
  const statsHash = generateStatsHash(playerStats);
  
  analysisCache.set(cacheKey, {
    data: analysis,
    timestamp: Date.now(),
    playerStatsHash: statsHash
  });
  
  console.log(`Análisis guardado en caché para ${playerName} (válido por 3 horas)`);
}

// Función para obtener análisis de IA usando Mistral API con caché
export async function analyzePlayerStatsWithAI(playerStats: any, playerName?: string): Promise<PlayerAnalysis> {
  if (!playerStats) {
    return {
      playerType: "Jugador Misterioso",
      description: "Este jugador mantiene sus secretos bien guardados. Sus estadísticas están envueltas en misterio.",
      traits: ["Enigmático", "Reservado"]
    };
  }

  // Verificar caché si tenemos el nombre del jugador
  if (playerName) {
    const cachedAnalysis = getCachedAnalysis(playerName, playerStats);
    if (cachedAnalysis) {
      return cachedAnalysis;
    }
  }

  try {
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      throw new ApiKeyMissingError('No se encontró MISTRAL_API_KEY en las variables de entorno');
    }
    
    const statsPrompt = `Analiza estas estadísticas de Minecraft de un servidor técnico NO-PVP. El TIEMPO JUGADO es el factor más importante para evaluar todas las demás estadísticas. Responde SOLO con JSON: {"playerType": "tipo", "description": "descripción detallada de 2-3 oraciones", "traits": ["palabra1", "palabra2", "palabra3"]}.

Estadísticas:
- Tiempo: ${playerStats.playtime || '0h'} ⭐ FACTOR PRINCIPAL
- Muertes: ${playerStats.deaths || 0}
- Mobs eliminados: ${playerStats.mobKills || 0}
- Jugadores eliminados: ${playerStats.playerKills || 0} (NOTA: Servidor NO-PVP, probablemente accidentes o duelos amistosos)
- Bloques colocados: ${playerStats.blocksPlaced || 0}
- Bloques rotos: ${playerStats.blocksBroken || 0}
- Items crafteados: ${playerStats.itemsCrafted || 0}
- Items usados: ${playerStats.itemsUsed || 0}
- Daño infligido: ${playerStats.damageDealt || 0}
- Daño recibido: ${playerStats.damageTaken || 0}
- Experiencia: ${playerStats.experienceGained || 0}
- Logros: ${playerStats.achievements || 0}

CONTEXTO DEL SERVIDOR:
- Servidor técnico enfocado en construcción, redstone y automatización
- NO es PvP: las kills de jugadores son raras y no indican agresividad
- Prioriza cooperación, construcción y mecánicas técnicas

REFERENCIAS DE ESCALA (por hora jugada):
- Bloques colocados: <500/h = Bajo, 500-2000/h = Medio, >2000/h = Alto
- Bloques rotos: <1000/h = Bajo, 1000-5000/h = Medio, >5000/h = Alto
- Mobs eliminados: <50/h = Bajo, 50-200/h = Medio, >200/h = Alto
- Items crafteados: <100/h = Bajo, 100-500/h = Medio, >500/h = Alto
- Muertes: >5/h = Problemático, 1-5/h = Normal, <1/h = Cuidadoso
- Jugadores eliminados: Ignorar o mencionar como "accidentes" si >0

IMPORTANTE:
- Menciona el tiempo jugado SOLO si es destacable (muy poco/mucho) o relevante para el análisis
- Calcula ratios por hora para evaluar eficiencia
- Un jugador con pocas horas pero buenas ratios es "Prometedor"
- Un jugador con muchas horas pero malas ratios necesita "Mejorar"
- NO interpretes kills de jugadores como agresividad
- Enfócate en las estadísticas más relevantes y patrones de juego

REQUISITOS:
- description: Mínimo 2 oraciones, enfócate en eficiencia y estilo de juego
- traits: Solo palabras simples (máximo 2 palabras cada una)
- Menciona tiempo jugado solo si es muy relevante (ej: "novato con pocas horas" o "veterano experimentado")

Tipos: Novato, Prometedor, Eficiente, Constructor, Explorador, Ingeniero, Técnico, Veterano, Cooperativo.
Traits ejemplo: "Eficiente", "Novato", "Técnico", "Paciente", "Activo", "Cuidadoso", "Productivo", "Cooperativo".`;

    const aiResponseContent = await callMistralApi(apiKey, statsPrompt);
    
    try {
      // Limpiar la respuesta de bloques de código markdown si existen
      let cleanResponse = typeof aiResponseContent === 'string' ? aiResponseContent : JSON.stringify(aiResponseContent);
      
      // Remover bloques de código markdown (```json ... ```)
      cleanResponse = cleanResponse.replace(/```json\s*/, '').replace(/\s*```$/, '').trim();
      
      const parsedResponse = JSON.parse(cleanResponse);
      const analysis: PlayerAnalysis = {
        playerType: parsedResponse.playerType || "Jugador Único",
        description: parsedResponse.description || "Un jugador con características especiales.",
        traits: parsedResponse.traits || ["Único", "Especial"]
      };
      
      // Guardar en caché si tenemos el nombre del jugador
      if (playerName) {
        setCachedAnalysis(playerName, playerStats, analysis);
      }
      
      return analysis;
    } catch (parseError) {
      console.warn('Error parsing AI response, using simple fallback. Response was:', aiResponseContent);
      return getSimpleFallback(playerStats);
    }
  } catch (error) {
    if (error instanceof ApiKeyMissingError) {
      console.warn(error.message);
    } else {
      console.warn('Error llamando a la API de Mistral:', error);
    }
    return getSimpleFallback(playerStats);
  }
}

async function callMistralApi(apiKey: string, prompt: string): Promise<string | ContentChunk[]> {
  const client = new Mistral({ apiKey });

  const chatResponse = await client.chat.complete({
    model: 'mistral-small-latest',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
  });

  return chatResponse.choices[0].message.content || '';
}

// Función de análisis estático simple como respaldo
function getSimpleFallback(playerStats: any): PlayerAnalysis {
  return {
    playerType: "Jugador Único",
    description: "Un jugador con su propio estilo de juego. Para obtener un análisis más detallado, configura la API de Mistral.",
    traits: ["Único", "Especial", "Individual"]
  };
}

// Función principal que usa exclusivamente la API de Mistral con caché
export async function analyzePlayerStats(playerStats: any, playerName?: string): Promise<PlayerAnalysis> {
  return await analyzePlayerStatsWithAI(playerStats, playerName);
}

// Función para obtener información del caché (útil para debugging)
export function getCacheInfo(): { size: number; entries: Array<{ playerName: string; timestamp: number; age: string }> } {
  cleanExpiredCache();
  const entries = Array.from(analysisCache.entries()).map(([playerName, entry]) => ({
    playerName,
    timestamp: entry.timestamp,
    age: `${Math.round((Date.now() - entry.timestamp) / (60 * 1000))} minutos`
  }));
  
  return {
    size: analysisCache.size,
    entries
  };
}

// Función para limpiar manualmente el caché
export function clearCache(): void {
  analysisCache.clear();
  console.log('Caché de análisis limpiado manualmente');
}

// Función para obtener un consejo personalizado basado en las estadísticas
export function getPersonalizedTip(playerStats: any): string {
  if (!playerStats) return "¡Empieza a jugar para obtener consejos personalizados!";

  const { deaths, mobKills, blocksPlaced, itemsCrafted, playtime } = playerStats;
  const playtimeHours = parseFloat(playtime?.replace('h', '') || '0');

  if (deaths > mobKills && deaths > 10) {
    return "💡 Consejo: Considera mejorar tu equipo o construir refugios más seguros para reducir las muertes.";
  } else if (blocksPlaced < 1000 && playtimeHours > 10) {
    return "🏗️ Consejo: ¡Anímate a construir más! La construcción es una parte fundamental de Minecraft.";
  } else if (itemsCrafted < 100 && playtimeHours > 5) {
    return "⚒️ Consejo: Experimenta más con el crafting para crear herramientas y objetos útiles.";
  } else if (mobKills < 50 && playtimeHours > 20) {
    return "⚔️ Consejo: Practica el combate para defenderte mejor de las criaturas hostiles.";
  } else {
    return "🌟 ¡Sigue así! Tus estadísticas muestran un progreso excelente en el servidor.";
  }
}