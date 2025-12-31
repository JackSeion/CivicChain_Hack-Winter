import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface HomeHeaderProps {
  subtitle: string;
  openCount: number;
  resolvedCount: number;
  verifiedCount: number;
  totalCount: number;
  selectedStatus: string;
  totalDisplay: number;
  onStatusPress: (status: string) => void;
}

const makeTitleCase = (s: string) =>
  s
    .split(' ')
    .map((w) => (w.length ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(' ');

const HomeHeaderComponent: React.FC<HomeHeaderProps> = ({
  subtitle,
  openCount,
  resolvedCount,
  verifiedCount,
  totalCount,
  selectedStatus,
  totalDisplay,
  onStatusPress,
}) => (
  <View>
    <Text style={styles.subtitle}>{subtitle}</Text>

    {/* Stats */}
    <View style={styles.statsContainer}>
      <Pressable
        style={[
          styles.statCard,
          selectedStatus === 'pending' ? styles.statCardActive : null,
          { backgroundColor: '#ffebee' },
        ]}
        onPress={() => onStatusPress('pending')}
      >
        <Text style={[styles.statNumber, { color: '#d32f2f' }]}>{openCount}</Text>
        <Text style={styles.statLabel}>OPEN</Text>
      </Pressable>
      <Pressable
        style={[
          styles.statCard,
          selectedStatus === 'resolved' ? styles.statCardActive : null,
          { backgroundColor: '#e8f5e9' },
        ]}
        onPress={() => onStatusPress('resolved')}
      >
        <Text style={[styles.statNumber, { color: '#388e3c' }]}>{resolvedCount}</Text>
        <Text style={styles.statLabel}>RESOLVED</Text>
      </Pressable>
      <Pressable
        style={[
          styles.statCard,
          selectedStatus === 'verified' ? styles.statCardActive : null,
          { backgroundColor: '#f3e8ff' },
        ]}
        onPress={() => onStatusPress('verified')}
      >
        <Text style={[styles.statNumber, { color: '#6a1b9a' }]}>{verifiedCount}</Text>
        <Text style={styles.statLabel}>VERIFIED</Text>
      </Pressable>
      <Pressable
        style={[
          styles.statCard,
          selectedStatus === 'all' ? styles.statCardActive : null,
          { backgroundColor: '#e3f2fd' },
        ]}
        onPress={() => onStatusPress('all')}
      >
        <Text style={[styles.statNumber, { color: '#1976d2' }]}>{totalDisplay}</Text>
        <Text style={styles.statLabel}>TOTAL</Text>
      </Pressable>
    </View>
  </View>
);

export const HomeHeader = React.memo(HomeHeaderComponent);

const styles = StyleSheet.create({
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
});
