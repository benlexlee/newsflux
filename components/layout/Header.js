import Link from 'next/link';

export default function Header() {
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Finance', path: '/?category=finance' },
    { name: 'Sports', path: '/?category=sports' },
    { name: 'Games', path: '/games' },
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            NewsFlux
          </Link>
          <nav className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className="text-gray-600 hover:text-blue-600 transition"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}