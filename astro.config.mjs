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
         // Incluir la página índice de miembros pero excluir páginas individuales
         if (page === '/miembros/' || page === '/miembros') {
           return true;
         }
         // Excluir rutas de miembros específicos ya que son dinámicas
         if (page.includes('/miembros/')) {
           return false;
         }
         return true;
       },
       serialize: (item) => {
         const url = item.url;
         
         // Página principal
         if (url === '/' || url === '') {
           return {
             ...item,
             priority: 1.0,
             changefreq: 'weekly'
           };
         }
         
         // Página de miembros (índice)
         if (url === '/miembros/' || url === '/miembros') {
           return {
             ...item,
             priority: 0.8,
             changefreq: 'daily'
           };
         }
         
         // Otras páginas
         return {
           ...item,
           priority: 0.6,
           changefreq: 'monthly'
         };
       }
     })
   ]
});