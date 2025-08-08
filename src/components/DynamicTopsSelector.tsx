import React, { useState, useEffect } from 'react';

interface TopPlayer {
  name: string;
  value: number;
  formattedValue: string;
  item?: string;
}

interface TopCategory {
  id: string;
  title: string;
  icon: string;
  description: string;
  apiPath: string;
}

interface ItemOption {
  id: string;
  name: string;
  displayName: string;
  total?: number; // Nuevo campo para el total
  formattedTotal?: string; // Total formateado
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface PlayerStatsCache {
  [playerName: string]: CacheEntry<any>;
}

interface ItemsCache {
  [categoryId: string]: CacheEntry<ItemOption[]>;
}

const TOP_CATEGORIES: TopCategory[] = [
  {
    id: 'mined',
    title: 'Bloques Minados',
    icon: '⛏️',
    description: 'Los mejores mineros del servidor',
    apiPath: 'minecraft:mined'
  },
  {
    id: 'crafted',
    title: 'Items Crafteados',
    icon: '🔨',
    description: 'Los mejores artesanos del servidor',
    apiPath: 'minecraft:crafted'
  },
  {
    id: 'used',
    title: 'Items Utilizados',
    icon: '🛠️',
    description: 'Los que más usan herramientas',
    apiPath: 'minecraft:used'
  },
  {
    id: 'killed',
    title: 'Mobs Eliminados',
    icon: '⚔️',
    description: 'Los mejores cazadores de mobs',
    apiPath: 'minecraft:killed'
  },
  {
    id: 'killed_by',
    title: 'Muertes por Mobs',
    icon: '💀',
    description: 'Estadísticas de muertes por mobs',
    apiPath: 'minecraft:killed_by'
  },
  {
    id: 'picked_up',
    title: 'Items Recogidos',
    icon: '📦',
    description: 'Los mejores recolectores',
    apiPath: 'minecraft:picked_up'
  },
  {
    id: 'dropped',
    title: 'Items Soltados',
    icon: '📤',
    description: 'Los que más items han soltado',
    apiPath: 'minecraft:dropped'
  },
  {
    id: 'broken',
    title: 'Items Rotos',
    icon: '💔',
    description: 'Los que más herramientas han roto',
    apiPath: 'minecraft:broken'
  },
  {
    id: 'custom',
    title: 'Estadísticas Custom',
    icon: '🎯',
    description: 'Estadísticas personalizadas del servidor',
    apiPath: 'minecraft:custom'
  }
];

const WHITELIST_API_URL = 'https://stats.cubusfera.com/whitelist';
const STATS_API_URL = 'https://stats.cubusfera.com/stats';

// TTL en milisegundos
const CACHE_TTL = {
  MEMBERS: 60 * 60 * 1000, // 1 hora (los miembros cambian raramente)
  PLAYER_STATS: 15 * 60 * 1000, // 15 minutos
  AVAILABLE_ITEMS: 30 * 60 * 1000, // 30 minutos
};

export default function DynamicTopsSelector() {
  const [selectedCategory, setSelectedCategory] = useState<TopCategory>(TOP_CATEGORIES[0]);
  const [availableItems, setAvailableItems] = useState<ItemOption[]>([]);
  const [selectedItem, setSelectedItem] = useState<ItemOption | null>(null);
  const [topPlayers, setTopPlayers] = useState<TopPlayer[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cachés en memoria
  const [membersCache, setMembersCache] = useState<CacheEntry<any[]> | null>(null);
  const [playerStatsCache, setPlayerStatsCache] = useState<PlayerStatsCache>({});
  const [itemsCache, setItemsCache] = useState<ItemsCache>({});

  // Función para verificar si un caché es válido
  const isCacheValid = <T,>(cache: CacheEntry<T> | null): boolean => {
    if (!cache) return false;
    return Date.now() - cache.timestamp < cache.ttl;
  };

  // Función para obtener miembros con caché
  const getCachedMembers = async (): Promise<any[]> => {
    // Verificar caché
    if (isCacheValid(membersCache)) {
      console.log('📋 Usando miembros desde caché');
      return membersCache!.data;
    }

    console.log('🔄 Obteniendo miembros desde API');
    const response = await fetch(WHITELIST_API_URL);
    if (!response.ok) throw new Error('Error al obtener miembros');
    
    const members = await response.json();
    
    // Guardar en caché
    const cacheEntry: CacheEntry<any[]> = {
      data: members,
      timestamp: Date.now(),
      ttl: CACHE_TTL.MEMBERS
    };
    setMembersCache(cacheEntry);
    
    return members;
  };

  // Función para obtener estadísticas de un jugador con caché
  const getCachedPlayerStats = async (playerName: string): Promise<any | null> => {
    // Verificar caché
    const cached = playerStatsCache[playerName];
    if (isCacheValid(cached)) {
      console.log(`📊 Usando stats de ${playerName} desde caché`);
      return cached.data;
    }

    try {
      console.log(`🔄 Obteniendo stats de ${playerName} desde API`);
      const response = await fetch(`${STATS_API_URL}/${playerName}`);
      if (!response.ok) return null;
      
      const stats = await response.json();
      
      // Guardar en caché
      const cacheEntry: CacheEntry<any> = {
        data: stats,
        timestamp: Date.now(),
        ttl: CACHE_TTL.PLAYER_STATS
      };
      
      setPlayerStatsCache(prev => ({
        ...prev,
        [playerName]: cacheEntry
      }));
      
      return stats;
    } catch (e) {
      console.warn(`Error obteniendo stats de ${playerName}:`, e);
      return null;
    }
  };

  // Función para formatear nombres de items
  const formatItemName = (itemName: string): string => {
    return itemName
      .replace('minecraft:', '')
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Función para obtener items disponibles en una categoría con caché y totales
  const fetchAvailableItems = async (category: TopCategory) => {
    setLoadingItems(true);
    
    try {
      // Verificar caché de items
      const cached = itemsCache[category.id];
      if (isCacheValid(cached)) {
        console.log(`📦 Usando items de ${category.id} desde caché`);
        setAvailableItems(cached.data);
        setSelectedItem(cached.data[0]);
        setLoadingItems(false);
        return;
      }

      console.log(`🔄 Obteniendo items de ${category.id} desde API`);
      const members = await getCachedMembers();
      const itemTotals: { [itemName: string]: number } = {};

      // Obtener estadísticas de TODOS los jugadores para calcular totales precisos
      const batchSize = 10;
      for (let i = 0; i < members.length; i += batchSize) {
        const batch = members.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (member) => {
          const rawStats = await getCachedPlayerStats(member.name);
          if (!rawStats) return;
          
          // Buscar datos de la categoría
          let categoryData = null;
          if (rawStats.stats && rawStats.stats[category.apiPath]) {
            categoryData = rawStats.stats[category.apiPath];
          } else if (rawStats[category.apiPath]) {
            categoryData = rawStats[category.apiPath];
          }
          
          if (categoryData && typeof categoryData === 'object') {
            Object.entries(categoryData).forEach(([item, value]) => {
              const numValue = Number(value);
              if (!isNaN(numValue) && numValue > 0) {
                itemTotals[item] = (itemTotals[item] || 0) + numValue;
              }
            });
          }
        });
        
        await Promise.all(batchPromises);
      }

      // Convertir a array con totales y ordenar por total (mayor a menor)
      const itemsArray: ItemOption[] = Object.entries(itemTotals)
        .sort(([,a], [,b]) => b - a) // Ordenar por total descendente
        .map(([item, total]) => ({
          id: item,
          name: item,
          displayName: formatItemName(item),
          total,
          formattedTotal: total.toLocaleString()
        }));

      // Calcular total general
      const grandTotal = Object.values(itemTotals).reduce((sum, value) => sum + value, 0);

      // Añadir opción "Todos" al principio
      const itemsWithTotal: ItemOption[] = [
        {
          id: 'total',
          name: 'total',
          displayName: 'Todos (Total)',
          total: grandTotal,
          formattedTotal: grandTotal.toLocaleString()
        },
        ...itemsArray
      ];

      // Guardar en caché
      const cacheEntry: CacheEntry<ItemOption[]> = {
        data: itemsWithTotal,
        timestamp: Date.now(),
        ttl: CACHE_TTL.AVAILABLE_ITEMS
      };
      
      setItemsCache(prev => ({
        ...prev,
        [category.id]: cacheEntry
      }));

      setAvailableItems(itemsWithTotal);
      setSelectedItem(itemsWithTotal[0]);
      
    } catch (e) {
      console.error('Error obteniendo items:', e);
      const fallbackItems = [{
        id: 'total',
        name: 'total',
        displayName: 'Todos (Total)',
        total: 0,
        formattedTotal: '0'
      }];
      setAvailableItems(fallbackItems);
      setSelectedItem(fallbackItems[0]);
    } finally {
      setLoadingItems(false);
    }
  };

  // Función para obtener datos del ranking con caché optimizado
  const fetchTopData = async (category: TopCategory, item: ItemOption | null) => {
    if (!item) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const members = await getCachedMembers();
      
      // Procesar estadísticas en lotes para mejor rendimiento
      const batchSize = 10;
      const allPlayerStats: Array<{ name: string; stats: any }> = [];
      
      for (let i = 0; i < members.length; i += batchSize) {
        const batch = members.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (member) => {
          const stats = await getCachedPlayerStats(member.name);
          return stats ? { name: member.name, stats } : null;
        });
        
        const batchResults = await Promise.all(batchPromises);
        allPlayerStats.push(...batchResults.filter(Boolean) as Array<{ name: string; stats: any }>);
      }
      
      const categoryStats: { [playerName: string]: number } = {};
      
      allPlayerStats.forEach(player => {
        let categoryData = null;
        
        // Buscar datos de la categoría
        if (player.stats.stats && player.stats.stats[category.apiPath]) {
          categoryData = player.stats.stats[category.apiPath];
        } else if (player.stats[category.apiPath]) {
          categoryData = player.stats[category.apiPath];
        }
        
        if (categoryData && typeof categoryData === 'object') {
          let value = 0;
          
          if (item.id === 'total') {
            // Sumar todos los items
            Object.values(categoryData).forEach(itemValue => {
              const numValue = Number(itemValue);
              if (!isNaN(numValue) && numValue > 0) {
                value += numValue;
              }
            });
          } else {
            // Item específico
            const itemValue = categoryData[item.name];
            value = Number(itemValue) || 0;
          }
          
          if (value > 0) {
            categoryStats[player.name] = value;
          }
        }
      });
      
      // Crear ranking
      const ranking = Object.entries(categoryStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([name, value]) => ({
          name,
          value,
          formattedValue: value.toLocaleString()
        }));
      
      setTopPlayers(ranking);
      
    } catch (e) {
      setError(`Error al obtener datos: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  // Función para seleccionar categoría e ítem aleatorio
  const selectRandomCategoryAndItem = async () => {
    setLoadingItems(true);
    
    try {
      // Seleccionar categoría aleatoria
      const randomCategory = TOP_CATEGORIES[Math.floor(Math.random() * TOP_CATEGORIES.length)];
      console.log(`🎲 Categoría seleccionada: ${randomCategory.title}`);
      
      // Cambiar la categoría primero
      setSelectedCategory(randomCategory);
      
      // Obtener items para esta categoría
      let items: ItemOption[] = [];
      
      // Verificar caché
      const cached = itemsCache[randomCategory.id];
      if (isCacheValid(cached)) {
        console.log(`📦 Usando items desde caché para ${randomCategory.title}`);
        items = cached.data;
      } else {
        console.log(`🔄 Cargando items para ${randomCategory.title}`);
        
        // Cargar items manualmente
        const members = await getCachedMembers();
        const itemTotals: { [itemName: string]: number } = {};

        // Procesar en lotes
        const batchSize = 10;
        for (let i = 0; i < members.length; i += batchSize) {
          const batch = members.slice(i, i + batchSize);
          
          const batchPromises = batch.map(async (member) => {
            const rawStats = await getCachedPlayerStats(member.name);
            if (!rawStats) return;
            
            let categoryData = null;
            if (rawStats.stats && rawStats.stats[randomCategory.apiPath]) {
              categoryData = rawStats.stats[randomCategory.apiPath];
            } else if (rawStats[randomCategory.apiPath]) {
              categoryData = rawStats[randomCategory.apiPath];
            }
            
            if (categoryData && typeof categoryData === 'object') {
              Object.entries(categoryData).forEach(([item, value]) => {
                const numValue = Number(value);
                if (!isNaN(numValue) && numValue > 0) {
                  itemTotals[item] = (itemTotals[item] || 0) + numValue;
                }
              });
            }
          });
          
          await Promise.all(batchPromises);
        }

        // Crear array de items específicos (sin "Todos")
        const itemsArray: ItemOption[] = Object.entries(itemTotals)
          .sort(([,a], [,b]) => b - a)
          .map(([item, total]) => ({
            id: item,
            name: item,
            displayName: formatItemName(item),
            total,
            formattedTotal: total.toLocaleString()
          }));

        // Calcular total general
        const grandTotal = Object.values(itemTotals).reduce((sum, value) => sum + value, 0);

        // Crear lista completa con "Todos" al principio
        const completeItems = [
          {
            id: 'total',
            name: 'total',
            displayName: 'Todos (Total)',
            total: grandTotal,
            formattedTotal: grandTotal.toLocaleString()
          },
          ...itemsArray
        ];

        // Guardar en caché la lista completa
        const cacheEntry: CacheEntry<ItemOption[]> = {
          data: completeItems,
          timestamp: Date.now(),
          ttl: CACHE_TTL.AVAILABLE_ITEMS
        };
        
        setItemsCache(prev => ({
          ...prev,
          [randomCategory.id]: cacheEntry
        }));

        // Actualizar availableItems con la lista completa
        setAvailableItems(completeItems);
        
        // Usar la lista completa para la selección
        items = completeItems;
      }
      
      // SELECCIÓN ALEATORIA: FORZAR selección de ítems específicos ÚNICAMENTE
      console.log(`📋 Total de items cargados: ${items.length}`);
      console.log(`📋 Todos los items:`, items.map(i => `${i.id} - ${i.displayName}`));
      
      // Filtrar AGRESIVAMENTE cualquier cosa que sea "total" o "Todos"
      const specificItems = items.filter(item => 
        item.id !== 'total' && 
        item.name !== 'total' && 
        !item.displayName.includes('Todos') &&
        !item.displayName.includes('Total')
      );
      
      console.log(`📋 Items específicos después del filtro: ${specificItems.length}`);
      console.log(`📋 Items específicos filtrados:`, specificItems.map(i => `${i.id} - ${i.displayName}`));
      
      if (specificItems.length > 0) {
        // Asegurar que availableItems esté actualizado ANTES de seleccionar
        setAvailableItems(items);
        
        // Esperar un tick para que el estado se actualice
        await new Promise(resolve => setTimeout(resolve, 10));
        
        const randomIndex = Math.floor(Math.random() * specificItems.length);
        const selectedRandomItem = specificItems[randomIndex];
        
        console.log(`✅ SELECCIONADO FINAL: ${selectedRandomItem.displayName} (índice ${randomIndex} de ${specificItems.length})`);
        console.log(`✅ Item seleccionado completo:`, selectedRandomItem);
        
        // Seleccionar el ítem específico
        setSelectedItem(selectedRandomItem);
      } else {
        console.error(`❌ NO HAY ÍTEMS ESPECÍFICOS para ${randomCategory.title}`);
        console.error(`❌ Items disponibles:`, items);
        // Como último recurso, si realmente no hay ítems específicos
        if (items.length > 1) {
          // Tomar el segundo ítem (saltarse el primero que suele ser "Todos")
          setSelectedItem(items[1]);
        } else if (items.length === 1) {
          setSelectedItem(items[0]);
        }
      }
      
    } catch (error) {
      console.error('❌ Error en selección aleatoria:', error);
    } finally {
      setLoadingItems(false);
    }
  };

  // Función para limpiar cachés expirados
  const cleanExpiredCaches = () => {
    // Limpiar caché de miembros
    if (membersCache && !isCacheValid(membersCache)) {
      setMembersCache(null);
    }
    
    // Limpiar caché de estadísticas de jugadores
    setPlayerStatsCache(prev => {
      const cleaned: PlayerStatsCache = {};
      Object.entries(prev).forEach(([key, value]) => {
        if (isCacheValid(value)) {
          cleaned[key] = value;
        }
      });
      return cleaned;
    });
    
    // Limpiar caché de items
    setItemsCache(prev => {
      const cleaned: ItemsCache = {};
      Object.entries(prev).forEach(([key, value]) => {
        if (isCacheValid(value)) {
          cleaned[key] = value;
        }
      });
      return cleaned;
    });
  };

  // Efecto para cargar items cuando cambia la categoría
  useEffect(() => {
    fetchAvailableItems(selectedCategory);
  }, [selectedCategory]);

  // Efecto para cargar datos cuando cambia la categoría o el item
  useEffect(() => {
    if (selectedItem) {
      fetchTopData(selectedCategory, selectedItem);
    }
  }, [selectedCategory, selectedItem]);

  // Efecto para limpiar cachés expirados cada 5 minutos
  useEffect(() => {
    const interval = setInterval(cleanExpiredCaches, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getPositionColor = (position: number): string => {
    switch (position) {
      case 1: return 'text-yellow-500 dark:text-yellow-400';
      case 2: return 'text-gray-400 dark:text-gray-300';
      case 3: return 'text-amber-600 dark:text-amber-500';
      default: return 'text-white/80';
    }
  };

  const getPositionIcon = (position: number): string => {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `${position}°`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header compacto */}
      <div className="space-y-3 text-center">
        <div className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-full border bg-[#264532] border-[#366348] text-[#38e07b]">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
          Explorador de Estadísticas
        </div>
        <h2 className="text-2xl font-bold text-white md:text-3xl">
          Explorador
        </h2>
        <p className="max-w-xl mx-auto text-[#96c5a9]">
          Explora estadísticas detalladas y crea rankings personalizados
        </p>
      </div>

      {/* Panel de control con ancho expandido */}
      <div className="max-w-6xl mx-auto bg-[#1b3124] border border-[#366348] rounded-lg p-6 shadow-sm">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Selector de categorías */}
          <div>
            <h3 className="flex items-center mb-3 text-sm font-semibold text-white">
              <span className="bg-[#38e07b] text-black rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2">1</span>
              Categoría
            </h3>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
              {TOP_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category)}
                  className={`p-3 rounded-md border text-sm transition-all duration-200 hover:scale-105 ${
                    selectedCategory.id === category.id
                      ? 'bg-[#38e07b] text-black border-[#38e07b] shadow-md'
                      : 'bg-[#122118] border-[#366348] hover:border-[#38e07b] hover:bg-[#264532]'
                  }`}
                >
                  <div className="mb-2 text-xl">{category.icon}</div>
                  <div className="font-medium leading-tight">
                    {category.title}
                  </div>
                </button>
              ))}
              
              {/* Botón de selección aleatoria como categoría */}
              <button
                onClick={selectRandomCategoryAndItem}
                disabled={loadingItems || loading}
                className="p-3 rounded-md border text-sm transition-all duration-200 hover:scale-105 bg-[#122118] border-[#366348] hover:border-[#38e07b] hover:bg-[#264532] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <div className="mb-2 text-xl">
                  {loadingItems || loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#38e07b] mx-auto"></div>
                  ) : (
                    "🎲"
                  )}
                </div>
                <div className="font-medium leading-tight">
                  {loadingItems || loading ? "Seleccionando..." : "Sorpréndeme"}
                </div>
              </button>
            </div>
          </div>

          {/* Selector de items */}
          <div>
            <h3 className="flex items-center mb-3 text-sm font-semibold text-white">
              <span className="bg-[#38e07b] text-black rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2">2</span>
              Item Específico
            </h3>
            
            {loadingItems ? (
              <div className="flex items-center justify-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#38e07b]"></div>
                <span className="ml-3 text-sm text-[#96c5a9]">Cargando...</span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <select
                    value={selectedItem?.id || ''}
                    onChange={(e) => {
                      const item = availableItems.find(i => i.id === e.target.value);
                      setSelectedItem(item || null);
                    }}
                    className="w-full p-4 pr-10 text-sm rounded-lg border-2 border-[#366348] bg-[#122118] text-white focus:border-[#38e07b] focus:ring-4 focus:ring-[#38e07b]/10 transition-all duration-200 appearance-none cursor-pointer hover:border-[#38e07b] shadow-sm"
                  >
                    {availableItems.map((item) => (
                      <option key={item.id} value={item.id} className="py-2">
                        {item.displayName} {item.formattedTotal && `(${item.formattedTotal})`}
                      </option>
                    ))}
                  </select>
                  
                  {/* Icono de flecha personalizado */}
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-[#96c5a9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
                
                {selectedItem && (
                  <div className="bg-gradient-to-r from-[#264532] to-[#1b3124] border border-[#366348] rounded-lg p-4 space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-[#38e07b] rounded-full"></div>
                      <span className="font-semibold text-white">{selectedCategory.title}</span>
                      {selectedItem.id !== 'total' && (
                        <>
                          <span className="text-[#96c5a9]">→</span>
                          <span className="text-[#38e07b] font-medium">{selectedItem.displayName}</span>
                        </>
                      )}
                    </div>
                    
                    {selectedItem.formattedTotal && (
                      <div className="flex items-center justify-between p-3 bg-[#122118]/50 rounded-md border border-[#366348]/50">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">📊</span>
                          <span className="text-sm text-[#96c5a9]">Total del servidor:</span>
                        </div>
                        <span className="font-bold text-[#38e07b] text-lg">{selectedItem.formattedTotal}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resultados con ancho expandido */}
      <div className="max-w-6xl mx-auto">
        {error ? (
          <div className="p-6 text-center border border-red-800 rounded-lg bg-red-900/20">
            <div className="mb-3 text-red-400">
              <svg className="w-8 h-8 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-red-300">Error al cargar ranking</h3>
            <p className="text-sm text-red-400">{error}</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="space-y-4 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#38e07b] mx-auto"></div>
              <p className="text-sm text-[#96c5a9]">
                Cargando ranking...
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-[#1b3124] border border-[#366348] rounded-lg shadow-sm overflow-hidden">
            {/* Header del ranking */}
            <div className="bg-[#264532] px-6 py-4 border-b border-[#366348]">
              <div className="flex items-center space-x-4">
                <span className="text-3xl">{selectedCategory.icon}</span>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Top {selectedCategory.title}
                  </h3>
                  {selectedItem && (
                    <p className="text-sm text-[#96c5a9]">
                      {selectedItem.id === 'total' ? 'Total de todos los items' : selectedItem.displayName}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Lista de jugadores */}
            <div className="divide-y divide-[#366348]">
              {topPlayers.length > 0 ? (
                topPlayers.map((player, index) => (
                  <div key={player.name} className="flex items-center justify-between p-4 hover:bg-[#264532] transition-colors duration-200">
                    <div className="flex items-center space-x-4">
                      <span className={`text-xl font-bold ${getPositionColor(index + 1)} min-w-[3rem]`}>
                        {getPositionIcon(index + 1)}
                      </span>
                      <a 
                        href={`/miembros/${player.name}`}
                        className="flex items-center space-x-3 transition-transform duration-200 group hover:scale-105"
                      >
                        <img 
                          src={`https://mc-heads.net/avatar/${player.name}/32`}
                          alt={`Avatar de ${player.name}`}
                          className="w-8 h-8 transition-shadow duration-200 rounded group-hover:shadow-md"
                          loading="lazy"
                        />
                        <span className="text-lg font-medium text-white group-hover:text-[#38e07b] transition-colors duration-200">
                          {player.name}
                        </span>
                      </a>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-semibold text-[#38e07b]">
                        {player.formattedValue}
                      </span>
                      {selectedItem?.total && selectedItem.total > 0 && (
                        <div className="text-sm text-[#96c5a9]">
                          {((player.value / selectedItem.total) * 100).toFixed(1)}%
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-[#96c5a9]">
                  <div className="mb-4 text-4xl">📊</div>
                  <p className="mb-2 text-lg font-medium">No hay datos disponibles</p>
                  <p className="text-sm">
                    No se encontraron estadísticas para {selectedItem?.displayName || 'esta selección'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer compacto con información de caché */}
      <div className="space-y-1 text-center">
        <p className="text-xs text-[#96c5a9]">
          📊 Rankings con caché inteligente y totales ordenados por popularidad
        </p>
        <p className="text-xs text-[#96c5a9]/70">
          🔄 Miembros: 1h • 📊 Stats: 15min • 📦 Items: 30min
        </p>
      </div>
    </div>
  );
}