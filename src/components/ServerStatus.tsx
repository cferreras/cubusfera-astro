import { useEffect, useState } from 'react';

interface ServerStatusData {
  online: boolean;
  players: {
    online: number;
    max: number;
    list: string[];
  };
  whitelist: boolean;
  motd?: string;
}

export default function ServerStatus() {
  const [status, setStatus] = useState<ServerStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const serverIP = "cubusfera.com";

  useEffect(() => {
    const fetchServerStatus = async () => {
      try {
        // Usando la API de mcsrvstat.us para obtener el estado del servidor
        const response = await fetch(`https://api.mcsrvstat.us/3/${serverIP}`);
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        
        console.log('Server data:', data); // Para debug
        console.log('Players list:', data.players?.list); // Debug lista de jugadores
        console.log('Players online:', data.players?.online); // Debug jugadores online
        
        if (data.online) {
          // La lista de jugadores puede venir como array de strings o array de objetos
          // Los bots NO aparecen en la lista, solo los jugadores reales
          const rawPlayersList = data.players?.list || [];
          const playersList = rawPlayersList.map((player: any) => 
            typeof player === 'string' ? player : (player.name || player.uuid || '')
          ).filter((name: string) => name && name.trim() !== '');
          
          setStatus({
            online: data.online,
            players: {
              online: data.players?.online || 0,
              max: data.players?.max || 0,
              list: playersList
            },
            whitelist: true, // Asumimos que siempre está activa
            motd: data.motd?.clean?.[0] || ''
          });
        } else {
          setStatus({
            online: false,
            players: {
              online: 0,
              max: 0,
              list: []
            },
            whitelist: true
          });
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching server status:', err);
        setError(true);
        setLoading(false);
      }
    };

    fetchServerStatus();
    // Actualizar cada 60 segundos
    const interval = setInterval(fetchServerStatus, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Los bots son la diferencia entre el total online y los jugadores con nombre
  const realPlayersCount = status?.players.list.length || 0;
  const totalOnline = status?.players.online || 0;
  const botsCount = totalOnline - realPlayersCount;
  
  const humanPlayers = status?.players.list || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="w-6 h-6 border-4 border-green-600 border-t-transparent rounded-full animate-spin dark:border-[#38e07b]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="inline-flex items-center gap-2 px-6 py-3 text-sm border border-red-300 rounded-full bg-red-50 dark:bg-red-900/20 dark:border-red-700">
        <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span className="text-red-600 dark:text-red-400">No se pudo obtener el estado del servidor</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full px-2">
      {/* Pill grande con toda la información */}
      <div className="inline-flex flex-col lg:flex-row lg:flex-wrap items-center gap-2 lg:gap-3 px-4 lg:px-6 py-3 text-xs sm:text-sm lg:text-base border border-gray-200 rounded-2xl lg:rounded-full shadow-lg bg-white/90 backdrop-blur-sm dark:bg-[#1b3124]/90 dark:border-[#366348] w-full lg:w-auto max-w-full">
        
        {/* Primera fila en móvil: Estado + IP */}
        <div className="flex flex-wrap items-center justify-center w-full gap-2 lg:w-auto lg:gap-3">
          {/* Estado Online/Offline */}
          <div className="flex items-center gap-1.5 lg:gap-2">
            <div className={`w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full ${status?.online ? 'bg-green-500 animate-pulse shadow-lg shadow-green-500/50' : 'bg-red-500'}`}></div>
            <span className={`font-semibold ${status?.online ? 'text-green-600 dark:text-[#38e07b]' : 'text-red-600 dark:text-red-400'}`}>
              {status?.online ? 'Online' : 'Offline'}
            </span>
          </div>
          
          {/* Separador - oculto en móvil */}
          <div className="hidden w-px h-5 lg:block bg-gray-300 dark:bg-[#366348]"></div>
          
          {/* IP del Servidor */}
          <div className="flex items-center gap-1.5 lg:gap-2">
            <svg className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-gray-600 dark:text-[#96c5a9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"></path>
            </svg>
            <span className="font-semibold text-gray-900 dark:text-white">{serverIP}</span>
            <button
              onClick={() => navigator.clipboard.writeText(serverIP)}
              className="p-1 transition-colors rounded hover:bg-gray-100 dark:hover:bg-[#264532]"
              title="Copiar IP"
            >
              <svg className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-green-600 dark:text-[#38e07b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
            </button>
          </div>
        </div>
        
        {/* Separador horizontal en móvil */}
        <div className="w-full h-px lg:hidden bg-gray-300 dark:bg-[#366348]"></div>
        
        {/* Separador vertical en desktop */}
        <div className="hidden w-px h-5 lg:block bg-gray-300 dark:bg-[#366348]"></div>
        
        {/* Segunda fila en móvil: Jugadores + Whitelist */}
        <div className="flex flex-wrap items-center justify-center w-full gap-2 lg:w-auto lg:gap-3">
          {/* Jugadores Online */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 lg:gap-2">
            <svg className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-gray-600 dark:text-[#96c5a9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
            <span className="text-gray-700 dark:text-[#96c5a9]">
              <strong className="text-gray-900 dark:text-white">{totalOnline}</strong> online
            </span>
            {botsCount > 0 && (
              <>
                <svg className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path>
                </svg>
                <span className="text-blue-600 dark:text-blue-400">
                  <strong>{botsCount}</strong> bot{botsCount !== 1 ? 's' : ''}
                </span>
              </>
            )}
          </div>
          
          {/* Separador */}
          <div className="hidden w-px h-5 lg:block bg-gray-300 dark:bg-[#366348]"></div>
          
          {/* Whitelist */}
          <div className="flex items-center gap-1.5 lg:gap-2">
            <svg className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-gray-600 dark:text-[#96c5a9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
            <span className={`font-medium ${status?.whitelist ? 'text-green-600 dark:text-[#38e07b]' : 'text-gray-600'}`}>
              Whitelist
            </span>
          </div>
        </div>
        
      </div>
      
      {/* Lista de jugadores debajo del pill (si hay) */}
      {status?.online && humanPlayers.length > 0 && (
        <div className="flex justify-center w-full mt-3 lg:mt-4">
          <div className="inline-flex flex-wrap items-center justify-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-2 text-xs border border-gray-200 rounded-xl lg:rounded-full shadow-md bg-white/80 backdrop-blur-sm dark:bg-[#1b3124]/80 dark:border-[#366348] max-w-full sm:max-w-2xl lg:max-w-3xl">
            {humanPlayers.map((player, index) => (
              <a
                key={index}
                href={`/miembros/${player}`}
                className="inline-flex items-center gap-1 lg:gap-1.5 font-medium text-green-700 transition-colors dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:underline"
                title={`Ver perfil de ${player}`}
              >
                <img
                  src={`https://minotar.net/avatar/${player}/20`}
                  alt={player}
                  className="w-4 h-4 rounded lg:w-5 lg:h-5"
                  loading="lazy"
                />
                <span className="text-xs sm:text-sm">{player}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
