import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { CityStat, fetchLeaderboard } from "../lib/leaderboard";

export default function LeaderboardScreen() {
  const [data, setData] = useState<CityStat[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Force a light, soft-blue palette for this screen regardless of system theme
  const palette = useMemo(() => getPalette(false), []);
  const styles = useMemo(() => makeStyles(palette), [palette]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      const rows = await fetchLeaderboard();
      if (mounted) setData(rows);
      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    const rows = await fetchLeaderboard();
    setData(rows);
    setRefreshing(false);
  };

  const sortedData = useMemo(() => {
    if (!data) return [] as CityStat[];
    // Always sort by score_percentage (default)
    return [...data].sort((a, b) => b.score_percentage - a.score_percentage);
  }, [data]);

  const topThree = sortedData.slice(0, 3);
  const rest = sortedData.slice(3);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>City Leaderboard</Text>
        <Text style={styles.headerSubtitle}>{data?.length ?? 0} cities</Text>
      </View>

      {/* Content */}
      {loading ? (
        <LoadingSkeleton palette={palette} styles={styles} />
      ) : (
        <>
          {/* Podium */}
          {topThree.length > 0 && (
            <View style={styles.podiumRow}>
              {topThree.map((item, i) => (
                <PodiumCard
                  key={item.name}
                  palette={palette}
                  item={item}
                  rank={i + 1}
                />
              ))}
            </View>
          )}
          <FlatList
            data={rest}
            keyExtractor={(item) => item.name}
            contentContainerStyle={{ paddingBottom: 24 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            renderItem={({ item, index }) => (
              <LeaderboardRow
                palette={palette}
                styles={styles}
                item={item}
                rank={index + 4}
              />
            )}
          />
        </>
      )}
    </View>
  );
}

type Palette = {
  screenBg: string;
  headerBg: string;
  headerBorder: string;
  textPrimary: string;
  textSecondary: string;
  cardBg: string;
  cardBorder: string;
  rankText: string;
  avatarBg: string;
  avatarBorder: string;
  avatarText: string;
  nameText: string;
  valueText: string;
  barBg: string;
  barFill: string;
  pillActiveBg: string;
  pillActiveBorder: string;
  pillActiveText: string;
  pillInactiveBg: string;
  pillInactiveBorder: string;
  pillInactiveText: string;
  medalColors: [string, string, string];
  skeleton: string;
};

function getPalette(dark: boolean): Palette {
  if (!dark) {
    // Light palette
    return {
      screenBg: "#f0f6ff", // soft light blue background
      headerBg: "#f7fbff", // very light blue header
      headerBorder: "#dfeaf8",
      textPrimary: "#0f172a",
      textSecondary: "#6b7280",
      cardBg: "#E6F6FF", // azure blue card tint
      cardBorder: "#CFE9FF", // azure border
      rankText: "#6b7280",
      avatarBg: "#DFF1FF",
      avatarBorder: "#C7E4FF",
      avatarText: "#1e293b",
      nameText: "#0f172a",
      valueText: "#0f766e",
      barBg: "#DCEEFF",
      barFill: "#22c55e",
      pillActiveBg: "#E6F6FF",
      pillActiveBorder: "#CFE9FF",
      pillActiveText: "#1F4E8C",
      pillInactiveBg: "#F1F8FF",
      pillInactiveBorder: "#E3EDFF",
      pillInactiveText: "#6b7280",
      medalColors: ["#b38600", "#8c8f98", "#a06b1a"],
      skeleton: "#eaf4ff",
    };
  }
  // Dark palette (previous defaults)
  return {
    screenBg: "#0b1020",
    headerBg: "#11162a",
    headerBorder: "#1f2744",
    textPrimary: "#e5e7eb",
    textSecondary: "#9aa4c7",
    cardBg: "#121a33",
    cardBorder: "#203057",
    rankText: "#9aa4c7",
    avatarBg: "#1f2b4d",
    avatarBorder: "#2b3e73",
    avatarText: "#cbd5e1",
    nameText: "#e5e7eb",
    valueText: "#c7ffd5",
    barBg: "#1a2240",
    barFill: "#22c55e",
    pillActiveBg: "#1d2546",
    pillActiveBorder: "#60a5fa",
    pillActiveText: "#bfdbfe",
    pillInactiveBg: "#121a33",
    pillInactiveBorder: "#263055",
    pillInactiveText: "#9aa4c7",
    medalColors: ["#fbbf24", "#94a3b8", "#d97706"],
    skeleton: "#1a2240",
  };
}

function makeStyles(p: Palette) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: p.screenBg },
    header: {
      paddingTop: 28,
      paddingHorizontal: 20,
      paddingBottom: 16,
      backgroundColor: p.headerBg,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: p.headerBorder,
    },
    headerTitle: { fontSize: 22, fontWeight: "800", color: p.textPrimary },
    headerSubtitle: { marginTop: 4, color: p.textSecondary },
    sortRow: { flexDirection: "row", gap: 10, marginTop: 12 },
    podiumRow: {
      flexDirection: "row",
      gap: 12,
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
    },
    rowCard: {
      marginHorizontal: 16,
      marginVertical: 6,
      backgroundColor: p.cardBg,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: p.cardBorder,
      height: 88, // keep all cards the same height with room for bar
      overflow: "hidden",
    },
    rowTop: { flexDirection: "row", alignItems: "center", width: "100%" },
    rankBadge: {
      width: 30,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 8,
    },
    rankText: { color: p.rankText, fontWeight: "700" },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 10,
      backgroundColor: p.avatarBg,
      borderWidth: 1,
      borderColor: p.avatarBorder,
    },
    avatarText: { color: p.avatarText, fontWeight: "800" },
    nameText: { color: p.nameText, fontSize: 16, fontWeight: "600" },
    valueText: { color: p.valueText, fontWeight: "700" },
    barWrap: {
      height: 8,
      backgroundColor: p.barBg,
      borderRadius: 8,
      overflow: "hidden",
      marginTop: 8,
    },
    barFill: {
      height: 8,
      backgroundColor: p.barFill,
    },
  });
}

function PodiumCard({
  item,
  rank,
  palette,
}: {
  item: CityStat;
  rank: number;
  palette: Palette;
}) {
  const colors = palette.medalColors; // gold, silver-ish, bronze
  const emojis = ["🥇", "🥈", "🥉"];
  const idx = rank - 1;
  const score = Math.round(item.score_percentage);
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <View
        style={{
          height: 130, // increase height to contain all content
          width: "100%",
          borderRadius: 16,
          backgroundColor: palette.cardBg,
          borderWidth: 1,
          borderColor: palette.cardBorder,
          padding: 12,
          paddingBottom: 14,
          justifyContent: "space-between",
          overflow: "hidden",
        }}
      >
        <Text style={{ fontSize: 24, textAlign: "center" }}>{emojis[idx]}</Text>
        <View
          style={{ alignItems: "center", flex: 1, justifyContent: "center" }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: palette.avatarBg,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 6,
              borderWidth: 1,
              borderColor: palette.avatarBorder,
            }}
          >
            <Text
              style={{
                color: palette.avatarText,
                fontWeight: "800",
                fontSize: 14,
              }}
            >
              {initials(item.name)}
            </Text>
          </View>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{
              color: palette.nameText,
              fontWeight: "800",
              fontSize: 13,
              maxWidth: "100%",
              marginBottom: 2,
            }}
          >
            {item.name}
          </Text>
          <Text
            numberOfLines={1}
            style={{
              color: colors[idx] || palette.barFill,
              fontWeight: "900",
              fontSize: 16,
            }}
          >
            {score}%
          </Text>
        </View>
      </View>
    </View>
  );
}

type Styles = ReturnType<typeof makeStyles>;

function LeaderboardRow({
  item,
  rank,
  palette,
  styles,
}: {
  item: CityStat;
  rank: number;
  palette: Palette;
  styles: Styles;
}) {
  const progress = useRef(new Animated.Value(0)).current;
  const pct = Math.max(0, Math.min(100, item.score_percentage));

  useEffect(() => {
    Animated.timing(progress, {
      toValue: pct,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [pct]);

  const widthInterpolate = progress.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.rowCard}>
      <View style={styles.rowTop}>
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>{rank}</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(item.name)}</Text>
        </View>
        <View style={{ flex: 1, minWidth: 0, marginRight: 8 }}>
          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.nameText}>
            {item.name}
          </Text>
        </View>
        <View style={{ flexShrink: 0 }}>
          <Text numberOfLines={1} style={styles.valueText}>
            ✅ {Math.round(pct)}%
          </Text>
        </View>
      </View>
      <View style={styles.barWrap}>
        <Animated.View
          style={[
            styles.barFill,
            { width: widthInterpolate, backgroundColor: palette.barFill },
          ]}
        />
      </View>
    </View>
  );
}

function LoadingSkeleton({
  palette,
  styles,
}: {
  palette: Palette;
  styles: Styles;
}) {
  return (
    <View style={{ padding: 16 }}>
      {[...Array(6)].map((_, i) => (
        <View
          key={i}
          style={[styles.rowCard, { height: 64, justifyContent: "center" }]}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View
              style={{
                width: 30,
                height: 12,
                backgroundColor: palette.skeleton,
                borderRadius: 8,
              }}
            />
            <View
              style={{
                width: 36,
                height: 36,
                backgroundColor: palette.skeleton,
                borderRadius: 18,
              }}
            />
            <View
              style={{
                flex: 1,
                height: 12,
                backgroundColor: palette.skeleton,
                borderRadius: 8,
              }}
            />
            <View
              style={{
                width: 60,
                height: 12,
                backgroundColor: palette.skeleton,
                borderRadius: 8,
              }}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

function initials(name?: string) {
  if (!name) return "?";
  const parts = name.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts[1]?.[0] ?? "";
  return (first + last).toUpperCase() || first.toUpperCase() || "?";
}