'use client';

import { useState } from 'react';
import { FaUser, FaBars, FaCog } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import { AuthModal } from './AuthModal';
import Link from 'next/link';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { user, signOut, loading } = useAuth();

  const handleAuthClick = () => {
    if (user) {
      signOut();
    } else {
      setAuthModalOpen(true);
    }
  };

  return (
    <>
      <nav className="w-full bg-slate-900/90 backdrop-blur-md border-b border-emerald-700/30 p-4 flex justify-between items-center shadow-lg">
        <Link href="/" className="text-2xl font-bold text-stone-100 hover:text-amber-400 transition-colors">
          pescador.io
        </Link>

        <div className="flex items-center space-x-4">
          <button
            className="md:hidden text-stone-100 hover:text-amber-400 text-xl transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <FaBars />
          </button>

          <ul
            className={`text-stone-100 ${menuOpen ? 'flex flex-col items-center absolute top-16 right-4 bg-slate-900/95 backdrop-blur-md border border-emerald-700/40 p-4 rounded-lg shadow-xl space-y-2 md:relative md:top-0 md:right-0 md:bg-transparent md:border-0 md:p-0 md:shadow-none md:flex-row md:items-start md:space-y-0' : 'hidden'} md:flex md:space-x-6`}
          >
            {user && (
              <li>
                <Link
                  href="/dashboard"
                  className="block py-1 hover:text-amber-400 transition-colors text-center md:text-left"
                >
                  Dashboard
                </Link>
              </li>
            )}
            <li>
              <Link
                href="/"
                className="block py-1 hover:text-amber-400 transition-colors text-center md:text-left"
              >
                Search
              </Link>
            </li>
            <li>
              <a
                href="#about"
                className="block py-1 hover:text-amber-400 transition-colors text-center md:text-left"
              >
                About
              </a>
            </li>
            <li>
              <a
                href="#stations"
                className="block py-1 hover:text-amber-400 transition-colors text-center md:text-left"
              >
                My Stations
              </a>
            </li>
          </ul>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="text-stone-100 hover:text-amber-400 p-2 transition-colors"
                title={user.name}
              >
                <FaUser className="text-lg" />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-emerald-700/40 rounded-lg shadow-xl py-1 z-50 backdrop-blur-md">
                  <div className="px-4 py-2 text-sm text-stone-200 border-b border-emerald-700/30">
                    {user.name}
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center px-4 py-2 text-sm text-stone-200 hover:bg-slate-700/50 hover:text-amber-400 w-full transition-colors"
                  >
                    <FaCog className="mr-2" />
                    Profile Settings
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setProfileMenuOpen(false);
                    }}
                    disabled={loading}
                    className="block w-full text-left px-4 py-2 text-sm text-stone-200 hover:bg-slate-700/50 hover:text-amber-400 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Loading...' : 'Sign Out'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleAuthClick}
              disabled={loading}
              className="text-stone-100 hover:text-amber-400 py-1 px-3 disabled:opacity-50 transition-colors font-medium"
            >
              {loading ? 'Loading...' : 'Sign In'}
            </button>
          )}
        </div>
      </nav>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </>
  );
}
