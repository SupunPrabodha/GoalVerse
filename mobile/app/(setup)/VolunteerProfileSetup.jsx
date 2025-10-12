import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Modal,
  Pressable,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { saveVolunteerProfile } from "../../lib/volunteers";

const SKILLS = [
  "Data Entry",
  "Fieldwork",
  "Teaching",
  "Medical Assistance",
  "Fundraising",
  "Event Planning",
  "Other",
];
const AVAILABILITY = ["Full-time", "Part-time", "Occasional"];

export default function VolunteerProfileSetup() {
  const router = useRouter();
  const [age, setAge] = useState("");
  const [skillsModal, setSkillsModal] = useState(false);
  const [skills, setSkills] = useState([]);
  const [district, setDistrict] = useState("");
  const [availability, setAvailability] = useState("");

  const toggleSkill = (item) =>
    setSkills((arr) =>
      arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]
    );

  const canSave = age.trim().length > 0 && district.trim().length > 0 && availability.length > 0;

  const onSave = async () => {
    try {
      await saveVolunteerProfile({
        age: Number(age),
        skills,
        district: district.trim(),
        availability,
      });
      Alert.alert(
        "Profile Complete",
        "Your Volunteer profile has been set up successfully.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/(auth)"),
          },
        ],
        { cancelable: false }
      );
    } catch (e) {
      Alert.alert("Error", e?.message || "Failed to save profile");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#111827" }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.header}>
          <Ionicons name="people-outline" size={18} color="#16a34a" />
          <Text style={styles.headerTitle}>Volunteer Profile Setup</Text>
        </View>
        <Text style={styles.headerSub}>
          Complete your volunteer profile to join projects
        </Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Volunteer Details</Text>
          <Text style={styles.sectionHint}>
            Set up your volunteer profile to participate in activities
          </Text>

          <Text style={styles.label}>Age</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.inputFlex}
              placeholder="Enter your age"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
            />
            {age.length > 0 && (
              <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
            )}
          </View>

          <Text style={styles.label}>District</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.inputFlex}
              placeholder="Enter your district"
              value={district}
              onChangeText={setDistrict}
            />
            {district.length > 0 && (
              <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
            )}
          </View>

          <Text style={[styles.label, { marginTop: 8 }]}>Skills</Text>
          <Text style={styles.mutedSmall}>
            Select your skills
          </Text>

          {skills.length > 0 && (
            <View style={styles.goalCard}>
              {skills.map((item) => (
                <View key={item} style={styles.goalRow}>
                  <View style={styles.goalBadge}>
                    <Text style={styles.goalBadgeText}>{item}</Text>
                  </View>
                  <TouchableOpacity onPress={() => toggleSkill(item)}>
                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={styles.addGoalBtn}
            onPress={() => setSkillsModal(true)}
          >
            <Text style={{ color: "#111827", fontWeight: "600" }}>Add Skill</Text>
          </TouchableOpacity>

          <Text style={[styles.label, { marginTop: 8 }]}>Availability</Text>
          <View style={styles.availRow}>
            {AVAILABILITY.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.availChip, availability === item && styles.availChipActive]}
                onPress={() => setAvailability(item)}
              >
                <Text style={[styles.availText, availability === item && styles.availTextActive]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, !canSave && { opacity: 0.6 }]}
          onPress={onSave}
          disabled={!canSave}
        >
          <Ionicons name="save-outline" size={18} color="#fff" />
          <Text style={styles.saveText}>Save Profile</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal transparent visible={skillsModal} animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={() => setSkillsModal(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Select Skills</Text>
            <View style={styles.sdgsWrap}>
              {SKILLS.map((item) => {
                const active = skills.includes(item);
                return (
                  <TouchableOpacity
                    key={item}
                    style={[styles.sdgChip, active && styles.sdgChipActive]}
                    onPress={() => toggleSkill(item)}
                  >
                    <Text style={[styles.sdgText, active && styles.sdgTextActive]}>{item}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity style={styles.modalDone} onPress={() => setSkillsModal(false)}>
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
  muted: { color: "#6b7280" },
  mutedSmall: { color: "#80858dff", fontSize: 12, marginTop: 2 },
  goalCard: {
    borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, padding: 8, backgroundColor: "#f8fafc",
    marginTop: 8,
  },
  goalRow: { flexDirection: "row", gap: 10, alignItems: "center", paddingVertical: 6 },
  goalBadge: {
    minWidth: 38, minHeight: 38, borderRadius: 10, backgroundColor: "#16a34a",
    alignItems: "center", justifyContent: "center", paddingHorizontal: 8
  },
  goalBadgeText: { color: "#fff", fontWeight: "800" },
  addGoalBtn: {
    marginTop: 10, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10,
    paddingVertical: 10, alignItems: "center", backgroundColor: "#fff",
  },
  availRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  availChip: {
    borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10,
    paddingVertical: 8, paddingHorizontal: 16, backgroundColor: "#f1f5f9",
  },
  availChipActive: { backgroundColor: "#16a34a", borderColor: "#16a34a" },
  availText: { color: "#0f172a", fontWeight: "700" },
  availTextActive: { color: "#fff" },
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
    minWidth: 40, minHeight: 40, borderRadius: 12, borderWidth: 1, borderColor: "#e5e7eb",
    alignItems: "center", justifyContent: "center", backgroundColor: "#f1f5f9", paddingHorizontal: 8
  },
  sdgChipActive: { backgroundColor: "#16a34a", borderColor: "#16a34a" },
  sdgText: { color: "#0f172a", fontWeight: "700" },
  sdgTextActive: { color: "#fff" },
  modalDone: {
    marginTop: 14, backgroundColor: "#16a34a", borderRadius: 10,
    paddingVertical: 12, alignItems: "center",
  },
});