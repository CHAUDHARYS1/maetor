import { useMemo, useRef, useEffect, useState, useCallback } from 'react'
import Globe from 'react-globe.gl'

const SERVICE_ARC = {
  ground:   ['#60a5fa', '#4ade80'],
  '3day':   ['#38bdf8', '#4ade80'],
  '2day':   ['#fbbf24', '#4ade80'],
  '2dayam': ['#fbbf24', '#4ade80'],
  ndsaver:  ['#fb923c', '#f87171'],
  nda:      ['#f97316', '#ef4444'],
  ndaearly: ['#f97316', '#ef4444'],
}

const TEXTURES = {
  dark:  '//unpkg.com/three-globe/example/img/earth-night.jpg',
  light: '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
}
const STARS = '//unpkg.com/three-globe/example/img/night-sky.png'

function isDarkTheme() {
  return document.documentElement.getAttribute('data-theme') === 'dark'
}

function tip(content, dark) {
  const bg     = dark ? 'rgba(8,11,18,0.92)'    : 'rgba(255,255,255,0.94)'
  const color  = dark ? '#eceef2'               : '#111827'
  const border = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  return `<div style="background:${bg};backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid ${border};border-radius:6px;padding:6px 10px;font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:0.04em;color:${color};white-space:nowrap;">${content}</div>`
}

export default function GlobePreview({ originCoords, destCoords, service, origin, dest, routeInfo }) {
  const globeRef = useRef()
  const [dims, setDims] = useState({ w: window.innerWidth, h: window.innerHeight })
  const [dark, setDark] = useState(isDarkTheme)

  useEffect(() => {
    function onResize() { setDims({ w: window.innerWidth, h: window.innerHeight }) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const obs = new MutationObserver(() => setDark(isDarkTheme()))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  }, [])

  const panToRoute = useCallback(() => {
    const ctrl = globeRef.current?.controls()
    if (!ctrl) return
    ctrl.autoRotate = false
    if (!originCoords || !destCoords) return
    const midLat = (originCoords[0] + destCoords[0]) / 2
    const midLng = (originCoords[1] + destCoords[1]) / 2
    globeRef.current.pointOfView({ lat: midLat, lng: midLng, altitude: 2.2 }, 1000)
  }, [originCoords, destCoords])

  useEffect(() => { panToRoute() }, [panToRoute])

  function onReady() {
    const ctrl = globeRef.current?.controls()
    if (!ctrl) return
    if (!originCoords || !destCoords) {
      ctrl.autoRotate = true
      ctrl.autoRotateSpeed = 0.5
    } else {
      panToRoute()
    }
  }

  const arcColors = SERVICE_ARC[service] ?? SERVICE_ARC.ground

  const arcs = useMemo(() => {
    if (!originCoords || !destCoords) return []
    return [{
      startLat: originCoords[0], startLng: originCoords[1],
      endLat:   destCoords[0],   endLng:   destCoords[1],
      dist:     routeInfo?.dist     ?? 0,
      transit:  routeInfo?.transit  ?? 0,
      svcName:  routeInfo?.svcName  ?? '',
    }]
  }, [originCoords, destCoords, routeInfo])

  const points = useMemo(() => {
    if (!originCoords || !destCoords) return []
    return [
      { lat: originCoords[0], lng: originCoords[1], color: arcColors[0], role: 'FROM', zip: origin },
      { lat: destCoords[0],   lng: destCoords[1],   color: '#4ade80',    role: 'TO',   zip: dest   },
    ]
  }, [originCoords, destCoords, arcColors, origin, dest])

  const rings = useMemo(() => {
    if (!destCoords) return []
    return [{ lat: destCoords[0], lng: destCoords[1] }]
  }, [destCoords])

  return (
    <Globe
      ref={globeRef}
      onGlobeReady={onReady}
      globeImageUrl={dark ? TEXTURES.dark : TEXTURES.light}
      backgroundImageUrl={dark ? STARS : null}
      arcsData={arcs}
      arcColor={() => arcColors}
      arcDashLength={0.4}
      arcDashGap={0.2}
      arcDashAnimateTime={2000}
      arcStroke={1.5}
      arcLabel={d => {
        const parts = []
        if (d.dist > 0) parts.push(`~${d.dist.toLocaleString()} mi`)
        if (d.transit)  parts.push(`${d.transit} transit day${d.transit === 1 ? '' : 's'}`)
        if (d.svcName)  parts.push(d.svcName.replace('®', ''))
        return parts.length ? tip(parts.join(' &nbsp;·&nbsp; '), dark) : ''
      }}
      pointsData={points}
      pointColor="color"
      pointAltitude={0.02}
      pointRadius={0.55}
      pointLabel={d => tip(
        `<span style="opacity:0.55;font-size:9px;letter-spacing:0.14em;">${d.role}</span>&nbsp;&nbsp;<strong>${d.zip}</strong>`,
        dark
      )}
      ringsData={rings}
      ringColor={() => t => `rgba(74,222,128,${1 - t})`}
      ringMaxRadius={5}
      ringPropagationSpeed={2}
      ringRepeatPeriod={1200}
      width={dims.w}
      height={dims.h}
      backgroundColor="rgba(0,0,0,0)"
      atmosphereColor={dark ? '#3b82f6' : '#7cb9f4'}
      atmosphereAltitude={0.2}
    />
  )
}
