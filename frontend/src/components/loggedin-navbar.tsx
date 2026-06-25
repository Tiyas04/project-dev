"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { User, LogOut, LayoutDashboard, BarChart2, Menu, X, TrendingUp, Zap, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function LoggedInNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsMobileMenuOpen(false);
    }
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const menuVariants: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: "easeInOut", when: "beforeChildren", staggerChildren: 0.1 }
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeInOut" } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } }
  };

  const navLinks = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "Stats", path: "/stats", icon: <BarChart2 size={18} /> },
    { name: "Analysis", path: "/analysis", icon: <Zap size={18} /> },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 w-full py-4 px-6 md:px-12 flex items-center justify-between z-50 bg-white border-b-2 border-sketch-black border-dashed">
        {/* Left: Logo */}
        <div className="flex items-center gap-2 flex-1">
          <Link href="/dashboard" className="w-10 h-10 bg-blueprint-blue text-white flex items-center justify-center font-sketch text-2xl rough-border-blue transform -rotate-3 hover:rotate-0 transition-transform cursor-pointer">
            DA
          </Link>
          
          {/* Search bar in logged-in navbar */}
          <form onSubmit={handleSearchSubmit} className="hidden sm:flex items-center border-2 border-sketch-black bg-white px-2 py-1 select-none relative max-w-[180px] md:max-w-[220px] w-full ml-4 shadow-[2px_2px_0px_#171717]">
            <input
              type="text"
              placeholder="Search username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full font-mono text-xs focus:outline-none bg-transparent text-sketch-black"
            />
            <button type="submit" className="text-sketch-black hover:text-blueprint-blue transition-colors cursor-pointer">
              <Search size={14} />
            </button>
          </form>
        </div>
        
        {/* Middle: Links */}
        <nav className="hidden md:flex flex-1 justify-center gap-8 font-mono text-sm uppercase tracking-widest text-sketch-black font-bold">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link 
                key={link.name} 
                href={link.path} 
                className={`hover:text-blueprint-blue transition-colors relative group flex items-center gap-2 ${isActive ? "text-blueprint-blue" : ""}`}
              >
                {link.icon}
                {link.name}
                <span className={`absolute -bottom-1 left-0 w-full h-[2px] bg-blueprint-blue origin-left transition-transform rough-border ${isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}></span>
              </Link>
            )
          })}
        </nav>

        {/* Right: Auth Buttons */}
        <div className="hidden md:flex flex-1 justify-end items-center gap-4 relative">
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-paper text-sketch-black font-mono font-bold rough-border hover:-translate-y-1 transition-transform shadow-[2px_2px_0px_#171717]"
            >
              <div className="w-6 h-6 rounded-full bg-blueprint-blue flex items-center justify-center overflow-hidden shrink-0">
                 {user?.avatar && user.avatar !== "https://cdn-icons-png.flaticon.com/512/5951/5951752.png" ? (
                  <img 
                    src={user.avatar.replace("http://", "https://")} 
                    alt="Avatar" 
                    className="w-full h-full object-cover" 
                    crossOrigin="anonymous"
                  />
                 ) : (
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-white">
                     <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                     <circle cx="12" cy="7" r="4" />
                   </svg>
                 )}
              </div>
              <span>Profile</span>
            </button>
            
            {/* Dropdown */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-full mt-4 w-48 bg-white border-2 border-sketch-black border-dashed p-2 flex flex-col gap-2 z-50"
                >
                  <Link 
                    href="/profile" 
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 font-mono text-sm font-bold text-sketch-black hover:bg-blueprint-blue hover:text-white transition-colors"
                  >
                    <User size={16} />
                    My Profile
                  </Link>
                  <button 
                    onClick={() => {
                      setIsDropdownOpen(false);
                      logout();
                    }}
                    className="flex items-center gap-3 px-4 py-2 font-mono text-sm font-bold text-red-600 hover:bg-red-50 transition-colors text-left"
                  >
                    <LogOut size={16} />
                    Log Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile menu button (Animated Hamburger) */}
        <button 
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-[6px] z-50 focus:outline-none" 
          onClick={toggleMobileMenu}
          aria-label="Toggle Menu"
        >
          <span className={`block w-7 h-[3px] bg-sketch-black rounded-sm transition-transform duration-300 ease-in-out origin-center ${isMobileMenuOpen ? 'rotate-45 translate-y-[9px]' : ''}`}></span>
          <span className={`block w-7 h-[3px] bg-sketch-black rounded-sm transition-opacity duration-300 ease-in-out ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
          <span className={`block w-7 h-[3px] bg-sketch-black rounded-sm transition-transform duration-300 ease-in-out origin-center ${isMobileMenuOpen ? '-rotate-45 translate-y-[-9px]' : ''}`}></span>
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 top-[74px] z-40 bg-white border-t-2 border-dashed border-sketch-black flex flex-col md:hidden overflow-y-auto"
          >
            <nav className="flex flex-col p-8 gap-8 font-mono text-xl uppercase tracking-widest text-sketch-black font-bold h-full">
              {/* Mobile Search Bar */}
              <form onSubmit={handleSearchSubmit} className="flex items-center border-2 border-sketch-black bg-white px-3 py-2 select-none relative w-full mb-2 shadow-[4px_4px_0px_#171717]">
                <input
                  type="text"
                  placeholder="Search username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full font-mono text-sm focus:outline-none bg-transparent text-sketch-black"
                />
                <button type="submit" className="text-sketch-black hover:text-blueprint-blue transition-colors cursor-pointer">
                  <Search size={18} />
                </button>
              </form>

              {navLinks.map((link, index) => (
                <motion.div key={link.name} variants={itemVariants}>
                  <Link 
                    href={link.path} 
                    onClick={closeMobileMenu} 
                    className={`w-fit border-b-2 pb-1 flex items-center gap-4 ${pathname === link.path ? "text-blueprint-blue border-blueprint-blue" : "hover:text-blueprint-blue border-transparent hover:border-blueprint-blue"}`}
                  >
                    <span className="text-blueprint-blue/40 text-sm">0{index + 1}</span> 
                    {link.icon}
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              
              <motion.div variants={itemVariants}>
                <Link 
                  href="/profile" 
                  onClick={closeMobileMenu} 
                  className={`w-fit border-b-2 pb-1 flex items-center gap-4 ${pathname === "/profile" ? "text-blueprint-blue border-blueprint-blue" : "hover:text-blueprint-blue border-transparent hover:border-blueprint-blue"}`}
                >
                  <span className="text-blueprint-blue/40 text-sm">05</span> 
                  <User size={24} />
                  Profile
                </Link>
              </motion.div>

              <motion.div variants={itemVariants} className="mt-12 flex flex-col gap-6">
                <button 
                  onClick={() => {
                    closeMobileMenu();
                    logout();
                  }} 
                  className="w-full flex items-center justify-center gap-3 py-4 bg-red-100 text-red-600 font-bold shadow-[6px_6px_0px_#171717] hover:-translate-y-1 transition-transform border-2 border-red-200 border-dashed"
                >
                 <LogOut size={20} />
                 Log Out
                </button>
              </motion.div>
            </nav>
            
            {/* Decorative element for mobile menu */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 0.5 }}
              className="absolute bottom-10 right-10 text-[100px] font-sketch text-blueprint-blue/5 pointer-events-none select-none -rotate-12"
            >
              DA
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
