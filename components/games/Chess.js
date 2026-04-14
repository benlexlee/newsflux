import { useState, useEffect, useRef } from 'react';
import { useFullscreen } from '../../hooks/useFullscreen';

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
  const [board, setBoard] = useState(initialBoard.map(row=>[...row]));
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
  const timerRef = useRef(null);
  const { elementRef, toggleFullscreen } = useFullscreen();

  useEffect(() => {
    const savedBest = localStorage.getItem('chessBestTime');
    if (savedBest) setBestTime(parseFloat(savedBest));
    const savedLeaderboard = localStorage.getItem('chessLeaderboard');
    if (savedLeaderboard) setLeaderboard(JSON.parse(savedLeaderboard));
  }, []);

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
      if (bestTime === null || time < bestTime) {
        setBestTime(time);
        localStorage.setItem('chessBestTime', time);
      }
    }
  }, [gameOver, winner, time, bestTime, justWon]);

  const submitLeaderboard = () => {
    if (nickname.trim() && winner === 'white' && time) {
      const newEntry = { nickname: nickname.trim(), time, date: new Date().toLocaleDateString() };
      const newLeaderboard = [...leaderboard, newEntry].sort((a,b) => a.time - b.time).slice(0,5);
      setLeaderboard(newLeaderboard);
      localStorage.setItem('chessLeaderboard', JSON.stringify(newLeaderboard));
      setNickname('');
      setJustWon(false);
    }
  };

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
    for (let i=0;i<8;i++) {
      for (let j=0;j<8;j++) {
        const piece = boardState[i][j];
        if (piece && ((color==='white' && piece===piece.toUpperCase()) || (color==='black' && piece===piece.toLowerCase()))) {
          for (let ti=0;ti<8;ti++) {
            for (let tj=0;tj<8;tj++) {
              if (isValidMove(i,j,ti,tj,piece,boardState)) {
                moves.push({ from: [i,j], to: [ti,tj], piece, capture: !!boardState[ti][tj] });
              }
            }
          }
        }
      }
    }
    return moves;
  };

  const playSound = (type) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.type = 'sine';
      if (type === 'move') { osc.frequency.value=440; gain.gain.value=0.1; osc.start(); gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime+0.2); osc.stop(audioCtx.currentTime+0.2); }
      else if (type === 'capture') { osc.frequency.value=220; gain.gain.value=0.15; osc.start(); gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime+0.3); osc.stop(audioCtx.currentTime+0.3); }
      else if (type === 'gameover') { osc.frequency.value=110; gain.gain.value=0.2; osc.start(); gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime+0.8); osc.stop(audioCtx.currentTime+0.8); }
    } catch(e) {}
  };

  const makeAIMove = () => {
    if (gameOver || turn !== 'black') return;
    const moves = getAllMoves(board, 'black');
    if (moves.length === 0) {
      setGameOver(true);
      setWinner('white');
      playSound('gameover');
      return;
    }
    let selectedMove;
    if (difficulty === 'easy') {
      selectedMove = moves[Math.floor(Math.random() * moves.length)];
    } else if (difficulty === 'medium') {
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
      if (wasCapture) playSound('capture'); else playSound('move');
      const whiteMoves = getAllMoves(newBoard, 'white');
      if (whiteMoves.length === 0) {
        setGameOver(true);
        setWinner('black');
        playSound('gameover');
      }
    }
  };

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
        if (wasCapture) playSound('capture'); else playSound('move');
        const blackMoves = getAllMoves(newBoard, 'black');
        if (blackMoves.length === 0) {
          setGameOver(true);
          setWinner('white');
          playSound('gameover');
        } else {
          setTimeout(() => makeAIMove(), 300);
        }
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

  return (
    <div ref={elementRef} className="w-full h-full min-h-[500px] bg-gray-900/50 rounded-xl p-4">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h2 className="text-2xl font-bold">Chess</h2>
        <div className="flex gap-2">
          <select value={difficulty} onChange={(e)=>setDifficulty(e.target.value)} className="border rounded px-2 py-1 bg-gray-800 text-white">
            <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
          </select>
          <button onClick={()=>setShowInstructions(!showInstructions)} className="bg-gray-600 text-white px-3 py-1 rounded">Instructions</button>
          <button onClick={()=>setShowLeaderboard(!showLeaderboard)} className="bg-green-600 text-white px-3 py-1 rounded">Leaderboard</button>
          <button onClick={toggleFullscreen} className="bg-purple-600 text-white px-3 py-1 rounded">Fullscreen</button>
          <button onClick={resetGame} className="bg-blue-600 text-white px-3 py-1 rounded">New Game</button>
        </div>
      </div>
      {showInstructions && (
        <div className="bg-gray-800 p-4 rounded-lg mb-4 text-sm">
          <h3 className="font-bold mb-2">How to Play Chess</h3>
          <ul className="list-disc list-inside"><li>Click a white piece, then click a square to move it.</li><li>White moves first. Computer plays black.</li><li>Timer starts on your first move.</li></ul>
        </div>
      )}
      {showLeaderboard && (
        <div className="bg-gray-800 p-4 rounded-lg mb-4 shadow">
          <h3 className="font-bold text-lg mb-2">🏆 Fastest Wins</h3>
          <table className="w-full text-sm">
            <thead><tr><th>Rank</th><th>Nickname</th><th>Time (sec)</th><th>Date</th></tr></thead>
            <tbody>
              {leaderboard.map((entry, idx) => (
                <tr key={idx} className={idx===0?'bg-yellow-900':''}>
                  <td className="text-center">{idx+1}</td>
                  <td>{entry.nickname}</td>
                  <td className="text-center">{entry.time.toFixed(1)}</td>
                  <td className="text-center text-xs">{entry.date}</td>
                </tr>
              ))}
              {leaderboard.length===0 && <tr><td colSpan="4" className="text-center text-gray-500">No times yet. Win a game!</td></tr>}
            </tbody>
          </table>
          <button onClick={()=>setShowLeaderboard(false)} className="mt-2 bg-gray-500 text-white px-2 py-1 rounded text-sm">Close</button>
        </div>
      )}
      <div className="text-center mb-2 font-semibold">Turn: {turn==='white'?'You (White)':'Computer (Black)'}</div>
      <div className="text-center text-sm mb-2">⏱️ Time: {time.toFixed(1)} sec {bestTime && <span className="text-green-400 ml-2">🏆 Best: {bestTime.toFixed(1)}</span>}</div>
      {gameOver && (
        <div className="bg-yellow-800 p-3 rounded-lg mb-4 text-center">
          <p className="text-green-400 font-bold text-xl">Game Over! {winner==='white'?'You win! 🎉':'Computer wins! 🤖'} {winner==='white' && `Time: ${time.toFixed(1)}s`}</p>
          {winner==='white' && justWon && (
            <div className="mt-2">
              <input type="text" value={nickname} onChange={(e)=>setNickname(e.target.value)} className="border rounded px-2 py-1 bg-gray-700 text-white" placeholder="Your name" />
              <button onClick={submitLeaderboard} className="ml-2 bg-blue-600 text-white px-3 py-1 rounded">Save</button>
              <button onClick={()=>setJustWon(false)} className="ml-2 bg-gray-500 text-white px-3 py-1 rounded">Skip</button>
            </div>
          )}
          <button onClick={resetGame} className="mt-2 bg-blue-600 text-white px-3 py-1 rounded">Play Again</button>
        </div>
      )}
      <div className="flex justify-center">
        <div className="inline-block border-2 border-gray-600 rounded-lg overflow-hidden shadow-lg">
          {board.map((row,i)=>(
            <div key={i} className="flex">
              {row.map((piece,j)=>{
                const isDark = (i+j)%2===1;
                const isSelected = selected && selected.row===i && selected.col===j;
                return (
                  <div key={j} onClick={()=>handleSquareClick(i,j)} className={`w-16 h-16 flex items-center justify-center text-4xl cursor-pointer transition-all ${isDark?'bg-amber-800':'bg-amber-100'} ${isSelected?'ring-4 ring-yellow-400 scale-105':''} hover:brightness-95`}>
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