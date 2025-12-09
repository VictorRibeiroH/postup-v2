"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        scrolled ? "w-[95%]" : "w-[90%]"
      } max-w-7xl`}
    >
      <div
        className={`backdrop-blur-xl bg-white/70 border border-gray-200/50 rounded-2xl shadow-lg px-6 py-4 transition-all duration-300 ${
          scrolled ? "shadow-xl" : ""
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gray-900">
              Post<span className="text-[#FF6400]">Up</span>
            </span>
          </Link>

          {/* Menu Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="#funcionalidades"
              className="text-gray-700 hover:text-[#FF6400] transition-colors font-medium"
            >
              Funcionalidades
            </Link>
            <Link
              href="#planos"
              className="text-gray-700 hover:text-[#FF6400] transition-colors font-medium"
            >
              Planos
            </Link>
            <Link
              href="#contato"
              className="text-gray-700 hover:text-[#FF6400] transition-colors font-medium"
            >
              Fale Conosco
            </Link>
          </div>

          {/* CTA Button */}
          <Button
            className="bg-[#FF6400] hover:bg-[#e55a00] text-white font-semibold px-6 rounded-xl shadow-md hover:shadow-lg transition-all"
            asChild
          >
            <Link href="/login">Acessar Plataforma</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
