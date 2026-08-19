'use client'

import { useEffect, useId, useRef } from 'react'
import { animate } from 'motion'

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────
type StarPoint = [x: number, y: number, dim?: boolean, blur?: boolean]

// ────────────────────────────────────────────────────────────
// Static star data
// ────────────────────────────────────────────────────────────
const stars: StarPoint[] = [
  [4, 4, true, true],
  [4, 44, true],
  [36, 22],
  [50, 146, true, true],
  [64, 43, true, true],
  [76, 30, true],
  [101, 116],
  [140, 36, true],
  [149, 134],
  [162, 74, true],
  [171, 96, true, true],
  [210, 56, true, true],
  [235, 90],
  [275, 82, true, true],
  [306, 6],
  [307, 64, true, true],
  [380, 68, true],
  [380, 108, true, true],
  [391, 148, true, true],
  [405, 18, true],
  [412, 86, true, true],
  [426, 210, true, true],
  [427, 56, true, true],
  [538, 138],
  [563, 88, true, true],
  [611, 154, true, true],
  [637, 150],
  [651, 146, true],
  [682, 70, true, true],
  [683, 128],
  [781, 82, true, true],
  [785, 158, true],
  [832, 146, true, true],
  [852, 89],
]

// 3 constellations that draw themselves
const constellations: StarPoint[][] = [
  [
    [247, 103],
    [261, 86],
    [307, 104],
    [357, 36],
  ],
  [
    [586, 120],
    [516, 100],
    [491, 62],
    [440, 107],
    [477, 180],
    [516, 100],
  ],
  [
    [733, 100],
    [803, 120],
    [879, 113],
    [823, 164],
    [803, 120],
  ],
]

// ────────────────────────────────────────────────────────────
// Single Star
// ────────────────────────────────────────────────────────────
function Star({
  blurId,
  point: [cx, cy, dim, blur],
}: {
  blurId: string
  point: StarPoint
}) {
  const groupRef = useRef<SVGGElement>(null)

  useEffect(() => {
    const group = groupRef.current
    if (!group) return

    const delay = Math.random() * 2

    // Fade in the group
    const fadeIn = animate(group, { opacity: [0, 1] }, { duration: 4, delay })

    // Twinkle the circle inside
    const circle = group.querySelector('circle')
    if (circle) {
      // Use style property animation via WAAPI directly
      const kfs = dim
        ? [{ opacity: 0.2 }, { opacity: 0.5 }]
        : [{ opacity: 1 }, { opacity: 0.6 }]
      const twinkle = circle.animate(kfs, {
        delay: delay * 1000,
        duration: (Math.random() * 2 + 2) * 1000,
        direction: 'alternate',
        iterations: Infinity,
      })
      return () => {
        fadeIn.cancel()
        twinkle.cancel()
      }
    }

    return () => { fadeIn.cancel() }
  }, [dim])

  return (
    <g ref={groupRef} style={{ opacity: 0 }}>
      <circle
        cx={cx}
        cy={cy}
        r={1}
        style={{
          transformOrigin: `${cx / 16}rem ${cy / 16}rem`,
          opacity: dim ? 0.2 : 1,
          transform: `scale(${dim ? 1 : 1.2})`,
        }}
        filter={blur ? `url(#${blurId})` : undefined}
      />
    </g>
  )
}

// ────────────────────────────────────────────────────────────
// Constellation — draws path via stroke-dashoffset
// ────────────────────────────────────────────────────────────
function Constellation({
  points,
  blurId,
}: {
  points: StarPoint[]
  blurId: string
}) {
  const pathRef = useRef<SVGPathElement>(null)

  const uniquePoints = points.filter(
    (p, i) => points.findIndex((q) => String(q) === String(p)) === i
  )
  const isFilled = uniquePoints.length !== points.length

  useEffect(() => {
    const path = pathRef.current
    if (!path) return

    const delay = Math.random() * 3 + 2

    // Reveal the path with stroke-dashoffset
    path.style.visibility = 'hidden'
    const drawDelay = setTimeout(() => {
      path.style.visibility = 'visible'
      const draw = animate(
        path,
        { strokeDashoffset: ['1', '0'] },
        { duration: 5 }
      )

      if (isFilled) {
        setTimeout(() => {
          animate(
            path,
            { fill: ['transparent', 'rgb(255 255 255 / 0.02)'] },
            { duration: 1 }
          )
        }, 5000)
      }

      return () => { draw.cancel() }
    }, delay * 1000)

    return () => { clearTimeout(drawDelay) }
  }, [isFilled])

  const d = `M ${points.map(([x, y]) => `${x} ${y}`).join(' L ')}`

  return (
    <>
      <path
        ref={pathRef}
        stroke="white"
        strokeOpacity="0.2"
        strokeDasharray="1"
        strokeDashoffset="1"
        pathLength={1}
        fill="transparent"
        d={d}
        style={{ visibility: 'hidden' }}
      />
      {uniquePoints.map((point, i) => (
        <Star key={i} point={point} blurId={blurId} />
      ))}
    </>
  )
}

// ────────────────────────────────────────────────────────────
// Main StarField export
// ────────────────────────────────────────────────────────────
export function StarField({ className }: { className?: string }) {
  const blurId = useId()

  return (
    <svg
      viewBox="0 0 881 211"
      fill="white"
      aria-hidden="true"
      className={[
        'pointer-events-none absolute overflow-visible opacity-70',
        'w-[55rem] origin-top-right rotate-[30deg]',
        className ?? '',
      ].join(' ')}
    >
      <defs>
        <filter id={blurId}>
          <feGaussianBlur in="SourceGraphic" stdDeviation=".5" />
        </filter>
      </defs>

      {constellations.map((pts, i) => (
        <Constellation key={i} points={pts} blurId={blurId} />
      ))}

      {stars.map((point, i) => (
        <Star key={i} point={point} blurId={blurId} />
      ))}
    </svg>
  )
}
