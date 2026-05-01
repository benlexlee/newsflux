import { useState } from 'react';
import Head from 'next/head';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import AdManager from '../../components/ads/AdManager';
import SideAd from '../../components/ads/SideAd';
import Chess from '../../components/games/Chess';
import Sudoku from '../../components/games/Sudoku';
import EndlessRunner from '../../components/games/EndlessRunner';
import SpaceShooter from '../../components/games/SpaceShooter';

const GAMES = {
  chess: { name: 'Chess', icon: '♔', emoji: '🏆', component: Chess },
  sudoku: { name: 'Sudoku', icon: '🔢', emoji: '🧩', component: Sudoku },
  runner: { name: 'Endless Runner', icon: '🏃', emoji: '⚡', component: EndlessRunner },
  shooter: { name: 'Space Shooter', icon: '🚀', emoji: '👾', component: SpaceShooter },
};

export default function GamesPage() {
  const [active, setActive] = useState('chess');
  const Component = GAMES[active].component;

  return (
    <>
      <Head><title>Games - NewsFlux</title></Head>
      <Header />
      <AdManager position="video" />
      <AdManager position="interstitial" />
      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            {/* Game selector tabs - modern card style */}
            <div className="flex flex-wrap gap-3 mb-6 border-b border-gray-700 pb-3">
              {Object.entries(GAMES).map(([key, g]) => (
                <button
                  key={key}
                  onClick={() => setActive(key)}
                  className={`
                    flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-200
                    ${active === key 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105' 
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:scale-105'
                    }
                  `}
                >
                  <span className="text-xl">{g.icon}</span>
                  <span>{g.name}</span>
                </button>
              ))}
            </div>
            {/* Game container with glass effect */}
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-30"></div>
              <div className="relative bg-gray-900/90 backdrop-blur-sm rounded-2xl p-4 border border-white/10 shadow-2xl">
                <Component />
              </div>
            </div>
          </div>
          <SideAd />
        </div>
        <AdManager position="bottom" />
      </main>
      <Footer />
    </>
  );
}