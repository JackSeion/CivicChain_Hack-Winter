import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

interface FilterCategory {
  id: string;
  name: string;
}

interface HomeFiltersProps {
  selectedStatus: string;
  selectedCategory: string;
  showStatusDropdown: boolean;
  showCategoryDropdown: boolean;
  categories: FilterCategory[];
  onStatusChange: (status: string) => void;
  onStatusDropdownToggle: (open: boolean) => void;
  onCategoryChange: (category: string) => void;
  onCategoryDropdownToggle: (open: boolean) => void;
}

const makeTitleCase = (s: string) =>
  s
    .split(' ')
    .map((w) => (w.length ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(' ');

const STATUSES = ['all', 'pending', 'resolved', 'verified'];

const HomeFiltersComponent: React.FC<HomeFiltersProps> = ({
  selectedStatus,
  selectedCategory,
  showStatusDropdown,
  showCategoryDropdown,
  categories,
  onStatusChange,
  onStatusDropdownToggle,
  onCategoryChange,
  onCategoryDropdownToggle,
}) => (
  <View style={styles.filtersContainer}>
    {/* Status Filter */}
    <View style={styles.filterColumn}>
      <Text style={styles.filterLabel}>Status</Text>
      <View style={styles.statusDropdown}>
        <Pressable
          style={styles.dropdownButton}
          onPress={() => onStatusDropdownToggle(!showStatusDropdown)}
        >
          <Text style={styles.dropdownButtonText}>{makeTitleCase(selectedStatus)}</Text>
          <Ionicons name="chevron-down" size={14} color="#6c757d" />
        </Pressable>

        {showStatusDropdown && (
          <ScrollView style={styles.dropdownList} nestedScrollEnabled>
            {STATUSES.map((status) => (
              <Pressable
                key={status}
                style={[
                  styles.dropdownOption,
                  selectedStatus === status && styles.dropdownOptionActive,
                ]}
                onPress={() => {
                  onStatusChange(status);
                  onStatusDropdownToggle(false);
                }}
              >
                <Text
                  style={[
                    styles.dropdownOptionText,
                    selectedStatus === status && styles.dropdownOptionTextActive,
                  ]}
                >
                  {makeTitleCase(status)}
                </Text>
                {selectedStatus === status && (
                  <Ionicons name="checkmark" size={16} color="#2f95dc" />
                )}
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>
    </View>

    {/* Category Filter */}
    <View style={styles.filterColumn}>
      <Text style={styles.filterLabel}>Category</Text>
      <View style={styles.categoryDropdown}>
        <Pressable
          style={styles.dropdownButton}
          onPress={() => onCategoryDropdownToggle(!showCategoryDropdown)}
        >
          <Text style={styles.dropdownButtonText}>
            {categories.find((c) => c.id === selectedCategory)?.name || 'All'}
          </Text>
          <Ionicons name="chevron-down" size={14} color="#6c757d" />
        </Pressable>

        {showCategoryDropdown && (
          <ScrollView style={styles.dropdownList} nestedScrollEnabled>
            {categories.map((cat) => (
              <Pressable
                key={cat.id}
                style={[
                  styles.dropdownOption,
                  selectedCategory === cat.id && styles.dropdownOptionActive,
                ]}
                onPress={() => {
                  onCategoryChange(cat.id);
                  onCategoryDropdownToggle(false);
                }}
              >
                <Text
                  style={[
                    styles.dropdownOptionText,
                    selectedCategory === cat.id && styles.dropdownOptionTextActive,
                  ]}
                >
                  {makeTitleCase(cat.name)}
                </Text>
                {selectedCategory === cat.id && (
                  <Ionicons name="checkmark" size={16} color="#2f95dc" />
                )}
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  </View>
);

export const HomeFilters = React.memo(HomeFiltersComponent);

const styles = StyleSheet.create({
  filtersContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  filterColumn: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  statusDropdown: {
    position: 'relative',
    zIndex: 100,
  },
  categoryDropdown: {
    position: 'relative',
    zIndex: 200,
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
});
