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
        { name: 'Proyectos', href: '/proyectos', disabled: true },
      ]
    },
    {
      name: 'Jugadores',
      children: [
        { name: 'Miembros', href: '/miembros' },
        { name: 'Top', href: '/top' },
      ]
    },
    { name: 'Blog', href: '/blog', disabled: true },
  ];

  const handleMobileDropdownToggle = (itemName: string) => {
    setOpenMobileDropdown(openMobileDropdown === itemName ? null : itemName);
  };

  const handleNavigation = (href: string | undefined, disabled: boolean | undefined) => {
    if (disabled || !href) return;
    
    setIsOpen(false);
    setOpenMobileDropdown(null);
    window.location.href = href;
  };

  const renderDesktopNavItem = (item: NavItem) => {
    if (item.children) {
      return (
        <div key={item.name} className="relative group">
          <button
            className="flex items-center space-x-1 text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 hover:bg-accent"
            type="button"
          >
            <span>{item.name}</span>
            <ChevronDown className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
          </button>
          
          {/* Dropdown que aparece en hover */}
          <div className="absolute left-0 mt-1 bg-background border border-border rounded-md shadow-lg min-w-[160px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            {item.children.map((child) => (
              <button
                key={child.name}
                onClick={() => handleNavigation(child.href, child.disabled)}
                disabled={child.disabled}
                className={cn(
                  "w-full text-left block px-4 py-2 text-sm transition-colors duration-200 first:rounded-t-md last:rounded-b-md",
                  child.disabled 
                    ? "text-muted-foreground/50 cursor-not-allowed" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer"
                )}
                type="button"
              >
                {child.name}
                {child.disabled && (
                  <span className="ml-2 text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
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
          "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200",
          item.disabled 
            ? "text-muted-foreground/50 cursor-not-allowed" 
            : "text-muted-foreground hover:text-foreground hover:bg-accent"
        )}
        type="button"
      >
        {item.name}
        {item.disabled && (
          <span className="ml-2 text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
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
            className="w-full flex items-center justify-between text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 hover:bg-accent"
            type="button"
          >
            <span>{item.name}</span>
            <ChevronDown className={cn(
              "h-4 w-4 transition-transform duration-200",
              openMobileDropdown === item.name && "rotate-180"
            )} />
          </button>
          
          {openMobileDropdown === item.name && (
            <div className="ml-4 mt-1 space-y-1">
              {item.children.map((child) => (
                <button
                  key={child.name}
                  onClick={() => handleNavigation(child.href, child.disabled)}
                  disabled={child.disabled}
                  className={cn(
                    "w-full text-left block px-4 py-2 text-sm transition-colors duration-200 rounded-md",
                    child.disabled 
                      ? "text-muted-foreground/50 cursor-not-allowed" 
                      : "text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer"
                  )}
                  type="button"
                >
                  {child.name}
                  {child.disabled && (
                    <span className="ml-2 text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
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
            ? "text-muted-foreground/50 cursor-not-allowed" 
            : "text-muted-foreground hover:text-foreground hover:bg-accent"
        )}
        type="button"
      >
        {item.name}
        {item.disabled && (
          <span className="ml-2 text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
            Próximamente
          </span>
        )}
      </button>
    );
  };

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" className="flex items-center space-x-2 text-xl font-bold text-foreground hover:text-primary transition-colors">
              <img 
                src="/logo-dark.svg" 
                alt="Cubusfera Logo" 
                className="h-8 w-8 dark:hidden block" 
              />
              <img 
                src="/logo.svg" 
                alt="Cubusfera Logo" 
                className="h-8 w-8 hidden dark:block" 
              />
              <span>Cubusfera</span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => renderDesktopNavItem(item))}
            </div>
          </div>

          {/* Theme Toggle and Mobile Menu Button */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-200"
              aria-label="Toggle theme"
              type="button"
            >
              {isDark ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-200"
                aria-label="Toggle menu"
                type="button"
              >
                {isOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
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
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background border-t border-border">
          {navItems.map((item) => renderMobileNavItem(item))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;