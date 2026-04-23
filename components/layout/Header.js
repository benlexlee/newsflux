import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

export default function Header() {
  const router = useRouter();
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
      setTheme('light');
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }, []);

  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light');
      document.body.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    } else {
      setTheme('dark');
      document.body.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    }
  };
  
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Finance', path: '/?category=finance' },
    { name: 'Sports', path: '/?category=sports' },
    { name: 'Games', path: '/games' },
  ];

  return (
    <header className="bg-gray-900 shadow-md sticky top-0 z-40 border-b border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold text-blue-500 hover:text-blue-400 transition">
            NewsFlux
          </Link>
          <nav className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className="text-gray-300 hover:text-blue-400 transition"
              >
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition text-xl"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <div className="md:hidden">
              <details className="dropdown">
                <summary className="text-white text-2xl cursor-pointer">☰</summary>
                <ul className="absolute right-0 mt-2 bg-gray-800 rounded-lg shadow-lg z-50 w-40">
                  {navItems.map((item) => (
                    <li key={item.path}>
                      <Link href={item.path} className="block px-4 py-2 text-gray-300 hover:bg-gray-700">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}