import { useState, useEffect, useRef } from 'react';
import { useFullscreen } from '../../hooks/useFullscreen';

// Sound effects using Web Audio API
const playSound = (type) => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    if (type === 'jump') {
      osc.type = 'sine';
      osc.frequency.value = 523.25;
      gain.gain.value = 0.15;
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.3);
      osc.stop(now + 0.3);
    } else if (type === 'coin') {
      osc.type = 'sine';
      osc.frequency.value = 880;
      gain.gain.value = 0.2;
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.15);
      osc.stop(now + 0.15);
    } else if (type === 'shoot') {
      osc.type = 'sawtooth';
      osc.frequency.value = 660;
      gain.gain.value = 0.1;
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.2);
      osc.stop(now + 0.2);
    } else if (type === 'explosion') {
      osc.type = 'sawtooth';
      osc.frequency.value = 110;
      gain.gain.value = 0.2;
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.5);
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.5);
      osc.stop(now + 0.5);
    } else if (type === 'gameover') {
      osc.type = 'sine';
      osc.frequency.value = 220;
      gain.gain.value = 0.15;
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.00001, now + 1.5);
      osc.frequency.exponentialRampToValueAtTime(110, now + 1.5);
      osc.stop(now + 1.5);
    }
  } catch(e) { console.log('Audio not supported'); }
};

export default function EndlessRunner() {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameRunning, setGameRunning] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [justFinished, setJustFinished] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [nickname, setNickname] = useState('');
  const { elementRef, toggleFullscreen } = useFullscreen();

  const gameDataRef = useRef({
    player: { x: 50, y: 150, width: 30, height: 30, isJumping: false, yVelocity: 0 },
    obstacles: [],
    coins: [],
    enemies: [],
    enemyBullets: [],
    playerBullets: [],
    particles: [],
    clouds: [],
    birds: [],
    grassPatches: [],
    frame: 0,
    score: 0,
    shootCooldown: 0,
  });

  const groundY = 180;

  useEffect(() => {
    const savedHigh = localStorage.getItem('runnerHighScore');
    if (savedHigh) setHighScore(parseInt(savedHigh));
    const savedLeaderboard = localStorage.getItem('runnerLeaderboard');
    if (savedLeaderboard) setLeaderboard(JSON.parse(savedLeaderboard));
  }, []);

  const saveScoreToLeaderboard = (finalScore) => {
    if (finalScore === 0) return;
    const newEntry = { nickname: nickname.trim() || 'Anonymous', score: finalScore, date: new Date().toLocaleDateString() };
    const newLeaderboard = [...leaderboard, newEntry].sort((a,b) => b.score - a.score).slice(0, 10);
    setLeaderboard(newLeaderboard);
    localStorage.setItem('runnerLeaderboard', JSON.stringify(newLeaderboard));
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('runnerHighScore', finalScore);
    }
  };

  const addParticle = (x, y) => {
    gameDataRef.current.particles.push({ x, y, vx: (Math.random() - 0.5) * 4, vy: Math.random() * -3, life: 20 });
  };

  useEffect(() => {
    if (!gameRunning) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    const data = gameDataRef.current;

    data.player = { x: 50, y: groundY - 30, width: 30, height: 30, isJumping: false, yVelocity: 0 };
    data.obstacles = [];
    data.coins = [];
    data.enemies = [];
    data.enemyBullets = [];
    data.playerBullets = [];
    data.particles = [];
    data.clouds = [];
    data.birds = [];
    data.grassPatches = [];
    data.frame = 0;
    data.score = 0;
    data.shootCooldown = 0;
    setScore(0);
    setJustFinished(false);

    for (let i=0;i<5;i++) {
      data.clouds.push({ x: Math.random()*canvas.width, y: Math.random()*80, size: 40+Math.random()*30, speed: 0.3 + Math.random()*0.5 });
      data.birds.push({ x: Math.random()*canvas.width, y: Math.random()*70, flap: 0, speed: 1 + Math.random()*0.5 });
    }
    for (let i=0;i<30;i++) {
      data.grassPatches.push({ x: Math.random()*canvas.width, size: 5+Math.random()*10 });
    }

    const jump = () => {
      if (!data.player.isJumping && gameRunning) {
        data.player.isJumping = true;
        data.player.yVelocity = -11;
        playSound('jump');
      }
    };
    const shoot = () => {
      if (data.shootCooldown <= 0 && gameRunning) {
        data.playerBullets.push({ x: data.player.x + data.player.width, y: data.player.y + 15, width: 10, height: 4, vx: 8 });
        data.shootCooldown = 15;
        playSound('shoot');
      }
    };
    const handleKey = (e) => {
      if (e.code === 'Space') { e.preventDefault(); jump(); }
      if (e.code === 'KeyF') { e.preventDefault(); shoot(); }
    };
    const handleTouch = (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const touchX = e.touches[0].clientX - rect.left;
      const halfWidth = canvas.width / 2;
      if (touchX < halfWidth) jump();
      else shoot();
    };
    window.addEventListener('keydown', handleKey);
    canvas.addEventListener('touchstart', handleTouch);
    window.addEventListener('click', () => { if (gameRunning) shoot(); });

    function update() {
      if (!gameRunning) return;
      if (data.shootCooldown > 0) data.shootCooldown--;

      if (data.player.isJumping) {
        data.player.y += data.player.yVelocity;
        data.player.yVelocity += 0.8;
        if (data.player.y + data.player.height >= groundY) {
          data.player.y = groundY - data.player.height;
          data.player.isJumping = false;
          data.player.yVelocity = 0;
        }
      } else {
        data.player.y = groundY - data.player.height;
      }

      for (let c of data.clouds) { c.x -= c.speed; if (c.x + c.size*2 < 0) c.x = canvas.width + c.size*2; }
      for (let b of data.birds) { b.x -= b.speed; b.flap = (b.flap+0.1)%(Math.PI*2); if (b.x+20<0) b.x = canvas.width+20; }

      if (data.frame % 85 === 0 && Math.random() > 0.5) {
        data.obstacles.push({ x: canvas.width, y: groundY - 25, width: 20, height: 25 });
      }
      if (data.frame % 35 === 0 && Math.random() > 0.6) {
        data.coins.push({ x: canvas.width, y: groundY - 40, width: 12, height: 12 });
      }
      if (data.frame % 180 === 0 && Math.random() > 0.7) {
        data.enemies.push({ x: canvas.width, y: groundY - 35, width: 25, height: 30, shootCooldown: 0 });
      }

      for (let i=0; i<data.enemies.length; i++) {
        const e = data.enemies[i];
        e.x -= 4;
        if (e.x + e.width < 0) { data.enemies.splice(i,1); i--; continue; }
        if (e.shootCooldown > 0) e.shootCooldown--;
        if (e.shootCooldown === 0 && Math.random() < 0.02) {
          data.enemyBullets.push({ x: e.x, y: e.y+15, width: 8, height: 4, vx: -5 });
          e.shootCooldown = 60;
          playSound('shoot');
        }
        if (data.player.x < e.x+e.width && data.player.x+data.player.width > e.x &&
            data.player.y < e.y+e.height && data.player.y+data.player.height > e.y) {
          setGameOver(true); setGameRunning(false); playSound('explosion'); setJustFinished(true);
          if (data.score > highScore) setHighScore(data.score);
          return;
        }
      }

      for (let i=0; i<data.enemyBullets.length; i++) {
        const b = data.enemyBullets[i];
        b.x += b.vx;
        if (b.x + b.width < 0 || b.x > canvas.width) { data.enemyBullets.splice(i,1); i--; continue; }
        if (data.player.x < b.x+b.width && data.player.x+data.player.width > b.x &&
            data.player.y < b.y+b.height && data.player.y+data.player.height > b.y) {
          setGameOver(true); setGameRunning(false); playSound('explosion'); setJustFinished(true);
          if (data.score > highScore) setHighScore(data.score);
          return;
        }
      }

      for (let i=0; i<data.playerBullets.length; i++) {
        const b = data.playerBullets[i];
        b.x += b.vx;
        if (b.x > canvas.width) { data.playerBullets.splice(i,1); i--; continue; }
        for (let j=0; j<data.enemies.length; j++) {
          const e = data.enemies[j];
          if (b.x < e.x+e.width && b.x+b.width > e.x && b.y < e.y+e.height && b.y+b.height > e.y) {
            data.enemies.splice(j,1);
            data.playerBullets.splice(i,1);
            data.score += 20;
            setScore(data.score);
            playSound('coin');
            for (let p=0;p<10;p++) addParticle(e.x+e.width/2, e.y+e.height/2);
            i--; break;
          }
        }
      }

      for (let i=0; i<data.obstacles.length; i++) {
        data.obstacles[i].x -= 6;
        if (data.obstacles[i].x + data.obstacles[i].width < 0) { data.obstacles.splice(i,1); i--; continue; }
        const obs = data.obstacles[i];
        if (data.player.x < obs.x+obs.width && data.player.x+data.player.width > obs.x &&
            data.player.y < obs.y+obs.height && data.player.y+data.player.height > obs.y) {
          setGameOver(true); setGameRunning(false); playSound('explosion'); setJustFinished(true);
          if (data.score > highScore) setHighScore(data.score);
          return;
        }
      }

      for (let i=0; i<data.coins.length; i++) {
        data.coins[i].x -= 6;
        if (data.coins[i].x + data.coins[i].width < 0) { data.coins.splice(i,1); i--; continue; }
        const coin = data.coins[i];
        if (data.player.x < coin.x+coin.width && data.player.x+data.player.width > coin.x &&
            data.player.y < coin.y+coin.height && data.player.y+data.player.height > coin.y) {
          data.coins.splice(i,1);
          data.score += 10;
          setScore(data.score);
          playSound('coin');
          for (let p=0;p<5;p++) addParticle(coin.x+6, coin.y+6);
          i--;
        }
      }

      for (let i=0; i<data.particles.length; i++) {
        data.particles[i].x += data.particles[i].vx;
        data.particles[i].y += data.particles[i].vy;
        data.particles[i].life--;
        if (data.particles[i].life <= 0) data.particles.splice(i,1);
      }
      data.frame++;
    }

    function draw() {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      const grad = ctx.createLinearGradient(0,0,0,groundY);
      grad.addColorStop(0,'#0a0a2a'); grad.addColorStop(1,'#1a2a4a');
      ctx.fillStyle = grad; ctx.fillRect(0,0,canvas.width,groundY);
      
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      for (let c of data.clouds) {
        ctx.beginPath(); ctx.arc(c.x,c.y,c.size*0.6,0,2*Math.PI);
        ctx.arc(c.x+c.size*0.4,c.y-c.size*0.2,c.size*0.5,0,2*Math.PI);
        ctx.arc(c.x-c.size*0.4,c.y-c.size*0.2,c.size*0.5,0,2*Math.PI);
        ctx.fill();
      }
      ctx.fillStyle = '#444';
      for (let b of data.birds) {
        const wing = Math.sin(b.flap)*10;
        ctx.beginPath(); ctx.moveTo(b.x,b.y); ctx.lineTo(b.x-15,b.y+5+wing); ctx.lineTo(b.x-8,b.y); ctx.lineTo(b.x-15,b.y-5-wing); ctx.fill();
      }
      const gradGround = ctx.createLinearGradient(0,groundY,0,canvas.height);
      gradGround.addColorStop(0,'#2d5a1e'); gradGround.addColorStop(1,'#1a3a10');
      ctx.fillStyle = gradGround; ctx.fillRect(0, groundY, canvas.width, canvas.height-groundY);
      ctx.fillStyle = '#8B5A2B'; ctx.fillRect(0, groundY, canvas.width, 5);
      ctx.fillStyle = '#4CAF50';
      for (let g of data.grassPatches) { ctx.fillRect(g.x % canvas.width, groundY-6, g.size, 6); }
      for (let coin of data.coins) {
        ctx.shadowBlur = 10; ctx.shadowColor = 'gold';
        ctx.fillStyle = '#FFD700'; ctx.beginPath(); ctx.arc(coin.x+6, coin.y+6, 8, 0, 2*Math.PI); ctx.fill();
        ctx.fillStyle = '#FFA500'; ctx.beginPath(); ctx.arc(coin.x+6, coin.y+6, 4, 0, 2*Math.PI); ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.fillStyle = '#8B0000';
      for (let obs of data.obstacles) {
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        ctx.fillStyle = '#5a0000'; ctx.fillRect(obs.x+5, obs.y-5, obs.width-10, 5);
        ctx.fillStyle = '#8B0000';
      }
      for (let e of data.enemies) {
        ctx.fillStyle = '#6a0dad'; ctx.fillRect(e.x, e.y, e.width, e.height);
        ctx.fillStyle = '#ffcc00'; ctx.fillRect(e.x+5, e.y+10, 5, 5); ctx.fillRect(e.x+15, e.y+10, 5, 5);
      }
      ctx.fillStyle = '#ff6600';
      for (let b of data.enemyBullets) ctx.fillRect(b.x, b.y, b.width, b.height);
      ctx.fillStyle = '#00ff00';
      for (let b of data.playerBullets) ctx.fillRect(b.x, b.y, b.width, b.height);
      for (let p of data.particles) { ctx.fillStyle = `rgba(255,200,0,${p.life/20})`; ctx.fillRect(p.x, p.y, 3, 3); }
      ctx.fillStyle = '#00bfff'; ctx.fillRect(data.player.x, data.player.y, data.player.width, data.player.height);
      ctx.fillStyle = '#0088cc'; ctx.fillRect(data.player.x+5, data.player.y-10, 20, 10);
      ctx.fillStyle = 'white'; ctx.fillRect(data.player.x+20, data.player.y+8, 5, 5); ctx.fillRect(data.player.x+8, data.player.y+8, 5, 5);
      ctx.fillStyle = '#ff4444'; ctx.fillRect(data.player.x-8, data.player.y+10, 8, 15);
      ctx.fillStyle = 'white'; ctx.font = 'bold 24px Arial'; ctx.fillText(`🏆 ${data.score}`, 10, 40);
      ctx.fillStyle = 'gold'; ctx.font = 'bold 16px Arial'; ctx.fillText(`High: ${highScore}`, 10, 70);
      ctx.fillStyle = 'white'; ctx.font = '12px Arial'; ctx.fillText('← Tap left to Jump | Tap right to Shoot →', canvas.width/2-150, 25);
    }

    function loop() { if (gameRunning) { update(); draw(); animId = requestAnimationFrame(loop); } }
    loop();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKey);
      canvas.removeEventListener('touchstart', handleTouch);
    };
  }, [gameRunning, highScore]);

  const startGame = () => {
    setGameOver(false); setScore(0); setGameRunning(true); setJustFinished(false);
    const data = gameDataRef.current;
    data.player = { x: 50, y: groundY - 30, width: 30, height: 30, isJumping: false, yVelocity: 0 };
    data.obstacles = []; data.coins = []; data.enemies = []; data.enemyBullets = []; data.playerBullets = []; data.particles = [];
    data.frame = 0; data.score = 0; data.shootCooldown = 0;
  };

  return (
    <div ref={elementRef} className="w-full h-full min-h-[500px] bg-gradient-to-b from-gray-900 to-black rounded-xl p-4">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h2 className="text-2xl font-bold text-cyan-400">Endless Runner</h2>
        <div className="flex gap-2">
          <button onClick={()=>setShowInstructions(!showInstructions)} className="bg-gray-600 text-white px-3 py-1 rounded">Instructions</button>
          <button onClick={()=>setShowLeaderboard(!showLeaderboard)} className="bg-green-600 text-white px-3 py-1 rounded">Leaderboard</button>
          <button onClick={toggleFullscreen} className="bg-purple-600 text-white px-3 py-1 rounded">Fullscreen</button>
        </div>
      </div>
      {showInstructions && (
        <div className="bg-gray-800 p-4 rounded-lg mb-4 text-sm">
          <h3 className="font-bold mb-2 text-cyan-300">How to Play</h3>
          <ul className="list-disc list-inside"><li>🖱️ <strong>Tap left side</strong> to jump | <strong>Tap right side</strong> to shoot</li><li>💣 <strong>Space</strong> = Jump | <strong>F</strong> = Shoot</li><li>💰 Collect coins (+10) | Kill enemies (+20)</li><li>Avoid red spikes and purple enemy bullets</li><li>High score saved locally</li></ul>
        </div>
      )}
      {showLeaderboard && (
        <div className="bg-gray-800 p-4 rounded-lg mb-4 shadow">
          <h3 className="font-bold text-lg mb-2 text-cyan-300">🏆 Top Scores</h3>
          <table className="w-full text-sm"><thead><tr><th>Rank</th><th>Nickname</th><th>Score</th><th>Date</th></tr></thead>
          <tbody>{leaderboard.map((e,i)=> <tr key={i} className={i===0?'bg-yellow-900':''}><td className="text-center">{i+1}</td><td>{e.nickname}</td><td className="text-center">{e.score}</td><td className="text-center text-xs">{e.date}</td></tr>)}</tbody></table>
          <button onClick={()=>setShowLeaderboard(false)} className="mt-2 bg-gray-500 px-2 py-1 rounded text-sm">Close</button>
        </div>
      )}
      {!gameRunning && !gameOver && <button onClick={startGame} className="mb-4 bg-green-600 text-white px-6 py-2 rounded-lg">🚀 Start Game</button>}
      {gameOver && justFinished && (
        <div className="mb-4 p-4 bg-red-800 rounded-lg text-center">
          <p className="text-red-200 font-bold text-xl">Game Over! Score: {score}</p>
          <div className="mt-2"><input type="text" value={nickname} onChange={(e)=>setNickname(e.target.value)} className="border rounded px-2 py-1 bg-gray-700 text-white" placeholder="Your nickname" />
          <button onClick={()=>{ saveScoreToLeaderboard(score); setJustFinished(false); }} className="ml-2 bg-blue-600 px-3 py-1 rounded">Submit</button>
          <button onClick={()=>setJustFinished(false)} className="ml-2 bg-gray-500 px-3 py-1 rounded">Skip</button></div>
          <button onClick={startGame} className="mt-2 bg-blue-600 px-4 py-2 rounded">Play Again</button>
        </div>
      )}
      <canvas ref={canvasRef} width={800} height={300} className="border border-gray-600 rounded-lg shadow-md w-full" style={{ maxWidth: '100%', height: 'auto' }} />
      
      {/* Banner ad space below the game */}
      <div className="mt-4 p-2 bg-gray-800 rounded-lg text-center text-gray-400 text-sm border border-gray-700">
        <span className="text-xs text-gray-500">ADVERTISEMENT</span>
        <div className="mt-1">
          {/* Your banner ad code here (e.g., Google AdSense) */}
          <div className="bg-gray-700 h-20 flex items-center justify-center rounded">Banner Ad Space</div>
        </div>
      </div>
    </div>
  );
}