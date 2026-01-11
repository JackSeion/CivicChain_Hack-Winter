// src/screens/HomeScreen.tsx
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { HomeFilters } from '../components/HomeFilters';
import { HomeHeader } from '../components/HomeHeader';
import { generateDemoHash, getBlockchainHash, isValidTxHash } from '../lib/blockchain';
import { supabase } from '../lib/supabase';

// Statuses match table values
const STATUSES = ['all', 'pending', 'resolved', 'verified'];

// ==============================
// Filter Pill Component
// ==============================
type FilterPillProps = {
  label: string;
  isSelected: boolean;
  onPress: () => void;
};

const makeTitleCase = (s: string) =>
  s
    .split(' ')
    .map((w) => (w.length ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(' ');

const FilterPill = ({ label, isSelected, onPress }: FilterPillProps) => (
  <Pressable
    style={[styles.pill, isSelected ? styles.pillActive : styles.pillInactive]}
    onPress={onPress}
  >
    <Text style={[styles.pillText, isSelected ? styles.pillTextActive : styles.pillTextInactive]}>
      {makeTitleCase(label)}
    </Text>
  </Pressable>
);

// ==============================
// Search Bar Component (Memoized)
// ==============================
const SearchBar = React.memo(({ 
  searchQuery, 
  onSearchChange, 
  isSearchFocused, 
  onFilterToggle 
}: {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  isSearchFocused: boolean;
  onFilterToggle: () => void;
}) => (
  <View style={styles.searchContainer}>
    <View style={styles.searchBar}>
      <Ionicons name="search" size={20} color="#6c757d" style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search complaints..."
        value={searchQuery}
        onChangeText={onSearchChange}
        placeholderTextColor="#adb5bd"
      />
      {searchQuery.length > 0 && (
        <Pressable onPress={() => onSearchChange('')}>
          <Ionicons name="close-circle" size={20} color="#6c757d" />
        </Pressable>
      )}
      <Pressable 
        onPress={onFilterToggle}
        style={styles.filterToggleButton}
      >
        <Ionicons 
          name={isSearchFocused ? "chevron-up" : "filter"} 
          size={20} 
          color="#6c757d" 
        />
      </Pressable>
    </View>
  </View>
));

// ==============================
// Home Screen
// ==============================

export default function HomeScreen() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // User's city from auth metadata
  const [userCityId, setUserCityId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userDataLoaded, setUserDataLoaded] = useState(false);

  // Track which complaints user has voted on
  const [userVotedComplaints, setUserVotedComplaints] = useState<Set<number>>(new Set());

  // Status filter
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Category filter
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [searchBarHeight, setSearchBarHeight] = useState(70);

  // Debounce search query to prevent excessive re-renders
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Stats
  const [openCount, setOpenCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [resolvedCount, setResolvedCount] = useState(0);
  const [verifiedCount, setVerifiedCount] = useState(0);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase.from('categories').select('id').order('id', { ascending: true });
        if (error) throw error;
        const rows = (data ?? []).map((r: any) => ({ id: String(r.id), name: String(r.id) }));
        setCategories([{ id: 'all', name: 'All' }, ...rows]);
      } catch (e) {
        console.error('Error fetching categories', e);
      }
    };
    fetchCategories();
  }, []);

  // Fetch user's city and email from auth metadata on mount
  useEffect(() => {
    const fetchUserCity = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const cityId = session.user.user_metadata?.city_id;
          if (cityId) {
            setUserCityId(cityId);
          }
          setUserEmail(session.user.email || null);
        }
      } catch (error) {
        console.error('Error fetching user city:', error);
      } finally {
        setUserDataLoaded(true);
      }
    };
    fetchUserCity();
  }, []);

  // Re-fetch user city when screen comes into focus (e.g., after city change)
  useFocusEffect(
    useCallback(() => {
      const refreshUserCity = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const cityId = session.user.user_metadata?.city_id;
            if (cityId && cityId !== userCityId) {
              // City has changed, update it
              setUserCityId(cityId);
            }
          }
        } catch (error) {
          console.error('Error refreshing user city:', error);
        }
      };
      refreshUserCity();
    }, [userCityId])
  );

  // ==============================
  // Fetch Complaints + Stats
  // ==============================
  const fetchComplaintsAndCounts = useCallback(async () => {
    try {
      setLoading(true);

  // --- Fetch counts ---
  // Apply municipal filter to counts if user has a city
      let totalQuery: any = supabase.from('complaints_with_verification_count').select('*', { count: 'exact', head: true });
  let openQuery: any = supabase.from('complaints_with_verification_count').select('*', { count: 'exact', head: true }).eq('status', 'pending');
      let resolvedQuery: any = supabase.from('complaints_with_verification_count').select('*', { count: 'exact', head: true }).eq('status', 'resolved');
      let verifiedQuery: any = supabase.from('complaints_with_verification_count').select('*', { count: 'exact', head: true }).eq('status', 'verified');

      if (userCityId) {
        totalQuery = totalQuery.eq('municipal_id', userCityId);
        openQuery = openQuery.eq('municipal_id', userCityId);
        resolvedQuery = resolvedQuery.eq('municipal_id', userCityId);
        verifiedQuery = verifiedQuery.eq('municipal_id', userCityId);
      }

      const { count: total } = await totalQuery;
      const { count: open } = await openQuery;
      const { count: resolved } = await resolvedQuery;
      const { count: verified } = await verifiedQuery;

      setTotalCount(total ?? 0);
      setOpenCount(open ?? 0);
      setResolvedCount(resolved ?? 0);
      setVerifiedCount(verified ?? 0);

      // --- Fetch complaints list (ordered by votes descending) ---
      let query = supabase
        .from('complaints')
        .select('id, title, description, location, location_address, status, votes, created_at, municipal_id, category_id')
        .order('votes', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

  if (selectedStatus !== 'all') query = query.eq('status', selectedStatus);
  if (selectedCategory !== 'all') query = query.eq('category_id', selectedCategory);
  if (userCityId) query = query.eq('municipal_id', userCityId);

      const { data, error } = await query;
      if (error) throw error;

      setComplaints(data || []);

      // --- Fetch user's voted complaints ---
      if (userEmail) {
        const { data: votesData } = await supabase
          .from('user_votes')
          .select('complaint_id')
          .eq('user_email', userEmail);
        
        if (votesData) {
          const votedIds = new Set(votesData.map(v => v.complaint_id));
          setUserVotedComplaints(votedIds);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setInitialLoad(false);
    }
  }, [userCityId, selectedStatus, selectedCategory, userEmail]);

  useEffect(() => {
    // Only fetch after user data has been loaded
    if (userDataLoaded) {
      fetchComplaintsAndCounts();
    }
  }, [fetchComplaintsAndCounts, userDataLoaded]);

  // Real-time subscription to complaints table for auto-refresh
  useEffect(() => {
    if (!userCityId) return;

    // Subscribe to changes in complaints table for user's city
    const channel = supabase
      .channel('home_complaints_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'complaints',
          filter: `municipal_id=eq.${userCityId}`
        },
        (payload) => {
          console.log('Home complaint change detected:', payload);
          // Refresh complaints list when any change occurs
          fetchComplaintsAndCounts();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userCityId, fetchComplaintsAndCounts]);

  // Handle voting on a complaint
  const handleVote = async (complaintId: number, currentVotes: number) => {
    if (!userEmail) {
      Alert.alert('Error', 'You must be logged in to vote');
      return;
    }

    // Check if user has already voted
    if (userVotedComplaints.has(complaintId)) {
      Alert.alert('Already Voted', 'You have already voted on this complaint');
      return;
    }

    try {
      // Record the vote in user_votes table
      const { error: voteError } = await supabase
        .from('user_votes')
        .insert({
          user_email: userEmail,
          complaint_id: complaintId
        });

      if (voteError) throw voteError;

      // Increment vote count
      const { error: updateError } = await supabase
        .from('complaints')
        .update({ votes: (currentVotes || 0) + 1 })
        .eq('id', complaintId);

      if (updateError) throw updateError;

      // Update local state
      setUserVotedComplaints(prev => new Set(prev).add(complaintId));

      Alert.alert('Success', 'Your vote has been recorded!');
      // Refresh will happen automatically via realtime subscription
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to vote');
    }
  };

  // Handle verify button - open Sepolia Etherscan
  const handleVerify = async (complaintId: number) => {
    try {
      // Try to fetch blockchain hash from your backend/service
      let txHash = await getBlockchainHash(complaintId);
      
      if (!txHash) {
        // Generate a demo transaction hash for demonstration purposes
        // In production, this should come from actual blockchain transaction
        txHash = generateDemoHash(complaintId);
        
        Alert.alert(
          'Demo Mode',
          `No blockchain transaction found for this complaint.\n\nThis is a demo. In production, complaints would be verified on the Ethereum Sepolia blockchain.\n\nDemo TX Hash: ${txHash.substring(0, 20)}...`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'View Demo on Sepolia', 
              onPress: () => openSepoliaExplorer(txHash!)
            }
          ]
        );
        return;
      }

      // Validate the hash format
      if (!isValidTxHash(txHash)) {
        Alert.alert('Invalid Hash', 'The blockchain transaction hash is invalid.');
        return;
      }

      // Open Sepolia Etherscan with the real transaction
      openSepoliaExplorer(txHash);
    } catch (error: any) {
      console.error('Error verifying complaint:', error);
      Alert.alert('Error', error.message || 'Failed to open verification link');
    }
  };

  // Open Sepolia Etherscan in browser
  const openSepoliaExplorer = async (txHash: string) => {
    const url = `https://sepolia.etherscan.io/tx/${txHash}`;
    const canOpen = await Linking.canOpenURL(url);
    
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Error', 'Cannot open Etherscan. Please check your browser settings.');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchComplaintsAndCounts();
  };

  // Memoize filtered data to prevent re-renders (already filtered by city, status, category in fetchComplaintsAndCounts)
  const filteredComplaints = useMemo(() => {
    // complaints array is already filtered by city, status, and category from the database query
    // We only need to apply the search filter here
    return complaints.filter(item => {
      if (!debouncedSearch) return true;
      const query = debouncedSearch.toLowerCase();
      return item.title.toLowerCase().includes(query) || 
             item.description.toLowerCase().includes(query) ||
             (item.location_address && item.location_address.toLowerCase().includes(query));
    });
  }, [complaints, debouncedSearch]);

  // ==============================
  // Header (light - stats only)
  // ==============================
  const ListHeader = useCallback(() => {
    // Calculate dynamic counts based on filtered results (category + search)
    const dynamicOpenCount = filteredComplaints.filter(c => c.status === 'pending').length;
    const dynamicResolvedCount = filteredComplaints.filter(c => c.status === 'resolved').length;
    const dynamicVerifiedCount = filteredComplaints.filter(c => c.status === 'verified').length;
    const dynamicTotalCount = filteredComplaints.length;

    return (
      <HomeHeader
        subtitle="Make your city better"
        openCount={dynamicOpenCount}
        resolvedCount={dynamicResolvedCount}
        verifiedCount={dynamicVerifiedCount}
        totalCount={dynamicTotalCount}
        selectedStatus={selectedStatus}
        totalDisplay={dynamicTotalCount}
        onStatusPress={setSelectedStatus}
      />
    );
  }, [filteredComplaints, selectedStatus]);

  // ==============================
  // Empty List
  // ==============================
  const EmptyList = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="mailbox-outline" size={80} color="#ced4da" />
      <Text style={styles.emptyTitle}>No complaints found</Text>
      <Text style={styles.emptySubtitle}>
        Try adjusting your filters or be the first to report an issue!
      </Text>
    </View>
  );

  // ==============================
  // Render
  // ==============================
  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#2f95dc" style={{ flex: 1 }} />
      ) : (
        <>
          <View style={styles.contentWrapper}>
            {/* Search Bar - Fixed at top */}
            <View 
              style={styles.searchContainer}
              onLayout={(event) => {
                const { height } = event.nativeEvent.layout;
                setSearchBarHeight(height);
              }}
            >
              <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#6c757d" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search complaints..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#adb5bd"
                editable={true}
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="#6c757d" />
                </Pressable>
              )}
              <Pressable 
                onPress={() => setIsSearchFocused(!isSearchFocused)}
                style={styles.filterToggleButton}
              >
                <Ionicons 
                  name={isSearchFocused ? "chevron-up" : "filter"} 
                  size={20} 
                  color="#6c757d" 
                />
              </Pressable>
              </View>
            </View>

            {/* FlatList with Stats Header */}
            <FlatList
            style={styles.flatList}
            data={filteredComplaints}
            keyExtractor={(item) => item.id.toString()}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            removeClippedSubviews={false}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            ListHeaderComponent={ListHeader}
            ListEmptyComponent={EmptyList}
            contentContainerStyle={styles.flatListContainer}
            refreshing={refreshing}
            onRefresh={onRefresh}
            onScroll={() => {
              if (isSearchFocused) {
                setIsSearchFocused(false);
                setShowStatusDropdown(false);
                setShowCategoryDropdown(false);
              }
            }}
            scrollEventThrottle={16}
            renderItem={({ item }) => {
            const hasVoted = userVotedComplaints.has(item.id);
            return (
              <View style={styles.complaintCard}>
                <Pressable 
                  onPress={() => {
                    Alert.alert(
                      item.title,
                      `${item.description}\n\nLocation: ${item.location || 'N/A'}\nStatus: ${item.status}\nVotes: ${item.votes || 0}`,
                      [{ text: 'OK' }]
                    );
                  }}
                >
                  <Text style={styles.complaintTitle}>{item.title}</Text>
                  <Text numberOfLines={2} style={styles.complaintDescription}>{item.description}</Text>
                </Pressable>
                
                <View style={styles.complaintFooter}>
                  <View style={styles.voteInfo}>
                    <Ionicons name="arrow-up-circle" size={20} color="#6c757d" />
                    <Text style={styles.voteCount}>{item.votes || 0} votes</Text>
                  </View>
                  <View style={styles.actionButtons}>
                    <Pressable 
                      style={styles.verifyButton}
                      onPress={() => handleVerify(item.id)}
                    >
                      <Ionicons name="shield-checkmark" size={18} color="#28a745" />
                      <Text style={styles.verifyButtonText}>Verify</Text>
                    </Pressable>
                    <Pressable 
                      style={[styles.voteButton, hasVoted && styles.voteButtonDisabled]}
                      onPress={() => handleVote(item.id, item.votes)}
                      disabled={hasVoted}
                    >
                      <Ionicons 
                        name={hasVoted ? "checkmark-circle" : "arrow-up-circle-outline"} 
                        size={20} 
                        color={hasVoted ? "#6c757d" : "#007bff"} 
                      />
                      <Text style={[styles.voteButtonText, hasVoted && styles.voteButtonTextDisabled]}>
                        {hasVoted ? 'Voted' : 'Vote'}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          }}
          />
          </View>

          {/* Filter Options - Full-screen modal overlay */}
          {isSearchFocused && (
            <Pressable 
              style={styles.filterModalOverlay}
              onPress={() => {
                setIsSearchFocused(false);
                setShowStatusDropdown(false);
                setShowCategoryDropdown(false);
              }}
            >
              <Pressable 
                style={styles.filterModalContent}
                onPress={(e) => e.stopPropagation()}
              >
                <View style={styles.filterHeader}>
                  <Text style={styles.filterHeaderText}>Filters</Text>
                  <Pressable onPress={() => {
                    setIsSearchFocused(false);
                    setShowStatusDropdown(false);
                    setShowCategoryDropdown(false);
                  }}>
                    <Ionicons name="close" size={20} color="#6c757d" />
                  </Pressable>
                </View>
                <HomeFilters
                  selectedStatus={selectedStatus}
                  selectedCategory={selectedCategory}
                  showStatusDropdown={showStatusDropdown}
                  showCategoryDropdown={showCategoryDropdown}
                  categories={categories}
                  onStatusChange={setSelectedStatus}
                  onStatusDropdownToggle={setShowStatusDropdown}
                  onCategoryChange={setSelectedCategory}
                  onCategoryDropdownToggle={setShowCategoryDropdown}
                />
              </Pressable>
            </Pressable>
          )}
        </>
      )}

      {/* Floating Action Buttons */}
      <View style={styles.fabContainer}>
        <Pressable style={styles.fabSmall} onPress={onRefresh}>
          <Ionicons name="refresh" size={20} color="#495057" />
        </Pressable>
      </View>

      <Link href="/add-complaint" asChild>
        <Pressable style={styles.fabMain}>
          <Ionicons name="add" size={32} color="white" />
        </Pressable>
      </Link>
    </View>
  );
}

// ==============================
// Styles
// ==============================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentWrapper: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  flatList: {
    flex: 1,
  },
  flatListContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  subtitle: {
    fontSize: 22,
    color: '#343a40',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  statCardActive: {
    borderWidth: 2,
    borderColor: '#2f95dc',
    transform: [{ scale: 1.02 }],
  },
  statLabel: {
    fontSize: 12,
    color: '#495057',
    marginTop: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#f8f9fa',
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#343a40',
    paddingVertical: 4,
  },
  filterToggleButton: {
    padding: 4,
    marginLeft: 8,
  },
  filterModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    paddingTop: 70,
    paddingHorizontal: 16,
  },
  filterModalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginTop: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterHeaderText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#343a40',
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  filterColumn: {
    flex: 1,
    minHeight: 60,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  statusDropdown: {
    position: 'relative',
    zIndex: 1,
  },
  categoryDropdown: {
    position: 'relative',
    zIndex: 2,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  dropdownButtonText: {
    fontSize: 13,
    color: '#343a40',
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    maxHeight: 250,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  dropdownOptionActive: {
    backgroundColor: '#e7f3ff',
  },
  dropdownOptionText: {
    fontSize: 13,
    color: '#495057',
  },
  dropdownOptionTextActive: {
    color: '#2f95dc',
    fontWeight: '600',
  },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  pillActive: {
    backgroundColor: '#343a40',
    borderColor: '#343a40',
  },
  pillInactive: {
    backgroundColor: '#ffffff',
    borderColor: '#dee2e6',
  },
  pillText: {
    fontWeight: '600',
    fontSize: 12,
  },
  pillTextActive: {
    color: '#ffffff',
  },
  pillTextInactive: {
    color: '#495057',
  },
  emptyContainer: {
    marginTop: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#495057',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 8,
    textAlign: 'center',
    maxWidth: '80%',
  },
  complaintCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  complaintTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  complaintDescription: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 12,
  },
  complaintFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  voteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  voteCount: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#d4edda',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  verifyButtonText: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '600',
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#e7f3ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  voteButtonText: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '600',
  },
  voteButtonDisabled: {
    backgroundColor: '#e9ecef',
    opacity: 0.6,
  },
  voteButtonTextDisabled: {
    color: '#6c757d',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    alignItems: 'center',
  },
  fabSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginTop: 10,
  },
  fabMain: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2f95dc',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
