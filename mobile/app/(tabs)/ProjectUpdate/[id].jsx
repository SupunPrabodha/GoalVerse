import React, { useEffect, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  SafeAreaView, StyleSheet, ActivityIndicator, Alert, Platform, Modal, Pressable
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { getProject, updateProject } from "../../../lib/projects";

const STATUSES = ["On-going", "Planned", "Completed"];
const STATUS_ENUM = { "On-going": "ON_GOING", Planned: "PLANNED", Completed: "COMPLETED" };
const ENUM_TO_LABEL = { ON_GOING: "On-going", PLANNED: "Planned", COMPLETED: "Completed" };
const SDGS = [
  { id: 1, title: "No Poverty" }, { id: 2, title: "Zero Hunger" }, { id: 3, title: "Good Health and Well-being" },
  { id: 4, title: "Quality Education" }, { id: 5, title: "Gender Equality" }, { id: 6, title: "Clean Water and Sanitation" },
  { id: 7, title: "Affordable and Clean Energy" }, { id: 8, title: "Decent Work and Economic Growth" },
  { id: 9, title: "Industry, Innovation and Infrastructure" }, { id: 10, title: "Reduced Inequalities" },
  { id: 11, title: "Sustainable Cities and Communities" }, { id: 12, title: "Responsible Consumption and Production" },
  { id: 13, title: "Climate Action" }, { id: 14, title: "Life Below Water" }, { id: 15, title: "Life on Land" },
  { id: 16, title: "Peace, Justice and Strong Institutions" }, { id: 17, title: "Partnerships for the Goals" },
];

export default function ProjectUpdate() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // loading + form state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [status, setStatus] = useState("On-going");
  const [sdg, setSdg] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [donor, setDonor] = useState("");
  const [customDonors, setCustomDonors] = useState([]);
  const [region, setRegion] = useState("");
  const [description, setDescription] = useState("");
  const [targetBeneficiaries, setTargetBeneficiaries] = useState("0");
  const [achievedBeneficiaries, setAchievedBeneficiaries] = useState("0");

  // dropdown modals + date pickers
  const [statusOpen, setStatusOpen] = useState(false);
  const [sdgOpen, setSdgOpen] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const formatDate = (d) => {
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  useEffect(() => {
    (async () => {
      try {
        const p = await getProject(id);
        setName(p.name);
        setStatus(ENUM_TO_LABEL[p.status] || "On-going");
        setSdg(SDGS.find((x) => x.id === p.sdg) || null);
        setStartDate(p.start_date ? p.start_date.slice(0, 10) : "");
        setEndDate(p.end_date ? p.end_date.slice(0, 10) : "");
        setBudget(String(p.budget?.amount ?? ""));
        setCustomDonors(p.donors || []);
        setRegion(p.region || "");
        setDescription(p.description || "");
        setTargetBeneficiaries(String(p.target_beneficiaries ?? 0));
        setAchievedBeneficiaries(String(p.achieved_beneficiaries ?? 0));
      } catch (e) {
        Alert.alert("Error", e.message || "Failed to load project", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const addCustomDonor = () => {
    const t = donor.trim();
    if (!t) return;
    if (customDonors.includes(t)) return;
    setCustomDonors((d) => [...d, t]);
    setDonor("");
  };
  const removeCustomDonor = (name) => setCustomDonors((d) => d.filter((x) => x !== name));

  const onSave = async () => {
    try {
      setSaving(true);
      const donors = customDonors.includes(donor.trim()) || !donor.trim()
        ? customDonors
        : [...customDonors, donor.trim()];

      const payload = {
        name: name.trim(),
        status: STATUS_ENUM[status] || "ON_GOING",
        sdg: sdg?.id,
        start_date: startDate || null,
        end_date: endDate || null,
        budget_amount: Number(budget || 0),
        budget_currency: "USD",
        donors,
        region: region.trim(),
        description: description.trim(),
        target_beneficiaries: Number(targetBeneficiaries || 0),
        achieved_beneficiaries: Number(achievedBeneficiaries || 0),
      };

      const updated = await updateProject(id, payload);
      Alert.alert("Saved", "Project updated successfully.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert("Error", e?.message || "Failed to update project.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#111827", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color="#16a34a" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#111827" }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.card}>
          <Text style={styles.header}>Update Project Details</Text>

          <Text style={styles.label}>Project Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Project Name" />

          <Text style={styles.label}>Description</Text>
          <TextInput style={styles.textarea} value={description} onChangeText={setDescription} multiline />

          <Text style={styles.label}>SDG Goal</Text>
          <TouchableOpacity style={styles.dropdown} onPress={() => setSdgOpen(true)}>
            <Text style={{ color: sdg ? "#111827" : "#6b7280" }}>
              {sdg ? `SDG ${sdg.id} — ${sdg.title}` : "Select SDG Goal"}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#6b7280" />
          </TouchableOpacity>

          <Text style={styles.label}>Region/District</Text>
          <TextInput style={styles.input} value={region} onChangeText={setRegion} placeholder="Region" />

          <Text style={styles.label}>Start Date</Text>
          <View style={styles.rowInput}>
            <TextInput style={styles.inputFlex} value={startDate} onChangeText={setStartDate} placeholder="YYYY-MM-DD" />
            <TouchableOpacity onPress={() => setShowStartPicker(true)}>
              <Ionicons name="calendar" size={18} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>End Date</Text>
          <View style={styles.rowInput}>
            <TextInput style={styles.inputFlex} value={endDate} onChangeText={setEndDate} placeholder="YYYY-MM-DD" />
            <TouchableOpacity onPress={() => setShowEndPicker(true)}>
              <Ionicons name="calendar" size={18} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Total Budget (USD)</Text>
          <TextInput style={styles.input} value={budget} onChangeText={setBudget} keyboardType="numeric" placeholder="0" />

          <Text style={styles.label}>Target Beneficiaries</Text>
          <TextInput style={styles.input} value={targetBeneficiaries} onChangeText={setTargetBeneficiaries} keyboardType="numeric" placeholder="0" />

          <Text style={styles.label}>Achieved Beneficiaries</Text>
          <TextInput style={styles.input} value={achievedBeneficiaries} onChangeText={setAchievedBeneficiaries} keyboardType="numeric" placeholder="0" />

          <Text style={styles.label}>Donors / Funding Sources</Text>
          <View style={styles.rowInput}>
            <TextInput style={styles.inputFlex} value={donor} onChangeText={setDonor} placeholder="Add donor name" />
            <TouchableOpacity onPress={addCustomDonor}><Ionicons name="add" size={22} color="#16a34a" /></TouchableOpacity>
          </View>
          {customDonors.length > 0 && (
            <View style={styles.chipsWrap}>
              {customDonors.map((d) => (
                <View key={d} style={styles.chip}>
                  <Text style={styles.chipText}>{d}</Text>
                  <TouchableOpacity onPress={() => removeCustomDonor(d)}><Ionicons name="close" size={14} color="#fff" /></TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} disabled={saving} onPress={onSave}>
            <Text style={styles.saveText}>{saving ? "Saving..." : "Save Changes"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* SDG dropdown */}
      <Modal transparent visible={sdgOpen} animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={() => setSdgOpen(false)}>
          <View style={[styles.modalSheet, { maxHeight: "70%" }]}>
            <Text style={{ fontWeight: "800", fontSize: 16, marginBottom: 8 }}>Select SDG</Text>
            <ScrollView>
              {SDGS.map((g) => (
                <TouchableOpacity key={g.id} style={styles.modalItem} onPress={() => { setSdg(g); setSdgOpen(false); }}>
                  <Text style={{ fontSize: 16 }}>{`SDG ${g.id} — ${g.title}`}</Text>
                  {sdg?.id === g.id && <Ionicons name="checkmark" size={18} color="#16a34a" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* Dates */}
      {showStartPicker && (
        <DateTimePicker
          value={startDate ? new Date(startDate) : new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, d) => { setShowStartPicker(false); if (d) setStartDate(formatDate(d)); }}
        />
      )}
      {showEndPicker && (
        <DateTimePicker
          value={endDate ? new Date(endDate) : new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, d) => { setShowEndPicker(false); if (d) setEndDate(formatDate(d)); }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 14 },
  header: { fontWeight: "800", fontSize: 18, color: "#0f172a", marginBottom: 8 },
  label: { marginTop: 12, marginBottom: 6, color: "#111827", fontWeight: "700" },
  input: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, padding: 12, color: "#0f172a" },
  textarea: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, padding: 12, minHeight: 100, textAlignVertical: "top" },
  dropdown: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, paddingVertical: 12, paddingHorizontal: 12,
              flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rowInput: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  inputFlex: { flex: 1, color: "#0f172a" },
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#16a34a", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  chipText: { color: "#fff", fontWeight: "700" },
  saveBtn: { backgroundColor: "#16a34a", borderRadius: 10, paddingVertical: 14, alignItems: "center", marginTop: 16 },
  saveText: { color: "#fff", fontWeight: "800" },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.25)", justifyContent: "flex-end" },
  modalSheet: { backgroundColor: "#fff", padding: 12, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  modalItem: { paddingVertical: 14, paddingHorizontal: 6, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderColor: "#F2F4F7" },
});
