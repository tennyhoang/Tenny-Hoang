import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { BASE_URL } from '@/api/client';
import confetti from 'canvas-confetti';

const PALETTE = [
  '#7C3AED','#EC4899','#F59E0B','#10B981',
  '#3B82F6','#EF4444','#8B5CF6','#14B8A6',
  '#F97316','#06B6D4','#84CC16','#E879F9',
  '#DC2626','#059669','#2563EB','#D97706',
];

function WheelSVG({ entries, rotation, spinning }) {
  const size = 480;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 6;
  if (!entries.length) return null;
  const segAngle = 360 / entries.length;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-full pointer-events-none"
        style={{ boxShadow: '0 0 60px rgba(124,58,237,0.4), 0 0 120px rgba(124,58,237,0.15)', borderRadius: '50%' }}/>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 z-20 drop-shadow-lg">
        <svg width="28" height="36" viewBox="0 0 28 36">
          <polygon points="14,34 1,2 27,2" fill="#FFD700" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5"/>
        </svg>
      </div>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
        style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? 'transform 5s cubic-bezier(0.17,0.67,0.12,0.99)' : 'none', willChange: 'transform' }}>
        <defs>
          {entries.map((e, i) => (
            <radialGradient key={i} id={`g${i}`} cx="60%" cy="35%">
              <stop offset="0%" stopColor={e.color} stopOpacity="1"/>
              <stop offset="100%" stopColor={e.color} stopOpacity="0.72"/>
            </radialGradient>
          ))}
        </defs>
        {entries.map((entry, i) => {
          const start = i * segAngle - 90;
          const end = (i + 1) * segAngle - 90;
          const s = (a) => [cx + r * Math.cos(a * Math.PI / 180), cy + r * Math.sin(a * Math.PI / 180)];
          const [x1, y1] = s(start);
          const [x2, y2] = s(end);
          const mid = start + segAngle / 2;
          const tr = r * 0.64;
          const [tx, ty] = [cx + tr * Math.cos(mid * Math.PI / 180), cy + tr * Math.sin(mid * Math.PI / 180)];
          const la = segAngle > 180 ? 1 : 0;
          const lbl = entry.isMystery ? '???' : (entry.label.length > 15 ? entry.label.slice(0, 13) + '\u2026' : entry.label);
          const fs = entries.length > 16 ? 8 : entries.length > 10 ? 10 : entries.length > 6 ? 12 : 14;
          return (
            <g key={i}>
              <path d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${la},1 ${x2},${y2} Z`}
                fill={`url(#g${i})`} stroke="rgba(0,0,0,0.35)" strokeWidth="1.5"/>
              <text x={tx} y={ty} textAnchor="middle" dominantBaseline="central"
                fill="white" fontSize={fs} fontWeight="800" fontFamily="Space Grotesk, sans-serif"
                style={{ transform: `rotate(${mid + 90}deg)`, transformOrigin: `${tx}px ${ty}px`, pointerEvents: 'none' }}
                filter="drop-shadow(0 1px 2px rgba(0,0,0,0.8))">
                {lbl}
              </text>
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r="38" fill="rgba(10,10,18,0.9)" stroke="rgba(255,255,255,0.15)" strokeWidth="2"/>
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fill="white" fontSize="10" fontWeight="900" fontFamily="Space Grotesk, sans-serif" letterSpacing="0.08em">
          SPIN
        </text>
      </svg>
    </div>
  );
}

export default function SpinPage() {
  const { token } = useParams();
  const [prizes, setPrizes] = useState([]);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [loading, setLoading] = useState(true);
  const connectionRef = useRef(null);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetch(`${BASE_URL}/api/spin/wheel/${token}`)
      .then(r => r.json())
      .then(data => {
        const built = (data.prizes || []).map((p, i) => ({
          label: p.label || '',
          color: p.color || PALETTE[i % PALETTE.length],
          weight: p.weight || 1,
          isMystery: p.isMystery || false,
        }));
        setPrizes(built);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!token || prizes.length === 0) return;

    const connection = new HubConnectionBuilder()
      .withUrl(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/hubs/donations`)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    connectionRef.current = connection;

    connection.start()
      .then(() => connection.invoke('JoinOverlay', token))
      .catch(() => {});

    connection.on('SpinResult', (result) => {
      const { targetIndex } = result;
      const segAngle = 360 / prizes.length;
      const targetAngle = 360 * 8 + (360 - targetIndex * segAngle - segAngle / 2);

      setWinner(null);
      setSpinning(true);
      setRotation(r => r + targetAngle);

      setTimeout(() => {
        setSpinning(false);
        setWinner(result);
        confetti({ particleCount: 250, spread: 80, origin: { y: 0.5 },
          colors: [result.color || '#7C3AED', '#FFD700', '#ffffff', '#EC4899', '#06B6D4'] });
      }, 5200);
    });

    return () => {
      connection.stop();
    };
  }, [token, prizes.length]);

  if (loading) return (
    <div className="min-h-screen bg-[#0d0d14] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"/>
    </div>
  );

  if (!prizes.length) return (
    <div className="min-h-screen bg-[#0d0d14] flex items-center justify-center">
      <p className="text-white/30 text-sm">Vòng quay chưa được cấu hình.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0d0d14] flex items-center justify-center overflow-hidden select-none">
      <WheelSVG entries={prizes} rotation={rotation} spinning={spinning} />

      <AnimatePresence>
        {winner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 200, damping: 16 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="text-center px-8 py-6 rounded-3xl"
              style={{
                background: 'linear-gradient(135deg,rgba(10,10,18,0.95),rgba(20,8,35,0.95))',
                border: '1.5px solid rgba(124,58,237,0.45)',
                boxShadow: `0 0 80px rgba(124,58,237,0.5), 0 0 0 1px rgba(255,255,255,0.05)`,
              }}>
              <p className="text-5xl mb-2">{winner.isMystery ? '\u{1F3B2}' : '\u{1F389}'}</p>
              <p className="text-white/50 text-xs uppercase tracking-widest mb-2 font-semibold">K\u1EBFt qu\u1EA3</p>
              <p className="text-white font-black text-3xl" style={{ textShadow: `0 0 30px ${winner.color}80` }}>
                {winner.label}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
