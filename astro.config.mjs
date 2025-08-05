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
         // Normalizar URL para sitemap - el servidor maneja las redirecciones
         const url = item.url;
         
         // Página principal - máxima prioridad
         if (url.endsWith('/') && (url === 'https://www.cubusfera.com/' || url.match(/\/$/) && !url.includes('/', url.indexOf('/', 8) + 1))) {
           return {
             ...item,
             priority: 1.0,
             changefreq: 'daily'
           };
         }
         
         // Página de miembros - alta prioridad por contenido dinámico
         if (url.includes('/miembros') && !url.match(/\/miembros\/[^/]+/)) {
           return {
             ...item,
             priority: 0.9,
             changefreq: 'daily'
           };
         }
         
         // Página de proyectos - alta prioridad
         if (url.includes('/proyectos') && !url.match(/\/proyectos\/[^/]+/)) {
           return {
             ...item,
             priority: 0.8,
             changefreq: 'weekly'
           };
         }
         
         // Páginas de proyectos individuales - prioridad media-alta
         if (url.match(/\/proyectos\/[^/]+/)) {
           return {
             ...item,
             priority: 0.7,
             changefreq: 'monthly'
           };
         }
         
         // Página del explorador - prioridad media-alta
         if (url.includes('/explorador')) {
           return {
             ...item,
             priority: 0.7,
             changefreq: 'daily'
           };
         }
         
         // Página del mapa - prioridad media-alta
         if (url.includes('/mapa')) {
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