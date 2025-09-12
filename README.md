# Cubusfera

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/cferreras/cubusfera-astro)
[![Build Status](https://img.shields.io/github/actions/workflow/status/cferreras/cubusfera-astro/build.yml?style=flat-square&label=Build)](https://github.com/cferreras/cubusfera-astro/actions)
[![Node version](https://img.shields.io/badge/Node.js->=18-3c873a?style=flat-square)](https://nodejs.org)
[![Astro](https://img.shields.io/badge/Astro-5.x-ff7000?style=flat-square&logo=astro)](https://astro.build)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

<div align="center">
  <img src="./public/logo.svg" alt="Cubusfera Logo" width="128" height="128">
</div>

Official website for **Cubusfera**, a technical Minecraft server focused on redstone, automated farms, and game optimization. Built with modern web technologies for optimal performance and user experience.

## Overview

Cubusfera is a Spanish-speaking Minecraft technical server where players collaborate on complex redstone contraptions, automated farms, and game mechanics optimization. This website serves as the community hub, featuring player profiles, project showcases, server rules, and an interactive map.

The site is built with **Astro** for maximum performance, **React** for interactive components, and **Tailwind CSS** for modern styling. It includes server integration for real-time player data, a newsletter system, and comprehensive project documentation.

## Features

- **High Performance**: Built with Astro's static site generation for lightning-fast loading
- **Server Integration**: Real-time player data and whitelist management via REST API
- **Interactive Map**: Live server world visualization with Dynmap integration
- **Player Profiles**: Individual member pages with stats and achievements
- **Project Showcase**: Detailed documentation of community builds and farms
- **Newsletter System**: Email subscription powered by Resend API
- **Responsive Design**: Mobile-first approach with dark/light theme support
- **SEO Optimized**: Complete meta tags, Open Graph, and sitemap generation

## Tech Stack

- **[Astro](https://astro.build/)** - Modern web framework with server-side rendering
- **[React](https://reactjs.org/)** - Interactive UI components
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Resend](https://resend.com/)** - Transactional email service
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library

## Getting Started

### Prerequisites

- Node.js 18 or later
- pnpm (recommended) or npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/cferreras/cubusfera-astro.git
   cd cubusfera-astro
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Configure your `.env` file:
   ```env
   # Minecraft Server API
   WHITELIST_API_URL=http://localhost:8080/whitelist
   
   # Newsletter (Resend)
   RESEND_API_KEY=your_resend_api_key_here
   RESEND_AUDIENCE_ID=your_audience_id_here
   ```

4. **Start development server**
   ```bash
   pnpm dev
   ```

The site will be available at `http://localhost:4321`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.astro
│   ├── FAQ.astro
│   ├── Footer.astro
│   ├── Navbar.tsx
│   ├── PlayerProfile.astro
│   └── TopsSection.astro
├── content/            # Content collections
│   ├── config.ts
│   └── proyectos/      # Project documentation
├── layouts/            # Page layouts
│   └── main.astro
├── lib/               # Utilities and helpers
│   ├── statsMapper.ts
│   └── utils.ts
├── pages/             # Site pages
│   ├── index.astro    # Homepage
│   ├── explorador.astro
│   ├── mapa.astro
│   ├── normas.astro
│   ├── proyectos.astro
│   ├── api/           # API routes
│   │   └── subscribe.ts
│   ├── miembros/      # Member pages
│   └── proyectos/     # Project pages
└── styles/
    └── global.css
```

## Scripts

```bash
# Development
pnpm dev            # Start dev server
pnpm build          # Build for production
pnpm preview        # Preview production build

# Utilities
pnpm astro          # Run Astro CLI commands
```

## Key Pages

### Homepage (`/`)
- Server overview and community highlights
- Newsletter subscription form
- Featured projects and statistics
- Frequently asked questions

### Members (`/miembros`)
- Complete player directory from server whitelist
- Individual player profiles with statistics
- Dynamic content from Minecraft server API

### Projects (`/proyectos`)
- Showcase of community builds and farms
- Detailed documentation with coordinates
- Video tutorials and build instructions
- Interactive map locations

### Explorer (`/explorador`)
- Real-time server statistics
- Top players leaderboards
- Dynamic data visualization

### Map (`/mapa`)
- Live world map integration
- Full-screen viewing option
- Real-time player positions

## Configuration

### Newsletter Setup

The newsletter system uses Resend for email delivery. For detailed setup instructions, see [`NEWSLETTER_SETUP.md`](./NEWSLETTER_SETUP.md).

Key features:
- Email validation and error handling
- Duplicate subscription prevention
- Responsive subscription form
- Admin dashboard integration

### Server Integration

The site integrates with the Minecraft server through REST APIs:

- **Whitelist API**: Fetches player list and statistics
- **Map Integration**: Connects to Dynmap for live world view
- **Real-time Data**: Updates player information dynamically

### Content Management

Projects are managed through Astro's content collections:

```typescript
// src/content/config.ts
export const collections = {
  proyectos: defineCollection({
    type: 'content',
    schema: z.object({
      titulo: z.string(),
      descripcion: z.string(),
      imagen: z.string(),
      constructores: z.array(z.object({
        nombre: z.string()
      })),
      // ... more fields
    })
  })
};
```

## Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Configure environment variables** in the Vercel dashboard
3. **Deploy** automatically on push to main branch

### Manual Deployment

```bash
# Build the project
pnpm build

# Deploy the dist/ folder to your hosting provider
```

## Performance

The site is optimized for performance with:

- **Static Generation**: Most pages are pre-rendered at build time
- **Image Optimization**: Automatic WebP conversion and responsive images
- **Code Splitting**: JavaScript is loaded only when needed
- **CSS Optimization**: Unused styles are purged automatically

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Community

- **Server**: Cubusfera Minecraft Server
- **Website**: [cubusfera.com](https://cubusfera.com)
- **Map**: [mapa.cubusfera.com](https://mapa.cubusfera.com)

## Troubleshooting

### Common Issues

**Newsletter not working**
- Verify `RESEND_API_KEY` and `RESEND_AUDIENCE_ID` are set correctly
- Check the [Newsletter Setup Guide](./NEWSLETTER_SETUP.md)

**Player data not loading**
- Ensure `WHITELIST_API_URL` points to your Minecraft server API
- Verify the server API is accessible and returns valid JSON

**Build failures**
- Clear node_modules and reinstall dependencies
- Check Node.js version compatibility (requires 18+)

For more detailed troubleshooting, please check our [issues](https://github.com/cferreras/cubusfera-astro/issues) or create a new one.
