/// <reference types="google.maps" />
import {
  AdvancedMarker,
  APILoadingStatus,
  APIProvider,
  ColorScheme,
  InfoWindow,
  Map as GoogleMap,
  useAdvancedMarkerRef,
  useApiLoadingStatus,
  useMap,
} from '@vis.gl/react-google-maps';
import { Compass, LoaderCircle, LocateFixed, MapPin } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { JobListing, Property } from '../types/rental';
import { formatCompactSalary, formatCurrency } from '../utils/format';

interface NamibiaMapProps {
  mode?: 'rentals' | 'jobs' | 'all';
  properties: Property[];
  jobs?: JobListing[];
  highlightedId: string | null;
  onSelectProperty: (property: Property) => void;
  onSelectJob?: (job: JobListing) => void;
  className?: string;
}

// Southern Africa (SADC) bounds for interactive SVG fallback map
const SADC_BOUNDS = {
  minLat: -35.0,
  maxLat: -8.0,
  minLng: 11.5,
  maxLng: 35.5,
};

const Z_INDEX_SELECTED = 1000;
const Z_INDEX_HOVER = 999;

type SelectedPin =
  | { kind: 'property'; item: Property }
  | { kind: 'job'; item: JobListing };

let cachedConfigPromise: Promise<string> | null = null;

function resolveInitialEnvKey(): string {
  const key = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim();
  return key && key !== 'MY_GOOGLE_MAPS_API_KEY' ? key : '';
}

function fetchServerMapsApiKey(): Promise<string> {
  if (!cachedConfigPromise) {
    cachedConfigPromise = fetch('/api/map/config')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { apiKey?: string } | null) => {
        const key = (data?.apiKey || '').trim();
        return key && key !== 'MY_GOOGLE_MAPS_API_KEY' ? key : '';
      })
      .catch(() => '');
  }
  return cachedConfigPromise;
}

interface PropertyMarkerProps {
  property: Property;
  zIndex: number;
  isHighlighted: boolean;
  isSelected: boolean;
  onSelectMarker: (
    pin: SelectedPin,
    marker: google.maps.marker.AdvancedMarkerElement
  ) => void;
}

function PropertyMarkerItem({
  property,
  zIndex,
  isHighlighted,
  isSelected,
  onSelectMarker,
}: PropertyMarkerProps) {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const active = isHighlighted || isSelected;

  return (
    <AdvancedMarker
      ref={markerRef}
      position={{ lat: property.lat, lng: property.lng }}
      zIndex={zIndex}
      title={property.title}
      onClick={() => {
        if (marker) {
          onSelectMarker({ kind: 'property', item: property }, marker);
        }
      }}
    >
      <div
        className={`font-mono-tabular inline-flex items-center justify-center rounded-lg border px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap shadow-lg transition-transform cursor-pointer ${
          active
            ? 'scale-105 border-emerald-200 bg-emerald-600 text-white'
            : 'border-emerald-500/45 bg-[#112224] text-emerald-300 hover:scale-105'
        }`}
      >
        {formatCurrency(property.pricePerNight, property.currency)}
      </div>
    </AdvancedMarker>
  );
}

interface JobMarkerProps {
  job: JobListing;
  zIndex: number;
  isHighlighted: boolean;
  isSelected: boolean;
  onSelectMarker: (
    pin: SelectedPin,
    marker: google.maps.marker.AdvancedMarkerElement
  ) => void;
}

function JobMarkerItem({
  job,
  zIndex,
  isHighlighted,
  isSelected,
  onSelectMarker,
}: JobMarkerProps) {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const active = isHighlighted || isSelected;

  return (
    <AdvancedMarker
      ref={markerRef}
      position={{ lat: job.lat, lng: job.lng }}
      zIndex={zIndex}
      title={`${job.title} — ${job.company}`}
      onClick={() => {
        if (marker) {
          onSelectMarker({ kind: 'job', item: job }, marker);
        }
      }}
    >
      <div
        className={`font-mono-tabular inline-flex items-center justify-center rounded-lg border px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap shadow-lg transition-transform cursor-pointer ${
          active
            ? 'scale-105 border-blue-200 bg-blue-600 text-white'
            : 'border-blue-500/50 bg-[#131E36] text-blue-300 hover:scale-105'
        }`}
      >
        {formatCompactSalary(job.salaryMax, job.currency)}
      </div>
    </AdvancedMarker>
  );
}

interface GoogleMapCanvasProps {
  mode: 'rentals' | 'jobs' | 'all';
  visibleProperties: Property[];
  visibleJobs: JobListing[];
  highlightedId: string | null;
  onSelectProperty: (property: Property) => void;
  onSelectJob?: (job: JobListing) => void;
  onRenderFallback: () => void;
}

function GoogleMapCanvas({
  mode,
  visibleProperties,
  visibleJobs,
  highlightedId,
  onSelectProperty,
  onSelectJob,
  onRenderFallback,
}: GoogleMapCanvasProps) {
  const map = useMap();
  const status = useApiLoadingStatus();

  const [focusRegion, setFocusRegion] = useState<'sadc' | 'namibia' | 'walvis'>(
    mode === 'rentals' ? 'namibia' : 'sadc'
  );
  const [locating, setLocating] = useState(false);
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);

  const [selectedPin, setSelectedPin] = useState<SelectedPin | null>(null);
  const [selectedMarker, setSelectedMarker] =
    useState<google.maps.marker.AdvancedMarkerElement | null>(null);

  const onSelectPropRef = useRef(onSelectProperty);
  onSelectPropRef.current = onSelectProperty;
  const onSelectJobRef = useRef(onSelectJob);
  onSelectJobRef.current = onSelectJob;

  useEffect(() => {
    if (status === APILoadingStatus.FAILED || status === APILoadingStatus.AUTH_FAILURE) {
      onRenderFallback();
    }
  }, [status, onRenderFallback]);

  const sortedProperties = useMemo(() => {
    return [...visibleProperties]
      .sort((a, b) => b.lat - a.lat)
      .map((item, idx) => ({ item, baseZ: idx }));
  }, [visibleProperties]);

  const sortedJobs = useMemo(() => {
    const offset = sortedProperties.length;
    return [...visibleJobs]
      .sort((a, b) => b.lat - a.lat)
      .map((item, idx) => ({ item, baseZ: offset + idx }));
  }, [visibleJobs, sortedProperties.length]);

  const handleMarkerClick = useCallback(
    (pin: SelectedPin, marker: google.maps.marker.AdvancedMarkerElement) => {
      setSelectedPin(pin);
      setSelectedMarker(marker);
    },
    []
  );

  const handleCloseInfoWindow = useCallback(() => {
    setSelectedPin(null);
    setSelectedMarker(null);
  }, []);

  function handleFocusSadc() {
    setFocusRegion('sadc');
    if (!map) return;
    const coords = [
      ...visibleProperties.map((p) => ({ lat: p.lat, lng: p.lng })),
      ...visibleJobs.map((j) => ({ lat: j.lat, lng: j.lng })),
    ];
    if (coords.length > 1 && typeof google !== 'undefined' && google.maps?.LatLngBounds) {
      const bounds = new google.maps.LatLngBounds();
      coords.forEach((pt) => bounds.extend(pt));
      map.fitBounds(bounds, 40);
    } else {
      map.panTo({ lat: -22.5, lng: 22.0 });
      map.setZoom(5);
    }
  }

  function handleFocusNamibia() {
    setFocusRegion('namibia');
    if (!map) return;
    map.panTo({ lat: -22.2, lng: 16.5 });
    map.setZoom(6);
  }

  function handleFocusWalvis() {
    setFocusRegion('walvis');
    if (!map) return;
    map.panTo({ lat: -22.92, lng: 14.51 });
    map.setZoom(11);
  }

  function handleLocateMe() {
    if (!navigator.geolocation || !map) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const latlng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(latlng);
        map.panTo(latlng);
        map.setZoom(11);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  const defaultCenter =
    mode === 'rentals' ? { lat: -22.2, lng: 16.5 } : { lat: -22.5, lng: 21.5 };
  const defaultZoom = mode === 'rentals' ? 6 : 5;

  return (
    <>
      {/* Map Viewport Controls */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
        <button
          type="button"
          onClick={handleFocusSadc}
          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold backdrop-blur-md border transition-colors cursor-pointer ${
            focusRegion === 'sadc'
              ? 'border-blue-400 bg-blue-600 text-white'
              : 'border-white/15 bg-[#0B1120]/85 text-[#C2CEE3] hover:text-white'
          }`}
        >
          <Compass className="size-3.5" />
          All SADC
        </button>
        <button
          type="button"
          onClick={handleFocusNamibia}
          className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold backdrop-blur-md border transition-colors cursor-pointer ${
            focusRegion === 'namibia'
              ? 'border-blue-400 bg-blue-600 text-white'
              : 'border-white/15 bg-[#0B1120]/85 text-[#C2CEE3] hover:text-white'
          }`}
        >
          Namibia
        </button>
        <button
          type="button"
          onClick={handleFocusWalvis}
          className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold backdrop-blur-md border transition-colors cursor-pointer ${
            focusRegion === 'walvis'
              ? 'border-blue-400 bg-blue-600 text-white'
              : 'border-white/15 bg-[#0B1120]/85 text-[#C2CEE3] hover:text-white'
          }`}
        >
          Walvis Bay
        </button>
        <button
          type="button"
          onClick={handleLocateMe}
          aria-label="Center map on my location"
          className="inline-flex size-8 items-center justify-center rounded-lg border border-white/15 bg-[#0B1120]/85 text-[#EEF3FB] backdrop-blur-md transition-colors hover:bg-[#16233F] cursor-pointer"
        >
          {locating ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <LocateFixed className="size-4" />
          )}
        </button>
      </div>

      {/* Legend */}
      {mode === 'all' && (
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-3 rounded-lg border border-white/15 bg-[#0B1120]/85 px-3 py-1.5 text-[11px] font-medium text-[#C2CEE3] backdrop-blur-md">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-400" />
            Rentals ({visibleProperties.length})
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-blue-400" />
            Jobs ({visibleJobs.length})
          </span>
        </div>
      )}

      <GoogleMap
        mapId="DEMO_MAP_ID"
        colorScheme={ColorScheme.DARK}
        defaultCenter={defaultCenter}
        defaultZoom={defaultZoom}
        gestureHandling="greedy"
        streetViewControl={false}
        mapTypeControl={false}
        fullscreenControl={false}
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        style={{ width: '100%', height: '100%' }}
        onClick={handleCloseInfoWindow}
      >
        {sortedProperties.map(({ item, baseZ }) => {
          const isSelected =
            selectedPin?.kind === 'property' && selectedPin.item.id === item.id;
          const isHighlighted = item.id === highlightedId;
          const zIndex = isSelected
            ? Z_INDEX_SELECTED
            : isHighlighted
              ? Z_INDEX_HOVER
              : baseZ;

          return (
            <PropertyMarkerItem
              key={item.id}
              property={item}
              zIndex={zIndex}
              isHighlighted={isHighlighted}
              isSelected={isSelected}
              onSelectMarker={handleMarkerClick}
            />
          );
        })}

        {sortedJobs.map(({ item, baseZ }) => {
          const isSelected =
            selectedPin?.kind === 'job' && selectedPin.item.id === item.id;
          const isHighlighted = item.id === highlightedId;
          const zIndex = isSelected
            ? Z_INDEX_SELECTED
            : isHighlighted
              ? Z_INDEX_HOVER
              : baseZ;

          return (
            <JobMarkerItem
              key={item.id}
              job={item}
              zIndex={zIndex}
              isHighlighted={isHighlighted}
              isSelected={isSelected}
              onSelectMarker={handleMarkerClick}
            />
          );
        })}

        {userLocation && (
          <AdvancedMarker position={userLocation} title="Your location" zIndex={Z_INDEX_SELECTED + 1}>
            <div className="size-4 rounded-full border-2 border-white bg-blue-500 shadow-lg" />
          </AdvancedMarker>
        )}

        {selectedPin && selectedMarker && (
          <InfoWindow
            anchor={selectedMarker}
            maxWidth={260}
            onCloseClick={handleCloseInfoWindow}
          >
            {selectedPin.kind === 'property' ? (
              <div className="w-[228px] overflow-hidden rounded-lg text-slate-900">
                <img
                  src={selectedPin.item.image}
                  alt={selectedPin.item.title}
                  className="h-28 w-full object-cover rounded-md"
                />
                <div className="pt-2.5">
                  <div className="text-[11px] font-medium text-slate-500">
                    {selectedPin.item.propertyType} · {selectedPin.item.city},{' '}
                    {selectedPin.item.country}
                  </div>
                  <div className="font-display mt-0.5 text-sm font-semibold leading-snug text-slate-900">
                    {selectedPin.item.title}
                  </div>
                  <div className="mt-2.5 flex items-center justify-between gap-2">
                    <span className="font-mono-tabular text-xs font-bold text-emerald-700">
                      {formatCurrency(
                        selectedPin.item.pricePerNight,
                        selectedPin.item.currency
                      )}
                      /night
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelectPropRef.current(selectedPin.item)}
                      className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-500 cursor-pointer"
                    >
                      Book Stay
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-[228px] text-slate-900">
                <div className="text-[11px] font-semibold text-blue-700">
                  Job · {selectedPin.item.sector}
                </div>
                <div className="font-display mt-0.5 text-sm font-semibold leading-snug text-slate-900">
                  {selectedPin.item.title}
                </div>
                <div className="mt-1 text-xs text-slate-600">
                  {selectedPin.item.company} · {selectedPin.item.city},{' '}
                  {selectedPin.item.country}
                </div>
                <div className="mt-2.5 flex items-center justify-between gap-2">
                  <span className="font-mono-tabular text-xs font-bold text-emerald-700">
                    {formatCompactSalary(
                      selectedPin.item.salaryMin,
                      selectedPin.item.currency
                    )}
                    –
                    {formatCompactSalary(
                      selectedPin.item.salaryMax,
                      selectedPin.item.currency
                    )}
                    /mo
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectJobRef.current?.(selectedPin.item)}
                    className="rounded-md bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-500 cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </InfoWindow>
        )}
      </GoogleMap>
    </>
  );
}

export function NamibiaMap({
  mode = 'all',
  properties,
  jobs = [],
  highlightedId,
  onSelectProperty,
  onSelectJob,
  className = 'h-[520px]',
}: NamibiaMapProps) {
  const [apiKey, setApiKey] = useState<string>(() => resolveInitialEnvKey());
  const [configLoaded, setConfigLoaded] = useState<boolean>(() =>
    Boolean(resolveInitialEnvKey())
  );
  const [mapFailed, setMapFailed] = useState(false);
  const [selectedFallback, setSelectedFallback] = useState<SelectedPin | null>(null);

  const visibleProperties = mode === 'jobs' ? [] : properties;
  const visibleJobs = mode === 'rentals' ? [] : jobs;

  useEffect(() => {
    if (apiKey) {
      setConfigLoaded(true);
      return;
    }
    let cancelled = false;
    fetchServerMapsApiKey().then((serverKey) => {
      if (!cancelled) {
        if (serverKey) setApiKey(serverKey);
        setConfigLoaded(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [apiKey]);

  const handleRenderFallback = useCallback(() => {
    setMapFailed(true);
  }, []);

  function projectToSvg(lat: number, lng: number) {
    const xPct = Math.min(
      92,
      Math.max(
        8,
        ((lng - SADC_BOUNDS.minLng) / (SADC_BOUNDS.maxLng - SADC_BOUNDS.minLng)) *
          100
      )
    );
    const yPct = Math.min(
      92,
      Math.max(
        8,
        ((SADC_BOUNDS.maxLat - lat) / (SADC_BOUNDS.maxLat - SADC_BOUNDS.minLat)) *
          100
      )
    );
    return { xPct, yPct };
  }

  const showFallback = mapFailed || (configLoaded && !apiKey);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-[#0D1528] ${className}`}
    >
      {!configLoaded ? (
        <div className="flex h-full w-full items-center justify-center bg-[#0D1528]">
          <LoaderCircle className="size-6 animate-spin text-blue-400" />
        </div>
      ) : !showFallback ? (
        <APIProvider
          apiKey={apiKey}
          libraries={['marker']}
          language="en"
          region="NA"
        >
          <GoogleMapCanvas
            mode={mode}
            visibleProperties={visibleProperties}
            visibleJobs={visibleJobs}
            highlightedId={highlightedId}
            onSelectProperty={onSelectProperty}
            onSelectJob={onSelectJob}
            onRenderFallback={handleRenderFallback}
          />
        </APIProvider>
      ) : (
        /* Interactive SADC Vector Coordinate Map Fallback */
        <div className="relative h-full w-full bg-[#0D1528] p-4 flex flex-col justify-between">
          <div className="text-xs font-medium text-[#9FB1CF]">
            Southern Africa (SADC) Interactive Pin Map ·{' '}
            {visibleProperties.length + visibleJobs.length} pins
          </div>

          <div className="relative my-2 flex-1 rounded-xl border border-white/10 bg-[#091020] overflow-hidden">
            <svg
              viewBox="0 0 600 420"
              className="h-full w-full"
              aria-label="Namibia and SADC map"
            >
              <rect width="600" height="420" fill="#0B162B" />
              <path
                d="M75,30 L390,30 L520,130 L550,235 L475,355 L265,400 L165,375 L105,270 L70,130 Z"
                fill="#111F38"
                stroke="rgba(148,163,184,0.22)"
                strokeWidth="1.5"
              />
              <text x="125" y="100" fill="#64748B" fontSize="10" fontFamily="Sora,sans-serif">
                Angola
              </text>
              <text
                x="120"
                y="235"
                fill="#EEF3FB"
                fontSize="11"
                fontWeight="600"
                fontFamily="Sora,sans-serif"
              >
                Namibia
              </text>
              <text x="275" y="255" fill="#9FB1CF" fontSize="10" fontFamily="Sora,sans-serif">
                Botswana
              </text>
              <text x="330" y="125" fill="#9FB1CF" fontSize="10" fontFamily="Sora,sans-serif">
                Zambia
              </text>
              <text x="380" y="185" fill="#9FB1CF" fontSize="10" fontFamily="Sora,sans-serif">
                Zimbabwe
              </text>
              <text x="465" y="215" fill="#9FB1CF" fontSize="10" fontFamily="Sora,sans-serif">
                Mozambique
              </text>
              <text x="275" y="345" fill="#9FB1CF" fontSize="11" fontFamily="Sora,sans-serif">
                South Africa
              </text>
            </svg>

            {visibleProperties.map((prop) => {
              const { xPct, yPct } = projectToSvg(prop.lat, prop.lng);
              const active =
                prop.id === highlightedId ||
                (selectedFallback?.kind === 'property' &&
                  selectedFallback.item.id === prop.id);
              return (
                <button
                  key={prop.id}
                  type="button"
                  onClick={() => setSelectedFallback({ kind: 'property', item: prop })}
                  style={{ left: `${xPct}%`, top: `${yPct}%` }}
                  className={`font-mono-tabular absolute -translate-x-1/2 -translate-y-1/2 rounded-lg border px-2 py-0.5 text-[10px] font-semibold shadow-lg cursor-pointer ${
                    active
                      ? 'z-20 border-emerald-300 bg-emerald-600 text-white'
                      : 'z-10 border-emerald-500/40 bg-[#112224] text-emerald-300'
                  }`}
                >
                  {formatCurrency(prop.pricePerNight, prop.currency)}
                </button>
              );
            })}

            {visibleJobs.map((job) => {
              const { xPct, yPct } = projectToSvg(job.lat, job.lng);
              const active =
                job.id === highlightedId ||
                (selectedFallback?.kind === 'job' && selectedFallback.item.id === job.id);
              return (
                <button
                  key={job.id}
                  type="button"
                  onClick={() => setSelectedFallback({ kind: 'job', item: job })}
                  style={{ left: `${xPct}%`, top: `${yPct}%` }}
                  className={`font-mono-tabular absolute -translate-x-1/2 -translate-y-1/2 rounded-lg border px-2 py-0.5 text-[10px] font-semibold shadow-lg cursor-pointer ${
                    active
                      ? 'z-20 border-blue-300 bg-blue-600 text-white'
                      : 'z-10 border-blue-500/40 bg-[#131E36] text-blue-300'
                  }`}
                >
                  {formatCompactSalary(job.salaryMax, job.currency)}
                </button>
              );
            })}
          </div>

          {selectedFallback && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#131E36] p-3">
              <div className="min-w-0">
                <p className="text-xs text-[#9FB1CF] flex items-center gap-1">
                  <MapPin className="size-3 text-emerald-400" />
                  {selectedFallback.kind === 'property'
                    ? `${selectedFallback.item.city}, ${selectedFallback.item.country}`
                    : `${selectedFallback.item.company} · ${selectedFallback.item.city}, ${selectedFallback.item.country}`}
                </p>
                <p className="font-display truncate text-sm font-semibold text-[#EEF3FB]">
                  {selectedFallback.item.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (selectedFallback.kind === 'property') {
                    onSelectProperty(selectedFallback.item);
                  } else {
                    onSelectJob?.(selectedFallback.item);
                  }
                }}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white whitespace-nowrap shrink-0 cursor-pointer hover:bg-blue-500"
              >
                {selectedFallback.kind === 'property' ? 'Book Stay' : 'Apply'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
