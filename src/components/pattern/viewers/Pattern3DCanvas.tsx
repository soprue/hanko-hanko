import { memo, useMemo } from 'react';

import {
  Center,
  Environment,
  Instance,
  Instances,
  OrbitControls,
} from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import * as Sentry from '@sentry/react';

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

const TORUS_R = 1.8;
const TORUS_TUBE = 0.8;
const PACKING = 0.5;
const LAYER_HEIGHT = 1.3;
const TILT = 0;
const PHASE_DRIFT = Math.PI / 3;
const LOOSENESS = 1.0;
const SMOOTHING = 0.65;
const MIN_RADIUS = 2;

function buildStitches(rounds: RoundWithMeta[]): StitchInstance[] {
  try {
    const outerDiameter = 2 * (TORUS_R + TORUS_TUBE) * PACKING;
    const fitRadius = (N: number) => {
      const n = Math.max(3, N);
      const denominator = 2 * Math.sin(Math.PI / n);

      // Geometry 계산 에러 감지: 분모가 0이거나 유효하지 않은 경우
      if (!Number.isFinite(denominator) || denominator === 0) {
        const error = new Error(
          'Invalid geometry calculation: denominator is zero or infinite',
        );
        Sentry.captureException(error, {
          tags: {
            component: '3d_rendering',
            error_type: 'geometry_calculation',
          },
          extra: { N, denominator, outerDiameter },
        });
        throw error;
      }

      return outerDiameter / denominator;
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

      // Geometry 계산 에러 감지: 반경이 유효하지 않은 경우
      if (!Number.isFinite(radius) || radius <= 0) {
        const error = new Error('Invalid radius calculation');
        Sentry.captureException(error, {
          tags: {
            component: '3d_rendering',
            error_type: 'geometry_calculation',
          },
          extra: { roundIndex, N, desired, radius, prevRadius },
        });
        throw error;
      }

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

        // 색상 변환 실패 감지
        let color: string = '#60a5fa'; // 기본값 설정
        try {
          const convertedColor = rgbaToHex(op.color);

          // 색상 변환 결과 검증
          if (
            !convertedColor ||
            typeof convertedColor !== 'string' ||
            !convertedColor.startsWith('#')
          ) {
            throw new Error('Invalid color conversion result');
          }
          color = convertedColor;
        } catch (colorError) {
          Sentry.captureException(colorError, {
            tags: { component: '3d_rendering', error_type: 'color_conversion' },
            extra: {
              roundIndex,
              opIndex: oi,
              inputColor: op.color,
            },
          });
          // Fallback 색상 사용 (이미 기본값으로 설정됨)
        }

        for (let i = 0; i < count; i++) {
          const x = cosTable[k] * radius;
          const z = sinTable[k] * radius;

          // Position 값 검증
          if (
            !Number.isFinite(x) ||
            !Number.isFinite(y) ||
            !Number.isFinite(z)
          ) {
            const error = new Error('Invalid stitch position calculated');
            Sentry.captureException(error, {
              tags: {
                component: '3d_rendering',
                error_type: 'geometry_calculation',
              },
              extra: {
                roundIndex,
                stitchIndex: i,
                position: [x, y, z],
                radius,
              },
            });
            continue; // 해당 스티치 스킵
          }

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
  } catch (error) {
    // 전체 buildStitches 함수 실패
    Sentry.captureException(error, {
      tags: { component: '3d_rendering', error_type: 'build_stitches_failed' },
      extra: { roundsCount: rounds.length },
    });
    console.error('Failed to build stitches:', error);
    return []; // 빈 배열 반환으로 앱 크래시 방지
  }
}

const Scene = memo(function Scene({
  stitches,
}: {
  stitches: StitchInstance[];
}) {
  return (
    <Sentry.ErrorBoundary
      fallback={({ error }) => {
        // 3D 렌더링 에러 발생 시 fallback UI
        Sentry.captureException(error, {
          tags: {
            component: '3d_rendering',
            error_type: 'scene_render_failed',
          },
          extra: { stitchesCount: stitches.length },
        });
        return (
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color='#60a5fa' wireframe />
          </mesh>
        );
      }}
    >
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
    </Sentry.ErrorBoundary>
  );
});

function Pattern3DCanvas() {
  const rounds = usePatternStore((s) => s.rounds);
  const stitches = useMemo(() => {
    try {
      return buildStitches(rounds ?? []);
    } catch (error) {
      Sentry.captureException(error, {
        tags: { component: '3d_rendering', error_type: 'useMemo_build_failed' },
      });
      return [];
    }
  }, [rounds]);
  const hasData = stitches.length > 0;

  return (
    <>
      <div className='mb-2 flex h-[660px] flex-col items-center justify-center gap-5 rounded-xl border-2 border-dotted border-[#DBD7D1]/50 bg-linear-to-r from-[#FAFAF9] to-[#F8F6F1]'>
        {hasData ? (
          <Sentry.ErrorBoundary
            fallback={({ error }) => {
              // Canvas 렌더링 실패 시 fallback UI
              Sentry.captureException(error, {
                tags: {
                  component: '3d_rendering',
                  error_type: 'canvas_render_failed',
                },
                extra: { stitchesCount: stitches.length },
              });
              return (
                <div className='flex flex-col items-center gap-4'>
                  <Icon name='Help' width={60} color='#EF4444' />
                  <p className='text-text-muted text-center'>
                    3D 렌더링 중 오류가 발생했습니다
                  </p>
                  <p className='text-text-muted text-center text-sm'>
                    문제가 지속되면 페이지를 새로고침 해 주세요
                  </p>
                </div>
              );
            }}
          >
            <Canvas camera={{ position: [0, 28, 85], fov: 50 }}>
              <Scene stitches={stitches} />
            </Canvas>
          </Sentry.ErrorBoundary>
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
