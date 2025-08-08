import React, { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  href?: string;
  disabled?: boolean;
  children?: NavItem[];
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(null);

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const navItems: NavItem[] = [
    { name: 'Inicio', href: '/' },
    {
      name: 'Servidor',
      children: [
        { name: 'Mapa', href: '/mapa' },
        { name: 'Normas', href: '/normas' },
        { name: 'Proyectos', href: '/proyectos' },
      ]
    },
    {
      name: 'Jugadores',
      children: [
        { name: 'Miembros', href: '/miembros' },
        { name: 'Explorador', href: '/explorador' },
      ]
    }
  ];

  const handleMobileDropdownToggle = (itemName: string) => {
    setOpenMobileDropdown(openMobileDropdown === itemName ? null : itemName);
  };

  const handleNavigation = (href: string | undefined, disabled: boolean | undefined) => {
    if (disabled || !href) return;
    
    setIsOpen(false);
    setOpenMobileDropdown(null);
    
    // Si es un enlace externo (Discord), abrir en nueva pestaña
    if (href.startsWith('http')) {
      window.open(href, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = href;
    }
  };

  const renderDesktopNavItem = (item: NavItem) => {
    if (item.children) {
      return (
        <div key={item.name} className="relative group">
          <button
            className="flex items-center space-x-1 text-gray-700 dark:text-white hover:text-green-600 dark:hover:text-[#38e07b] text-sm font-medium transition-colors duration-200"
            type="button"
          >
            <span>{item.name}</span>
            <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" />
          </button>
          
          {/* Dropdown que aparece en hover */}
          <div className="absolute left-0 mt-1 bg-white dark:bg-[#1b3124] border border-gray-200 dark:border-[#366348] rounded-md shadow-lg min-w-[160px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            {item.children.map((child) => (
              <button
                key={child.name}
                onClick={() => handleNavigation(child.href, child.disabled)}
                disabled={child.disabled}
                className={cn(
                  "w-full text-left block px-4 py-2 text-sm transition-colors duration-200 first:rounded-t-md last:rounded-b-md",
                  child.disabled 
                    ? "text-gray-400 dark:text-[#96c5a9]/50 cursor-not-allowed" 
                    : "text-gray-700 dark:text-white hover:text-green-600 dark:hover:text-[#38e07b] hover:bg-gray-100 dark:hover:bg-[#264532] cursor-pointer"
                )}
                type="button"
              >
                {child.name}
                {child.disabled && (
                              <span className="ml-2 text-xs bg-gray-200 dark:bg-[#264532] text-gray-600 dark:text-[#96c5a9] px-1.5 py-0.5 rounded">
              Próximamente
            </span>
                )}
              </button>
            ))}
          </div>
        </div>
      );
    }

    return (
      <button
        key={item.name}
        onClick={() => handleNavigation(item.href, item.disabled)}
        disabled={item.disabled}
        className={cn(
          "text-sm font-medium transition-colors duration-200",
          item.disabled 
            ? "text-gray-400 dark:text-[#96c5a9]/50 cursor-not-allowed" 
            : "text-gray-700 dark:text-white hover:text-green-600 dark:hover:text-[#38e07b]"
        )}
        type="button"
      >
        {item.name}
        {item.disabled && (
          <span className="ml-2 text-xs bg-[#264532] text-[#96c5a9] px-1.5 py-0.5 rounded">
            Próximamente
          </span>
        )}
      </button>
    );
  };

  const renderMobileNavItem = (item: NavItem) => {
    if (item.children) {
      return (
        <div key={item.name}>
          <button
            onClick={() => handleMobileDropdownToggle(item.name)}
            className="w-full flex items-center justify-between text-gray-700 dark:text-white hover:text-green-600 dark:hover:text-[#38e07b] px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-[#264532]"
            type="button"
          >
            <span>{item.name}</span>
            <ChevronDown className={cn(
              "h-4 w-4 transition-transform duration-200",
              openMobileDropdown === item.name && "rotate-180"
            )} />
          </button>
          
          {openMobileDropdown === item.name && (
            <div className="mt-1 ml-4 space-y-1">
              {item.children.map((child) => (
                <button
                  key={child.name}
                  onClick={() => handleNavigation(child.href, child.disabled)}
                  disabled={child.disabled}
                  className={cn(
                    "w-full text-left block px-4 py-2 text-sm transition-colors duration-200 rounded-md",
                    child.disabled 
                      ? "text-gray-400 dark:text-[#96c5a9]/50 cursor-not-allowed" 
                      : "text-gray-700 dark:text-white hover:text-green-600 dark:hover:text-[#38e07b] hover:bg-gray-100 dark:hover:bg-[#264532] cursor-pointer"
                  )}
                  type="button"
                >
                  {child.name}
                  {child.disabled && (
                    <span className="ml-2 text-xs bg-gray-200 dark:bg-[#264532] text-gray-600 dark:text-[#96c5a9] px-1.5 py-0.5 rounded">
                      Próximamente
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        key={item.name}
        onClick={() => handleNavigation(item.href, item.disabled)}
        disabled={item.disabled}
        className={cn(
          "w-full text-left block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200",
          item.disabled 
            ? "text-gray-400 dark:text-[#96c5a9]/50 cursor-not-allowed" 
            : "text-gray-700 dark:text-white hover:text-green-600 dark:hover:text-[#38e07b] hover:bg-gray-100 dark:hover:bg-[#264532]"
        )}
        type="button"
      >
        {item.name}
        {item.disabled && (
          <span className="ml-2 text-xs bg-[#264532] text-[#96c5a9] px-1.5 py-0.5 rounded">
            Próximamente
          </span>
        )}
      </button>
    );
  };

  return (
    <nav className="bg-gray-50 dark:bg-[#122118] border-b border-gray-200 dark:border-[#264532] sticky top-0 z-50">
      <div className="px-10 py-3 mx-auto max-w-7xl">
        <div className="flex items-center justify-between h-auto">
          {/* Logo */}
          <div className="flex items-center gap-4 text-gray-800 dark:text-white">
            <div className="w-8 h-8">
              {isDark ? (
                <svg xmlns="http://www.w3.org/2000/svg" style={{isolation: "isolate"}} viewBox="0 0 680 680" className="w-full h-full">
                  <g fill="#ffffff">
                    <path fillRule="evenodd"
                      d="M16.5 340C16.5 161.455 161.455 16.5 340 16.5S663.5 161.455 663.5 340 518.545 663.5 340 663.5 16.5 518.545 16.5 340Zm32 0c-.01-19.73 1.98-39.42 5.93-58.75 3.84-18.73 9.52-37.03 16.97-54.64a292.329 292.329 0 0 1 62.52-92.69 292.329 292.329 0 0 1 92.69-62.52 289.397 289.397 0 0 1 54.64-16.97A292.83 292.83 0 0 1 340 48.5a292.83 292.83 0 0 1 58.75 5.93c18.73 3.84 37.03 9.52 54.64 16.97a292.329 292.329 0 0 1 92.69 62.52 292.329 292.329 0 0 1 62.52 92.69 289.397 289.397 0 0 1 16.97 54.64A292.83 292.83 0 0 1 631.5 340a292.83 292.83 0 0 1-5.93 58.75 289.397 289.397 0 0 1-16.97 54.64 292.329 292.329 0 0 1-62.52 92.69 292.329 292.329 0 0 1-92.69 62.52 289.397 289.397 0 0 1-54.64 16.97A292.83 292.83 0 0 1 340 631.5a292.83 292.83 0 0 1-58.75-5.93 289.397 289.397 0 0 1-54.64-16.97 292.329 292.329 0 0 1-92.69-62.52 292.329 292.329 0 0 1-62.52-92.69 289.397 289.397 0 0 1-16.97-54.64A292.83 292.83 0 0 1 48.5 340Z" />
                    <path fillRule="evenodd"
                      d="M317.54 539.5 248 499.35l-69.54-40.15c-1.6-.93-3.13-1.99-4.56-3.16-1.49-1.22-2.9-2.54-4.22-3.95a52.116 52.116 0 0 1-7.11-9.65 51.887 51.887 0 0 1-4.8-10.99c-.56-1.84-1-3.72-1.31-5.63-.3-1.82-.45-3.67-.46-5.52V259.7c0-7.88 2.08-15.63 6.02-22.46 3.94-6.83 9.61-12.5 16.44-16.44L248 180.65l69.54-40.15c1.61-.92 3.28-1.71 5.02-2.36 1.8-.69 3.65-1.25 5.53-1.68 3.9-.9 7.9-1.35 11.91-1.34 4.01-.01 8.01.44 11.91 1.34 1.88.43 3.73.99 5.53 1.68 1.74.65 3.41 1.44 5.02 2.36L432 180.65l69.54 40.15c1.6.93 3.13 1.99 4.56 3.16 1.49 1.22 2.9 2.54 4.22 3.95 2.73 2.93 5.12 6.17 7.11 9.65 2.02 3.47 3.63 7.15 4.8 10.99.56 1.84 1 3.72 1.31 5.63.3 1.82.45 3.67.46 5.52v160.6c0 7.88-2.08 15.63-6.02 22.46a44.852 44.852 0 0 1-16.44 16.44L432 499.35l-69.54 40.15c-1.61.92-3.28 1.71-5.02 2.36-1.8.69-3.65 1.25-5.53 1.68-3.9.9-7.9 1.35-11.91 1.34-4.01.01-8.01-.44-11.91-1.34-1.88-.43-3.73-.99-5.53-1.68-1.74-.65-3.41-1.44-5.02-2.36Zm13.14-22.87-69.49-40.12-69.5-40.13c-.38-.22-.74-.47-1.08-.75-.59-.48-1.14-1-1.65-1.55a25.463 25.463 0 0 1-3.55-4.83 26.082 26.082 0 0 1-2.41-5.49c-.22-.72-.39-1.45-.51-2.19a8.55 8.55 0 0 1-.11-1.34V259.7c0-3.25.86-6.45 2.49-9.28 1.62-2.81 3.96-5.15 6.77-6.77 0 0 .01 0 .01-.01l69.54-40.15 69.49-40.12c.39-.22.79-.41 1.22-.56.68-.26 1.37-.48 2.09-.64 1.92-.45 3.89-.67 5.86-.67h.3c1.97 0 3.94.22 5.86.67.72.16 1.41.38 2.09.64.43.15.83.34 1.22.56l69.49 40.12 69.5 40.13c.38.22.74.47 1.08.75.59.48 1.14 1 1.65 1.55 1.37 1.46 2.56 3.09 3.55 4.83 1.01 1.73 1.82 3.57 2.41 5.49.22.72.39 1.45.51 2.19.07.44.11.89.11 1.34V420.3c0 3.25-.86 6.45-2.49 9.28a18.472 18.472 0 0 1-6.77 6.77s-.01 0-.01.01l-69.54 40.15-69.49 40.12c-.39.22-.79.41-1.22.56-.68.26-1.37.48-2.09.64-1.92.45-3.89.67-5.86.67h-.3c-1.97 0-3.94-.22-5.86-.67-.72-.16-1.41-.38-2.09-.64-.43-.15-.83-.34-1.22-.56Z" />
                    <path fillRule="evenodd"
                      d="M523 268.044a45.212 45.212 0 0 0-2.387-.558c.875-3.251 1.357-6.495 1.357-9.589v-6.482c-2.824-11.87-11.132-24.092-20.93-29.749l-5.45-3.146v39.38c0 6.26-3.35 12.06-8.77 15.19l-69.54 40.15-38.793 22.397-17.507-10.107c-.34-.2-.65-.42-.96-.67-.54-.45-1.06-.93-1.54-1.44a25.164 25.164 0 0 1-3.42-4.66c-.98-1.67-1.76-3.45-2.32-5.3-.21-.67-.37-1.36-.48-2.05-.07-.39-.1-.77-.1-1.16V149.71c0-4.07 1.416-7.945 3.911-11.008-11.061-3.867-25.413-3.389-35.649 1.445a26.888 26.888 0 0 1 2.458 3.583c.98 1.67 1.76 3.44 2.32 5.29.21.68.37 1.36.48 2.06.06.38.1.77.1 1.16v160.54c0 6.26-3.35 12.06-8.77 15.19l-15.418 8.902-40.932-23.632-69.49-40.12c-.34-.2-.66-.42-.96-.67-.54-.44-1.06-.93-1.54-1.44a25.164 25.164 0 0 1-3.42-4.66c-.98-1.67-1.76-3.45-2.33-5.29-.2-.68-.36-1.37-.47-2.06-.07-.38-.1-.77-.1-1.16v-38.131l-3.39 1.957c-12.12 6.998-21.96 24.041-21.96 38.036v6.471a45.456 45.456 0 0 0 1.387 4.663c-.467.122-.929.251-1.387.387v29.255l5.4-3.118c.34-.19.69-.36 1.05-.49.66-.25 1.34-.46 2.02-.62 1.89-.43 3.82-.64 5.75-.63 1.93-.01 3.86.2 5.75.63.68.16 1.36.37 2.02.62.36.13.71.3 1.05.49l69.49 40.12 32.854 18.969 18.973 11.016.054-.031 17.659 10.196c5.42 3.13 8.77 8.93 8.77 15.19v149.635c8.446 2.07 18.162 1.884 26.38-.558V390.41c0-.39.04-.78.1-1.16.11-.7.27-1.39.48-2.06.56-1.85 1.34-3.62 2.32-5.29.96-1.68 2.11-3.25 3.42-4.66.48-.52 1-1 1.55-1.44.3-.25.62-.47.95-.67l69.49-40.12 69.49-40.12c.34-.19.69-.36 1.05-.49.66-.25 1.34-.46 2.02-.62 1.89-.43 3.82-.65 5.75-.63 1.93-.02 3.86.2 5.75.63.68.16 1.36.37 2.02.62.36.13.71.3 1.05.49l3.34 1.928v-28.774Zm-2.138 164.423c-11.291 2.762-24.843 1.482-34.042-3.828l-69.54-40.149-19.082-11.018 26.346-15.243 5.926 3.421 69.49 40.12c.34.19.69.35 1.05.49.66.25 1.34.45 2.02.61 1.89.44 3.82.65 5.75.64 1.93.01 3.86-.2 5.75-.64.68-.16 1.36-.36 2.02-.61.36-.14.71-.3 1.05-.49l5.4-3.118v17.646c0 3.913-.769 8.065-2.138 12.169ZM157 406.312l3.34 1.928c.34.19.69.36 1.05.49.66.25 1.34.46 2.02.62 1.89.43 3.82.64 5.75.63 1.93.01 3.86-.2 5.75-.63.68-.16 1.36-.37 2.02-.62.36-.13.71-.3 1.05-.49l69.49-40.12 8.405-4.853 26.349 15.245-21.565 12.451-69.54 40.148c-8.334 4.812-20.241 6.315-30.802 4.496-2.103-5.1-3.317-10.393-3.317-15.309v-13.986Zm195.112-55.447-4.322 2.495c-.34.19-.69.35-1.05.49-.66.25-1.34.46-2.02.62-1.89.43-3.82.64-5.75.63-1.93.01-3.86-.2-5.75-.63-.68-.16-1.36-.37-2.02-.62-.36-.14-.71-.3-1.05-.49l-2.181-1.259 2.23-1.287c3.564-2.058 6.932-4.986 9.905-8.454 2.38 2.389 4.953 4.431 7.636 5.981l4.372 2.524Z" />
                  </g>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" style={{isolation: "isolate"}} viewBox="0 0 680 680" className="w-full h-full">
                  <g fill="#000000">
                    <path fillRule="evenodd"
                      d="M16.5 340C16.5 161.455 161.455 16.5 340 16.5S663.5 161.455 663.5 340 518.545 663.5 340 663.5 16.5 518.545 16.5 340Zm32 0c-.01-19.73 1.98-39.42 5.93-58.75 3.84-18.73 9.52-37.03 16.97-54.64a292.329 292.329 0 0 1 62.52-92.69 292.329 292.329 0 0 1 92.69-62.52 289.397 289.397 0 0 1 54.64-16.97A292.83 292.83 0 0 1 340 48.5a292.83 292.83 0 0 1 58.75 5.93c18.73 3.84 37.03 9.52 54.64 16.97a292.329 292.329 0 0 1 92.69 62.52 292.329 292.329 0 0 1 62.52 92.69 289.397 289.397 0 0 1 16.97 54.64A292.83 292.83 0 0 1 631.5 340a292.83 292.83 0 0 1-5.93 58.75 289.397 289.397 0 0 1-16.97 54.64 292.329 292.329 0 0 1-62.52 92.69 292.329 292.329 0 0 1-92.69 62.52 289.397 289.397 0 0 1-54.64 16.97A292.83 292.83 0 0 1 340 631.5a292.83 292.83 0 0 1-58.75-5.93 289.397 289.397 0 0 1-54.64-16.97 292.329 292.329 0 0 1-92.69-62.52 292.329 292.329 0 0 1-62.52-92.69 289.397 289.397 0 0 1-16.97-54.64A292.83 292.83 0 0 1 48.5 340Z" />
                    <path fillRule="evenodd"
                      d="M317.54 539.5 248 499.35l-69.54-40.15c-1.6-.93-3.13-1.99-4.56-3.16-1.49-1.22-2.9-2.54-4.22-3.95a52.116 52.116 0 0 1-7.11-9.65 51.887 51.887 0 0 1-4.8-10.99c-.56-1.84-1-3.72-1.31-5.63-.3-1.82-.45-3.67-.46-5.52V259.7c0-7.88 2.08-15.63 6.02-22.46 3.94-6.83 9.61-12.5 16.44-16.44L248 180.65l69.54-40.15c1.61-.92 3.28-1.71 5.02-2.36 1.8-.69 3.65-1.25 5.53-1.68 3.9-.9 7.9-1.35 11.91-1.34 4.01-.01 8.01.44 11.91 1.34 1.88.43 3.73.99 5.53 1.68 1.74.65 3.41 1.44 5.02 2.36L432 180.65l69.54 40.15c1.6.93 3.13 1.99 4.56 3.16 1.49 1.22 2.9 2.54 4.22 3.95 2.73 2.93 5.12 6.17 7.11 9.65 2.02 3.47 3.63 7.15 4.8 10.99.56 1.84 1 3.72 1.31 5.63.3 1.82.45 3.67.46 5.52v160.6c0 7.88-2.08 15.63-6.02 22.46a44.852 44.852 0 0 1-16.44 16.44L432 499.35l-69.54 40.15c-1.61.92-3.28 1.71-5.02 2.36-1.8.69-3.65 1.25-5.53 1.68-3.9.9-7.9 1.35-11.91 1.34-4.01.01-8.01-.44-11.91-1.34-1.88-.43-3.73-.99-5.53-1.68-1.74-.65-3.41-1.44-5.02-2.36Zm13.14-22.87-69.49-40.12-69.5-40.13c-.38-.22-.74-.47-1.08-.75-.59-.48-1.14-1-1.65-1.55a25.463 25.463 0 0 1-3.55-4.83 26.082 26.082 0 0 1-2.41-5.49c-.22-.72-.39-1.45-.51-2.19a8.55 8.55 0 0 1-.11-1.34V259.7c0-3.25.86-6.45 2.49-9.28 1.62-2.81 3.96-5.15 6.77-6.77 0 0 .01 0 .01-.01l69.54-40.15 69.49-40.12c.39-.22.79-.41 1.22-.56.68-.26 1.37-.48 2.09-.64 1.92-.45 3.89-.67 5.86-.67h.3c1.97 0 3.94.22 5.86.67.72.16 1.41.38 2.09.64.43.15.83.34 1.22.56l69.49 40.12 69.5 40.13c.38.22.74.47 1.08.75.59.48 1.14 1 1.65 1.55 1.37 1.46 2.56 3.09 3.55 4.83 1.01 1.73 1.82 3.57 2.41 5.49.22.72.39 1.45.51 2.19.07.44.11.89.11 1.34V420.3c0 3.25-.86 6.45-2.49 9.28a18.472 18.472 0 0 1-6.77 6.77s-.01 0-.01.01l-69.54 40.15-69.49 40.12c-.39.22-.79.41-1.22.56-.68.26-1.37.48-2.09.64-1.92.45-3.89.67-5.86.67h-.3c-1.97 0-3.94-.22-5.86-.67-.72-.16-1.41-.38-2.09-.64-.43-.15-.83-.34-1.22-.56Z" />
                    <path fillRule="evenodd"
                      d="M523 268.044a45.212 45.212 0 0 0-2.387-.558c.875-3.251 1.357-6.495 1.357-9.589v-6.482c-2.824-11.87-11.132-24.092-20.93-29.749l-5.45-3.146v39.38c0 6.26-3.35 12.06-8.77 15.19l-69.54 40.15-38.793 22.397-17.507-10.107c-.34-.2-.65-.42-.96-.67-.54-.45-1.06-.93-1.54-1.44a25.164 25.164 0 0 1-3.42-4.66c-.98-1.67-1.76-3.45-2.32-5.3-.21-.67-.37-1.36-.48-2.05-.07-.39-.1-.77-.1-1.16V149.71c0-4.07 1.416-7.945 3.911-11.008-11.061-3.867-25.413-3.389-35.649 1.445a26.888 26.888 0 0 1 2.458 3.583c.98 1.67 1.76 3.44 2.32 5.29.21.68.37 1.36.48 2.06.06.38.1.77.1 1.16v160.54c0 6.26-3.35 12.06-8.77 15.19l-15.418 8.902-40.932-23.632-69.49-40.12c-.34-.2-.66-.42-.96-.67-.54-.44-1.06-.93-1.54-1.44a25.164 25.164 0 0 1-3.42-4.66c-.98-1.67-1.76-3.45-2.33-5.29-.2-.68-.36-1.37-.47-2.06-.07-.38-.1-.77-.1-1.16v-38.131l-3.39 1.957c-12.12 6.998-21.96 24.041-21.96 38.036v6.471a45.456 45.456 0 0 0 1.387 4.663c-.467.122-.929.251-1.387.387v29.255l5.4-3.118c.34-.19.69-.36 1.05-.49.66-.25 1.34-.46 2.02-.62 1.89-.43 3.82-.64 5.75-.63 1.93-.01 3.86.2 5.75.63.68.16 1.36.37 2.02.62.36.13.71.3 1.05.49l69.49 40.12 32.854 18.969 18.973 11.016.054-.031 17.659 10.196c5.42 3.13 8.77 8.93 8.77 15.19v149.635c8.446 2.07 18.162 1.884 26.38-.558V390.41c0-.39.04-.78.1-1.16.11-.7.27-1.39.48-2.06.56-1.85 1.34-3.62 2.32-5.29.96-1.68 2.11-3.25 3.42-4.66.48-.52 1-1 1.55-1.44.3-.25.62-.47.95-.67l69.49-40.12 69.49-40.12c.34-.19.69-.36 1.05-.49.66-.25 1.34-.46 2.02-.62 1.89-.43 3.82-.65 5.75-.63 1.93-.02 3.86.2 5.75.63.68.16 1.36.37 2.02.62.36.13.71.3 1.05.49l3.34 1.928v-28.774Zm-2.138 164.423c-11.291 2.762-24.843 1.482-34.042-3.828l-69.54-40.149-19.082-11.018 26.346-15.243 5.926 3.421 69.49 40.12c.34.19.69.35 1.05.49.66.25 1.34.45 2.02.61 1.89.44 3.82.65 5.75.64 1.93.01 3.86-.2 5.75-.64.68-.16 1.36-.36 2.02-.61.36-.14.71-.3 1.05-.49l5.4-3.118v17.646c0 3.913-.769 8.065-2.138 12.169ZM157 406.312l3.34 1.928c.34.19.69.36 1.05.49.66.25 1.34.46 2.02.62 1.89.43 3.82.64 5.75.63 1.93.01 3.86-.2 5.75-.63.68-.16 1.36-.37 2.02-.62.36-.13.71-.3 1.05-.49l69.49-40.12 8.405-4.853 26.349 15.245-21.565 12.451-69.54 40.148c-8.334 4.812-20.241 6.315-30.802 4.496-2.103-5.1-3.317-10.393-3.317-15.309v-13.986Zm195.112-55.447-4.322 2.495c-.34.19-.69.35-1.05.49-.66.25-1.34.46-2.02.62-1.89.43-3.82.64-5.75.63-1.93.01-3.86-.2-5.75-.63-.68-.16-1.36-.37-2.02-.62-.36-.14-.71-.3-1.05-.49l-2.181-1.259 2.23-1.287c3.564-2.058 6.932-4.986 9.905-8.454 2.38 2.389 4.953 4.431 7.636 5.981l4.372 2.524Z" />
                  </g>
                </svg>
              )}
            </div>
            <h2 className="text-gray-800 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">Cubusfera</h2>
          </div>

          <div className="flex justify-end flex-1 gap-8">
            {/* Desktop Navigation */}
            <div className="items-center hidden md:flex gap-9">
              {navItems.map((item) => renderDesktopNavItem(item))}
            </div>

            {/* Action Buttons */}
            <div className="hidden gap-2 md:flex">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-200 dark:bg-[#264532] hover:bg-gray-300 dark:hover:bg-[#366348] text-gray-700 dark:text-white transition-colors duration-200"
                aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                type="button"
              >
                {isDark ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
              
              <button
                onClick={() => handleNavigation('https://discord.gg/7uKEYACErc', false)}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-green-600 dark:bg-[#38e07b] text-white dark:text-[#122118] text-sm font-bold leading-normal tracking-[0.015em]"
                type="button"
              >
                <span className="truncate">Únete a Discord</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-md text-gray-700 dark:text-white hover:text-green-600 dark:hover:text-[#38e07b] hover:bg-gray-100 dark:hover:bg-[#264532] transition-colors duration-200"
                aria-label="Toggle menu"
                type="button"
              >
                {isOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={cn(
        "md:hidden transition-all duration-300 ease-in-out overflow-hidden",
        isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 dark:bg-[#122118] border-t border-gray-200 dark:border-[#264532]">
          {navItems.map((item) => renderMobileNavItem(item))}
          
          {/* Mobile Action Buttons */}
          <div className="pt-4 space-y-2">
            {/* Mobile Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-gray-200 dark:bg-[#264532] hover:bg-gray-300 dark:hover:bg-[#366348] text-gray-700 dark:text-white text-sm font-medium transition-colors duration-200"
              type="button"
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4" />
                  <span>Modo Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4" />
                  <span>Modo Oscuro</span>
                </>
              )}
            </button>
            
            <button
              onClick={() => handleNavigation('https://discord.gg/7uKEYACErc', false)}
              className="w-full flex items-center justify-center rounded-lg h-10 px-4 bg-green-600 dark:bg-[#38e07b] text-white dark:text-[#122118] text-sm font-bold"
              type="button"
            >
              Join Discord
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;