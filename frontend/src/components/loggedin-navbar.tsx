"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { usePathname } from "next/navigation";
import { User, LogOut, LayoutDashboard, BarChart2, Menu, X, TrendingUp } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function LoggedInNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

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
    { name: "Progress", path: "/progress", icon: <TrendingUp size={18} /> },
    { name: "Stats", path: "/stats", icon: <BarChart2 size={18} /> },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 w-full py-4 px-6 md:px-12 flex items-center justify-between z-50 bg-white border-b-2 border-sketch-black border-dashed">
        {/* Left: Logo */}
        <div className="flex items-center gap-2 flex-1">
          <Link href="/dashboard" className="w-10 h-10 bg-blueprint-blue text-white flex items-center justify-center font-sketch text-2xl rough-border-blue transform -rotate-3 hover:rotate-0 transition-transform cursor-pointer">
            DA
          </Link>
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
              <div className="w-6 h-6 rounded-full bg-blueprint-blue flex items-center justify-center overflow-hidden">
                 <img src={user?.avatar || "https://cdn-icons-png.flaticon.com/512/5951/5951752.png"} alt="Avatar" className="w-full h-full object-cover" />
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
                  <span className="text-blueprint-blue/40 text-sm">03</span> 
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
