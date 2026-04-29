'use client';
import { useState, useEffect, useRef } from 'react';
import { useFullscreen } from '../../hooks/useFullscreen';
import { sounds } from '../../lib/sounds';
import { getAdCodes } from '../../lib/ads';
import GameInterstitialAd from '../ads/GameInterstitialAd';

export default function SpaceShooter() {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [gameRunning, setGameRunning] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showReplayAd, setShowReplayAd] = useState(false);
  const [adCode, setAdCode] = useState('');
  const { elementRef, toggleFullscreen } = useFullscreen();

  const gameRef = useRef({
    player: { x: 0, width: 40, height: 30 },
    bullets: [],
    enemies: [],
    frame: 0,
    cooldown: 0,
    lives: 3,
    score: 0,
  });

  useEffect(() => {
    const saved = localStorage.getItem('shooterHighScore');
    if (saved) setHighScore(parseInt(saved));
    getAdCodes().then(codes => setAdCode(codes.interstitialAdCode));
  }, []);

  useEffect(() => {
    if (!gameRunning) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    const playerY = h - 50;
    let animId;
    const data = gameRef.current;
    data.player.x = w/2 - 20;
    data.bullets = [];
    data.enemies = [];
    data.frame = 0;
    data.cooldown = 0;
    data.lives = 3;
    data.score = 0;
    setLives(3);
    setScore(0);

    let pointerX = data.player.x;
    const move = (clientX) => {
      const rect = canvas.getBoundingClientRect();
      const scale = w / rect.width;
      let newX = (clientX - rect.left) * scale - 20;
      newX = Math.min(Math.max(newX, 0), w - 40);
      data.player.x = newX;
      pointerX = newX;
    };
    const handleMove = (e) => move(e.clientX);
    const handleTouch = (e) => { e.preventDefault(); move(e.touches[0].clientX); };
    const shoot = () => {
      if (data.cooldown <= 0 && gameRunning) {
        data.bullets.push({ x: data.player.x + 17, y: playerY - 10, w: 6, h: 12 });
        data.cooldown = 10;
        sounds.playShoot();
      }
    };
    const handleClick = () => shoot();
    const handleTouchStart = (e) => { e.preventDefault(); shoot(); };
    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('touchmove', handleTouch);
    canvas.addEventListener('touchstart', handleTouchStart);

    function update() {
      if (!gameRunning) return;
      if (data.cooldown > 0) data.cooldown--;
      for (let i=0; i<data.bullets.length; i++) {
        data.bullets[i].y -= 8;
        if (data.bullets[i].y + data.bullets[i].h < 0) data.bullets.splice(i--,1);
      }
      if (data.frame % 40 === 0 && Math.random() > 0.4) {
        data.enemies.push({ x: Math.random() * (w - 30), y: -30, w: 30, h: 30 });
      }
      for (let i=0; i<data.enemies.length; i++) {
        const e = data.enemies[i];
        e.y += 4;
        if (e.y > h) { data.enemies.splice(i--,1); continue; }
        if (e.x < data.player.x+40 && e.x+30 > data.player.x && e.y+30 > playerY && e.y < playerY+30) {
          data.enemies.splice(i--,1);
          data.lives--;
          setLives(data.lives);
          sounds.playExplosion();
          if (data.lives <= 0) {
            setGameOver(true);
            setGameRunning(false);
            if (data.score > highScore) {
              setHighScore(data.score);
              localStorage.setItem('shooterHighScore', data.score);
            }
          }
          continue;
        }
        for (let j=0; j<data.bullets.length; j++) {
          const b = data.bullets[j];
          if (b.x < e.x+30 && b.x+6 > e.x && b.y < e.y+30 && b.y+12 > e.y) {
            data.bullets.splice(j--,1);
            data.enemies.splice(i--,1);
            data.score += 10;
            setScore(data.score);
            sounds.playCoin();
            break;
          }
        }
      }
      data.frame++;
    }

    function draw() {
      ctx.clearRect(0,0,w,h);
      ctx.fillStyle = '#0a0a2a';
      ctx.fillRect(0,0,w,h);
      ctx.fillStyle = 'white';
      for (let i=0;i<100;i++) ctx.fillRect((i*79)%w, (i*13 + Date.now()*0.2)%h, 2,2);
      ctx.fillStyle = '#00bfff';
      ctx.fillRect(data.player.x, playerY, 40, 30);
      ctx.fillStyle = '#0088cc';
      ctx.fillRect(data.player.x+10, playerY-10, 20, 10);
      ctx.fillStyle = '#ffff00';
      data.bullets.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h));
      ctx.fillStyle = '#ff4444';
      data.enemies.forEach(e => ctx.fillRect(e.x, e.y, e.w, e.h));
      ctx.fillStyle = 'white';
      ctx.font = 'bold 20px monospace';
      ctx.fillText(`Score: ${data.score}`, 10, 30);
      ctx.fillStyle = 'red';
      ctx.fillText(`❤️ ${data.lives}`, w-70, 30);
      ctx.fillStyle = 'gold';
      ctx.fillText(`🏆 ${highScore}`, w-120, 30);
    }

    function loop() { if (gameRunning) { update(); draw(); animId = requestAnimationFrame(loop); } }
    loop();
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('mousemove', handleMove);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('touchmove', handleTouch);
      canvas.removeEventListener('touchstart', handleTouchStart);
    };
  }, [gameRunning, highScore]);

  const startGame = () => {
    setGameOver(false);
    setGameRunning(true);
  };

  const handlePlayAgain = () => {
    if (adCode) {
      setShowReplayAd(true);
    } else {
      startGame();
    }
  };

  const onAdClose = () => {
    setShowReplayAd(false);
    startGame();
  };

  return (
    <div ref={elementRef} className="w-full h-full min-h-[500px] bg-gradient-to-b from-gray-800 to-black rounded-xl p-4">
      {showReplayAd && <GameInterstitialAd adCode={adCode} onClose={onAdClose} />}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-cyan-400">🚀 Space Shooter</h2>
        <div className="flex gap-2">
          <button onClick={()=>setShowInstructions(!showInstructions)} className="bg-gray-700 px-3 py-1 rounded">Help</button>
          <button onClick={toggleFullscreen} className="bg-purple-700 px-3 py-1 rounded">Fullscreen</button>
        </div>
      </div>
      {showInstructions && <div className="bg-gray-800 p-3 rounded mb-4 text-sm">Move mouse/finger; click/tap to shoot. Avoid red enemies.</div>}
      {!gameRunning && !gameOver && <button onClick={startGame} className="bg-green-600 px-6 py-2 rounded-lg mb-4">🚀 Start Game</button>}
      {gameOver && (
        <div className="mb-4 p-4 bg-red-800 rounded-lg text-center">
          <p className="text-xl font-bold">Game Over! Score: {score}</p>
          <button onClick={handlePlayAgain} className="mt-2 bg-blue-600 px-4 py-1 rounded">Play Again</button>
        </div>
      )}
      <canvas ref={canvasRef} width={800} height={500} className="border border-gray-600 rounded-xl w-full" style={{ maxWidth: '100%', height: 'auto', cursor: 'none' }} />
    </div>
  );
}