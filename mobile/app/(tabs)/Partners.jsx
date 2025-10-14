import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import ManagerNavBar from "../../components/ManagerNavBar";
import { API_BASE_URL } from "../../lib/api";
const API_BASE = `${API_BASE_URL}/partners`;

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
              <PartnerCard key={ngo._id} type="NGO" name={ngo.organization_name} focus={ngo.address} logo={ngo.organization_logo} {...ngo} />
            ))}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Donors</Text>
          {donors.length === 0 && <Text style={styles.empty}>No donors found.</Text>}
            {donors.map((donor) => (
              <PartnerCard key={donor._id} type="Donor" name={donor.organization_name} focus={donor.country} logo={donor.organization_picture} {...donor} />
            ))}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Volunteers</Text>
          {volunteers.length === 0 && <Text style={styles.empty}>No volunteers found.</Text>}
          {volunteers.map((vol) => (
            <PartnerCard key={vol._id} type="Volunteer" name={vol.user_id?.fullName} focus={Array.isArray(vol.skills) ? vol.skills.join(", ") : vol.skills} logo={vol.profile_picture} {...vol} />
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
    logoUrl = API_BASE_URL.replace(/\/api$/, "") + logo;
  }
  const [imgError, setImgError] = React.useState(false);
  const handleRequest = () => {
    let userId = partner._id;
    if (type === "Volunteer" && partner.user_id && partner.user_id._id) {
      userId = partner.user_id._id;
    }
    // If NGO or Donor profiles have user_id, use that
    if ((type === "NGO" || type === "Donor") && partner.user_id) {
      userId = partner.user_id;
    }
    console.log('PartnerCard partner:', partner);
    router.push({
      pathname: "/RequestPartnership",
      params: {
        type,
        name,
        focus,
        logo: logoUrl,
        id: userId,
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
  scroll: { backgroundColor: "#111827" },
  scrollContent: { padding: 16 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#111827" },
  title: { fontSize: 22, fontWeight: "800", color: "#a7eec9ff", marginBottom: 4 },
  subtitle: { fontSize: 16, color: "#d1fae5", marginBottom: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#e5e7eb", marginBottom: 8 },
  empty: { color: "#6b7280", fontStyle: "italic", marginBottom: 8 },
  card: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 12, padding: 12, marginBottom: 10, alignItems: "center" },
  logoBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: "#d1fae5", justifyContent: "center", alignItems: "center", marginRight: 12, overflow: "hidden" },
  logoText: { fontSize: 20, fontWeight: "bold", color: "#16a34a" },
  logoImg: { width: 48, height: 48, borderRadius: 12, resizeMode: "cover" },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: "800", color: "#0f172a" },
  cardType: { fontSize: 12, color: "#2563eb", marginBottom: 2, fontWeight: "700" },
  cardFocus: { fontSize: 13, color: "#6b7280", marginBottom: 4 },
  requestBtn: { backgroundColor: "#F3F4F6", borderRadius: 8, paddingVertical: 10, alignItems: "center", marginTop: 4 },
  requestText: { color: "#111827", fontWeight: "700" },
  exploreBtn: { backgroundColor: "#16a34a", borderRadius: 8, padding: 12, alignItems: "center", marginTop: 16 },
  exploreText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
