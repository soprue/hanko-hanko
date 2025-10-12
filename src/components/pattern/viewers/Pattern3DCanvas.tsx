import { memo, useMemo } from 'react';

import {
  Center,
  Environment,
  Instance,
  Instances,
  OrbitControls,
} from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

import type { RoundWithMeta } from '@/types/patterns';
import Icon from '@components/ui/Icon';
import { producedByOp, totalOfRound } from '@store/pattern.calc';
import { usePatternStore } from '@store/pattern.store';
import { rgbaToHex } from '@utils/colorPicker';

export type StitchInstance = {
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
  roundIndex: number;
};

const TORUS_R = 1.5;
const TORUS_TUBE = 0.6;
const PACKING = 0.5;
const LAYER_HEIGHT = 1.3;
const TILT = 0;
const PHASE_DRIFT = Math.PI / 3;
const LOOSENESS = 1.0;
const SMOOTHING = 0.65;
const MIN_RADIUS = 2;

function buildStitches(rounds: RoundWithMeta[]): StitchInstance[] {
  const outerDiameter = 2 * (TORUS_R + TORUS_TUBE) * PACKING;
  const fitRadius = (N: number) => {
    const n = Math.max(3, N);
    return outerDiameter / (2 * Math.sin(Math.PI / n));
  };
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  const out: StitchInstance[] = [];
  let prevRadius: number | null = null;

  for (let rIdx = 0; rIdx < rounds.length; rIdx++) {
    const round = rounds[rIdx];
    const roundIndex = round.meta?.roundIndex ?? rIdx + 1;
    const N = Math.max(1, totalOfRound(round));

    // 반경(그 라운드의 코 수에 따라)
    const desired: number = Math.max(MIN_RADIUS, fitRadius(N) * LOOSENESS);
    const radius: number =
      prevRadius == null ? desired : lerp(prevRadius, desired, SMOOTHING);
    prevRadius = radius;

    const y = (roundIndex - 1) * LAYER_HEIGHT;
    const step = (Math.PI * 2) / N;
    const baseAngle =
      -Math.PI / 2 +
      (roundIndex % 2 === 0 ? step * 0.5 : 0) +
      roundIndex * PHASE_DRIFT;

    // 삼각함수 테이블(라운드당 1회 계산)
    const cosTable: number[] = new Array(N);
    const sinTable: number[] = new Array(N);
    const rotYTable: number[] = new Array(N);
    for (let k = 0; k < N; k++) {
      const ang = baseAngle + k * step;
      cosTable[k] = Math.cos(ang);
      sinTable[k] = Math.sin(ang);
      rotYTable[k] = -ang;
    }

    // 스티치 채우기(모듈로 제거, k를 직접 래핑)
    let k = 0;
    for (let oi = 0; oi < round.ops.length; oi++) {
      const op = round.ops[oi];
      const count = producedByOp(op);
      const color = rgbaToHex(op.color);

      for (let i = 0; i < count; i++) {
        const x = cosTable[k] * radius;
        const z = sinTable[k] * radius;
        out.push({
          position: [x, y, z],
          rotation: [TILT, rotYTable[k], 0],
          color,
          roundIndex,
        });
        k++;
        if (k === N) k = 0;
      }
    }
  }

  return out;
}

const Scene = memo(function Scene({
  stitches,
}: {
  stitches: StitchInstance[];
}) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={0.9} />
      <Environment preset='city' />

      <Center>
        <Instances limit={Math.max(1, stitches.length)}>
          <torusGeometry args={[TORUS_R, TORUS_TUBE, 16, 24]} />
          <meshStandardMaterial roughness={1} />
          {stitches.map((s, i) => (
            <Instance
              key={i}
              position={s.position}
              rotation={s.rotation}
              color={s.color}
            />
          ))}
        </Instances>
      </Center>

      <OrbitControls enableDamping makeDefault target={[0, 0, 0]} />
    </>
  );
});

function Pattern3DCanvas() {
  const rounds = usePatternStore((s) => s.rounds);
  const stitches = useMemo(() => buildStitches(rounds ?? []), [rounds]);
  const hasData = stitches.length > 0;

  return (
    <>
      <div className='mb-2 flex h-[660px] flex-col items-center justify-center gap-5 rounded-xl border-2 border-dotted border-[#DBD7D1]/50 bg-linear-to-r from-[#FAFAF9] to-[#F8F6F1]'>
        {hasData ? (
          <Canvas camera={{ position: [0, 28, 85], fov: 50 }}>
            <Scene stitches={stitches} />
          </Canvas>
        ) : (
          <>
            <Icon name='Cube' width={60} color='#EBE6D8' />
            <p className='text-text-muted text-center'>
              패턴이 추가되면 3D 모델이 표시됩니다
            </p>
          </>
        )}
      </div>

      <div>
        <p className='text-text-muted text-center'>
          마우스로 회전하고, 휠로 확대/축소할 수 있어요
        </p>
      </div>
    </>
  );
}

export default Pattern3DCanvas;
