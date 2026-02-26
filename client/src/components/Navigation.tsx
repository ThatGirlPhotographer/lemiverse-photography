import { 
  Navbar, 
  NavbarBrand, 
  NavbarContent, 
  NavbarItem, 
  NavbarMenuToggle, 
  NavbarMenu, 
  NavbarMenuItem, 
  Link as HeroLink
} from "@heroui/react";
import { useState } from "react";
import { useLocation, Link } from "react-router-dom"; // Use Link from react-router-dom

export default function Navigation({ siteTitle, user }: { siteTitle: string, user: any }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Gallery", href: "/gallery" },
    { name: "Services", href: "/services" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <Navbar 
      onMenuOpenChange={setIsMenuOpen} 
      isBordered={false} 
      position="fixed"
      disableBlur={true}
      classNames={{
        // We use !bg-transparent to ensure HeroUI's default glass effect doesn't show
        base: "fixed top-0 !bg-transparent border-none shadow-none z-[100]",
        // Added a slightly deeper gradient to ensure text visibility on all photos
        wrapper: "px-8 py-6 h-auto max-w-full justify-between !bg-gradient-to-b !from-black/90 !via-black/50 !to-transparent", 
      }}
    >
      <NavbarContent>
        <NavbarBrand>
          {/* as={Link} allows HeroUI styling with React Router functionality */}
          <HeroLink 
            as={Link}
            to="/" 
            className="text-white font-bold text-[1.4rem] tracking-tight uppercase"
          >
            {siteTitle}
          </HeroLink>
        </NavbarBrand>
      </NavbarContent>

      {/* Desktop Links */}
      <NavbarContent className="hidden sm:flex gap-10" justify="end">
        {menuItems.map((item) => (
          <NavbarItem key={item.href} isActive={location.pathname === item.href}>
            <HeroLink 
              as={Link}
              to={item.href} 
              className={`text-[0.9rem] tracking-[2px] uppercase transition-opacity duration-300 ${
                location.pathname === item.href ? "text-white font-black" : "text-white/60 hover:text-white"
              }`}
            >
              {item.name}
            </HeroLink>
          </NavbarItem>
        ))}
        {user && (
          <NavbarItem>
            <HeroLink as={Link} to="/admin/dashboard" className="text-[#00ffcc] font-bold uppercase text-[0.9rem] tracking-[2px]">
              Dashboard
            </HeroLink>
          </NavbarItem>
        )}
      </NavbarContent>

      {/* Mobile Toggle */}
      <NavbarContent className="sm:hidden" justify="end">
        <NavbarMenuToggle 
          aria-label={isMenuOpen ? "Close menu" : "Open menu"} 
          className="text-white"
        />
      </NavbarContent>

      {/* Mobile Sidebar */}
      <NavbarMenu className="bg-[#050505] pt-10 border-none">
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item.name}-${index}`}>
            <HeroLink 
              as={Link}
              className="w-full text-white text-[1.5rem] py-6 uppercase text-center block font-light tracking-[4px]" 
              to={item.href}
              onClick={() => setIsMenuOpen(false)} // Close menu on click
            >
              {item.name}
            </HeroLink>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  );
}