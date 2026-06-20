"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

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
      transition: { 
        duration: 0.3, 
        ease: "easeInOut",
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.3, ease: "easeInOut" }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } }
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full py-4 px-6 md:px-12 flex items-center justify-between z-50 bg-white border-b-2 border-sketch-black border-dashed">
        {/* Left: Logo */}
        <div className="flex items-center gap-2 flex-1">
          <Link href="/" className="w-10 h-10 bg-blueprint-blue text-white flex items-center justify-center font-sketch text-2xl rough-border-blue transform -rotate-3 hover:rotate-0 transition-transform cursor-pointer">
            DA
          </Link>
        </div>
        
        {/* Middle: Links */}
        <nav className="hidden md:flex flex-1 justify-center gap-8 font-mono text-sm uppercase tracking-widest text-sketch-black font-bold">
          <Link href="/" className="hover:text-blueprint-blue transition-colors relative group">
            Home
            <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-blueprint-blue origin-left scale-x-0 transition-transform group-hover:scale-x-100 rough-border"></span>
          </Link>
          <Link href="/#features" className="hover:text-blueprint-blue transition-colors relative group">
            Features
            <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-blueprint-blue origin-left scale-x-0 transition-transform group-hover:scale-x-100 rough-border"></span>
          </Link>
          <Link href="/#about" className="hover:text-blueprint-blue transition-colors relative group">
            About
            <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-blueprint-blue origin-left scale-x-0 transition-transform group-hover:scale-x-100 rough-border"></span>
          </Link>
          <Link href="/#how-it-works" className="hover:text-blueprint-blue transition-colors relative group">
            How It Works
            <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-blueprint-blue origin-left scale-x-0 transition-transform group-hover:scale-x-100 rough-border"></span>
          </Link>
          <Link href="/#faqs" className="hover:text-blueprint-blue transition-colors relative group">
            FAQs
            <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-blueprint-blue origin-left scale-x-0 transition-transform group-hover:scale-x-100 rough-border"></span>
          </Link>
        </nav>

        {/* Right: Auth Buttons */}
        <div className="hidden md:flex flex-1 justify-end items-center gap-4">
          {user ? (
            <>
              <Link href="/dashboard" className="px-4 py-2 font-mono font-bold text-sketch-black hover:bg-gray-100 transition-colors">
                Dashboard
              </Link>
              <button onClick={() => logout()} className="px-6 py-2 bg-blueprint-blue text-white font-mono font-bold rough-border-blue hover:-translate-y-1 transition-transform shadow-[2px_2px_0px_#171717]">
                Logout
              </button>
            </>
          ) : (
            <Link href="/auth" className="px-6 py-2 bg-blueprint-blue text-white font-mono font-bold rough-border-blue hover:-translate-y-1 transition-transform shadow-[2px_2px_0px_#171717]">
              Get Started
            </Link>
          )}
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
              <motion.div variants={itemVariants}>
                <Link href="/" onClick={closeMobileMenu} className="hover:text-blueprint-blue w-fit border-b-2 border-transparent hover:border-blueprint-blue pb-1 flex items-center gap-4">
                  <span className="text-blueprint-blue/40 text-sm">01</span> Home
                </Link>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Link href="/#features" onClick={closeMobileMenu} className="hover:text-blueprint-blue w-fit border-b-2 border-transparent hover:border-blueprint-blue pb-1 flex items-center gap-4">
                  <span className="text-blueprint-blue/40 text-sm">02</span> Features
                </Link>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Link href="/#about" onClick={closeMobileMenu} className="hover:text-blueprint-blue w-fit border-b-2 border-transparent hover:border-blueprint-blue pb-1 flex items-center gap-4">
                  <span className="text-blueprint-blue/40 text-sm">03</span> About
                </Link>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Link href="/#how-it-works" onClick={closeMobileMenu} className="hover:text-blueprint-blue w-fit border-b-2 border-transparent hover:border-blueprint-blue pb-1 flex items-center gap-4">
                  <span className="text-blueprint-blue/40 text-sm">04</span> How It Works
                </Link>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Link href="/#faqs" onClick={closeMobileMenu} className="hover:text-blueprint-blue w-fit border-b-2 border-transparent hover:border-blueprint-blue pb-1 flex items-center gap-4">
                  <span className="text-blueprint-blue/40 text-sm">05</span> FAQs
                </Link>
              </motion.div>

              <motion.div variants={itemVariants} className="mt-12 flex flex-col gap-6">
                <Link href="/auth" onClick={closeMobileMenu} className="w-full text-center py-4 bg-blueprint-blue text-white font-bold shadow-[6px_6px_0px_#171717] hover:-translate-y-1 transition-transform">
                 Get Started
                </Link>
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
