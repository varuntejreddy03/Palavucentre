import { MapPin, Navigation, Loader2, ExternalLink } from 'lucide-react'
import { useEffect, useState } from 'react'

import { STORE_LOCATIONS, rankByDistance } from '../../../shared/store-locations'

export default function LocationPicker({ selected, onSelect }) {
  const [rankedLocations, setRankedLocations] = useState(null)
  const [geoStatus, setGeoStatus] = useState('idle') // idle | loading | done | denied

  const detectLocation = () => {
    if (!navigator.geolocation) { setGeoStatus('denied'); return }
    setGeoStatus('loading')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const ranked = rankByDistance(pos.coords.latitude, pos.coords.longitude)
        setRankedLocations(ranked)
        setGeoStatus('done')
        // Auto-select nearest if nothing selected yet
        if (!selected) onSelect(ranked[0].id)
      },
      () => setGeoStatus('denied'),
      { enableHighAccuracy: false, timeout: 8000 },
    )
  }

  useEffect(() => { detectLocation() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const locations = rankedLocations || STORE_LOCATIONS

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#8A8060]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          Select Store Location
        </p>
        {geoStatus === 'idle' || geoStatus === 'denied' ? (
          <button type="button" onClick={detectLocation} className="flex items-center gap-1 text-[11px] font-medium text-[#F0A500] transition hover:text-[#F0A500]/80">
            <Navigation className="h-3 w-3" /> Detect my location
          </button>
        ) : geoStatus === 'loading' ? (
          <span className="flex items-center gap-1 text-[11px] text-[#8A8060]"><Loader2 className="h-3 w-3 animate-spin" /> Detecting...</span>
        ) : null}
      </div>

      {locations.map((loc, i) => {
        const isSelected = selected === loc.id
        const isNearest = rankedLocations && i === 0
        return (
          <button
            key={loc.id}
            type="button"
            onClick={() => onSelect(loc.id)}
            className={`w-full rounded-[14px] border text-left transition-all duration-200 ${
              isSelected
                ? 'border-[#F0A500] bg-[#F0A500]/[0.06] shadow-[0_0_20px_rgba(240,165,0,0.08)]'
                : 'border-[#2E2B1F] bg-[#111009] hover:border-[#3A3520]'
            }`}
            style={{ padding: '14px 16px' }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <MapPin className={`mt-0.5 h-4 w-4 shrink-0 ${isSelected ? 'text-[#F0A500]' : 'text-[#8A8060]'}`} />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[15px] font-semibold text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>{loc.name}</p>
                    {isNearest && (
                      <span className="rounded-full bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                        Nearest
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[12px] text-[#8A8060]" style={{ fontFamily: 'DM Sans, sans-serif' }}>{loc.address}</p>
                  {loc.distanceKm != null && (
                    <p className="mt-1 text-[11px] text-[#B0A880]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                      ~{loc.distanceKm < 1 ? `${Math.round(loc.distanceKm * 1000)}m` : `${loc.distanceKm.toFixed(1)} km`} away
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a href={loc.mapUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-[#8A8060] hover:text-[#F0A500] transition">
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                  isSelected ? 'border-[#F0A500] bg-[#F0A500]' : 'border-[#3A3520] bg-transparent'
                }`}>
                  {isSelected && <span className="h-2 w-2 rounded-full bg-white" />}
                </span>
              </div>
            </div>
          </button>
        )
      })}

      {geoStatus === 'denied' && (
        <p className="text-[11px] text-[#8A8060]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          Location access denied. You can still pick a store manually.
        </p>
      )}
    </div>
  )
}
