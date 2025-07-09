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

// Función para obtener análisis de IA usando Mistral API
export async function analyzePlayerStatsWithAI(playerStats: any): Promise<PlayerAnalysis> {
  if (!playerStats) {
    return {
      playerType: "Jugador Misterioso",
      description: "Este jugador mantiene sus secretos bien guardados. Sus estadísticas están envueltas en misterio.",
      traits: ["Enigmático", "Reservado"]
    };
  }

  try {
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      throw new ApiKeyMissingError('No se encontró MISTRAL_API_KEY en las variables de entorno');
    }
    
    const statsPrompt = `Analiza las siguientes estadísticas de Minecraft y describe qué tipo de jugador es esta persona en español. Responde SOLO con un JSON válido con esta estructura exacta: {"playerType": "tipo de jugador", "description": "descripción detallada", "traits": ["rasgo1", "rasgo2", "rasgo3"]}.

Estadísticas:
- Tiempo jugado: ${playerStats.playtime || '0h'}
- Muertes: ${playerStats.deaths || 0}
- Mobs eliminados: ${playerStats.mobKills || 0}
- Jugadores eliminados: ${playerStats.playerKills || 0}
- Bloques colocados: ${playerStats.blocksPlaced || 0}
- Bloques rotos: ${playerStats.blocksBroken || 0}
- Items crafteados: ${playerStats.itemsCrafted || 0}
- Items usados: ${playerStats.itemsUsed || 0}
- Daño infligido: ${playerStats.damageDealt || 0}
- Daño recibido: ${playerStats.damageTaken || 0}
- Saltos: ${playerStats.jumps || 0}`;

    const aiResponseContent = await callMistralApi(apiKey, statsPrompt);
    
    try {
      // Limpiar la respuesta de bloques de código markdown si existen
      let cleanResponse = typeof aiResponseContent === 'string' ? aiResponseContent : JSON.stringify(aiResponseContent);
      
      // Remover bloques de código markdown (```json ... ```)
      cleanResponse = cleanResponse.replace(/```json\s*/, '').replace(/\s*```$/, '').trim();
      
      const parsedResponse = JSON.parse(cleanResponse);
      return {
        playerType: parsedResponse.playerType || "Jugador Único",
        description: parsedResponse.description || "Un jugador con características especiales.",
        traits: parsedResponse.traits || ["Único", "Especial"]
      };
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

// Función principal que usa exclusivamente la API de Mistral
export async function analyzePlayerStats(playerStats: any): Promise<PlayerAnalysis> {
  return await analyzePlayerStatsWithAI(playerStats);
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