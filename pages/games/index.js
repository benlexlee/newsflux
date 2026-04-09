import { useState } from 'react';
import Head from 'next/head';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import AdManager from '../../components/ads/AdManager';
import SideAd from '../../components/ads/SideAd';
import Chess from '../../components/games/Chess';
import Sudoku from '../../components/games/Sudoku';
import EndlessRunner from '../../components/games/EndlessRunner';

const GAMES = {
  chess: { name: 'Chess', icon: '♔', color: 'from-amber-600 to-orange-600', component: Chess },
  sudoku: { name: 'Sudoku', icon: '🔢', color: 'from-green-600 to-emerald-600', component: Sudoku },
  runner: { name: 'Endless Runner', icon: '🏃', color: 'from-red-600 to-pink-600', component: EndlessRunner },
};

export default function GamesPage() {
  const [activeGame, setActiveGame] = useState('chess');
  const ActiveGameComponent = GAMES[activeGame].component;

  return (
    <>
      <Head><title>Games - NewsFlux</title></Head>
      <Header />
      <AdManager position="video" />
      <AdManager position="interstitial" />
      <main className="container mx-auto px-4 py-8">
        <AdManager position="top" />
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main game area */}
          <div className="flex-1">
            {/* Animated game selector tabs */}
            <div className="flex flex-wrap gap-3 mb-8">
              {Object.entries(GAMES).map(([key, game]) => (
                <button
                  key={key}
                  onClick={() => setActiveGame(key)}
                  className={`relative flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-lg transition-all duration-300 ${
                    activeGame === key
                      ? `bg-gradient-to-r ${game.color} text-white shadow-lg scale-105`
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:scale-105'
                  }`}
                >
                  <span className="text-2xl">{game.icon}</span>
                  {game.name}
                  {activeGame === key && (
                    <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white rounded-full animate-pulse"></span>
                  )}
                </button>
              ))}
            </div>
            {/* Game container with glassmorphism */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative bg-gray-900/80 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-2xl">
                <ActiveGameComponent />
              </div>
            </div>
          </div>
          
          {/* Side ad column */}
          <div className="lg:w-80">
            <SideAd />
          </div>
        </div>
        
        <AdManager position="bottom" />
      </main>
      <Footer />
    </>
  );
}