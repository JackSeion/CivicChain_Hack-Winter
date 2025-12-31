import React, { useState, useEffect } from 'react';
import { Alert, View, Text, TextInput, Button, StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function SignUpScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  const [cities, setCities] = useState<{ id: string; name: string }[]>([]);
  const [selectedCity, setSelectedCity] = useState('');

  useEffect(() => {
    const fetchCities = async () => {
      // Fetch only the municipal id; we will display the id in the dropdown
      const { data, error } = await supabase
        .from('municipals')
        .select('id')
        .order('id', { ascending: true });
      if (error) {
        console.error('Error fetching cities:', error);
        setCities([]);
      } else {
        const rows = (data ?? []).map((row: any) => ({ id: row.id as string, name: String(row.id) }));
        setCities(rows);
        if (rows.length > 0) setSelectedCity(rows[0].id);
      }
    };
    fetchCities();
  }, []);

  async function signUpWithEmail() {
    if (!email || !password || !displayName || !selectedCity) {
      Alert.alert('Please fill all fields and select a city');
      return;
    }

    setLoading(true);

    // Create user in Supabase Auth with all metadata (display_name, city_id)
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: { 
        data: { 
          display_name: displayName,
          city_id: selectedCity 
        } 
      },
    });

    if (error) {
      Alert.alert(error.message);
      setLoading(false);
      return;
    }

    // Debug: log signUp response to verify metadata is stored
    console.log('signUp response:', data);
    console.log('User metadata stored:', {
      display_name: displayName,
      city_id: selectedCity
    });

    setLoading(false);

    // Show confirmation to the user and navigate to login explicitly
    Alert.alert('Sign up', 'Check your email for confirmation (if required). You will be redirected to Login.', [
      {
        text: 'OK',
        onPress: () => {
          // Use push so the navigation is visible in dev and easier to trace
          router.push('/login');
        },
      },
    ]);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      <TextInput style={styles.input} placeholder="Display name" value={displayName} onChangeText={setDisplayName} />
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />

      <Text style={styles.label}>Select City</Text>
      {cities.length === 0 ? (
        <ActivityIndicator />
      ) : (
        <View style={{ marginBottom: 12 }}>
          <DropdownSelect
            label="City"
            options={cities}
            selected={selectedCity}
            onSelect={(id) => setSelectedCity(id)}
          />
        </View>
      )}

      <Button title="Sign Up" onPress={signUpWithEmail} disabled={loading} />

      <Pressable style={styles.link} onPress={() => router.replace('/login')}>
        <Text>Already have an account? Log in</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: { height: 44, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingHorizontal: 10, borderRadius: 6 },
  link: { marginTop: 15, alignItems: 'center' },
  label: { marginBottom: 8, fontWeight: '600' },
  cityPill: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, marginRight: 8, borderWidth: 1 },
  cityPillActive: { backgroundColor: '#2f95dc', borderColor: '#2f95dc' },
  cityPillInactive: { backgroundColor: '#fff', borderColor: '#dee2e6' },
  cityTextActive: { color: '#fff', fontWeight: '600' },
  cityTextInactive: { color: '#495057', fontWeight: '600' },
  dropdownToggle: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e9ecef', backgroundColor: '#fff' },
  dropdownToggleActive: { borderColor: '#2f95dc' },
  dropdownToggleInactive: { borderColor: '#dee2e6' },
  dropdownList: { marginTop: 8, borderRadius: 8, borderWidth: 1, borderColor: '#e9ecef', backgroundColor: '#fff' },
  dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#f1f3f5' },
});

// ------------------------------
// Small DropdownSelect component
// ------------------------------
function DropdownSelect({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: { id: string; name: string }[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const selectedName = options.find((o) => o.id === selected)?.name ?? 'Select';

  return (
    <View>
      <Pressable
        style={[styles.dropdownToggle, open ? styles.dropdownToggleActive : styles.dropdownToggleInactive]}
        onPress={() => setOpen((s) => !s)}
      >
        <Text style={{ fontWeight: '600' }}>{label}:</Text>
        <Text style={{ marginLeft: 8 }}>{selectedName}</Text>
      </Pressable>

      {open && (
        <View style={styles.dropdownList}>
          <ScrollView style={{ maxHeight: 220 }}>
            {options.map((opt) => (
              <Pressable
                key={opt.id}
                style={styles.dropdownItem}
                onPress={() => {
                  onSelect(opt.id);
                  setOpen(false);
                }}
              >
                <Text>{opt.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
