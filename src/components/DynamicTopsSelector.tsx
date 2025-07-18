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
      default: return 'text-muted-foreground';
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
      <div className="text-center space-y-3">
        <div className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-full border bg-primary/10 border-primary/20 text-primary">
          <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
          Rankings Dinámicos
        </div>
        <h2 className="text-2xl font-bold text-foreground md:text-3xl">
          Tops Personalizados
        </h2>
        <p className="max-w-xl mx-auto text-muted-foreground">
          Selecciona una categoría y un item específico para ver rankings detallados
        </p>
      </div>

      {/* Panel de control con ancho expandido */}
      <div className="max-w-6xl mx-auto bg-card border border-border rounded-lg p-6 shadow-sm">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Selector de categorías */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center">
              <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2">1</span>
              Categoría
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {TOP_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category)}
                  className={`p-3 rounded-md border text-sm transition-all duration-200 hover:scale-105 ${
                    selectedCategory.id === category.id
                      ? 'bg-primary text-primary-foreground border-primary shadow-md'
                      : 'bg-background border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                >
                  <div className="text-xl mb-2">{category.icon}</div>
                  <div className="font-medium leading-tight">
                    {category.title}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Selector de items */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center">
              <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2">2</span>
              Item Específico
            </h3>
            
            {loadingItems ? (
              <div className="flex items-center justify-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="ml-3 text-sm text-muted-foreground">Cargando...</span>
              </div>
            ) : (
              <div className="space-y-3">
                <select
                  value={selectedItem?.id || ''}
                  onChange={(e) => {
                    const item = availableItems.find(i => i.id === e.target.value);
                    setSelectedItem(item || null);
                  }}
                  className="w-full p-3 text-sm rounded-md border border-border bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                >
                  {availableItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.displayName} {item.formattedTotal && `(${item.formattedTotal})`}
                    </option>
                  ))}
                </select>
                
                {selectedItem && (
                  <div className="text-sm text-muted-foreground space-y-2 p-3 bg-muted/30 rounded-md">
                    <div>
                      <span className="font-medium">{selectedCategory.title}</span>
                      {selectedItem.id !== 'total' && (
                        <span> → {selectedItem.displayName}</span>
                      )}
                    </div>
                    {selectedItem.formattedTotal && (
                      <div className="flex items-center space-x-2">
                        <span className="text-primary font-medium">📊</span>
                        <span>Total del servidor: <span className="font-semibold text-primary">{selectedItem.formattedTotal}</span></span>
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
          <div className="p-6 text-center bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <div className="text-red-600 dark:text-red-400 mb-3">
              <svg className="mx-auto mb-3 w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">Error al cargar ranking</h3>
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground">
                Cargando ranking...
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
            {/* Header del ranking */}
            <div className="bg-muted/30 px-6 py-4 border-b border-border">
              <div className="flex items-center space-x-4">
                <span className="text-3xl">{selectedCategory.icon}</span>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Top {selectedCategory.title}
                  </h3>
                  {selectedItem && (
                    <p className="text-sm text-muted-foreground">
                      {selectedItem.id === 'total' ? 'Total de todos los items' : selectedItem.displayName}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Lista de jugadores */}
            <div className="divide-y divide-border">
              {topPlayers.length > 0 ? (
                topPlayers.map((player, index) => (
                  <div key={player.name} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors duration-200">
                    <div className="flex items-center space-x-4">
                      <span className={`text-xl font-bold ${getPositionColor(index + 1)} min-w-[3rem]`}>
                        {getPositionIcon(index + 1)}
                      </span>
                      <a 
                        href={`/miembros/${player.name}`}
                        className="flex items-center space-x-3 group hover:scale-105 transition-transform duration-200"
                      >
                        <img 
                          src={`https://mc-heads.net/avatar/${player.name}/32`}
                          alt={`Avatar de ${player.name}`}
                          className="w-8 h-8 rounded group-hover:shadow-md transition-shadow duration-200"
                          loading="lazy"
                        />
                        <span className="text-lg font-medium text-foreground group-hover:text-primary transition-colors duration-200">
                          {player.name}
                        </span>
                      </a>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-semibold text-primary">
                        {player.formattedValue}
                      </span>
                      {selectedItem?.total && selectedItem.total > 0 && (
                        <div className="text-sm text-muted-foreground">
                          {((player.value / selectedItem.total) * 100).toFixed(1)}%
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-muted-foreground">
                  <div className="text-4xl mb-4">📊</div>
                  <p className="text-lg font-medium mb-2">No hay datos disponibles</p>
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
      <div className="text-center space-y-1">
        <p className="text-xs text-muted-foreground">
          📊 Rankings con caché inteligente y totales ordenados por popularidad
        </p>
        <p className="text-xs text-muted-foreground/70">
          🔄 Miembros: 1h • 📊 Stats: 15min • 📦 Items: 30min
        </p>
      </div>
    </div>
  );
}