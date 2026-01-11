import * as Location from "expo-location";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { fetchHotspots, fetchHotspotsInBBox, Hotspot } from "../lib/map";
import { supabase } from "../lib/supabase";

const STATUSES = ["all", "pending", "resolved", "verified"];

export default function MapScreen() {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedHotspot, setSelectedHotspot] = useState<any>(null);
  // Set default region immediately so map shows right away
  const [region, setRegion] = useState<any | null>({
    latitude: 20.5937,
    longitude: 78.9629,
    latitudeDelta: 10,
    longitudeDelta: 10,
  });
  const [userCityId, setUserCityId] = useState<string | null>(null);
  const mapRef = useRef<any>(null);
  const regionTimeout = useRef<any>(null);

  useEffect(() => {
    let mounted = true;

    const initializeMap = async () => {
      try {
        // Get location permissions first
        const locationStatus = await Location.requestForegroundPermissionsAsync();
        
        // Try to get user location quickly
        let loc: any = null;
        if (locationStatus.status === "granted") {
          try {
            // Use getLastKnownPositionAsync first (instant, cached location)
            const lastKnown = await Location.getLastKnownPositionAsync();
            
            if (lastKnown) {
              // Use cached location immediately
              loc = lastKnown;
            } else {
              // If no cached location, try current position with timeout
              const locationPromise = Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
                mayShowUserSettingsDialog: false,
              });
              const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Location timeout')), 8000)
              );
              loc = await Promise.race([locationPromise, timeoutPromise]);
            }
          } catch (e) {
            // Silent fail - will use fallback region
          }
        }

        // Set initial region based on location or fallback
        const initialRegion = loc ? {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        } : {
          latitude: 20.5937,
          longitude: 78.9629,
          latitudeDelta: 10,
          longitudeDelta: 10,
        };

        if (mounted) {
          setRegion(initialRegion);
          setLoading(false); // Show map with initial region
        }

        // Load user city
        const sessionResult = await supabase.auth.getSession();

        // Set user city
        let cityId: string | null = null;
        if (sessionResult?.data?.session?.user) {
          cityId = sessionResult.data.session.user.user_metadata?.city_id || null;
          if (mounted) setUserCityId(cityId);
        }

        // Load hotspots for the region
        if (mounted) {
          if (loc) {
            const bbox = {
              min_lat: loc.coords.latitude - 0.08 / 2,
              max_lat: loc.coords.latitude + 0.08 / 2,
              min_lng: loc.coords.longitude - 0.08 / 2,
              max_lng: loc.coords.longitude + 0.08 / 2,
            };
            const rows = await fetchHotspotsInBBox(selectedStatus, bbox, cityId || undefined);
            setHotspots(rows);
          } else {
            await loadHotspots(selectedStatus);
          }
        }
      } catch (e) {
        console.warn("Error initializing map", e);
        if (mounted) {
          // Set fallback region on error
          setRegion({
            latitude: 20.5937,
            longitude: 78.9629,
            latitudeDelta: 10,
            longitudeDelta: 10,
          });
          setLoading(false);
        }
      }
    };

    initializeMap();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    // reload when status filter changes
    // If map has region, fetch by bbox; otherwise fallback to full fetch
    const reloadHotspots = async () => {
      if (region) {
        const bbox = {
          min_lat: region.latitude - region.latitudeDelta / 2,
          max_lat: region.latitude + region.latitudeDelta / 2,
          min_lng: region.longitude - region.longitudeDelta / 2,
          max_lng: region.longitude + region.longitudeDelta / 2,
        };
        const rows = await fetchHotspotsInBBox(selectedStatus, bbox, userCityId || undefined);
        setHotspots(rows);
      } else {
        await loadHotspots(selectedStatus);
      }
    };
    reloadHotspots();
  }, [selectedStatus]);

  // Re-fetch user city when screen comes into focus (e.g., after city change)
  useFocusEffect(
    useCallback(() => {
      const refreshUserCity = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const cityId = session.user.user_metadata?.city_id || null;
            setUserCityId(cityId);
          }
        } catch (e) {
          console.warn("Could not refresh user city id", e);
        }
      };
      refreshUserCity();
    }, [])
  );

  useEffect(() => {
    return () => {
      if (regionTimeout.current) clearTimeout(regionTimeout.current);
    };
  }, []);

  async function loadHotspots(status: string) {
    setLoading(true);
    const rows = await fetchHotspots(status, userCityId || undefined);
    setHotspots(rows);
    setLoading(false);
    // If there are markers, center map to first one
    if (rows.length > 0 && mapRef.current) {
      const r = {
        latitude: rows[0].latitude,
        longitude: rows[0].longitude,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      };
      mapRef.current.animateToRegion(r, 500);
    }
  }

  // called by MapView when panning/zooming stops
  function handleRegionChangeComplete(newRegion: any) {
    setRegion(newRegion);

    // debounce requests while user is interacting
    if (regionTimeout.current) clearTimeout(regionTimeout.current);
    regionTimeout.current = setTimeout(async () => {
      try {
        const bbox = {
          min_lat: newRegion.latitude - newRegion.latitudeDelta / 2,
          max_lat: newRegion.latitude + newRegion.latitudeDelta / 2,
          min_lng: newRegion.longitude - newRegion.longitudeDelta / 2,
          max_lng: newRegion.longitude + newRegion.longitudeDelta / 2,
        };
        const rows = await fetchHotspotsInBBox(selectedStatus, bbox, userCityId || undefined);
        setHotspots(rows);
      } catch (err) {
        console.error("Error fetching bbox hotspots:", err);
      }
    }, 400);
  }

  // Fetch full complaint details when marker is clicked
  const handleMarkerPress = async (hotspot: Hotspot) => {
    try {
      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .eq("id", hotspot.id)
        .single();

      if (!error && data) {
        setSelectedHotspot(data);
      }
    } catch (err) {
      console.error("Error fetching complaint details:", err);
      setSelectedHotspot(hotspot);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        {STATUSES.map((s) => (
          <Pressable
            key={s}
            style={[
              styles.pill,
              selectedStatus === s ? styles.pillActive : styles.pillInactive,
            ]}
            onPress={() => setSelectedStatus(s)}
          >
            <Text
              style={
                selectedStatus === s
                  ? styles.pillTextActive
                  : styles.pillTextInactive
              }
            >
              {s.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>

      {!region || loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2f95dc" />
          <Text style={{ marginTop: 12 }}>
            {loading ? "Loading hotspots..." : "Determining location..."}
          </Text>
        </View>
      ) : (
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={region}
          showsUserLocation
          onRegionChangeComplete={handleRegionChangeComplete}
        >
          {hotspots.map((h) => (
            <Marker
              key={String(h.id)}
              coordinate={{ latitude: h.latitude, longitude: h.longitude }}
              title={h.title || "Complaint"}
              description={h.status}
              onPress={() => handleMarkerPress(h)}
            >
              {h.image_url ? (
                <View style={styles.markerImageWrap}>
                  <Image
                    source={{ uri: h.image_url }}
                    style={styles.markerImage}
                  />
                </View>
              ) : (
                <View
                  style={[styles.defaultMarker, markerColorForStatus(h.status)]}
                />
              )}
            </Marker>
          ))}
        </MapView>
      )}

      {/* Complaint Details Modal */}
      <Modal
        visible={!!selectedHotspot}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedHotspot(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Pressable
              style={styles.modalClose}
              onPress={() => setSelectedHotspot(null)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </Pressable>

            <ScrollView style={styles.modalScroll}>
              {selectedHotspot?.image_url && (
                <Image
                  source={{ uri: selectedHotspot.image_url }}
                  style={styles.modalImage}
                />
              )}

              <View style={styles.modalBody}>
                <Text style={styles.modalTitle}>{selectedHotspot?.title}</Text>

                <View style={styles.modalField}>
                  <Text style={styles.modalLabel}>Status</Text>
                  <Text style={[styles.modalValue, statusColor(selectedHotspot?.status)]}>
                    {selectedHotspot?.status?.toUpperCase()}
                  </Text>
                </View>

                {selectedHotspot?.description && (
                  <View style={styles.modalField}>
                    <Text style={styles.modalLabel}>Description</Text>
                    <Text style={styles.modalValue}>{selectedHotspot.description}</Text>
                  </View>
                )}

                {selectedHotspot?.category && (
                  <View style={styles.modalField}>
                    <Text style={styles.modalLabel}>Category</Text>
                    <Text style={styles.modalValue}>{selectedHotspot.category}</Text>
                  </View>
                )}

                {selectedHotspot?.created_at && (
                  <View style={styles.modalField}>
                    <Text style={styles.modalLabel}>Reported</Text>
                    <Text style={styles.modalValue}>
                      {new Date(selectedHotspot.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function markerColorForStatus(status?: string) {
  switch ((status || "").toLowerCase()) {
    case "verified":
      return { backgroundColor: "#2e7d32" };
    case "resolved":
      return { backgroundColor: "#1565c0" };
    case "pending":
    case "open":
      return { backgroundColor: "#d32f2f" };
    default:
      return { backgroundColor: "#6c757d" };
  }
}

function statusColor(status?: string) {
  switch ((status || "").toLowerCase()) {
    case "verified":
      return { color: "#2e7d32" };
    case "resolved":
      return { color: "#1565c0" };
    case "pending":
    case "open":
      return { color: "#d32f2f" };
    default:
      return { color: "#6c757d" };
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  filterRow: {
    flexDirection: "row",
    padding: 12,
    justifyContent: "space-around",
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  pillActive: { backgroundColor: "#343a40", borderColor: "#343a40" },
  pillInactive: { backgroundColor: "#fff", borderColor: "#dee2e6" },
  pillTextActive: { color: "#fff", fontWeight: "700" },
  pillTextInactive: { color: "#333", fontWeight: "700" },
  map: { flex: 1, width: Dimensions.get("window").width },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  defaultMarker: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#fff",
  },
  markerImageWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#fff",
  },
  markerImage: { width: 36, height: 36 },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    position: "relative",
  },
  modalClose: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  modalScroll: {
    paddingTop: 16,
  },
  modalImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  modalBody: {
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
  },
  modalField: {
    marginBottom: 12,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  modalValue: {
    fontSize: 14,
    color: "#333",
  },
});