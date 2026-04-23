import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTheme } from '../../lib/ThemeContext';

export default function Header() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Finance', path: '/?category=finance' },
    { name: 'Sports', path: '/?category=sports' },
    { name: 'Games', path: '/games' },
  ];

  return (
    <header className="bg-gray-900 dark:bg-gray-900 light:bg-white shadow-md sticky top-0 z-40 border-b border-gray-700 dark:border-gray-700 light:border-gray-200">
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
                className={`text-gray-300 dark:text-gray-300 light:text-gray-700 hover:text-blue-400 transition`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-700 dark:bg-gray-700 light:bg-gray-200 hover:bg-gray-600 transition"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <span className="text-yellow-400 text-xl">☀️</span>
              ) : (
                <span className="text-gray-700 text-xl">🌙</span>
              )}
            </button>
            {/* Mobile menu button */}
            <div className="md:hidden">
              <details className="dropdown">
                <summary className="btn btn-ghost text-white dark:text-white light:text-gray-800 text-2xl">☰</summary>
                <ul className="absolute right-0 mt-2 bg-gray-800 dark:bg-gray-800 light:bg-white rounded-lg shadow-lg z-50 w-40">
                  {navItems.map((item) => (
                    <li key={item.path}>
                      <Link href={item.path} className="block px-4 py-2 text-gray-300 dark:text-gray-300 light:text-gray-700 hover:bg-gray-700 light:hover:bg-gray-100">
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