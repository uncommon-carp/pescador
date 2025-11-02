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
      <nav className="w-full bg-cyan-700 p-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-white hover:text-gray-200 transition-colors">
          pescador.io
        </Link>

        <div className="flex items-center space-x-4">
          <button
            className="md:hidden text-white text-xl"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <FaBars />
          </button>

          <ul
            className={`text-white ${menuOpen ? 'flex flex-col items-center absolute top-16 right-4 bg-cyan-700 p-4 rounded shadow-lg space-y-2 md:relative md:top-0 md:right-0 md:bg-transparent md:p-0 md:shadow-none md:flex-row md:items-start md:space-y-0' : 'hidden'} md:flex md:space-x-6`}
          >
            <li>
              <a
                href="#search"
                className="block py-1 hover:text-gray-200 text-center md:text-left"
              >
                Search
              </a>
            </li>
            <li>
              <a
                href="#about"
                className="block py-1 hover:text-gray-200 text-center md:text-left"
              >
                About
              </a>
            </li>
            <li>
              <a
                href="#stations"
                className="block py-1 hover:text-gray-200 text-center md:text-left"
              >
                My Stations
              </a>
            </li>
          </ul>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="text-white hover:text-gray-200 p-2"
                title={user.name}
              >
                <FaUser className="text-lg" />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    {user.name}
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
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
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
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
              className="text-white hover:text-gray-200 py-1 px-3 disabled:opacity-50"
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
