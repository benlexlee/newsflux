import { useState, useEffect, useRef } from 'react';
import { useFullscreen } from '../../hooks/useFullscreen';
import { sounds } from '../../lib/sounds';
import { getAdCodes } from '../../lib/ads';
import GameInterstitialAd from '../ads/GameInterstitialAd';

const initialBoard = [
  ['r','n','b','q','k','b','n','r'],
  ['p','p','p','p','p','p','p','p'],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['P','P','P','P','P','P','P','P'],
  ['R','N','B','Q','K','B','N','R']
];

const pieceSymbol = {
  'r':'♜','n':'♞','b':'♝','q':'♛','k':'♚','p':'♟',
  'R':'♖','N':'♘','B':'♗','Q':'♕','K':'♔','P':'♙'
};

export default function ChessGame() {
  const [board, setBoard] = useState(initialBoard.map(row => [...row]));
  const [turn, setTurn] = useState('white');
  const [selected, setSelected] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [difficulty, setDifficulty] = useState('easy');
  const [showInstructions, setShowInstructions] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [time, setTime] = useState(0);
  const [bestTime, setBestTime] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [nickname, setNickname] = useState('');
  const [justWon, setJustWon] = useState(false);
  const [globalScores, setGlobalScores] = useState([]);
  const [showGlobal, setShowGlobal] = useState(false);
  const [showReplayAd, setShowReplayAd] = useState(false);
  const [adCode, setAdCode] = useState('');
  const timerRef = useRef(null);
  const { elementRef, toggleFullscreen } = useFullscreen();

  useEffect(() => {
    const savedBest = localStorage.getItem('chessBestTime');
    if (savedBest) setBestTime(parseFloat(savedBest));
    const savedLeaderboard = localStorage.getItem('chessLeaderboard');
    if (savedLeaderboard) setLeaderboard(JSON.parse(savedLeaderboard));
    fetchGlobalScores();
    getAdCodes().then(codes => setAdCode(codes.interstitialAdCode));
  }, []);

  const fetchGlobalScores = async () => {
    try {
      const res = await fetch('/api/scores?game=chess&limit=10');
      const data = await res.json();
      setGlobalScores(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (gameStarted && !gameOver) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => setTime(prev => prev + 0.1), 100);
    } else if (!gameStarted || gameOver) {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameStarted, gameOver]);

  useEffect(() => {
    if (gameOver && winner === 'white' && time > 0 && !justWon) {
      setJustWon(true);
      sounds.playWin();
      if (bestTime === null || time < bestTime) {
        setBestTime(time);
        localStorage.setItem('chessBestTime', time);
      }
    } else if (gameOver && winner === 'black') {
      sounds.playGameOver();
    }
  }, [gameOver, winner, time, bestTime, justWon]);

  const submitLocalScore = () => {
    if (nickname.trim() && winner === 'white' && time) {
      const newEntry = { nickname: nickname.trim(), time, date: new Date().toLocaleDateString() };
      const newLeaderboard = [...leaderboard, newEntry].sort((a,b) => a.time - b.time).slice(0,5);
      setLeaderboard(newLeaderboard);
      localStorage.setItem('chessLeaderboard', JSON.stringify(newLeaderboard));
      setNickname('');
      setJustWon(false);
    }
  };

  const submitGlobalScore = async () => {
    if (!nickname.trim()) return;
    try {
      await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game: 'chess', nickname: nickname.trim(), score: 0, time: time }),
      });
      fetchGlobalScores();
      setJustWon(false);
      setNickname('');
    } catch (err) { console.error(err); }
  };

  // Move validation and AI (same as before – keep your working logic)
  const isValidMove = (fromRow, fromCol, toRow, toCol, piece, boardState) => {
    const pieceType = piece.toLowerCase();
    const deltaRow = toRow - fromRow;
    const deltaCol = toCol - fromCol;
    const targetPiece = boardState[toRow][toCol];
    if (targetPiece && ((piece === piece.toUpperCase() && targetPiece === targetPiece.toUpperCase()) ||
        (piece === piece.toLowerCase() && targetPiece === targetPiece.toLowerCase()))) return false;
    switch(pieceType) {
      case 'p':
        const dir = piece === 'P' ? -1 : 1;
        if (deltaCol === 0 && deltaRow === dir && !targetPiece) return true;
        if (deltaCol === 0 && deltaRow === dir*2 && !targetPiece && 
            ((piece === 'P' && fromRow === 6) || (piece === 'p' && fromRow === 1))) return true;
        if (Math.abs(deltaCol) === 1 && deltaRow === dir && targetPiece) return true;
        return false;
      case 'r': return fromRow === toRow || fromCol === toCol;
      case 'n': return (Math.abs(deltaRow)===2 && Math.abs(deltaCol)===1) || (Math.abs(deltaRow)===1 && Math.abs(deltaCol)===2);
      case 'b': return Math.abs(deltaRow) === Math.abs(deltaCol);
      case 'q': return (fromRow===toRow || fromCol===toCol || Math.abs(deltaRow)===Math.abs(deltaCol));
      case 'k': return Math.abs(deltaRow)<=1 && Math.abs(deltaCol)<=1;
      default: return false;
    }
  };

  const getAllMoves = (boardState, color) => {
    const moves = [];
    for (let i=0;i<8;i++) for (let j=0;j<8;j++) {
      const piece = boardState[i][j];
      if (piece && ((color==='white' && piece===piece.toUpperCase()) || (color==='black' && piece===piece.toLowerCase()))) {
        for (let ti=0;ti<8;ti++) for (let tj=0;tj<8;tj++) {
          if (isValidMove(i,j,ti,tj,piece,boardState)) moves.push({ from: [i,j], to: [ti,tj], piece, capture: !!boardState[ti][tj] });
        }
      }
    }
    return moves;
  };

  const makeAIMove = () => {
    if (gameOver || turn !== 'black') return;
    const moves = getAllMoves(board, 'black');
    if (moves.length === 0) { setGameOver(true); setWinner('white'); sounds.playWin(); return; }
    let selectedMove;
    if (difficulty === 'easy') selectedMove = moves[Math.floor(Math.random() * moves.length)];
    else if (difficulty === 'medium') {
      const captures = moves.filter(m => m.capture);
      selectedMove = captures.length ? captures[Math.floor(Math.random() * captures.length)] : moves[Math.floor(Math.random() * moves.length)];
    } else {
      const captures = moves.filter(m => m.capture);
      const centerMoves = moves.filter(m => (m.to[0]>=2 && m.to[0]<=5 && m.to[1]>=2 && m.to[1]<=5));
      if (captures.length) selectedMove = captures[Math.floor(Math.random() * captures.length)];
      else if (centerMoves.length) selectedMove = centerMoves[Math.floor(Math.random() * centerMoves.length)];
      else selectedMove = moves[Math.floor(Math.random() * moves.length)];
    }
    if (selectedMove) {
      const newBoard = board.map(row=>[...row]);
      const wasCapture = !!newBoard[selectedMove.to[0]][selectedMove.to[1]];
      newBoard[selectedMove.to[0]][selectedMove.to[1]] = newBoard[selectedMove.from[0]][selectedMove.from[1]];
      newBoard[selectedMove.from[0]][selectedMove.from[1]] = '';
      setBoard(newBoard);
      setTurn('white');
      if (wasCapture) sounds.playCapture(); else sounds.playMove();
      const whiteMoves = getAllMoves(newBoard, 'white');
      if (whiteMoves.length === 0) { setGameOver(true); setWinner('black'); sounds.playGameOver(); }
    }
  };

  useEffect(() => {
    if (turn === 'black' && !gameOver && gameStarted) {
      const timer = setTimeout(() => makeAIMove(), 300);
      return () => clearTimeout(timer);
    }
  }, [turn, board, gameOver, gameStarted]);

  const handleSquareClick = (row, col) => {
    if (gameOver || turn !== 'white') return;
    if (selected === null) {
      const piece = board[row][col];
      if (piece && piece === piece.toUpperCase()) setSelected({ row, col });
    } else {
      const piece = board[selected.row][selected.col];
      if (isValidMove(selected.row, selected.col, row, col, piece, board)) {
        if (!gameStarted) setGameStarted(true);
        const newBoard = board.map(r=>[...r]);
        const wasCapture = !!newBoard[row][col];
        newBoard[row][col] = piece;
        newBoard[selected.row][selected.col] = '';
        setBoard(newBoard);
        setSelected(null);
        setTurn('black');
        if (wasCapture) sounds.playCapture(); else sounds.playMove();
        const blackMoves = getAllMoves(newBoard, 'black');
        if (blackMoves.length === 0) { setGameOver(true); setWinner('white'); sounds.playWin(); }
      } else {
        setSelected(null);
      }
    }
  };

  const resetGame = () => {
    setBoard(initialBoard.map(row=>[...row]));
    setTurn('white');
    setSelected(null);
    setGameOver(false);
    setWinner(null);
    setGameStarted(false);
    setTime(0);
    setJustWon(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handlePlayAgain = () => {
    if (adCode) {
      setShowReplayAd(true);
    } else {
      resetGame();
    }
  };

  const onAdClose = () => {
    setShowReplayAd(false);
    resetGame();
  };

  return (
    <div ref={elementRef} className="w-full h-full min-h-[500px] bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4">
      {showReplayAd && <GameInterstitialAd adCode={adCode} onClose={onAdClose} />}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h2 className="text-2xl font-bold text-amber-400">♔ Chess</h2>
        <div className="flex gap-2">
          <select value={difficulty} onChange={(e)=>setDifficulty(e.target.value)} className="border rounded px-2 py-1 bg-gray-700 text-white">
            <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
          </select>
          <button onClick={()=>setShowInstructions(!showInstructions)} className="bg-gray-600 text-white px-3 py-1 rounded">Instructions</button>
          <button onClick={()=>setShowLeaderboard(!showLeaderboard)} className="bg-green-600 text-white px-3 py-1 rounded">Local</button>
          <button onClick={()=>setShowGlobal(!showGlobal)} className="bg-blue-600 text-white px-3 py-1 rounded">🌍 Global</button>
          <button onClick={toggleFullscreen} className="bg-purple-600 text-white px-3 py-1 rounded">Fullscreen</button>
          <button onClick={resetGame} className="bg-red-600 text-white px-3 py-1 rounded">New Game</button>
        </div>
      </div>
      {/* rest of the UI same as before – use your existing render code */}
      {showInstructions && (<div className="bg-gray-700 p-4 rounded-lg mb-4 text-sm">...</div>)}
      {showLeaderboard && (<div>...</div>)}
      {showGlobal && (<div>...</div>)}
      <div>Turn: {turn==='white'?'You (White)':'Computer (Black)'}</div>
      <div>⏱️ Time: {time.toFixed(1)} sec {bestTime && <span>🏆 Best: {bestTime.toFixed(1)}</span>}</div>
      {gameOver && (
        <div>
          <p>{winner==='white' ? 'You win!' : 'Computer wins!'}</p>
          {winner==='white' && justWon && (<div><input value={nickname} onChange={e=>setNickname(e.target.value)} placeholder="Name" /><button onClick={submitLocalScore}>Save Local</button><button onClick={submitGlobalScore}>🌍 Save Global</button></div>)}
          <button onClick={handlePlayAgain}>Play Again</button>
        </div>
      )}
      <div className="flex justify-center">
        <div className="inline-block border-2 border-amber-600 rounded-lg overflow-hidden shadow-2xl">
          {board.map((row,i)=>(
            <div key={i} className="flex">
              {row.map((piece,j)=>{
                const isDark = (i+j)%2===1;
                const isSelected = selected && selected.row===i && selected.col===j;
                return (
                  <div key={j} onClick={()=>handleSquareClick(i,j)} className={`w-16 h-16 flex items-center justify-center text-4xl cursor-pointer transition-all transform hover:scale-105 ${isDark?'bg-amber-800':'bg-amber-100'} ${isSelected?'ring-4 ring-yellow-400 scale-105 shadow-lg':''}`}>
                    {piece && <span className={piece===piece.toUpperCase()?'text-white drop-shadow-md':'text-black'}>{pieceSymbol[piece]}</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}