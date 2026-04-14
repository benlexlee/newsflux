import { useState, useEffect, useRef } from 'react';
import { useFullscreen } from '../../hooks/useFullscreen';

function generateBoard() {
  const board = Array(9).fill().map(() => Array(9).fill(null));
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = 0; i < 9; i++) {
    const r = Math.floor(Math.random() * nums.length);
    board[0][i] = nums[r];
    nums.splice(r, 1);
  }
  for (let i = 1; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      board[i][j] = ((board[i - 1][j] + i) % 9) + 1;
    }
  }
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (Math.random() > 0.55) board[i][j] = null;
    }
  }
  return board;
}

function isValid(board, row, col, num) {
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num || board[i][col] === num) return false;
  }
  const br = Math.floor(row / 3) * 3;
  const bc = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[br + i][bc + j] === num) return false;
    }
  }
  return true;
}

export default function Sudoku() {
  const [board, setBoard] = useState(null);
  const [message, setMessage] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);
  const [time, setTime] = useState(0);
  const [bestTime, setBestTime] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [nickname, setNickname] = useState('');
  const [justCompleted, setJustCompleted] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const timerRef = useRef(null);
  const { elementRef, toggleFullscreen } = useFullscreen();

  useEffect(() => {
    const savedBest = localStorage.getItem('sudokuBestTime');
    if (savedBest) setBestTime(parseFloat(savedBest));
    const savedLeaderboard = localStorage.getItem('sudokuLeaderboard');
    if (savedLeaderboard) setLeaderboard(JSON.parse(savedLeaderboard));
    setBoard(generateBoard());
  }, []);

  useEffect(() => {
    if (gameStarted && !justCompleted) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => setTime(prev => prev + 0.1), 100);
    } else if (!gameStarted || justCompleted) {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameStarted, justCompleted]);

  useEffect(() => {
    if (board && gameStarted && !justCompleted) {
      const complete = board.every(row => row.every(cell => cell !== null));
      if (complete) {
        if (timerRef.current) clearInterval(timerRef.current);
        setJustCompleted(true);
        setMessage(`🎉 Solved in ${time.toFixed(1)} seconds! 🎉`);
        if (bestTime === null || time < bestTime) {
          setBestTime(time);
          localStorage.setItem('sudokuBestTime', time);
        }
      }
    }
  }, [board, gameStarted, justCompleted, time, bestTime]);

  const submitLeaderboard = () => {
    if (nickname.trim() && time) {
      const newEntry = { nickname: nickname.trim(), time, date: new Date().toLocaleDateString() };
      const newLeaderboard = [...leaderboard, newEntry].sort((a, b) => a.time - b.time).slice(0, 5);
      setLeaderboard(newLeaderboard);
      localStorage.setItem('sudokuLeaderboard', JSON.stringify(newLeaderboard));
      setNickname('');
      setJustCompleted(false);
      setMessage('');
    }
  };

  const playSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.value = 880;
      gain.gain.value = 0.1;
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.1);
      osc.stop(audioCtx.currentTime + 0.1);
    } catch (e) {}
  };

  const handleCellChange = (row, col, val) => {
    if (justCompleted) return;
    if (!gameStarted && val) setGameStarted(true);
    const newBoard = board.map(r => [...r]);
    const num = val === '' ? null : parseInt(val);
    if (num && !isValid(board, row, col, num)) {
      setMessage('Invalid move! Number already in row/column/box.');
      setTimeout(() => setMessage(''), 1500);
      return;
    }
    newBoard[row][col] = num;
    setBoard(newBoard);
    if (num) playSound();
    setMessage('');
  };

  const resetGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const newBoard = generateBoard();
    setBoard(newBoard);
    setGameStarted(false);
    setTime(0);
    setJustCompleted(false);
    setMessage('');
  };

  if (!board) return <div className="text-center py-10">Loading puzzle...</div>;

  return (
    <div ref={elementRef} className="w-full h-full min-h-[500px] bg-gray-900/50 rounded-xl p-4">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h2 className="text-2xl font-bold">Sudoku</h2>
        <div className="flex gap-2">
          <button onClick={() => setShowInstructions(!showInstructions)} className="bg-gray-600 text-white px-3 py-1 rounded">Instructions</button>
          <button onClick={() => setShowLeaderboard(!showLeaderboard)} className="bg-green-600 text-white px-3 py-1 rounded">Leaderboard</button>
          <button onClick={toggleFullscreen} className="bg-purple-600 text-white px-3 py-1 rounded">Fullscreen</button>
          <button onClick={resetGame} className="bg-blue-600 text-white px-3 py-1 rounded">New Game</button>
        </div>
      </div>
      {showInstructions && (
        <div className="bg-gray-800 p-4 rounded-lg mb-4 text-sm">
          <h3 className="font-bold mb-2">How to Play Sudoku</h3>
          <ul className="list-disc list-inside">
            <li>Fill empty cells with numbers 1-9.</li>
            <li>Each row, column, and 3x3 box must contain all numbers 1-9 without repeats.</li>
            <li>Timer starts on first entry.</li>
          </ul>
        </div>
      )}
      {showLeaderboard && (
        <div className="bg-gray-800 p-4 rounded-lg mb-4 shadow">
          <h3 className="font-bold text-lg mb-2">🏆 Fastest Sudoku Times</h3>
          <table className="w-full text-sm">
            <thead>
              <tr><th>Rank</th><th>Nickname</th><th>Time (sec)</th><th>Date</th></tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, idx) => (
                <tr key={idx} className={idx === 0 ? 'bg-yellow-900' : ''}>
                  <td className="text-center">{idx + 1}</td>
                  <td>{entry.nickname}</td>
                  <td className="text-center">{entry.time.toFixed(1)}</td>
                  <td className="text-center text-xs">{entry.date}</td>
                </tr>
              ))}
              {leaderboard.length === 0 && (
                <tr><td colSpan="4" className="text-center text-gray-500">No times yet. Solve a puzzle!</td></tr>
              )}
            </tbody>
          </table>
          <button onClick={() => setShowLeaderboard(false)} className="mt-2 bg-gray-500 text-white px-2 py-1 rounded text-sm">Close</button>
        </div>
      )}
      <div className="text-center text-sm mb-2">
        ⏱️ Time: {time.toFixed(1)} sec {bestTime && <span className="text-green-400 ml-2">🏆 Best: {bestTime.toFixed(1)}</span>}
      </div>
      {message && <div className="mb-4 p-3 bg-green-800 text-green-200 rounded-lg text-center">{message}</div>}
      {justCompleted && (
        <div className="mb-4 p-4 bg-yellow-800 rounded-lg text-center">
          <p className="text-green-400 font-bold text-xl">You solved it in {time.toFixed(1)} seconds! 🎉</p>
          <div className="mt-2">
            <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} className="border rounded px-2 py-1 bg-gray-700 text-white" placeholder="Your name" />
            <button onClick={submitLeaderboard} className="ml-2 bg-blue-600 text-white px-3 py-1 rounded">Save</button>
            <button onClick={() => setJustCompleted(false)} className="ml-2 bg-gray-500 text-white px-3 py-1 rounded">Skip</button>
          </div>
        </div>
      )}
      <div className="overflow-x-auto flex justify-center">
        <table className="border-collapse">
          <tbody>
            {board.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j} className={`border border-gray-500 ${(i + 1) % 3 === 0 && i !== 8 ? 'border-b-4' : ''} ${(j + 1) % 3 === 0 && j !== 8 ? 'border-r-4' : ''}`}>
                    <input
                      type="number"
                      min="1"
                      max="9"
                      value={cell || ''}
                      onChange={(e) => handleCellChange(i, j, e.target.value)}
                      className="w-12 h-12 text-center text-xl focus:outline-none focus:bg-blue-900 bg-gray-800 text-white"
                      disabled={cell !== null || justCompleted}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}