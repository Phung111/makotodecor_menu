import React from 'react';
import { Sun, Moon, MessageCircle } from 'lucide-react';

const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" {...props}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

export default function Header({ theme, onToggleTheme }) {
  const zaloPhone = import.meta.env.VITE_ZALO_PHONE || '0900000000';
  const facebookLink = import.meta.env.VITE_FACEBOOK_LINK || 'https://m.me/makotodecor';

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md border-b transition-colors duration-300 bg-white/80 dark:bg-[#121218]/80 border-gray-200/80 dark:border-gray-800/80 shadow-sm dark:shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo Image */}
        <a href="/" className="h-10 sm:h-12 flex items-center shrink-0 cursor-pointer transition-transform hover:scale-105">
          <img
            src="https://res.cloudinary.com/cloudinarymen/image/upload/v1748196437/makotodecor/backgrounds/LOGO_lolbry.png"
            alt="Makoto Decor - Japanese Decor Store"
            className="h-full w-auto object-contain dark:brightness-125 dark:drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]"
          />
        </a>

        {/* Action Buttons: 1. FB -> 2. Zalo -> 3. Theme Toggle (Icon Only) */}
        <div className="flex items-center space-x-3">
          
          {/* 1. Facebook Button */}
          <a
            href={facebookLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#1877F2] hover:bg-[#166fe5] text-white shadow-md shadow-blue-600/20 border border-blue-400/30 transition-all cursor-pointer"
          >
            <FacebookIcon />
            <span className="hidden sm:inline">Nhắn tin Facebook</span>
          </a>

          {/* 2. Zalo Button */}
          <a
            href={`https://zalo.me/${zaloPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-600/30 border border-blue-200 dark:border-blue-500/30 transition-all shadow-sm cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Tư vấn Zalo</span>
          </a>

          {/* 3. Light / Dark Mode Toggle Button (Icon ONLY) */}
          <button
            onClick={onToggleTheme}
            className="p-2.5 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800/80 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 transition-all shadow-sm cursor-pointer flex items-center justify-center"
            title={theme === 'dark' ? 'Click để chuyển sang Giao diện Sáng' : 'Click để chuyển sang Giao diện Tối'}
          >
            {theme === 'dark' ? (
              <Moon className="w-4 h-4 text-indigo-400 shrink-0" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500 shrink-0" />
            )}
          </button>

        </div>

      </div>
    </header>
  );
}
