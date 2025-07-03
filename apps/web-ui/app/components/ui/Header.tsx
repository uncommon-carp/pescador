import { useState } from 'react';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <nav className="w-full bg-[#496e6e] p-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-white">Pescador</h1>
      <button
        className="md:hidden text-white"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </button>
      <ul
        className={`md:flex space-x-6 text-white ${menuOpen ? 'block' : 'hidden'} md:block`}
      >
        <li>
          <a href="#search">Search</a>
        </li>
        <li>
          <a href="#explore">Explore</a>
        </li>
        <li>
          <a href="#about">About</a>
        </li>
        <li>
          <a href="#login">Log In</a>
        </li>
      </ul>
    </nav>
  );
}
