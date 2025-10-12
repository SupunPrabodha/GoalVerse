import React, { useEffect, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  SafeAreaView, StyleSheet, ActivityIndicator, Alert, Platform, Modal, Pressable
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { getProject, updateProject } from "../../../lib/projects";
import { addExpense, updateExpense, deleteExpense } from "../../../lib/projects";

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

  const [expenses, setExpenses] = useState([]);
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAlloc, setNewAlloc] = useState("");
  const [newActual, setNewActual] = useState("");
  const [totals, setTotals] = useState({ budget: 0, allocated: 0, remaining: 0 });


  // dropdown modals + date pickers
  const [statusOpen, setStatusOpen] = useState(false);
  const [sdgOpen, setSdgOpen] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const formatDate = (d) => {
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const cur = (n) => `$${Number(n || 0).toLocaleString()}`; // 🆕 currency-ish
  const updateFromProject = (p) => {      //centralize state sync
    setExpenses(p.expenses || []);
    setBudget(String(p.budget?.amount ?? "")); // keeps top budget field in sync
    setTotals({
      budget: Number(p.budget?.amount || 0),
      allocated: Number(p.allocated_total || 0),
      remaining: Number(p.remaining || 0),
    });
  };

  const onChangeExpense = (id, patch) =>     // 🆕 local UI update
  setExpenses((arr) => arr.map((e) => (e._id === id ? { ...e, ...patch } : e)));

  const saveExpense = async (exp) => {       // 🆕 persist one row
    try {
      const proj = await updateExpense(id, exp._id, {
        name: exp.name,
        allocated: Number(exp.allocated || 0),
        actual: Number(exp.actual || 0),
      });
      updateFromProject(proj);
    } catch (e) {
      Alert.alert("Error", e.message || "Failed to update category");
    }
  };

  const removeExpenseRow = async (expId) => {     // 🆕 delete row
    try {
      const proj = await deleteExpense(id, expId);
      updateFromProject(proj);
    } catch (e) {
      Alert.alert("Error", e.message || "Failed to remove category");
    }
  };

  const addCategory = async () => {         // 🆕 add new row
    try {
      const name = newName.trim();
      if (!name) return;
      const proj = await addExpense(id, {
        name,
        allocated: Number(newAlloc || 0),
        actual: Number(newActual || 0),
      });
      setAddOpen(false);
      setNewName(""); setNewAlloc(""); setNewActual("");
      updateFromProject(proj);
    } catch (e) {
      Alert.alert("Error", e.message || "Failed to add category");
    }
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

        updateFromProject(p); // 🆕 pulls expenses + totals

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
            <View style={styles.header}>
              <Text style={styles.header}>Update Project Details</Text>
              <Text style={styles.subHeader}>
                  Keep your project upto date
              </Text>
            </View>
        <View style={styles.card}>
          {/* <Text style={styles.header}>Update Project Details</Text> */}

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

          {/* added for expenses section start here */}
          {/* 🆕 Expense Categories */}
          <View style={styles.expCard}>
            <View style={styles.expHeader}>
              <Text style={styles.expTitle}>Expense Categories</Text>
              <TouchableOpacity style={styles.addBtn} onPress={() => setAddOpen(true)}>
                <Ionicons name="add-circle" size={18} color="#fff" />
                <Text style={styles.addBtnText}>Add Category</Text>
              </TouchableOpacity>
            </View>

            {/* rows */}
            {expenses.length === 0 ? (
              <Text style={{ color: "#6b7280" }}>No categories yet.</Text>
            ) : (
              expenses.map((e) => (
                <View key={e._id} style={styles.expRow}>
                  <TextInput
                    style={[styles.expName]}
                    placeholder="Category name"
                    value={e.name}
                    onChangeText={(t) => onChangeExpense(e._id, { name: t })}
                    onEndEditing={() => saveExpense(e)}
                  />
                  <View style={styles.amountCol}>
                    <Text style={styles.amountLabel}>Allocated</Text>
                    <TextInput
                      style={styles.amountInput}
                      keyboardType="numeric"
                      placeholder="0"
                      value={String(e.allocated ?? "")}
                      onChangeText={(t) => onChangeExpense(e._id, { allocated: t })}
                      onEndEditing={() => saveExpense(e)}
                    />
                  </View>
                  <View style={styles.amountCol}>
                    <Text style={styles.amountLabel}>Actual</Text>
                    <TextInput
                      style={styles.amountInput}
                      keyboardType="numeric"
                      placeholder="0"
                      value={String(e.actual ?? "")}
                      onChangeText={(t) => onChangeExpense(e._id, { actual: t })}
                      onEndEditing={() => saveExpense(e)}
                    />
                  </View>
                  <TouchableOpacity onPress={() => removeExpenseRow(e._id)} style={styles.trash}>
                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))
            )}

            {/* totals */}
            <View style={styles.totalsBox}>
              <View style={styles.tRow}>
                <Text style={styles.tLabel}>Total Budget:</Text>
                <Text style={styles.tVal}>{cur(totals.budget)}</Text>
              </View>
              <View style={styles.tRow}>
                <Text style={styles.tLabel}>Total Allocated:</Text>
                <Text style={styles.tVal}>{cur(totals.allocated)}</Text>
              </View>
              <View style={styles.tRow}>
                <Text style={styles.tLabel}>Remaining:</Text>
                <Text style={[styles.tVal, { color: totals.remaining >= 0 ? "#16a34a" : "#ef4444" }]}>
                  {cur(totals.remaining)}
                </Text>
              </View>
            </View>
          </View>

          {/* added for expenses section ends here */}

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

      {/* 🆕 Add Category modal */}
<Modal transparent visible={addOpen} animationType="fade">
  <Pressable style={styles.modalBackdrop} onPress={() => setAddOpen(false)}>
    <View style={[styles.modalSheet, { paddingBottom: 16 }]}>
      <Text style={{ fontWeight: "800", fontSize: 16, marginBottom: 8 }}>Add Expense Category</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Infrastructure"
        value={newName}
        onChangeText={setNewName}
      />

      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Allocated</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            keyboardType="numeric"
            value={newAlloc}
            onChangeText={setNewAlloc}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Actual (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            keyboardType="numeric"
            value={newActual}
            onChangeText={setNewActual}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.primaryBtn} onPress={addCategory}>
        <Text style={styles.primaryBtnText}>Add</Text>
      </TouchableOpacity>
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
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginTop: 20 },
  // header: { fontWeight: "800", fontSize: 18, color: "#0f172a", marginBottom: 8 },
  header: { fontWeight: "800", fontSize: 20, color: "#a7eec9ff", marginBottom: 4, marginTop: 8 },
  subHeader: { color: "#7f889bff", marginBottom: 12, fontSize: 15 },
  label: { marginTop: 12, marginBottom: 6, color: "#111827", fontWeight: "700" },
  input: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, padding: 12, color: "#0f172a", marginBottom: 12 },
  textarea: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, padding: 12, minHeight: 100, textAlignVertical: "top", marginBottom: 12},
  dropdown: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, paddingVertical: 12, paddingHorizontal: 12,
              flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12, },
  rowInput: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 },
  inputFlex: { flex: 1, color: "#0f172a" },
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#16a34a", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  chipText: { color: "#fff", fontWeight: "700" },
  saveBtn: { backgroundColor: "#16a34a", borderRadius: 10, paddingVertical: 14, alignItems: "center", marginTop: 16 },
  saveText: { color: "#fff", fontWeight: "800" },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.25)", justifyContent: "flex-end" },
  modalSheet: { backgroundColor: "#fff", padding: 12, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  modalItem: { paddingVertical: 14, paddingHorizontal: 6, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderColor: "#F2F4F7" },

  // styles for expenses section start here
   expCard: { backgroundColor: "#fff", borderRadius: 12, padding: 12, marginTop: 30, marginBottom: 25, boxShadow: "2px 1px 40px rgba(0,0,0,0.2)" },
  expHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  expTitle: { fontWeight: "800", color: "#0f172a" },
  addBtn: { backgroundColor: "#16a34a", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, flexDirection: "row", alignItems: "center", gap: 6 },
  addBtnText: { color: "#fff", fontWeight: "700" },
  expRow: {
    flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#f9fafb",
    borderRadius: 10, padding: 8, marginBottom: 8,
  },
  expName: {
    flex: 1, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 8, paddingVertical: 10, paddingHorizontal: 10, marginTop: 11,
    color: "#0f172a",
  },
  amountCol: { width: 110 },
  amountLabel: { fontSize: 11, color: "#6b7280", marginLeft: 4, marginBottom: 2 },
  amountInput: {
    borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 8, paddingVertical: 8, paddingHorizontal: 10,
    color: "#0f172a",
  },
  trash: { padding: 8 },
  totalsBox: { backgroundColor: "#f8fafc", borderRadius: 10, padding: 10, marginTop: 4 },
  tRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  tLabel: { color: "#6b7280" },
  tVal: { color: "#0f172a", fontWeight: "700" },

  // styles for expenses section ends here
});
