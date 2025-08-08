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
            className="flex items-center space-x-1 text-white hover:text-[#38e07b] text-sm font-medium transition-colors duration-200"
            type="button"
          >
            <span>{item.name}</span>
            <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" />
          </button>
          
          {/* Dropdown que aparece en hover */}
          <div className="absolute left-0 mt-1 bg-[#1b3124] border border-[#366348] rounded-md shadow-lg min-w-[160px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            {item.children.map((child) => (
              <button
                key={child.name}
                onClick={() => handleNavigation(child.href, child.disabled)}
                disabled={child.disabled}
                className={cn(
                  "w-full text-left block px-4 py-2 text-sm transition-colors duration-200 first:rounded-t-md last:rounded-b-md",
                  child.disabled 
                    ? "text-[#96c5a9]/50 cursor-not-allowed" 
                    : "text-white hover:text-[#38e07b] hover:bg-[#264532] cursor-pointer"
                )}
                type="button"
              >
                {child.name}
                {child.disabled && (
                  <span className="ml-2 text-xs bg-[#264532] text-[#96c5a9] px-1.5 py-0.5 rounded">
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
            ? "text-[#96c5a9]/50 cursor-not-allowed" 
            : "text-white hover:text-[#38e07b]"
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
            className="w-full flex items-center justify-between text-white hover:text-[#38e07b] px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 hover:bg-[#264532]"
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
                      ? "text-[#96c5a9]/50 cursor-not-allowed" 
                      : "text-white hover:text-[#38e07b] hover:bg-[#264532] cursor-pointer"
                  )}
                  type="button"
                >
                  {child.name}
                  {child.disabled && (
                    <span className="ml-2 text-xs bg-[#264532] text-[#96c5a9] px-1.5 py-0.5 rounded">
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
            ? "text-[#96c5a9]/50 cursor-not-allowed" 
            : "text-white hover:text-[#38e07b] hover:bg-[#264532]"
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
    <nav className="bg-[#122118] border-b border-[#264532] sticky top-0 z-50">
      <div className="px-10 py-3 mx-auto max-w-7xl">
        <div className="flex items-center justify-between h-auto">
          {/* Logo */}
          <div className="flex items-center gap-4 text-white">
            <div className="w-4 h-4">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">Cubusfera</h2>
          </div>

          <div className="flex justify-end flex-1 gap-8">
            {/* Desktop Navigation */}
            <div className="items-center hidden md:flex gap-9">
              {navItems.map((item) => renderDesktopNavItem(item))}
            </div>

            {/* Action Buttons */}
            <div className="hidden gap-2 md:flex">
              <button
                onClick={() => handleNavigation('https://discord.gg/7uKEYACErc', false)}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#38e07b] text-[#122118] text-sm font-bold leading-normal tracking-[0.015em]"
                type="button"
              >
                <span className="truncate">Únete a Discord</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-md text-white hover:text-[#38e07b] hover:bg-[#264532] transition-colors duration-200"
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
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-[#122118] border-t border-[#264532]">
          {navItems.map((item) => renderMobileNavItem(item))}
          
          {/* Mobile Action Buttons */}
          <div className="pt-4 space-y-2">
            <button
              onClick={() => handleNavigation('https://discord.gg/7uKEYACErc', false)}
              className="w-full flex items-center justify-center rounded-lg h-10 px-4 bg-[#38e07b] text-[#122118] text-sm font-bold"
              type="button"
            >
              Join Discord
            </button>
            <button
              onClick={() => handleNavigation('/miembros', false)}
              className="w-full flex items-center justify-center rounded-lg h-10 px-4 bg-[#264532] text-white text-sm font-bold"
              type="button"
            >
              Members
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;