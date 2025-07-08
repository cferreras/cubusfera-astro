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
  const hours = Math.floor(ticks / 72000);
  const minutes = Math.floor((ticks % 72000) / 1200);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

// Función para convertir centímetros a kilómetros
function cmToKm(cm: number): string {
  if (!cm) return '0km';
  const km = (cm / 100000).toFixed(1);
  return `${km}km`;
}

// Función para buscar un valor en cualquier parte de la estructura
function findAnyValue(data: any, searchTerms: string[]): number {
  function searchRecursive(obj: any, depth: number = 0): number {
    if (depth > 5 || !obj || typeof obj !== 'object') return 0;
    
    // Buscar directamente por las claves
    for (const term of searchTerms) {
      if (obj[term] !== undefined) {
        const value = Number(obj[term]);
        if (!isNaN(value) && value > 0) {
          return value;
        }
      }
    }
    
    // Buscar recursivamente
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null) {
        const result = searchRecursive(value, depth + 1);
        if (result > 0) return result;
      }
    }
    
    return 0;
  }
  
  return searchRecursive(data);
}

// Función para contar items en categorías
function countItemsInCategory(data: any, categoryNames: string[]): number {
  let total = 0;
  
  function searchInObject(obj: any, depth: number = 0): void {
    if (depth > 5 || !obj || typeof obj !== 'object') return;
    
    for (const categoryName of categoryNames) {
      const category = obj[categoryName];
      if (category && typeof category === 'object') {
        for (const [key, value] of Object.entries(category)) {
          const numValue = Number(value);
          if (!isNaN(numValue) && numValue > 0) {
            total += numValue;
          }
        }
      }
    }
    
    // Buscar recursivamente
    for (const value of Object.values(obj)) {
      if (typeof value === 'object' && value !== null) {
        searchInObject(value, depth + 1);
      }
    }
  }
  
  searchInObject(data);
  return total;
}

// Función principal para mapear los datos de la API
export function mapPlayerStats(apiData: any): PlayerStats {
  if (!apiData) {
    return createEmptyStats();
  }
  
  // Buscar tiempo de juego
  const playtimeTerms = [
    'play_time', 'playtime', 'play_one_minute', 'minecraft:play_time', 
    'minecraft:play_one_minute', 'timePlayed', 'playTime'
  ];
  const playTimeTicks = findAnyValue(apiData, playtimeTerms);
  
  // Buscar logros
  let achievements = 0;
  if (apiData.advancements) {
    achievements = Object.values(apiData.advancements).filter(
      (advancement: any) => advancement?.done === true
    ).length;
  }
  if (achievements === 0) {
    achievements = findAnyValue(apiData, ['achievements', 'advancements', 'advancement_count']);
  }
  
  // Buscar estadísticas básicas
  const deaths = findAnyValue(apiData, [
    'deaths', 'minecraft:deaths', 'death_count', 'deathCount'
  ]);
  
  const mobKills = findAnyValue(apiData, [
    'mob_kills', 'minecraft:mob_kills', 'mobKills', 'kills', 'mob_kill_count'
  ]);
  
  const playerKills = findAnyValue(apiData, [
    'player_kills', 'minecraft:player_kills', 'playerKills', 'pvp_kills'
  ]);
  
  // Buscar distancia
  const walkDistance = findAnyValue(apiData, [
    'walk_one_cm', 'minecraft:walk_one_cm', 'walkDistance', 'distance_walked'
  ]);
  const sprintDistance = findAnyValue(apiData, [
    'sprint_one_cm', 'minecraft:sprint_one_cm', 'sprintDistance'
  ]);
  const totalDistance = walkDistance + sprintDistance;
  
  // Buscar daño
  const damageDealt = findAnyValue(apiData, [
    'damage_dealt', 'minecraft:damage_dealt', 'damageDealt', 'damage_done'
  ]);
  const damageTaken = findAnyValue(apiData, [
    'damage_taken', 'minecraft:damage_taken', 'damageTaken', 'damage_received'
  ]);
  
  // Buscar estadísticas de construcción
  const blocksPlaced = countItemsInCategory(apiData, [
    'minecraft:used', 'used', 'use_item', 'placed', 'blocks_placed'
  ]);
  
  const blocksBroken = countItemsInCategory(apiData, [
    'minecraft:mined', 'mined', 'mine_block', 'broken', 'blocks_broken'
  ]);
  
  const itemsCrafted = countItemsInCategory(apiData, [
    'minecraft:crafted', 'crafted', 'craft_item', 'items_crafted'
  ]);
  
  const itemsUsed = countItemsInCategory(apiData, [
    'minecraft:used', 'used', 'use_item', 'items_used'
  ]);
  
  return {
    playtime: ticksToTime(playTimeTicks),
    achievements: achievements || 0,
    deaths: deaths || 0,
    distance: cmToKm(totalDistance),
    mobKills: mobKills || 0,
    playerKills: playerKills || 0,
    damageDealt: Math.round((damageDealt || 0) / 10) || (damageDealt || 0),
    damageTaken: Math.round((damageTaken || 0) / 10) || (damageTaken || 0),
    blocksPlaced: blocksPlaced || 0,
    blocksBroken: blocksBroken || 0,
    itemsCrafted: itemsCrafted || 0,
    itemsUsed: itemsUsed || 0
  };
}

// Función para crear estadísticas vacías
function createEmptyStats(): PlayerStats {
  return {
    playtime: '0h',
    achievements: 0,
    deaths: 0,
    distance: '0km',
    mobKills: 0,
    playerKills: 0,
    damageDealt: 0,
    damageTaken: 0,
    blocksPlaced: 0,
    blocksBroken: 0,
    itemsCrafted: 0,
    itemsUsed: 0
  };
}

// Función para obtener estadísticas específicas por categoría
export function getTopStats(apiData: any, category: 'mined' | 'crafted' | 'used' | 'killed', limit: number = 5) {
  const possiblePaths = [
    `minecraft:${category}`,
    category,
    `stats.minecraft:${category}`,
    `stats.${category}`
  ];
  
  let stats = {};
  
  for (const path of possiblePaths) {
    const pathParts = path.split('.');
    let current = apiData;
    
    for (const part of pathParts) {
      if (current && current[part]) {
        current = current[part];
      } else {
        current = null;
        break;
      }
    }
    
    if (current && typeof current === 'object') {
      stats = current;
      break;
    }
  }
  
  return Object.entries(stats)
    .sort(([,a], [,b]) => (Number(b) || 0) - (Number(a) || 0))
    .slice(0, limit)
    .map(([item, count]) => ({
      item: item.replace('minecraft:', '').replace(/_/g, ' '),
      count: Number(count) || 0
    }));
}