// Función para mapear los datos de la API de Minecraft a un formato más legible
export interface PlayerStats {
  playtime: string;
  achievements: number;
  deaths: number;
  distance: string;
  mobKills: number;
  playerKills: number;
  damageDealt: number;
  damageTaken: number;
  blocksPlaced: number;
  blocksBroken: number;
  itemsCrafted: number;
  itemsUsed: number;
}

// Función para convertir ticks a tiempo legible
function ticksToTime(ticks: number): string {
  if (!ticks) return '0h';
  const hours = Math.floor(ticks / 72000); // 20 ticks por segundo * 3600 segundos por hora
  const minutes = Math.floor((ticks % 72000) / 1200); // 20 ticks por segundo * 60 segundos por minuto
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

// Función para convertir centímetros a kilómetros
function cmToKm(cm: number): string {
  if (!cm) return '0km';
  const km = (cm / 100000).toFixed(1); // 100,000 cm = 1 km
  return `${km}km`;
}

// Función para obtener valor de estadística con múltiples formatos posibles
function getStatValue(stats: any, category: string, stat: string): number {
  // Intentar diferentes formatos de claves
  const possibleKeys = [
    `minecraft:${stat}`,
    `${stat}`,
    `minecraft:${category}.minecraft:${stat}`,
    `${category}.${stat}`
  ];
  
  // Buscar en la categoría específica
  const categoryData = stats?.[`minecraft:${category}`] || stats?.[category];
  if (categoryData) {
    for (const key of possibleKeys) {
      if (categoryData[key] !== undefined) {
        return Number(categoryData[key]) || 0;
      }
    }
  }
  
  // Buscar directamente en stats
  for (const key of possibleKeys) {
    if (stats[key] !== undefined) {
      return Number(stats[key]) || 0;
    }
  }
  
  return 0;
}

// Función para buscar valores en toda la estructura de datos
function findStatValue(data: any, searchTerms: string[]): number {
  function searchRecursive(obj: any, depth: number = 0): number {
    if (depth > 3 || !obj || typeof obj !== 'object') return 0;
    
    for (const term of searchTerms) {
      if (obj[term] !== undefined && typeof obj[term] === 'number') {
        return obj[term];
      }
    }
    
    for (const value of Object.values(obj)) {
      const result = searchRecursive(value, depth + 1);
      if (result > 0) return result;
    }
    
    return 0;
  }
  
  return searchRecursive(data);
}

// Función principal para mapear los datos de la API
export function mapPlayerStats(apiData: any): PlayerStats {
  console.log('Raw API Data:', apiData); // Debug log
  
  const stats = apiData?.stats || apiData || {};
  console.log('Stats object:', stats); // Debug log
  
  // Calcular tiempo total jugado - buscar en múltiples ubicaciones
  let playTimeTicks = getStatValue(stats, 'custom', 'play_time') || 
                     getStatValue(stats, 'custom', 'play_one_minute') ||
                     findStatValue(apiData, ['play_time', 'playtime', 'play_one_minute']);
  
  // Calcular distancia total
  const walkDistance = getStatValue(stats, 'custom', 'walk_one_cm') || 
                      findStatValue(apiData, ['walk_one_cm', 'walk_distance']);
  const sprintDistance = getStatValue(stats, 'custom', 'sprint_one_cm') ||
                        findStatValue(apiData, ['sprint_one_cm', 'sprint_distance']);
  const swimDistance = getStatValue(stats, 'custom', 'swim_one_cm') ||
                      findStatValue(apiData, ['swim_one_cm', 'swim_distance']);
  const flyDistance = getStatValue(stats, 'custom', 'fly_one_cm') ||
                     findStatValue(apiData, ['fly_one_cm', 'fly_distance']);
  const totalDistance = walkDistance + sprintDistance + swimDistance + flyDistance;
  
  // Contar logros
  let achievements = 0;
  if (apiData?.advancements) {
    achievements = Object.keys(apiData.advancements).filter(
      key => apiData.advancements[key]?.done === true
    ).length;
  } else {
    achievements = findStatValue(apiData, ['achievements', 'advancements_count']);
  }
  
  // Obtener estadísticas básicas
  const deaths = getStatValue(stats, 'custom', 'deaths') || 
                findStatValue(apiData, ['deaths', 'death_count']);
  
  const mobKills = getStatValue(stats, 'custom', 'mob_kills') ||
                  findStatValue(apiData, ['mob_kills', 'mobs_killed']);
  
  const playerKills = getStatValue(stats, 'custom', 'player_kills') ||
                     findStatValue(apiData, ['player_kills', 'players_killed']);
  
  const damageDealt = getStatValue(stats, 'custom', 'damage_dealt') ||
                     findStatValue(apiData, ['damage_dealt', 'damage_done']);
  
  const damageTaken = getStatValue(stats, 'custom', 'damage_taken') ||
                     findStatValue(apiData, ['damage_taken', 'damage_received']);
  
  // Calcular bloques y items
  let blocksPlaced = 0;
  let blocksBroken = 0;
  let itemsCrafted = 0;
  let itemsUsed = 0;
  
  // Buscar en diferentes estructuras posibles
  const usedStats = stats?.['minecraft:used'] || stats?.used || {};
  const minedStats = stats?.['minecraft:mined'] || stats?.mined || {};
  const craftedStats = stats?.['minecraft:crafted'] || stats?.crafted || {};
  
  if (Object.keys(usedStats).length > 0) {
    blocksPlaced = Object.keys(usedStats)
      .filter(key => key.includes('_block'))
      .reduce((total, key) => total + (Number(usedStats[key]) || 0), 0);
    
    itemsUsed = Object.keys(usedStats)
      .filter(key => !key.includes('_block'))
      .reduce((total, key) => total + (Number(usedStats[key]) || 0), 0);
  }
  
  if (Object.keys(minedStats).length > 0) {
    blocksBroken = Object.keys(minedStats)
      .reduce((total, key) => total + (Number(minedStats[key]) || 0), 0);
  }
  
  if (Object.keys(craftedStats).length > 0) {
    itemsCrafted = Object.keys(craftedStats)
      .reduce((total, key) => total + (Number(craftedStats[key]) || 0), 0);
  }
  
  const result = {
    playtime: ticksToTime(playTimeTicks),
    achievements,
    deaths,
    distance: cmToKm(totalDistance),
    mobKills,
    playerKills,
    damageDealt: Math.round(damageDealt / 10) || damageDealt, // Intentar ambos formatos
    damageTaken: Math.round(damageTaken / 10) || damageTaken,
    blocksPlaced,
    blocksBroken,
    itemsCrafted,
    itemsUsed
  };
  
  console.log('Mapped stats:', result); // Debug log
  return result;
}

// Función para obtener estadísticas específicas por categoría
export function getTopStats(apiData: any, category: 'mined' | 'crafted' | 'used' | 'killed', limit: number = 5) {
  const stats = apiData?.stats?.[`minecraft:${category}`] || {};
  
  return Object.entries(stats)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, limit)
    .map(([item, count]) => ({
      item: item.replace('minecraft:', '').replace(/_/g, ' '),
      count: count as number
    }));
}