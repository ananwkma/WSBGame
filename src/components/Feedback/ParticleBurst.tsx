import { motion, AnimatePresence } from 'framer-motion';

interface ParticleBurstProps {
  type: 'coin' | 'flame';
  active: boolean;  // true = burst is playing; parent resets to false after a delay
}

const COIN_CHAR = '$';
const FLAME_CHAR = '*';
const PARTICLE_COUNT = 10;

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

export function ParticleBurst({ type, active }: ParticleBurstProps) {
  const char = type === 'coin' ? COIN_CHAR : FLAME_CHAR;
  const color = type === 'coin' ? '#94ba8b' : '#ba8b8b'; // green or red — aesthetic match with candles

  const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    x: randomBetween(-80, 80),
    y: randomBetween(-80, -160),
    rotate: randomBetween(-180, 180),
  }));

  return (
    <div style={{ position: 'absolute', top: '50%', left: '50%', pointerEvents: 'none', zIndex: 50 }}>
      <AnimatePresence>
        {active && particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
            animate={{ x: p.x, y: p.y, opacity: 0, rotate: p.rotate, scale: 0.5 }}
            exit={{}}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              fontFamily: 'monospace',
              fontSize: '14px',
              color,
              fontWeight: 'bold',
              userSelect: 'none',
            }}
          >
            {char}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
