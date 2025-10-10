import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Modal,
  Pressable,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { saveNGOProfile } from "../../lib/ngo";

const SDGS = [
  { id: 1,  title: "No Poverty", desc: "End poverty in all its forms." },
  { id: 2,  title: "Zero Hunger", desc: "End hunger, achieve food security." },
  { id: 3,  title: "Good Health", desc: "Ensure healthy lives for all." },
  { id: 4,  title: "Quality Education", desc: "Inclusive, equitable education." },
  { id: 5,  title: "Gender Equality", desc: "Achieve gender equality." },
  { id: 6,  title: "Clean Water", desc: "Water and sanitation for all." },
  { id: 7,  title: "Affordable & Clean Energy", desc: "Sustainable energy." },
  { id: 8,  title: "Decent Work & Growth", desc: "Inclusive economic growth." },
  { id: 9,  title: "Industry, Innovation & Infra", desc: "Build resilient infra." },
  { id: 10, title: "Reduced Inequalities", desc: "Reduce inequality." },
  { id: 11, title: "Sustainable Cities", desc: "Inclusive, safe cities." },
  { id: 12, title: "Responsible Consumption", desc: "Sustainable consumption." },
  { id: 13, title: "Climate Action", desc: "Combat climate change." },
  { id: 14, title: "Life Below Water", desc: "Conserve oceans." },
  { id: 15, title: "Life on Land", desc: "Protect terrestrial ecosystems." },
  { id: 16, title: "Peace, Justice & Institutions", desc: "Peaceful, inclusive societies." },
  { id: 17, title: "Partnerships", desc: "Revitalize global partnership." },
];

export default function OrgProfileSetup() {
  const router = useRouter();
  const [orgName, setOrgName] = useState("");
  const [orgaddress, setOrgaddress] = useState("");
  const [orgcontact, setOrgcontact] = useState("");
  const [logo, setLogo] = useState(null); // { uri }
  const [sdgModal, setSdgModal] = useState(false);
  const [goals, setGoals] = useState([]); // array of sdg ids

  const pickLogo = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== "granted") return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });
    if (!res.canceled) setLogo(res.assets[0]);
  };

  const removeLogo = () => setLogo(null);
  const toggleGoal = (id) =>
    setGoals((g) => (g.includes(id) ? g.filter((x) => x !== id) : [...g, id]));

  const canSave = orgName.trim().length > 0; // you can add more rules

//   const onSave = () => {
//     // TODO: send to backend
//     router.replace("/(auth)");
//   };

    const onSave = async () => {
    try {
        const payload = {
        organization_name: orgName.trim(),
        address: orgaddress.trim(),
        contact_number: orgcontact.trim(),
        sdgs: goals,            // array of numbers
        logo,                   // { uri, ... } from ImagePicker
        };
        const { user } = await saveNGOProfile(payload);
        Alert.alert(
            "Registration Complete",
            "Your NGO profile has been set up successfully.",
            [
                {
                    text: "OK",
                    onPress: () => router.replace("/(auth)"),
                },
            ],
            { cancelable: false }
        );
        // After successful save, take user to app
        //router.replace("/(auth)");
    } catch (e) {
        Alert.alert("Error", e?.message || "Failed to save profile");
    }
    };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#111827" }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="business-outline" size={18} color="#16a34a" />
          <Text style={styles.headerTitle}>NGO Profile Setup</Text>
        </View>
        <Text style={styles.headerSub}>
          Complete your organization profile to get started with impact reporting
        </Text>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Organization Details</Text>
          <Text style={styles.sectionHint}>
            Set up your organization profile for financial and impact tracking
          </Text>

          {/* Organization Name */}
          <Text style={styles.label}>Organization Name</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.inputFlex}
              placeholder="Enter organization name"
              value={orgName}
              onChangeText={setOrgName}
            />
            {orgName.length > 0 && <Ionicons name="checkmark-circle" size={18} color="#22c55e" />}
          </View>

          {/* Organization Address */}
          <Text style={styles.label}>Organization Address</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.inputFlex}
              placeholder="Enter organization address"
              value={orgaddress}
              onChangeText={setOrgaddress}
            />
            {orgaddress.length > 0 && <Ionicons name="checkmark-circle" size={18} color="#22c55e" />}
          </View>

          {/* Organization Contact */}
          <Text style={styles.label}>Contact Number</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.inputFlex}
              placeholder="Enter contact no."
              value={orgcontact}
              onChangeText={setOrgcontact}
            />
            {orgcontact.length > 0 && <Ionicons name="checkmark-circle" size={18} color="#22c55e" />}
          </View>

          {/* Logo */}
          <Text style={styles.label}>Organization Logo</Text>
          <TouchableOpacity style={styles.upload} onPress={pickLogo} onLongPress={removeLogo}>
            <Ionicons name="cloud-upload-outline" size={18} color="#16a34a" />
            <View style={{ marginLeft: 8 }}>
              <Text style={{ fontWeight: "600", color: "#0f172a" }}>Upload Organization Logo</Text>
              <Text style={styles.muted}>Drag and drop or click to select</Text>
              <Text style={styles.mutedSmall}>PNG, JPG up to 5MB</Text>
            </View>
          </TouchableOpacity>

          {logo && (
            <View style={styles.logoPreview}>
              <Image source={{ uri: logo.uri }} style={styles.logoImg} />
              <TouchableOpacity style={styles.removeLogoBtn} onPress={removeLogo}>
                <Ionicons name="close" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          {/* SDGs */}
          <Text style={[styles.label, { marginTop: 8 }]}>Sustainable Development Goals</Text>
          <Text style={styles.mutedSmall}>Select the SDGs your organization focuses on</Text>

          {/* Selected Goals Preview */}
          {goals.length > 0 && (
            <View style={styles.goalCard}>
              {goals.map((id) => {
                const g = SDGS.find((x) => x.id === id);
                return (
                  <View key={id} style={styles.goalRow}>
                    <View style={styles.goalBadge}>
                      <Text style={styles.goalBadgeText}>{id}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.goalTitle}>SDG {id}  •  {g.title}</Text>
                      <Text style={styles.goalDesc}>{g.desc}</Text>
                    </View>
                    <TouchableOpacity onPress={() => toggleGoal(id)}>
                      <Ionicons name="trash-outline" size={18} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}

          <TouchableOpacity style={styles.addGoalBtn} onPress={() => setSdgModal(true)}>
            <Text style={{ color: "#111827", fontWeight: "600" }}>Add Goal</Text>
          </TouchableOpacity>
        </View>

        {/* Save */}
        <TouchableOpacity
          style={[styles.saveBtn, !canSave && { opacity: 0.6 }]}
          onPress={onSave}
          disabled={!canSave}
        >
          <Ionicons name="save-outline" size={18} color="#fff" />
          <Text style={styles.saveText}>Save Profile</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* SDG Picker Modal */}
      <Modal transparent visible={sdgModal} animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={() => setSdgModal(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Select SDGs</Text>
            <View style={styles.sdgsWrap}>
              {SDGS.map((g) => {
                const active = goals.includes(g.id);
                return (
                  <TouchableOpacity
                    key={g.id}
                    style={[styles.sdgChip, active && styles.sdgChipActive]}
                    onPress={() => toggleGoal(g.id)}
                  >
                    <Text style={[styles.sdgText, active && styles.sdgTextActive]}>{g.id}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity style={styles.modalDone} onPress={() => setSdgModal(false)}>
              <Text style={{ color: "#fff", fontWeight: "700" }}>Done</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6, marginTop: 20 },
  headerTitle: { color: "#d1fae5", fontWeight: "800", fontSize: 22 },
  headerSub: { color: "#cececeff",fontSize: 15, marginBottom: 12 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
    marginTop: 30,
    marginBottom: 20
  },
  sectionTitle: { fontWeight: "800", fontSize: 18, color: "#0f172a" },
  sectionHint: { color: "#6b7280", marginBottom: 12 },

  label: { marginTop: 10, marginBottom: 6, color: "#6b6b6bff", fontWeight: "600", fontSize: 15 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    marginBottom: 15
  },
  inputFlex: { flex: 1, color: "#0f172a" },

  upload: {
    borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10,
    padding: 12, flexDirection: "row", alignItems: "center",
    backgroundColor: "#f9fafb",
    marginBottom: 15
  },
  muted: { color: "#6b7280" },
  mutedSmall: { color: "#80858dff", fontSize: 12, marginTop: 2 },

  logoPreview: {
    marginTop: 10, alignSelf: "flex-start",
    width: 72, height: 72, borderRadius: 12,
    borderWidth: 1, borderColor: "#e5e7eb", overflow: "hidden", position: "relative",
  },
  logoImg: { width: "100%", height: "100%" },
  removeLogoBtn: {
    position: "absolute", top: 4, right: 4, width: 22, height: 22,
    borderRadius: 11, backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center", alignItems: "center",
  },

  goalCard: {
    borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, padding: 8, backgroundColor: "#f8fafc",
    marginTop: 8,
  },
  goalRow: { flexDirection: "row", gap: 10, alignItems: "center", paddingVertical: 6 },
  goalBadge: {
    width: 38, height: 38, borderRadius: 10, backgroundColor: "#16a34a",
    alignItems: "center", justifyContent: "center",
  },
  goalBadgeText: { color: "#fff", fontWeight: "800" },
  goalTitle: { fontWeight: "700", color: "#0f172a" },
  goalDesc: { color: "#6b7280", fontSize: 12 },

  addGoalBtn: {
    marginTop: 10, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10,
    paddingVertical: 10, alignItems: "center", backgroundColor: "#fff",
  },

  saveBtn: {
    marginTop: 14, backgroundColor: "#16a34a", borderRadius: 12,
    paddingVertical: 14, flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center",
  },
  saveText: { color: "#fff", fontWeight: "800" },

  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.25)", justifyContent: "flex-end" },
  modalSheet: { backgroundColor: "#fff", padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  modalTitle: { fontWeight: "800", fontSize: 16, marginBottom: 10 },
  sdgsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  sdgChip: {
    width: 40, height: 40, borderRadius: 12, borderWidth: 1, borderColor: "#e5e7eb",
    alignItems: "center", justifyContent: "center", backgroundColor: "#f1f5f9",
  },
  sdgChipActive: { backgroundColor: "#16a34a", borderColor: "#16a34a" },
  sdgText: { color: "#0f172a", fontWeight: "700" },
  sdgTextActive: { color: "#fff" },
  modalDone: {
    marginTop: 14, backgroundColor: "#16a34a", borderRadius: 10,
    paddingVertical: 12, alignItems: "center",
  },
});
