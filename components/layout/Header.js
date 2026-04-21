import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Header() {
  const router = useRouter();
  
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
                className={`text-gray-300 hover:text-blue-400 transition ${
                  router.pathname === item.path || (item.path.includes('category') && router.asPath.includes(item.path.split('?')[1]))
                    ? 'text-blue-400 border-b-2 border-blue-400 pb-1'
                    : ''
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          {/* Mobile menu button - shows on small screens */}
          <div className="md:hidden">
            <details className="dropdown">
              <summary className="btn btn-ghost text-white text-2xl">☰</summary>
              <ul className="absolute right-0 mt-2 bg-gray-800 rounded-lg shadow-lg z-50 w-40">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link href={item.path} className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          </div>
        </div>
      </div>
    </header>
  );
}