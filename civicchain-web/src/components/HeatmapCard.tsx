import { Card } from "./ui/card";
import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { getComplaintsByMunicipal, Complaint } from "../utils/api";

interface HeatmapCardProps {
  municipalId: string;
}

interface ComplaintLocation {
  lat: number;
  lng: number;
  weight: number;
}

// Municipal center coordinates
const municipalCenters: Record<string, { lat: number; lng: number; zoom: number }> = {
  mumbai: { lat: 19.0760, lng: 72.8777, zoom: 11 },
  pune: { lat: 18.5204, lng: 73.8567, zoom: 12 },
  nagpur: { lat: 21.1458, lng: 79.0882, zoom: 12 },
  bangalore: { lat: 12.9716, lng: 77.5946, zoom: 11 },
  mysore: { lat: 12.2958, lng: 76.6394, zoom: 12 },
  hubli: { lat: 15.3647, lng: 75.1240, zoom: 12 },
  ndmc: { lat: 28.6139, lng: 77.2090, zoom: 12 },
  sdmc: { lat: 28.5355, lng: 77.2495, zoom: 12 },
  edmc: { lat: 28.6692, lng: 77.3054, zoom: 12 },
  ahmedabad: { lat: 23.0225, lng: 72.5714, zoom: 11 },
  surat: { lat: 21.1702, lng: 72.8311, zoom: 12 },
  vadodara: { lat: 22.3072, lng: 73.1812, zoom: 12 },
  ludhiana: { lat: 30.9010, lng: 75.8573, zoom: 12 },
};

export function HeatmapCard({ municipalId }: HeatmapCardProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'overall' | 'pending' | 'verified'>('overall');
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const heatmapRef = useRef<google.maps.visualization.HeatmapLayer | null>(null);

  useEffect(() => {
    loadGoogleMapsScript();
  }, []);

  useEffect(() => {
    if (!isLoading && window.google?.maps?.visualization && mapRef.current && !mapInstanceRef.current) {
      initializeMap();
    } else if (!isLoading && window.google?.maps?.visualization && mapInstanceRef.current) {
      updateHeatmap();
    }
  }, [municipalId, isLoading, filter]);

  function loadGoogleMapsScript() {
    // Check if script already loaded
    if (window.google?.maps?.visualization) {
      console.log('Google Maps already loaded');
      setIsLoading(false);
      if (mapRef.current && !mapInstanceRef.current) {
        setTimeout(() => initializeMap(), 100);
      }
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      console.log('Google Maps script already in DOM, waiting...');
      // Wait for it to load
      let attempts = 0;
      const checkGoogle = setInterval(() => {
        attempts++;
        if (window.google?.maps?.visualization) {
          console.log('Google Maps loaded successfully');
          clearInterval(checkGoogle);
          setIsLoading(false);
          if (mapRef.current && !mapInstanceRef.current) {
            setTimeout(() => initializeMap(), 100);
          }
        } else if (attempts > 50) {
          // Timeout after 5 seconds
          console.error('Google Maps loading timeout');
          clearInterval(checkGoogle);
          setError("Google Maps loading timeout. Please refresh the page.");
          setIsLoading(false);
        }
      }, 100);
      return;
    }

    console.log('Loading Google Maps script...');
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBWak1GmJvHzfiRHKnE9_oHAzsuZtwEqrU&libraries=visualization`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log('Google Maps script loaded');
      // Wait a bit for the API to initialize
      setTimeout(() => {
        if (window.google?.maps?.visualization) {
          console.log('Google Maps API ready');
          setIsLoading(false);
          if (mapRef.current && !mapInstanceRef.current) {
            initializeMap();
          }
        } else {
          console.error('Google Maps API not ready after load');
          setError("Failed to initialize Google Maps");
          setIsLoading(false);
        }
      }, 200);
    };
    script.onerror = (e) => {
      console.error("Failed to load Google Maps script", e);
      setError("Failed to load Google Maps");
      setIsLoading(false);
    };
    document.head.appendChild(script);
  }

  function parseCoordinatesFromLocation(location: string): { lat: number; lng: number } | null {
    // Try to parse coordinates from location string
    // Format could be: "19.0760, 72.8777" or "19.0760,72.8777"
    
    const coordPattern = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)\s*,\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;
    
    if (coordPattern.test(location.trim())) {
      const parts = location.split(',').map(p => p.trim());
      if (parts.length === 2) {
        const lat = parseFloat(parts[0]);
        const lng = parseFloat(parts[1]);
        
        if (!isNaN(lat) && !isNaN(lng) && 
            lat >= -90 && lat <= 90 && 
            lng >= -180 && lng <= 180) {
          return { lat, lng };
        }
      }
    }
    
    return null;
  }

  async function fetchComplaintLocations(): Promise<ComplaintLocation[]> {
    try {
      // Fetch actual complaints from database
      let complaints = await getComplaintsByMunicipal(municipalId);
      
      console.log(`Fetched ${complaints.length} complaints for municipal ${municipalId}`);
      
      // Apply filter
      if (filter === 'pending') {
        complaints = complaints.filter(c => c.status === 'pending');
      } else if (filter === 'verified') {
        complaints = complaints.filter(c => c.status === 'verified');
      }
      
      console.log(`After ${filter} filter: ${complaints.length} complaints`);
      
      const center = municipalCenters[municipalId] || municipalCenters.mumbai;
      const locations: ComplaintLocation[] = [];
      let complaintsWithCoords = 0;
      let complaintsWithoutCoords = 0;
      
      // Create locations from actual complaints with coordinates
      complaints.forEach((complaint) => {
        let lat: number | null = null;
        let lng: number | null = null;
        
        // Strategy 1: Try to parse from location field (format: "lat,lng")
        const parsedFromLocation = parseCoordinatesFromLocation(complaint.location);
        if (parsedFromLocation) {
          lat = parsedFromLocation.lat;
          lng = parsedFromLocation.lng;
          console.log(`Complaint ${complaint.id}: Parsed coords from location field (${lat}, ${lng})`);
        }
        
        // Strategy 2: Use latitude/longitude fields if available
        if (lat === null && complaint.latitude !== null && complaint.latitude !== undefined && 
            complaint.longitude !== null && complaint.longitude !== undefined) {
          const parsedLat = typeof complaint.latitude === 'number' ? complaint.latitude : parseFloat(String(complaint.latitude));
          const parsedLng = typeof complaint.longitude === 'number' ? complaint.longitude : parseFloat(String(complaint.longitude));
          
          // Validate coordinates are within valid ranges
          if (!isNaN(parsedLat) && !isNaN(parsedLng) && 
              parsedLat >= -90 && parsedLat <= 90 && 
              parsedLng >= -180 && parsedLng <= 180) {
            lat = parsedLat;
            lng = parsedLng;
            console.log(`Complaint ${complaint.id}: Using lat/lng fields (${lat}, ${lng})`);
          }
        }
        
        // Strategy 3: Generate coordinates around municipal center if no valid coords found
        if (lat === null || lng === null) {
          // Generate deterministic random position based on complaint ID
          const seed = complaint.id * 12345.6789;
          const latOffset = (Math.sin(seed) * 0.5 + 0.5) * 0.1 - 0.05; // -0.05 to +0.05
          const lngOffset = (Math.cos(seed) * 0.5 + 0.5) * 0.1 - 0.05; // -0.05 to +0.05
          
          lat = center.lat + latOffset;
          lng = center.lng + lngOffset;
          complaintsWithoutCoords++;
          console.log(`Complaint ${complaint.id}: Generated coords around center (${lat}, ${lng})`);
        } else {
          complaintsWithCoords++;
        }
        
        // Weight by votes + 1 (so complaints with 0 votes still show)
        const weight = Math.log(complaint.votes + 1) + 1;
        
        locations.push({
          lat,
          lng,
          weight: weight,
        });
        
        // Add extra points for high-vote complaints to make them more visible
        if (complaint.votes > 100) {
          const extraPoints = Math.min(Math.floor(complaint.votes / 50), 5);
          for (let i = 0; i < extraPoints; i++) {
            const scatter = 0.002;
            locations.push({
              lat: lat + (Math.random() - 0.5) * scatter,
              lng: lng + (Math.random() - 0.5) * scatter,
              weight: weight * 0.5,
            });
          }
        }
      });
      
      console.log(`Heatmap data: ${complaintsWithCoords} complaints with real coords, ${complaintsWithoutCoords} with generated coords`);
      console.log(`Total heatmap points: ${locations.length}`);
      
      return locations;
    } catch (error) {
      console.error('Error fetching complaints for heatmap:', error);
      // Return empty array on error
      return [];
    }
  }

  async function initializeMap() {
    if (!mapRef.current || !window.google?.maps) return;

    console.log('Initializing map...');
    const center = municipalCenters[municipalId] || municipalCenters.mumbai;

    try {
      const map = new google.maps.Map(mapRef.current, {
        center: { lat: center.lat, lng: center.lng },
        zoom: center.zoom,
        mapTypeId: "roadmap",
        styles: [
          {
            featureType: "poi",
            stylers: [{ visibility: "off" }],
          },
        ],
      });

      mapInstanceRef.current = map;
      console.log('Map initialized');
      await updateHeatmap();
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map');
    }
  }

  async function updateHeatmap() {
    if (!mapInstanceRef.current || !window.google?.maps?.visualization) return;

    console.log('Updating heatmap...');
    try {
      const locations = await fetchComplaintLocations();
      
      console.log(`Found ${locations.length} complaint locations`);
      
      // Remove existing heatmap if any
      if (heatmapRef.current) {
        heatmapRef.current.setMap(null);
      }

      if (locations.length === 0) {
        console.log('No complaints to display on heatmap');
        return;
      }

      // Create weighted heatmap data
      const heatmapData = locations.map((loc) => ({
        location: new google.maps.LatLng(loc.lat, loc.lng),
        weight: loc.weight,
      }));

      // Create heatmap layer
      const heatmap = new google.maps.visualization.HeatmapLayer({
        data: heatmapData,
        map: mapInstanceRef.current,
        radius: 30,
        opacity: 0.8,
        maxIntensity: 10,
        dissipating: true,
        gradient: [
          "rgba(0, 255, 255, 0)",
          "rgba(0, 255, 255, 0.7)",
          "rgba(0, 191, 255, 0.8)",
          "rgba(0, 127, 255, 0.9)",
          "rgba(0, 63, 255, 1)",
          "rgba(0, 0, 255, 1)",
          "rgba(63, 0, 191, 1)",
          "rgba(127, 0, 127, 1)",
          "rgba(191, 0, 63, 1)",
          "rgba(255, 0, 0, 1)",
        ],
      });

      heatmapRef.current = heatmap;
      console.log('Heatmap updated successfully');

      // Recenter map
      const center = municipalCenters[municipalId] || municipalCenters.mumbai;
      mapInstanceRef.current.setCenter({ lat: center.lat, lng: center.lng });
      mapInstanceRef.current.setZoom(center.zoom);
    } catch (err) {
      console.error("Error updating heatmap:", err);
      setError("Failed to load complaint data");
    }
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-6 h-6 text-blue-600" />
          <h2>Complaint Heatmap</h2>
        </div>
        <div className="h-96 flex items-center justify-center bg-red-50 rounded-lg border-2 border-red-200">
          <div className="text-center p-6">
            <p className="text-red-600 mb-2">{error}</p>
            <button 
              onClick={() => {
                setError(null);
                setIsLoading(true);
                loadGoogleMapsScript();
              }}
              className="text-sm text-blue-600 hover:underline"
            >
              Try again
            </button>
          </div>
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-6 h-6 text-blue-600" />
          <h2>Complaint Heatmap</h2>
        </div>
        <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-6 h-6 text-blue-600" />
          <h2>Complaint Heatmap</h2>
        </div>
        
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
          <TabsList>
            <TabsTrigger value="overall">Overall</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="verified">Verified</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <p className="text-gray-600 text-sm mb-4">
        Geographic distribution of {filter === 'overall' ? 'all' : filter} complaints for {municipalId}. Red areas indicate higher complaint density, with intensity based on number of votes.
      </p>
      <div ref={mapRef} className="h-96 w-full rounded-lg border border-gray-200" />
      
      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-12 h-4 rounded" style={{
            background: "linear-gradient(to right, rgba(0, 255, 255, 0.7), rgba(0, 0, 255, 0.7), rgba(255, 0, 0, 0.7))"
          }} />
          <span className="text-sm text-gray-600">
            <span className="text-blue-600">Low</span> → <span className="text-red-600">High</span> Complaint Density
          </span>
        </div>
      </div>
    </Card>
  );
}

// Extend Window type for Google Maps
declare global {
  interface Window {
    google: typeof google;
  }
}
