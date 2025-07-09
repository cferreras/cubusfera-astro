// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.cubusfera.com', // Cambia esto por tu dominio real
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
    host: '0.0.0.0'
  },
  output: 'server', // Mantener como 'server'
  adapter: node({
    mode: 'standalone'
  }),
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [
     react(), 
sitemap({
       filter: (page) => {
         // Excluir solo las páginas dinámicas de miembros individuales
         // pero incluir la página índice /miembros/
         if (page.match(/\/miembros\/[^/]+$/)) {
           return false;
         }
         return true;
       },
       serialize: (item) => {
         const url = item.url;
         
         // Página principal - máxima prioridad
         if (url === '/' || url === '') {
           return {
             ...item,
             priority: 1.0,
             changefreq: 'daily'
           };
         }
         
         // Página de miembros - alta prioridad por contenido dinámico
         if (url.endsWith('/miembros/') || url.endsWith('/miembros')) {
           return {
             ...item,
             priority: 0.9,
             changefreq: 'daily'
           };
         }
         
         // Página del mapa - prioridad media-alta
         if (url.endsWith('/mapa/') || url.endsWith('/mapa')) {
           return {
             ...item,
             priority: 0.7,
             changefreq: 'weekly'
           };
         }
         
         // Otras páginas (normas, etc.) - prioridad media
         return {
           ...item,
           priority: 0.5,
           changefreq: 'monthly'
         };
       }
     })
   ]
});