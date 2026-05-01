'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useFullscreen } from '../../hooks/useFullscreen';
import { sounds } from '../../lib/sounds';
import { getAdCodes } from '../../lib/ads';
import GameInterstitialAd from '../ads/GameInterstitialAd';

const CHARACTERS = {
  blaze: { name: 'Blaze', color: '#ff6600', accent: '#ffcc00', health: 100,
    punchDamage: 8, kickDamage: 12, specialDamage: 25, specialPowerCost: 50 },
  frost: { name: 'Frost', color: '#00ccff', accent: '#ffffff', health: 100,
    punchDamage: 7, kickDamage: 14, specialDamage: 22, specialPowerCost: 55 }
};

export default function FightingGame() {
  const canvasRef = useRef(null);
  const [difficulty, setDifficulty] = useState('medium');
  const [selectedChar, setSelectedChar] = useState('blaze');
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [nickname, setNickname] = useState('');
  const [justFinished, setJustFinished] = useState(false);
  const [showReplayAd, setShowReplayAd] = useState(false);
  const [adCode, setAdCode] = useState('');
  const { elementRef, toggleFullscreen } = useFullscreen();

  const gameRef = useRef({
    player: { x: 100, y: 0, width: 40, height: 80, health: 100, power: 0, facingRight: true, combo: 0, lastHit: 0 },
    opponent: { x: 300, y: 0, width: 40, height: 80, health: 100, power: 0, facingRight: false, combo: 0 },
    roundTime: 60,
    playerAction: null,
    opponentAction: null,
    actionTimer: 0,
    gameActive: true,
  });

  useEffect(() => {
    fetchLeaderboard();
    getAdCodes().then(codes => setAdCode(codes.interstitialAdCode));
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/scores?game=fighting&limit=10');
      const data = await res.json();
      setLeaderboard(data);
    } catch (err) { console.error(err); }
  };

  const submitScore = async (score) => {
    if (!nickname.trim()) return;
    try {
      await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game: 'fighting', nickname: nickname.trim(), score, time: null }),
      });
      fetchLeaderboard();
    } catch (err) { console.error(err); }
  };

  const playSound = (type) => {
    try { sounds[type] && sounds[type](); } catch (e) {}
  };

  const dealDamage = (target, amount, isSpecial = false, isPlayer = true) => {
    const newHealth = Math.max(0, target.health - amount);
    target.health = newHealth;
    if (newHealth <= 0) {
      gameRef.current.gameActive = false;
      setWinner(isPlayer ? 'player' : 'opponent');
      setGameOver(true);
      setJustFinished(true);
      playSound('playGameOver');
      const finalScore = isPlayer ? Math.floor((100 - gameRef.current.opponent.health) * 10) : 0;
      submitScore(finalScore);
    } else {
      const powerGain = isSpecial ? 5 : 2;
      if (isPlayer) gameRef.current.player.power = Math.min(100, gameRef.current.player.power + powerGain);
      else gameRef.current.opponent.power = Math.min(100, gameRef.current.opponent.power + powerGain);
      const now = Date.now();
      if (now - gameRef.current.player.lastHit < 1000) gameRef.current.player.combo++;
      else gameRef.current.player.combo = 1;
      gameRef.current.player.lastHit = now;
      playSound('playCoin');
    }
  };

  const aiDecision = useCallback(() => {
    const opp = gameRef.current.opponent;
    const player = gameRef.current.player;
    if (opp.health <= 0) return null;
    const rand = Math.random();
    if (difficulty === 'easy') {
      if (rand < 0.3) return 'punch';
      if (rand < 0.5) return 'kick';
      if (rand < 0.6 && opp.power >= 50) return 'special';
    } else if (difficulty === 'medium') {
      if (player.health < 30 && rand < 0.5) return 'special';
      if (rand < 0.35) return 'punch';
      if (rand < 0.6) return 'kick';
      if (opp.power >= 50 && rand < 0.7) return 'special';
    } else {
      if (player.health < 40 && opp.power >= 50) return 'special';
      if (rand < 0.4) return 'punch';
      if (rand < 0.7) return 'kick';
      if (opp.power >= 50) return 'special';
    }
    return null;
  }, [difficulty]);

  const startMatch = () => {
    gameRef.current = {
      player: { x: 100, y: 0, width: 40, height: 80, health: 100, power: 0, facingRight: true, combo: 0, lastHit: 0 },
      opponent: { x: 300, y: 0, width: 40, height: 80, health: 100, power: 0, facingRight: false, combo: 0 },
      roundTime: 60,
      playerAction: null,
      opponentAction: null,
      actionTimer: 0,
      gameActive: true,
    };
    setGameStarted(true);
    setGameOver(false);
    setWinner(null);
    setJustFinished(false);
  };

  const resetGame = () => startMatch();
  const handlePlayAgain = () => {
    if (adCode) setShowReplayAd(true);
    else resetGame();
  };
  const onAdClose = () => {
    setShowReplayAd(false);
    resetGame();
  };

  // Animation loop
  useEffect(() => {
    if (!gameStarted) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    let lastTimestamp = 0;

    const update = (timestamp) => {
      const delta = Math.min(0.1, (timestamp - lastTimestamp) / 1000);
      lastTimestamp = timestamp;

      if (gameRef.current.gameActive) {
        if (gameRef.current.roundTime > 0) {
          gameRef.current.roundTime -= delta;
          if (gameRef.current.roundTime <= 0) {
            gameRef.current.gameActive = false;
            const winner = gameRef.current.player.health > gameRef.current.opponent.health ? 'player' : 'opponent';
            setWinner(winner);
            setGameOver(true);
            setJustFinished(true);
            playSound('playGameOver');
            const finalScore = winner === 'player' ? Math.floor((100 - gameRef.current.opponent.health) * 10) : 0;
            submitScore(finalScore);
          }
        }

        // AI decision
        if (!gameRef.current.opponentAction && gameRef.current.gameActive) {
          const action = aiDecision();
          if (action) {
            gameRef.current.opponentAction = action;
            gameRef.current.actionTimer = 0.3;
          }
        }

        // Process player action
        if (gameRef.current.playerAction) {
          gameRef.current.actionTimer -= delta;
          if (gameRef.current.actionTimer <= 0) {
            const stats = CHARACTERS[selectedChar];
            let damage = 0, isSpecial = false;
            switch (gameRef.current.playerAction) {
              case 'punch': damage = stats.punchDamage; break;
              case 'kick': damage = stats.kickDamage; break;
              case 'special':
                if (gameRef.current.player.power >= stats.specialPowerCost) {
                  damage = stats.specialDamage;
                  isSpecial = true;
                  gameRef.current.player.power -= stats.specialPowerCost;
                }
                break;
            }
            if (damage > 0) dealDamage(gameRef.current.opponent, damage, isSpecial, true);
            gameRef.current.playerAction = null;
          }
        }

        // Process opponent action
        if (gameRef.current.opponentAction) {
          gameRef.current.actionTimer -= delta;
          if (gameRef.current.actionTimer <= 0) {
            let damage = 0;
            switch (gameRef.current.opponentAction) {
              case 'punch': damage = CHARACTERS.frost.punchDamage; break;
              case 'kick': damage = CHARACTERS.frost.kickDamage; break;
              case 'special':
                if (gameRef.current.opponent.power >= CHARACTERS.frost.specialPowerCost) {
                  damage = CHARACTERS.frost.specialDamage;
                  gameRef.current.opponent.power -= CHARACTERS.frost.specialPowerCost;
                }
                break;
            }
            if (damage > 0) dealDamage(gameRef.current.player, damage, false, false);
            gameRef.current.opponentAction = null;
          }
        }
      }

      // Drawing
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#2a2a3a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#5a5a6a';
      ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
      // Player
      ctx.fillStyle = CHARACTERS[selectedChar].color;
      ctx.fillRect(gameRef.current.player.x, canvas.height - 100, 40, 80);
      // Opponent
      ctx.fillStyle = '#8844aa';
      ctx.fillRect(gameRef.current.opponent.x, canvas.height - 100, 40, 80);
      // Health bars
      ctx.fillStyle = '#cc3333';
      ctx.fillRect(50, 20, 200, 20);
      ctx.fillStyle = '#33cc33';
      ctx.fillRect(50, 20, (gameRef.current.player.health / 100) * 200, 20);
      ctx.fillStyle = '#cc3333';
      ctx.fillRect(canvas.width - 250, 20, 200, 20);
      ctx.fillStyle = '#33cc33';
      ctx.fillRect(canvas.width - 250, 20, (gameRef.current.opponent.health / 100) * 200, 20);
      // Power bars
      ctx.fillStyle = '#ffaa00';
      ctx.fillRect(50, 45, (gameRef.current.player.power / 100) * 200, 10);
      ctx.fillRect(canvas.width - 250, 45, (gameRef.current.opponent.power / 100) * 200, 10);
      // Timer
      ctx.fillStyle = 'white';
      ctx.font = '20px monospace';
      ctx.fillText(`Time: ${Math.floor(gameRef.current.roundTime)}`, canvas.width/2 - 40, 50);
      // Combo
      if (gameRef.current.player.combo > 1) {
        ctx.fillStyle = 'gold';
        ctx.font = 'bold 24px monospace';
        ctx.fillText(`${gameRef.current.player.combo} HIT!`, canvas.width/2 - 30, 100);
      }

      animId = requestAnimationFrame(update);
    };
    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [gameStarted, selectedChar, aiDecision]);

  // Keyboard controls
  useEffect(() => {
    if (!gameStarted || !gameRef.current.gameActive) return;
    const handler = (e) => {
      e.preventDefault();
      const key = e.key;
      if (key === 'a') gameRef.current.playerAction = 'punch';
      if (key === 's') gameRef.current.playerAction = 'kick';
      if (key === 'd') gameRef.current.playerAction = 'special';
      if (key === 'ArrowLeft') gameRef.current.player.x = Math.max(20, gameRef.current.player.x - 10);
      if (key === 'ArrowRight') gameRef.current.player.x = Math.min(340, gameRef.current.player.x + 10);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [gameStarted]);

  if (!gameStarted) {
    return (
      <div ref={elementRef} className="w-full p-4 bg-gray-800 rounded-xl text-center">
        <h2 className="text-2xl font-bold mb-4">⚔️ Fighting Game</h2>
        <div className="mb-4">
          <label className="mr-4">Character: </label>
          <button onClick={() => setSelectedChar('blaze')} className={`px-4 py-2 rounded ${selectedChar === 'blaze' ? 'bg-orange-600' : 'bg-gray-700'}`}>Blaze</button>
          <button onClick={() => setSelectedChar('frost')} className={`ml-2 px-4 py-2 rounded ${selectedChar === 'frost' ? 'bg-cyan-600' : 'bg-gray-700'}`}>Frost</button>
        </div>
        <div className="mb-4">
          <label className="mr-4">Difficulty: </label>
          <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="bg-gray-700 px-2 py-1 rounded">
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <button onClick={startMatch} className="bg-green-600 px-6 py-2 rounded">Start Fight</button>
        <button onClick={() => setShowInstructions(!showInstructions)} className="ml-4 bg-gray-600 px-4 py-2 rounded">Instructions</button>
        <button onClick={() => setShowLeaderboard(!showLeaderboard)} className="ml-4 bg-blue-600 px-4 py-2 rounded">Leaderboard</button>
        <button onClick={toggleFullscreen} className="ml-4 bg-purple-600 px-4 py-2 rounded">Fullscreen</button>
        {showInstructions && (
          <div className="mt-4 p-3 bg-gray-700 rounded text-left">
            <p>← → move, A = punch, S = kick, D = special (uses power). Fill power bar by landing hits.</p>
          </div>
        )}
        {showLeaderboard && (
          <div className="mt-4 p-3 bg-gray-700 rounded">
            <h3>🏆 Top Fighters</h3>
            <ul>{leaderboard.map((e,i) => <li key={i}>{e.nickname} – {e.score} pts</li>)}</ul>
            <button onClick={() => setShowLeaderboard(false)}>Close</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={elementRef} className="w-full relative">
      {showReplayAd && <GameInterstitialAd adCode={adCode} onClose={onAdClose} />}
      <canvas ref={canvasRef} width={800} height={400} className="w-full border border-gray-600 rounded-lg" style={{ maxWidth: '100%', height: 'auto' }} />
      {gameOver && justFinished && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
          <p className="text-white text-2xl">{winner === 'player' ? 'You Win!' : 'You Lose!'}</p>
          <input type="text" value={nickname} onChange={e=>setNickname(e.target.value)} placeholder="Your name" className="mt-2 px-2 py-1 rounded text-black" />
          <button onClick={()=>{ submitScore(winner === 'player' ? Math.floor((100 - gameRef.current.opponent.health) * 10) : 0); setJustFinished(false); }} className="mt-2 bg-blue-600 px-4 py-1 rounded">Save Score</button>
          <button onClick={handlePlayAgain} className="mt-2 bg-green-600 px-4 py-1 rounded">Play Again</button>
        </div>
      )}
    </div>
  );
}