"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Search,
  BarChart2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

// Glowing animation styling
const glowStyles = `
  @keyframes pulse-glow {
    0%, 100% { 
      box-shadow: 
        0 0 1px #2B6CB0,
        0 0 5px #2B6CB0,
        0 0 10px #2B6CB0,
        0 0 15px #2B6CB0,
        inset 0 0 10px rgba(43, 108, 176, 0.2);
    }
    50% { 
      box-shadow: 
        0 0 0px #2B6CB0,
        0 0 5px #2B6CB0,
        0 0 5px #2B6CB0,
        0 0 50px #3B82F6,
        inset 0 0 15px rgba(43, 108, 176, 0.3);
    }
  }
  .glow-button {
    animation: pulse-glow 2s infinite;
  }
`;

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isStreamPage = pathname === "/";
  const isAnalyticsPage = pathname === "/analytics";

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
    }
  };

  const handleGoLive = () => {
    window.open("https://adroitsdvc.in", "_blank");
  };

  // ✅ Analytics Button — works for ALL screen sizes, never hidden
  const AnalyticsButton = ({ mobile = false, compact = false }: { mobile?: boolean, compact?: boolean }) => {
      // Determine the specific size and layout classes
      let sizeClasses = "px-4 py-2 text-base"; // Desktop default
      if (mobile) {
          // Full width and center alignment for mobile menu
          sizeClasses = "px-4 py-2 text-sm w-full justify-center";
      } else if (compact) {
          // Compact for tablet/smaller screens on the main bar
          sizeClasses = "px-2 py-1.5 text-xs md:text-sm";
      }

      // Icon and text sizes for compactness
      const iconClasses = compact ? "w-4 h-4" : "w-5 h-5";
      const textClasses = compact ? "text-xs md:text-sm" : "text-base";

      const content = (
          <>
              <BarChart2 className={iconClasses} />
              <span className={textClasses}>See The Miasma Memory</span>
          </>
      );

      // Classes shared by both active and disabled states
      const baseClasses = "flex items-center gap-2 border-2 border-[#2B6CB0] font-semibold whitespace-nowrap transition-all";

      if (isAnalyticsPage) {
          return (
              <span
                  className={`${baseClasses} ${sizeClasses} text-white cursor-not-allowed opacity-50 bg-[#2B6CB0]/10`}
                  title="Already on Analytics"
              >
                  {content}
              </span>
          );
      }

      return (
          <Link
              href="/analytics"
              className={`${baseClasses} ${sizeClasses} text-white glow-button hover:bg-[#DC2626]/20 hover:border-[#DC2626] hover:shadow-[0_0_20px_rgba(220,38,38,0.4)]`}
              title="View Analytics"
          >
              {content}
          </Link>
      );
  };

  return (
    <>
      <style>{glowStyles}</style>
      <nav className="fixed top-0 left-0 w-full bg-[#1a202c2d] backdrop-blur-md border-b border-[#4A5568]/30 z-50 shadow-lg">
        <div className="mx-auto px-4 sm:px-6 py-3">
          
          {/* Main Grid Container: Retained for Desktop (lg) view */}
          <div className="grid grid-cols-10 gap-2 items-center">
            
            {/* 1. Left Column (col-span-6) */}
            <div className="col-span-6 flex items-center justify-between">
              
              {/* Left: Logo + Name */}
              <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
                <Image
                  src="/logo_nav.png"
                  height={32} 
                  width={32}
                  className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-[#2B6CB0]" // Responsive logo size
                  alt="The Miasma Filter Logo"
                />
                <span className="text-base sm:text-lg lg:text-xl font-bold text-[#FFFFFF] whitespace-nowrap hidden sm:inline">
                  The Miasma Filter
                </span>
              </Link>
              
              {/* Center Text: Powered by... */}
              <h4 className="mt-2.5 text-[10px] sm:text-xs lg:text-sm text-[#9CA3AF] whitespace-nowrap ml-2 hidden md:block lg:ml-4">
                Powered by: Google Cloud Vertex AI
              </h4>
            </div>

            {/* 2. Right Column (col-span-4) - Analytics button ALWAYS visible */}
            <div className="col-span-4 flex items-center justify-end lg:justify-between space-x-2 sm:space-x-3">
              
              {/* ✅ Analytics Button: ALWAYS VISIBLE - Responsive sizing only */}
              <div className="flex flex-1 lg:flex-1 justify-center">
                {/* Mobile/Tablet: Compact version */}
                <div className="block lg:hidden">
                  <AnalyticsButton compact={true} />
                </div>
                {/* Desktop: Full version */}
                <div className="hidden lg:block">
                  <AnalyticsButton compact={false} />
                </div>
              </div>
              
              {/* Go Live Button */}
              <button
                onClick={handleGoLive}
                className="px-2 py-1 rounded-sm bg-[#dc26261c] text-white font-medium text-xs sm:text-sm transition-all hover:bg-[#B91C1C] hover:shadow-lg hover:shadow-[#DC2626]/30 whitespace-nowrap"
              >
                Help
              </button>

              {/* Avatar Dropdown */}
              <div className="relative flex-shrink-0" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 bg-[#2D3748] border border-[#4A5568] rounded-full flex items-center justify-center cursor-pointer hover:border-[#9CA3AF] focus:ring-2 focus:ring-[#2B6CB0] transition"
                >
                  <User className="h-3 w-3 sm:h-4 sm:w-4 text-[#E2E8F0]" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-[#1A202C] border border-[#4A5568] rounded-lg shadow-lg py-2 animate-fadeIn z-50">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-[#9CA3AF] hover:bg-[#2D3748] hover:text-[#E2E8F0] text-sm transition"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center px-4 py-2 text-[#9CA3AF] hover:bg-[#2D3748] hover:text-[#E2E8F0] text-sm transition"
                    >
                      <Settings className="h-4 w-4 mr-2" /> Settings
                    </Link>
                    <button className="flex items-center w-full px-4 py-2 text-[#9CA3AF] hover:bg-[#2D3748] hover:text-[#E2E8F0] text-sm transition">
                      <LogOut className="h-4 w-4 mr-2" /> Logout
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              {!isStreamPage && (
                <button
                  className="lg:hidden text-[#9CA3AF] hover:text-[#E2E8F0] transition flex-shrink-0"
                  onClick={() => setMobileOpen(!mobileOpen)}
                >
                  {mobileOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown - Analytics button already visible in main nav, so only other items here */}
        {!isStreamPage && mobileOpen && (
          <div className="lg:hidden bg-[#1A202C]/95 border-t border-[#4A5568]/30 px-4 py-4 space-y-4 animate-slideDown relative z-40">
            
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search news, topics, streams..."
                  className="w-full pl-10 pr-4 py-2 bg-[#2D3748] border border-[#4A5568] rounded-lg text-sm text-[#E2E8F0] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2B6CB0] focus:border-transparent transition-all"
                />
              </div>
            </form>

            {/* Mobile Go Live/Help Button */}
            <button
              onClick={handleGoLive}
              className="w-full px-4 py-2 rounded-lg bg-[#DC2626] text-white font-medium text-sm transition-all hover:bg-[#B91C1C]"
            >
              Help
            </button>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
