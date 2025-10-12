import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import ManagerNavBar from "../../components/ManagerNavBar";
const API_BASE = "http://172.20.10.3:4000/api/partners"; 

export default function Partners() {
  const [ngos, setNgos] = useState([]);
  const [donors, setDonors] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPartners() {
      try {
        const [ngosRes, donorsRes, volunteersRes] = await Promise.all([
          fetch(`${API_BASE}/ngos`).then((r) => r.json()),
          fetch(`${API_BASE}/donors`).then((r) => r.json()),
          fetch(`${API_BASE}/volunteers`).then((r) => r.json()),
        ]);
        setNgos(ngosRes.ngos || []);
        setDonors(donorsRes.donors || []);
        setVolunteers(volunteersRes.volunteers || []);
      } catch (err) {
        setError("Failed to load partners");
      } finally {
        setLoading(false);
      }
    }
    fetchPartners();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}><ActivityIndicator size="large" color="#16a34a" /></View>
    );
  }
  if (error) {
    return (
      <View style={styles.centered}><Text style={{ color: "red" }}>{error}</Text></View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, { paddingBottom: 80 }]}>
        <Text style={styles.title}>Partnership Network</Text>
        <Text style={styles.subtitle}>Find and connect with funding partners</Text>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NGOs</Text>
          {ngos.length === 0 && <Text style={styles.empty}>No NGOs found.</Text>}
          {ngos.map((ngo) => (
            <PartnerCard key={ngo._id} type="NGO" name={ngo.organization_name} focus={ngo.address} logo={ngo.organization_logo} />
          ))}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Donors</Text>
          {donors.length === 0 && <Text style={styles.empty}>No donors found.</Text>}
          {donors.map((donor) => (
            <PartnerCard key={donor._id} type="Donor" name={donor.organization_name || donor.country} focus={donor.funding_focus} logo={donor.organization_picture} />
          ))}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Volunteers</Text>
          {volunteers.length === 0 && <Text style={styles.empty}>No volunteers found.</Text>}
          {volunteers.map((vol) => (
            <PartnerCard key={vol._id} type="Volunteer" name={vol.user_id?.fullName} focus={vol.skills?.join(", ") || ""} logo={vol.profile_picture} />
          ))}
        </View>
      </ScrollView>
      <ManagerNavBar />
    </View>
  );
}

function PartnerCard({ type, name, focus, logo, ...partner }) {
  const router = useRouter();
  // Ensure logo is absolute URL if it starts with /uploads
  let logoUrl = logo;
  if (logo && logo.startsWith('/uploads')) {
    logoUrl = `http://172.20.10.3:4000${logo}`;
  }
  const [imgError, setImgError] = React.useState(false);
  const handleRequest = () => {
    router.push({
      pathname: "/RequestPartnership",
      params: {
        type,
        name,
        focus,
        logo: logoUrl,
        id: partner._id,
      },
    });
  };
  return (
    <View style={styles.card}>
      <View style={styles.logoBox}>
        {logoUrl && !imgError ? (
          <Image source={{ uri: logoUrl }} style={styles.logoImg} onError={() => setImgError(true)} />
        ) : (
          <Text style={styles.logoText}>{name?.slice(0, 2).toUpperCase()}</Text>
        )}
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{name}</Text>
        <Text style={styles.cardType}>{type}</Text>
        {focus ? <Text style={styles.cardFocus}>Focus: {focus}</Text> : null}
        <TouchableOpacity style={styles.requestBtn} onPress={handleRequest}>
          <Text style={styles.requestText}>Request Partnership</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { backgroundColor: "#f9fafb" },
  scrollContent: { padding: 16 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", color: "#16a34a", marginBottom: 4 },
  subtitle: { fontSize: 16, color: "#555", marginBottom: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#222", marginBottom: 8 },
  empty: { color: "#888", fontStyle: "italic", marginBottom: 8 },
  card: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 12, padding: 12, marginBottom: 10, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, alignItems: "center" },
  logoBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: "#d1fae5", justifyContent: "center", alignItems: "center", marginRight: 12, overflow: "hidden" },
  logoText: { fontSize: 20, fontWeight: "bold", color: "#16a34a" },
  logoImg: { width: 48, height: 48, borderRadius: 12, resizeMode: "cover" },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#222" },
  cardType: { fontSize: 12, color: "#2563eb", marginBottom: 2 },
  cardFocus: { fontSize: 13, color: "#555", marginBottom: 4 },
  requestBtn: { borderWidth: 1, borderColor: "#16a34a", borderRadius: 6, paddingVertical: 4, paddingHorizontal: 10, alignSelf: "flex-start", marginTop: 4 },
  requestText: { color: "#16a34a", fontWeight: "bold" },
  exploreBtn: { backgroundColor: "#16a34a", borderRadius: 8, padding: 12, alignItems: "center", marginTop: 16 },
  exploreText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
