import { useMemo } from 'react';

import {
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

function buildStitches(rounds: RoundWithMeta[]): StitchInstance[] {
  // ---- 레이아웃 상수 ----
  const BASE_RADIUS = 3.5; // 1단 최소 반경(필요 시 자동으로 더 벌어짐)
  const ROUND_GAP = 1; // 단 간격(반경 증가)
  const LAYER_HEIGHT = 2; // 단 높이(가까워 보이도록 낮춤)
  const TILT = 0; // 살짝 눕혀서 겹침 느낌 강화

  // 스티치(토러스) 실제 외경 = 2 * (TORUS_R + TORUS_TUBE)
  const TORUS_R = 1.5; // 토러스 큰반지름(스티치의 '링' 크기)
  const TORUS_TUBE = 0.6; // 토러스 두께
  const PACKING = 0.5;

  // 인접 스티치의 중심 간 거리가 외경에 맞춰지도록 반경을 보정
  const outerDiameter = 2 * (TORUS_R + TORUS_TUBE) * PACKING;
  const fitRadius = (N: number) => {
    // chord = 2 * R * sin(pi/N) >= outerDiameter
    const R = outerDiameter / (2 * Math.sin(Math.PI / N));
    return R;
  };

  const out: StitchInstance[] = [];

  rounds.forEach((round, rIdx) => {
    const roundIndex = round.meta?.roundIndex ?? rIdx + 1;
    const N = Math.max(1, totalOfRound(round));

    // 기본 반경과 '붙는' 데 필요한 반경 중 큰 값을 사용
    const baseR = BASE_RADIUS + (roundIndex - 1) * ROUND_GAP;
    const radius = Math.max(baseR, fitRadius(N));

    const y = (roundIndex - 1) * LAYER_HEIGHT;
    const step = (Math.PI * 2) / N;

    // 지그재그 시접 느낌: 짝수 단은 반 스텝 오프셋
    const startAngle = -Math.PI / 2 + (roundIndex % 2 === 0 ? step * 0.5 : 0);

    let cursor = 0;
    round.ops.forEach((op) => {
      const count = producedByOp(op);
      const color = rgbaToHex(op.color);
      for (let i = 0; i < count; i++) {
        const k = cursor % N;
        const ang = startAngle + k * step;
        const x = Math.cos(ang) * radius;
        const z = Math.sin(ang) * radius;
        const rotation: [number, number, number] = [TILT, -ang, 0];
        out.push({ position: [x, y, z], rotation, color, roundIndex });
        cursor++;
      }
    });
  });

  return out;
}

function Scene({ stitches }: { stitches: StitchInstance[] }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={0.9} />
      <Environment preset='city' />

      <group>
        <Instances limit={Math.max(1, stitches.length)}>
          <torusGeometry args={[1.5, 1.55, 16, 24]} />
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
      </group>

      <OrbitControls enableDamping makeDefault />
    </>
  );
}

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
