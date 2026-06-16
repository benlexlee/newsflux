'use client';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-800 py-6 mt-8 border-t border-gray-700">
      <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
        <div className="flex justify-center gap-4 mb-2">
          <Link href="/" className="hover:text-white transition">Home</Link>
          <Link href="/games" className="hover:text-white transition">Games</Link>
          <Link href="/rewards" className="hover:text-white transition">🎁 Rewards</Link>
        </div>
        <p>© {new Date().getFullYear()} NewsFlux. All rights reserved.</p>
      </div>
    </footer>
  );
}