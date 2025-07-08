# 🎮 Cubusfera - Sitio Web del Servidor de Minecraft

![Cubusfera Logo](./public/logo.svg)

Sitio web oficial del servidor de Minecraft **Cubusfera**, construido con Astro, React y Tailwind CSS. Una plataforma moderna y responsiva para la comunidad de jugadores.

## 🌟 Características

- **🎨 Diseño Moderno**: Interfaz limpia y atractiva con modo oscuro/claro
- **📱 Totalmente Responsivo**: Optimizado para todos los dispositivos
- **⚡ Alto Rendimiento**: Construido con Astro para máxima velocidad
- **🔍 SEO Optimizado**: Meta tags completas y Open Graph para redes sociales
- **🗺️ Mapa Interactivo**: Visualización en tiempo real del mundo del servidor
- **👥 Lista de Miembros**: Directorio de la comunidad de jugadores
- **📋 Sistema de Reglas**: Normativas claras y accesibles
- **🎯 Componentes Reutilizables**: Arquitectura modular y mantenible

## 🛠️ Tecnologías Utilizadas

- **[Astro](https://astro.build/)** - Framework web moderno
- **[React](https://reactjs.org/)** - Componentes interactivos
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework de CSS utilitario
- **[TypeScript](https://www.typescriptlang.org/)** - Tipado estático
- **[Lucide React](https://lucide.dev/)** - Iconos modernos
- **[Canvas Confetti](https://github.com/catdad/canvas-confetti)** - Efectos visuales

## 📁 Estructura del Proyecto

```
cubusfera/
├── public/                 # Archivos estáticos
│   ├── favicon.svg
│   ├── logo.svg
│   ├── logo-dark.svg
│   └── og-image.png       # Imagen para redes sociales
├── src/
│   ├── components/        # Componentes reutilizables
│   │   ├── Button.astro
│   │   ├── FAQ.astro
│   │   ├── Footer.astro
│   │   └── Navbar.tsx
│   ├── layouts/           # Layouts de página
│   │   └── main.astro
│   ├── lib/              # Utilidades y helpers
│   │   ├── statsMapper.ts
│   │   └── utils.ts
│   ├── pages/            # Páginas del sitio
│   │   ├── index.astro   # Página de inicio
│   │   ├── mapa.astro    # Mapa interactivo
│   │   ├── normas.astro  # Reglas del servidor
│   │   └── miembros/     # Directorio de miembros
│   │       ├── index.astro
│   │       └── [member].astro
│   └── styles/
│       └── global.css    # Estilos globales
├── astro.config.mjs      # Configuración de Astro
├── tailwind.config.js    # Configuración de Tailwind
└── package.json
```

## 🚀 Instalación y Desarrollo

### Prerrequisitos

- Node.js 18+ 
- pnpm (recomendado) o npm

### Configuración

1. **Clona el repositorio**
   ```bash
   git clone <repository-url>
   cd cubusfera
   ```

2. **Instala las dependencias**
   ```bash
   pnpm install
   ```

3. **Configura las variables de entorno**
   ```bash
   cp .env.example .env
   ```
   
   Edita el archivo `.env` con tus configuraciones:
   ```env
   WHITELIST_API_URL=http://localhost:8080/whitelist
   ```

4. **Inicia el servidor de desarrollo**
   ```bash
   pnpm dev
   ```

   El sitio estará disponible en `http://localhost:4321`

## 📜 Scripts Disponibles

```bash
# Desarrollo
pnpm dev          # Inicia el servidor de desarrollo

# Construcción
pnpm build        # Construye el sitio para producción
pnpm preview      # Previsualiza la construcción local

# Utilidades
pnpm astro        # Comandos de Astro CLI
```

## 🎯 Páginas Principales

### 🏠 Inicio (`/`)
- Presentación del servidor
- Estadísticas en tiempo real
- Sección de características
- FAQ (Preguntas Frecuentes)

### 👥 Miembros (`/miembros`)
- Lista de jugadores de la whitelist
- Perfiles individuales de miembros
- Integración con API del servidor

### 🗺️ Mapa (`/mapa`)
- Mapa interactivo del mundo
- Visualización en tiempo real
- Enlace a pantalla completa

### 📋 Reglas (`/normas`)
- Normativas del servidor
- Políticas de convivencia
- Información de moderación

## 🔧 Configuración de APIs

El sitio se integra con APIs del servidor de Minecraft:

- **Whitelist API**: Para obtener la lista de miembros
- **Mapa Dinámico**: Integración con sistema de mapas en tiempo real

## 🎨 Personalización

### Temas
El sitio incluye soporte para modo oscuro/claro automático basado en:
- Preferencias del sistema
- Configuración guardada del usuario

### Colores
Los colores se definen en `tailwind.config.js` y pueden personalizarse fácilmente.

## 📱 Características Responsivas

- **Mobile First**: Diseño optimizado para móviles
- **Breakpoints**: Adaptación fluida a diferentes tamaños
- **Touch Friendly**: Interfaz táctil optimizada

## 🔍 SEO y Redes Sociales

- Meta tags optimizadas para cada página
- Open Graph para Facebook/LinkedIn
- Twitter Cards para mejor compartición
- Sitemap automático
- Robots.txt configurado

## 🚀 Despliegue

### Construcción para Producción

```bash
pnpm build
```

Los archivos se generarán en la carpeta `dist/`.

### Opciones de Hosting

- **Vercel** (recomendado)
- **Netlify**
- **GitHub Pages**
- **Servidor propio**

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -m 'Agrega nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Contacto

- **Servidor**: Cubusfera
- **Sitio Web**: [cubusfera.com](https://cubusfera.com)
- **Mapa**: [mapa.cubusfera.com](https://mapa.cubusfera.com)

---

**¡Únete a la aventura en Cubusfera!** 🎮✨
