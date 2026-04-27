import React, { useState, useCallback, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import debounce from 'lodash.debounce';
import { MapPin, Search, Filter, Layers, Info, Loader2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import './App.css';

// Fix Leaflet default icon issues in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const center: [number, number] = [37.0902, -95.7129]; // USA Center

// Component to handle map movements and zoom
const MapEvents = ({ onBoundsChange }: { onBoundsChange: (bounds: any, zoom: number) => void }) => {
  const map = useMapEvents({
    moveend: () => {
      const bounds = map.getBounds();
      const zoom = map.getZoom();
      onBoundsChange(bounds, zoom);
    },
    zoomend: () => {
      const bounds = map.getBounds();
      const zoom = map.getZoom();
      onBoundsChange(bounds, zoom);
    }
  });
  return null;
};

const MapInstanceCapture = ({ setMap }: { setMap: (map: L.Map) => void }) => {
  const map = useMapEvents({});
  useEffect(() => {
    setMap(map);
  }, [map, setMap]);
  return null;
};

const App: React.FC = () => {
  const [stores, setStores] = useState<any[]>([]);
  const [tier, setTier] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Filters
  const [brand, setBrand] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [status, setStatus] = useState('');

  const fetchStores = useCallback(async (bounds: L.LatLngBounds, zoom: number) => {
    // console.log("DEBUG: Fetching stores for zoom level", zoom);
    setLoading(true);
    try {
      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();
      
      // TODO: Maybe add a cache here so we don't refetch the same area?
      const response = await axios.get('http://localhost:5000/api/stores', {
        params: {
          neLat: ne.lat,
          neLng: ne.lng,
          swLat: sw.lat,
          swLng: sw.lng,
          zoom,
          brand,
          state: stateFilter,
          status
        }
      });
      
      console.log("Got " + (response.data.data ? response.data.data.length : 0) + " items from server");
      setStores(response.data.data || []);
      setTier(response.data.tier);
    } catch (error) {
      console.error("Oops! Something went wrong fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [brand, stateFilter, status]);

  const debouncedFetch = useCallback(
    debounce((bounds: L.LatLngBounds, zoom: number) => {
      fetchStores(bounds, zoom);
    }, 300),
    [fetchStores]
  );

  const handleBoundsChange = (bounds: L.LatLngBounds, zoom: number) => {
    debouncedFetch(bounds, zoom);
  };

  const [map, setMap] = useState<L.Map | null>(null);

  // Trigger fetch when filters change if map is loaded
  useEffect(() => {
    if (map) {
      const bounds = map.getBounds();
      const zoom = map.getZoom();
      fetchStores(bounds, zoom);
    }
  }, [brand, stateFilter, status, map, fetchStores]);

  // Initial load
  useEffect(() => {
    // We'll let the map's onMoveEnd trigger the first load
  }, []);

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="header">
          <MapPin className="logo-icon" />
          <h1>Retail Mapper (Free)</h1>
        </div>
        
        <div className="filter-section">
          <div className="input-group">
            <Search size={16} className="icon" />
            <input 
              type="text" 
              placeholder="Brand Initial (e.g. S)" 
              value={brand} 
              onChange={(e) => setBrand(e.target.value)} 
            />
          </div>
          
          <div className="input-group">
            <Filter size={16} className="icon" />
            <input 
              type="text" 
              placeholder="State Code (e.g. CA)" 
              value={stateFilter} 
              onChange={(e) => setStateFilter(e.target.value)} 
            />
          </div>

          <div className="input-group">
            <Layers size={16} className="icon" />
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <button className="apply-btn">
            Filters Apply Auto
          </button>
        </div>

        {loading && (
          <div className="status-indicator loading">
            <Loader2 size={14} className="animate-spin" />
            Updating {tier === 1 ? 'States' : tier === 2 ? 'Clusters' : 'Stores'}...
          </div>
        )}

        <div className="stats-box">
          <Info size={14} />
          <span>Showing {stores.length} {tier === 1 ? 'States' : tier === 2 ? 'Clusters' : 'Locations'}</span>
        </div>
      </div>

      <MapContainer 
        center={center} 
        zoom={4} 
        style={{ height: '100vh', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        <MapInstanceCapture setMap={setMap} />
        <MapEvents onBoundsChange={handleBoundsChange} />

        {stores.map((item, index) => {
          const position: [number, number] = [parseFloat(item.lat || item.latitude), parseFloat(item.lng || item.longitude)];
          
          if (tier === 1) {
            return (
              <Marker 
                key={item.state} 
                position={position}
                icon={L.divIcon({
                  className: 'custom-div-icon',
                  html: `<div class="state-marker-leaflet">
                          <span class="code">${item.state}</span>
                          <span class="count">${formatCount(item.store_count)}</span>
                         </div>`,
                  iconSize: [60, 40],
                  iconAnchor: [30, 20]
                })}
              />
            );
          } else if (tier === 2) {
            return (
              <Marker 
                key={`cluster-${index}`} 
                position={position}
                icon={L.divIcon({
                  className: 'custom-div-icon',
                  html: `<div class="cluster-marker-leaflet">${item.store_count}</div>`,
                  iconSize: [40, 40],
                  iconAnchor: [20, 20]
                })}
              />
            );
          } else {
            return (
              <Marker 
                key={item.id} 
                position={position}
                icon={L.divIcon({
                  className: 'custom-div-icon',
                  html: `<div class="store-dot ${item.status.toLowerCase()}"></div>`,
                  iconSize: [12, 12],
                  iconAnchor: [6, 6]
                })}
              >
                <Popup>
                  <div className="info-window-content">
                    <h3>Brand {item.brand_initial}</h3>
                    <div className="info-grid">
                      <div><strong>Location:</strong> {item.city}, {item.state}</div>
                      <div><strong>Zip:</strong> {item.zipcode}</div>
                      <div><strong>Type:</strong> {item.type}</div>
                      <div><strong>Status:</strong> <span className={`status-pill ${item.status.toLowerCase()}`}>{item.status}</span></div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          }
        })}
      </MapContainer>
    </div>
  );
};

const formatCount = (count: number) => {
  if (count >= 1000) return (count / 1000).toFixed(1) + 'k';
  return count;
};

export default App;
