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
import FightingGame from '../../components/games/FightingGame';

const GAMES = {
  chess: { name: 'Chess', icon: '♔', component: Chess },
  sudoku: { name: 'Sudoku', icon: '🔢', component: Sudoku },
  runner: { name: 'Endless Runner', icon: '🏃', component: EndlessRunner },
  shooter: { name: 'Space Shooter', icon: '🚀', component: SpaceShooter },
  fighting: { name: 'Fighting Game', icon: '⚔️', component: FightingGame },
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
            <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-700 pb-2">
              {Object.entries(GAMES).map(([key, g]) => (
                <button
                  key={key}
                  onClick={() => setActive(key)}
                  className={`px-4 py-2 rounded-lg ${active === key ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                >
                  <span className="mr-1">{g.icon}</span> {g.name}
                </button>
              ))}
            </div>
            <div className="bg-gray-900/50 rounded-xl p-4">
              <Component />
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