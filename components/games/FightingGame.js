'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useFullscreen } from '../../hooks/useFullscreen';
import { sounds } from '../../lib/sounds';
import { getAdCodes } from '../../lib/ads';
import GameInterstitialAd from '../ads/GameInterstitialAd';

// ---- Character Stats ----
const CHARACTERS = {
  blaze: {
    name: 'Blaze',
    color: '#ff6600',
    health: 100,
    speed: 5,
    jumpPower: -10,
    punchDamage: 8,
    kickDamage: 12,
    specialDamage: 30,
    specialCost: 50,
    superDamage: 45,
    superCost: 75,
  },
  frost: {
    name: 'Frost',
    color: '#00ccff',
    health: 100,
    speed: 4,
    jumpPower: -12,
    punchDamage: 7,
    kickDamage: 14,
    specialDamage: 25,
    specialCost: 45,
    superDamage: 40,
    superCost: 70,
  },
  shadow: {
    name: 'Shadow',
    color: '#8844aa',
    health: 100,
    speed: 6,
    jumpPower: -9,
    punchDamage: 9,
    kickDamage: 10,
    specialDamage: 28,
    specialCost: 40,
    superDamage: 50,
    superCost: 80,
  },
};

// ---- Main Component ----
export default function FightingGame() {
  const canvasRef = useRef(null);
  const [selectedChar, setSelectedChar] = useState('blaze');
  const [difficulty, setDifficulty] = useState('medium');
  const [gameState, setGameState] = useState('menu'); // menu, playing, roundOver, gameOver
  const [round, setRound] = useState(1);
  const [playerWins, setPlayerWins] = useState(0);
  const [opponentWins, setOpponentWins] = useState(0);
  const [winner, setWinner] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [nickname, setNickname] = useState('');
  const [showReplayAd, setShowReplayAd] = useState(false);
  const [adCode, setAdCode] = useState('');
  const { elementRef, toggleFullscreen } = useFullscreen();

  // Game data ref (for animation loop)
  const gameRef = useRef({
    player: null,
    opponent: null,
    roundTime: 60,
    playerAction: null,
    opponentAction: null,
    actionTimer: 0,
    gameActive: true,
    combo: 0,
    lastHit: 0,
    blockActive: false,
    counterWindow: false,
    hitSparks: [],
    superFlash: 0,
  });

  // --- Leaderboard & Ad ---
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

  // --- Sound Helper ---
  const playSound = (type) => {
    try { if (sounds[type]) sounds[type](); } catch (e) {}
  };

  // --- Hit Spark ---
  const addHitSpark = (x, y) => {
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const speed = 2 + Math.random() * 5;
      gameRef.current.hitSparks.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 15 + Math.random() * 10,
        maxLife: 25,
        size: 4 + Math.random() * 6,
        color: `hsl(${30 + Math.random() * 40}, 100%, 70%)`,
      });
    }
  };

  // --- Damage & Combo ---
  const dealDamage = (target, amount, isSpecial = false, isPlayer = true) => {
    const newHealth = Math.max(0, target.health - amount);
    target.health = newHealth;
    // Hit spark at opponent's position
    const oppX = isPlayer ? gameRef.current.opponent.x : gameRef.current.player.x;
    const canvas = canvasRef.current;
    const y = canvas ? canvas.height - 100 : 300;
    addHitSpark(oppX + 20, y + 20);
    // Screen shake effect (super flash)
    if (isSpecial) gameRef.current.superFlash = 15;

    if (newHealth <= 0) {
      gameRef.current.gameActive = false;
      setGameState('roundOver');
      const winner = isPlayer ? 'player' : 'opponent';
      if (winner === 'player') setPlayerWins(prev => prev + 1);
      else setOpponentWins(prev => prev + 1);
      playSound('playGameOver');
      if (playerWins >= 2 || opponentWins >= 2) {
        setGameState('gameOver');
        setWinner(winner);
        const finalScore = winner === 'player' ? Math.floor((100 - gameRef.current.opponent.health) * 10) : 0;
        submitScore(finalScore);
      }
    } else {
      const powerGain = isSpecial ? 8 : 3;
      if (isPlayer) gameRef.current.player.power = Math.min(100, gameRef.current.player.power + powerGain);
      else gameRef.current.opponent.power = Math.min(100, gameRef.current.opponent.power + powerGain);
      // Combo
      const now = Date.now();
      if (now - gameRef.current.lastHit < 800) gameRef.current.combo++;
      else gameRef.current.combo = 1;
      gameRef.current.lastHit = now;
      playSound('playCoin');
    }
  };

  // --- AI Decision ---
  const aiDecision = useCallback(() => {
    const opp = gameRef.current.opponent;
    const player = gameRef.current.player;
    if (opp.health <= 0) return null;
    const rand = Math.random();
    if (difficulty === 'easy') {
      if (rand < 0.2) return 'punch';
      if (rand < 0.4) return 'kick';
      if (rand < 0.5 && opp.power >= 50) return 'special';
    } else if (difficulty === 'medium') {
      if (player.health < 30 && rand < 0.4) return 'special';
      if (rand < 0.25) return 'punch';
      if (rand < 0.5) return 'kick';
      if (opp.power >= 50 && rand < 0.6) return 'special';
      if (rand < 0.7) return 'block';
    } else {
      if (player.health < 40 && opp.power >= 50) return 'special';
      if (rand < 0.3) return 'punch';
      if (rand < 0.55) return 'kick';
      if (opp.power >= 50 && rand < 0.65) return 'special';
      if (rand < 0.8) return 'block';
    }
    return null;
  }, [difficulty]);

  // --- Start Round ---
  const startRound = () => {
    const stats = CHARACTERS[selectedChar];
    gameRef.current = {
      player: { x: 100, y: 0, width: 40, height: 80, health: 100, power: 0, facingRight: true, ...stats },
      opponent: { x: 300, y: 0, width: 40, height: 80, health: 100, power: 0, facingRight: false, ...CHARACTERS.shadow },
      roundTime: 60,
      playerAction: null,
      opponentAction: null,
      actionTimer: 0,
      gameActive: true,
      combo: 0,
      lastHit: 0,
      blockActive: false,
      counterWindow: false,
      hitSparks: [],
      superFlash: 0,
    };
    setGameState('playing');
    setRound(prev => prev + 1);
  };

  // --- Reset Match ---
  const resetMatch = () => {
    setPlayerWins(0);
    setOpponentWins(0);
    setRound(1);
    setWinner(null);
    setGameState('menu');
  };

  const handlePlayAgain = () => {
    if (adCode) setShowReplayAd(true);
    else resetMatch();
  };
  const onAdClose = () => {
    setShowReplayAd(false);
    resetMatch();
  };

  // --- Animation Loop ---
  useEffect(() => {
    if (gameState !== 'playing') return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    let lastTimestamp = 0;

    const update = (timestamp) => {
      const delta = Math.min(0.1, (timestamp - lastTimestamp) / 1000);
      lastTimestamp = timestamp;

      const data = gameRef.current;
      if (!data.gameActive) {
        draw(ctx, data);
        animId = requestAnimationFrame(update);
        return;
      }

      // Timer
      data.roundTime -= delta;
      if (data.roundTime <= 0) {
        data.gameActive = false;
        setGameState('roundOver');
        if (data.player.health > data.opponent.health) setPlayerWins(prev => prev + 1);
        else setOpponentWins(prev => prev + 1);
        playSound('playGameOver');
        if (playerWins >= 2 || opponentWins >= 2) {
          setGameState('gameOver');
          setWinner(playerWins >= 2 ? 'player' : 'opponent');
          const finalScore = playerWins >= 2 ? Math.floor((100 - data.opponent.health) * 10) : 0;
          submitScore(finalScore);
        }
        draw(ctx, data);
        animId = requestAnimationFrame(update);
        return;
      }

      // AI decision
      if (!data.opponentAction && data.gameActive) {
        const action = aiDecision();
        if (action) {
          data.opponentAction = action;
          data.actionTimer = 0.3;
        }
      }

      // Process player action
      if (data.playerAction) {
        data.actionTimer -= delta;
        if (data.actionTimer <= 0) {
          const stats = CHARACTERS[selectedChar];
          let damage = 0, isSpecial = false;
          switch (data.playerAction) {
            case 'punch': damage = stats.punchDamage; break;
            case 'kick': damage = stats.kickDamage; break;
            case 'special':
              if (data.player.power >= stats.specialCost) {
                damage = stats.specialDamage;
                isSpecial = true;
                data.player.power -= stats.specialCost;
              }
              break;
            case 'super':
              if (data.player.power >= stats.superCost) {
                damage = stats.superDamage;
                isSpecial = true;
                data.player.power -= stats.superCost;
                playSound('playWin');
              }
              break;
          }
          if (damage > 0) {
            // Check block
            if (data.opponentAction === 'block') {
              damage = Math.floor(damage * 0.2);
              playSound('playBlock');
            } else {
              dealDamage(data.opponent, damage, isSpecial, true);
            }
          }
          data.playerAction = null;
        }
      }

      // Process opponent action
      if (data.opponentAction) {
        data.actionTimer -= delta;
        if (data.actionTimer <= 0) {
          let damage = 0;
          switch (data.opponentAction) {
            case 'punch': damage = CHARACTERS.shadow.punchDamage; break;
            case 'kick': damage = CHARACTERS.shadow.kickDamage; break;
            case 'special':
              if (data.opponent.power >= CHARACTERS.shadow.specialCost) {
                damage = CHARACTERS.shadow.specialDamage;
                data.opponent.power -= CHARACTERS.shadow.specialCost;
              }
              break;
            case 'super':
              if (data.opponent.power >= CHARACTERS.shadow.superCost) {
                damage = CHARACTERS.shadow.superDamage;
                data.opponent.power -= CHARACTERS.shadow.superCost;
                playSound('playWin');
              }
              break;
          }
          if (damage > 0) {
            if (data.playerAction === 'block') {
              damage = Math.floor(damage * 0.2);
              playSound('playBlock');
            } else {
              dealDamage(data.player, damage, false, false);
            }
          }
          data.opponentAction = null;
        }
      }

      // Update hit sparks
      data.hitSparks.forEach(sp => {
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.vy += 0.2;
        sp.life--;
      });
      data.hitSparks = data.hitSparks.filter(sp => sp.life > 0);

      // Super flash decay
      if (data.superFlash > 0) data.superFlash--;

      draw(ctx, data);
      animId = requestAnimationFrame(update);
    };

    function draw(ctx, data) {
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      // Background
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, w, h);
      // Ground
      ctx.fillStyle = '#3a3a5a';
      ctx.fillRect(0, h - 50, w, 50);
      // Super flash
      if (data.superFlash > 0) {
        ctx.fillStyle = `rgba(255,255,255,${data.superFlash / 30})`;
        ctx.fillRect(0, 0, w, h);
      }

      // Draw stick figure
      const drawFighter = (fighter, facingRight, color, isPlayer) => {
        const x = fighter.x;
        const y = h - 100;
        const headRadius = 12;
        const bodyLen = 30;
        const armLen = 20;
        const legLen = 25;

        // Head
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x + 20, y - 20, headRadius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
        // Eyes
        ctx.fillStyle = 'white';
        ctx.fillRect(facingRight ? x + 25 : x + 10, y - 25, 5, 5);
        ctx.fillRect(facingRight ? x + 15 : x + 20, y - 25, 5, 5);
        // Body
        ctx.beginPath();
        ctx.moveTo(x + 20, y - 8);
        ctx.lineTo(x + 20, y + 22);
        ctx.stroke();
        // Arms
        ctx.beginPath();
        ctx.moveTo(x + 20, y);
        ctx.lineTo(x + 20 + (facingRight ? 20 : -20), y + 10);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 20, y);
        ctx.lineTo(x + 20 - (facingRight ? 15 : -15), y + 5);
        ctx.stroke();
        // Legs
        ctx.beginPath();
        ctx.moveTo(x + 20, y + 22);
        ctx.lineTo(x + 20 - 8, y + 45);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 20, y + 22);
        ctx.lineTo(x + 20 + 8, y + 45);
        ctx.stroke();
        // Health bar above
        ctx.fillStyle = '#cc3333';
        ctx.fillRect(x, y - 50, 40, 5);
        ctx.fillStyle = '#33cc33';
        ctx.fillRect(x, y - 50, (fighter.health / 100) * 40, 5);
        // Power bar
        ctx.fillStyle = '#ffaa00';
        ctx.fillRect(x, y - 44, (fighter.power / 100) * 40, 3);
      };

      drawFighter(data.player, true, CHARACTERS[selectedChar].color, true);
      drawFighter(data.opponent, false, CHARACTERS.shadow.color, false);

      // Hit sparks
      data.hitSparks.forEach(sp => {
        ctx.fillStyle = sp.color;
        ctx.globalAlpha = sp.life / sp.maxLife;
        ctx.fillRect(sp.x, sp.y, sp.size, sp.size);
      });
      ctx.globalAlpha = 1;

      // Timer & combo
      ctx.fillStyle = 'white';
      ctx.font = '20px monospace';
      ctx.fillText(`Time: ${Math.floor(data.roundTime)}`, w / 2 - 40, 30);
      ctx.fillText(`Round ${round}`, w / 2 - 40, 60);
      if (data.combo > 1) {
        ctx.fillStyle = 'gold';
        ctx.font = 'bold 28px monospace';
        ctx.fillText(`${data.combo}x`, w / 2 - 20, 100);
      }
      // Wins
      ctx.fillStyle = 'white';
      ctx.font = '16px monospace';
      ctx.fillText(`You: ${playerWins}`, 20, 100);
      ctx.fillText(`Opp: ${opponentWins}`, w - 120, 100);
    }

    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [gameState, selectedChar, aiDecision, playerWins, opponentWins, round]);

  // --- Controls ---
  useEffect(() => {
    if (gameState !== 'playing') return;
    const handler = (e) => {
      e.preventDefault();
      const key = e.key;
      const data = gameRef.current;
      if (key === 'a' || key === 'A') data.playerAction = 'punch';
      if (key === 's' || key === 'S') data.playerAction = 'kick';
      if (key === 'd' || key === 'D') data.playerAction = 'special';
      if (key === 'g' || key === 'G') data.playerAction = 'super';
      if (key === 'f' || key === 'F') data.playerAction = 'block';
      if (key === 'ArrowLeft') data.player.x = Math.max(20, data.player.x - 10);
      if (key === 'ArrowRight') data.player.x = Math.min(340, data.player.x + 10);
      if (key === 'ArrowUp' && data.player.y === 0) { /* jump logic if implemented */ }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [gameState]);

  // --- Mobile Touch Controls (Virtual Buttons) ---
  // (We'll render them on canvas if touch device; for now we'll add overlay buttons using HTML)
  // But for simplicity, we'll add a small instruction and rely on canvas drawing.

  // --- UI Rendering ---
  if (gameState === 'menu') {
    return (
      <div ref={elementRef} className="w-full p-4 bg-gray-800 rounded-xl text-center">
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">⚔️ Fighting Game</h2>
        <div className="mb-4 flex flex-wrap justify-center gap-2">
          {Object.keys(CHARACTERS).map(key => (
            <button
              key={key}
              onClick={() => setSelectedChar(key)}
              className={`px-4 py-2 rounded ${selectedChar === key ? 'ring-2 ring-white' : ''}`}
              style={{ backgroundColor: CHARACTERS[key].color }}
            >
              {CHARACTERS[key].name}
            </button>
          ))}
        </div>
        <div className="mb-4">
          <label className="mr-4 text-gray-300">Difficulty:</label>
          <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="bg-gray-700 px-2 py-1 rounded text-white">
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <button onClick={startRound} className="bg-green-600 px-6 py-2 rounded hover:bg-green-700">Start Fight</button>
          <button onClick={() => setShowInstructions(!showInstructions)} className="bg-gray-600 px-4 py-2 rounded">Instructions</button>
          <button onClick={() => setShowLeaderboard(!showLeaderboard)} className="bg-blue-600 px-4 py-2 rounded">Leaderboard</button>
          <button onClick={toggleFullscreen} className="bg-purple-600 px-4 py-2 rounded">Fullscreen</button>
        </div>
        {showInstructions && (
          <div className="mt-4 p-3 bg-gray-700 rounded text-left text-gray-200">
            <p><strong>Controls:</strong> ← → move | A = punch | S = kick | D = special | G = super (needs power) | F = block</p>
            <p><strong>Combos:</strong> Land hits quickly to build combo meter.</p>
            <p><strong>Block:</strong> Reduces damage by 80%.</p>
            <p><strong>Super:</strong> Fill power bar by landing hits, then press G.</p>
            <p>Best of 3 rounds. First to 2 wins.</p>
          </div>
        )}
        {showLeaderboard && (
          <div className="mt-4 p-3 bg-gray-700 rounded">
            <h3 className="text-lg font-bold text-cyan-300">🏆 Top Fighters</h3>
            {leaderboard.map((e, i) => <div key={i} className="text-gray-200">{e.nickname} – {e.score} pts</div>)}
            <button onClick={() => setShowLeaderboard(false)} className="mt-2 bg-gray-500 px-2 py-1 rounded">Close</button>
          </div>
        )}
      </div>
    );
  }

  if (gameState === 'roundOver' || gameState === 'gameOver') {
    const isGameOver = gameState === 'gameOver';
    return (
      <div ref={elementRef} className="w-full p-4 bg-gray-800 rounded-xl text-center">
        <h2 className="text-2xl font-bold text-cyan-400">⚔️ Fighting Game</h2>
        <div className="mt-4 p-4 bg-gray-700 rounded">
          <p className="text-xl text-white">
            {isGameOver
              ? winner === 'player' ? '🏆 You Won the Match!' : '💀 Opponent Won the Match!'
              : `Round ${round} Over!`}
          </p>
          <p className="text-gray-300">You: {playerWins} wins | Opponent: {opponentWins} wins</p>
          {isGameOver && winner === 'player' && (
            <div className="mt-2">
              <input
                type="text"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                placeholder="Your name"
                className="px-2 py-1 rounded text-black"
              />
              <button
                onClick={() => { submitScore(Math.floor((100 - gameRef.current.opponent.health) * 10)); setGameState('menu'); }}
                className="ml-2 bg-blue-600 px-3 py-1 rounded text-white"
              >
                Save Score
              </button>
            </div>
          )}
          <button onClick={isGameOver ? handlePlayAgain : startRound} className="mt-4 bg-green-600 px-6 py-2 rounded">
            {isGameOver ? 'Play Again' : 'Next Round'}
          </button>
          {isGameOver && <button onClick={resetMatch} className="ml-4 bg-gray-600 px-6 py-2 rounded">Quit</button>}
        </div>
        {showReplayAd && <GameInterstitialAd adCode={adCode} onClose={onAdClose} />}
      </div>
    );
  }

  // Playing state
  return (
    <div ref={elementRef} className="w-full relative">
      <canvas ref={canvasRef} width={800} height={500} className="w-full border border-gray-600 rounded-lg" style={{ maxWidth: '100%', height: 'auto' }} />
      {/* Mobile touch overlay (simple buttons) – we'll add a div with buttons that dispatch keyboard events */}
      <div className="mt-2 flex flex-wrap justify-center gap-2 md:hidden">
        <button onTouchStart={() => { const ev = new KeyboardEvent('keydown', { key: 'ArrowLeft' }); window.dispatchEvent(ev); }} className="bg-gray-700 px-4 py-2 rounded text-white">←</button>
        <button onTouchStart={() => { const ev = new KeyboardEvent('keydown', { key: 'ArrowRight' }); window.dispatchEvent(ev); }} className="bg-gray-700 px-4 py-2 rounded text-white">→</button>
        <button onTouchStart={() => { const ev = new KeyboardEvent('keydown', { key: 'a' }); window.dispatchEvent(ev); }} className="bg-red-600 px-4 py-2 rounded text-white">P</button>
        <button onTouchStart={() => { const ev = new KeyboardEvent('keydown', { key: 's' }); window.dispatchEvent(ev); }} className="bg-yellow-600 px-4 py-2 rounded text-white">K</button>
        <button onTouchStart={() => { const ev = new KeyboardEvent('keydown', { key: 'd' }); window.dispatchEvent(ev); }} className="bg-blue-600 px-4 py-2 rounded text-white">S</button>
        <button onTouchStart={() => { const ev = new KeyboardEvent('keydown', { key: 'g' }); window.dispatchEvent(ev); }} className="bg-purple-600 px-4 py-2 rounded text-white">Super</button>
        <button onTouchStart={() => { const ev = new KeyboardEvent('keydown', { key: 'f' }); window.dispatchEvent(ev); }} className="bg-gray-600 px-4 py-2 rounded text-white">Block</button>
      </div>
      <div className="text-center text-gray-400 text-xs mt-1">← → move | P=punch K=kick S=special G=super (power) F=block</div>
    </div>
  );
}