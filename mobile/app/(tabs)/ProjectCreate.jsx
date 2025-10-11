// import React, { useEffect, useState } from "react";
// import {
//   View, Text, TextInput, TouchableOpacity, ScrollView,
//   SafeAreaView, StyleSheet, ActivityIndicator, Alert
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// import { me } from "../../lib/auth"; // uses your existing me()
// import DateTimePicker from "@react-native-community/datetimepicker"; // 🆕

// const STATUSES = ["On-going", "Planned", "Completed"];
// const SDG_OPTIONS = Array.from({ length: 17 }, (_, i) => i + 1);

// export default function ProjectCreate() {
//   const router = useRouter();
//   const [authLoading, setAuthLoading] = useState(true);

//   // NGO Manager guard
//   useEffect(() => {
//     (async () => {
//       try {
//         const user = await me();
//         if (!user || user.role !== "NGO_MANAGER") {
//           Alert.alert("Access denied", "Only NGO Managers can create projects.", [
//             { text: "OK", onPress: () => router.replace("/(tabs)/HomeScreen") },
//           ]);
//           return;
//         }
//       } finally {
//         setAuthLoading(false);
//       }
//     })();
//   }, []);

//   // form state
//   const [name, setName] = useState("");
//   const [status, setStatus] = useState("On-going");
//   const [sdg, setSdg] = useState(null);
//   const [startDate, setStartDate] = useState(""); // for now, free text or "YYYY-MM-DD"
//   const [endDate, setEndDate] = useState("");
//   const [budget, setBudget] = useState("");
//   const [donor, setDonor] = useState("");
//   const [customDonor, setCustomDonor] = useState("");
//   const [region, setRegion] = useState("");
//   const [description, setDescription] = useState("");

//   const canCreate = name.trim().length > 0 && sdg && budget !== "";

//   const createProject = () => {
//     // TODO: hook your backend endpoint
//     Alert.alert("Project created", "Your project has been created.", [
//       { text: "OK", onPress: () => router.back() },
//     ]);
//   };

//   if (authLoading) {
//     return (
//       <SafeAreaView style={{ flex: 1, backgroundColor: "#111827", justifyContent: "center", alignItems: "center" }}>
//         <ActivityIndicator color="#16a34a" />
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: "#111827" }}>
//       <ScrollView contentContainerStyle={{ padding: 16 }}>
//         <View style={styles.card}>
//           <Text style={styles.header}>New Project Setup</Text>
//           <Text style={styles.subHeader}>
//             Create a new SDG-aligned project for tracking and transparency
//           </Text>

//           {/* Project Name + Status */}
//           <Text style={styles.label}>Project Name</Text>
//           <View style={styles.inputRow}>
//             <Ionicons name="leaf-outline" size={18} color="#16a34a" />
//             <TextInput
//               style={styles.inputFlex}
//               placeholder="Enter project name"
//               value={name}
//               onChangeText={setName}
//             />
//             <TouchableOpacity
//               style={styles.statusPill}
//               onPress={() => {
//                 const i = (STATUSES.indexOf(status) + 1) % STATUSES.length;
//                 setStatus(STATUSES[i]);
//               }}
//             >
//               <Text style={styles.statusText}>{status}</Text>
//             </TouchableOpacity>
//           </View>

//           {/* SDG Goal */}
//           <Text style={styles.label}>SDG Goals</Text>
//           <TouchableOpacity
//             style={styles.dropdown}
//             onPress={() => {
//               // quick cycle for demo; swap with modal list if you want
//               const current = sdg ?? 0;
//               const next = ((current % 17) + 1);
//               setSdg(next);
//             }}
//           >
//             <Text style={{ color: sdg ? "#111827" : "#6b7280" }}>
//               {sdg ? `SDG ${sdg}` : "Select SDG Goal"}
//             </Text>
//             <Ionicons name="chevron-down" size={18} color="#6b7280" />
//           </TouchableOpacity>

//           {/* Timeline */}
//           <Text style={styles.label}>Project Timeline</Text>
//           <View style={{ flexDirection: "row", gap: 10 }}>
//             <View style={[styles.inputRow, { flex: 1 }]}>
//               <Ionicons name="calendar-outline" size={18} color="#16a34a" />
//               <TextInput
//                 style={styles.inputFlex}
//                 placeholder="Start date (YYYY-MM-DD)"
//                 value={startDate}
//                 onChangeText={setStartDate}
//               />
//             </View>
//             <View style={[styles.inputRow, { flex: 1 }]}>
//               <Ionicons name="calendar-outline" size={18} color="#16a34a" />
//               <TextInput
//                 style={styles.inputFlex}
//                 placeholder="End date (YYYY-MM-DD)"
//                 value={endDate}
//                 onChangeText={setEndDate}
//               />
//             </View>
//           </View>

//           {/* Budget */}
//           <Text style={styles.label}>Total Budget</Text>
//           <View style={styles.inputRow}>
//             <Text style={{ color: "#6b7280", marginRight: 6 }}>$</Text>
//             <TextInput
//               style={styles.inputFlex}
//               placeholder="0"
//               keyboardType="numeric"
//               value={budget}
//               onChangeText={setBudget}
//             />
//             <Text style={{ color: "#6b7280" }}>USD</Text>
//           </View>

//           {/* Donor */}
//           <Text style={styles.label}>Donors / Funding Sources</Text>
//           <TouchableOpacity style={styles.dropdown}>
//             <Text style={{ color: donor ? "#111827" : "#6b7280" }}>
//               {donor || "Select registered donor"}
//             </Text>
//             <Ionicons name="chevron-down" size={18} color="#6b7280" />
//           </TouchableOpacity>
//           <View style={styles.inputRow}>
//             <Ionicons name="person-outline" size={18} color="#16a34a" />
//             <TextInput
//               style={styles.inputFlex}
//               placeholder="Or enter custom donor name"
//               value={customDonor}
//               onChangeText={setCustomDonor}
//             />
//             <Ionicons name="add" size={18} color="#6b7280" />
//           </View>

//           {/* Region */}
//           <Text style={styles.label}>Target Region / District</Text>
//           <View style={styles.inputRow}>
//             <Ionicons name="location-outline" size={18} color="#16a34a" />
//             <TextInput
//               style={styles.inputFlex}
//               placeholder="Enter target region or district"
//               value={region}
//               onChangeText={setRegion}
//             />
//             {/* <Ionicons name="chevron-down" size={18} color="#6b7280" /> */}
//           </View>

//           {/* Description */}
//           <Text style={styles.label}>Description / Objectives</Text>
//           <TextInput
//             style={styles.textarea}
//             placeholder="Describe the project goals, target beneficiaries, and expected outcomes…"
//             value={description}
//             onChangeText={setDescription}
//             multiline
//             maxLength={1000}
//           />

//           {/* Actions */}
//           <TouchableOpacity
//             style={[styles.primaryBtn, !canCreate && { opacity: 0.6 }]}
//             disabled={!canCreate}
//             onPress={createProject}
//           >
//             <Text style={styles.primaryBtnText}>Create Project</Text>
//           </TouchableOpacity>

//           <View style={styles.row}>
//             <TouchableOpacity style={styles.secondaryBtn} onPress={() => Alert.alert("Saved", "Draft saved locally.")}>
//               <Text style={styles.secondaryText}>Save as Draft</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.linkBtn} onPress={() => router.back()}>
//               <Text style={styles.linkText}>Cancel</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   card: { backgroundColor: "#fff", borderRadius: 12, padding: 14 },
//   header: { fontWeight: "800", fontSize: 18, color: "#0f172a" },
//   subHeader: { color: "#6b7280", marginBottom: 12 },
//   label: { marginTop: 12, marginBottom: 6, color: "#111827", fontWeight: "700" },
//   inputRow: {
//     flexDirection: "row", alignItems: "center", gap: 8,
//     borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10,
//     paddingHorizontal: 12, paddingVertical: 10,
//   },
//   inputFlex: { flex: 1, color: "#0f172a" },
//   dropdown: {
//     borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10,
//     paddingVertical: 12, paddingHorizontal: 12,
//     flexDirection: "row", justifyContent: "space-between", alignItems: "center",
//   },
//   statusPill: {
//     paddingVertical: 6, paddingHorizontal: 10,
//     backgroundColor: "#ecfdf5", borderRadius: 999,
//   },
//   statusText: { color: "#16a34a", fontWeight: "700" },
//   textarea: {
//     borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10,
//     padding: 12, minHeight: 120, textAlignVertical: "top",
//   },
//   primaryBtn: {
//     backgroundColor: "#16a34a", borderRadius: 10,
//     paddingVertical: 14, alignItems: "center", marginTop: 16,
//   },
//   primaryBtnText: { color: "#fff", fontWeight: "800" },
//   row: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
//   secondaryBtn: {
//     paddingVertical: 12, paddingHorizontal: 12,
//     borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, flex: 1, marginRight: 8,
//   },
//   secondaryText: { textAlign: "center", color: "#111827", fontWeight: "700" },
//   linkBtn: { paddingVertical: 12, paddingHorizontal: 8 },
//   linkText: { color: "#6b7280", fontWeight: "700" },
// });




import React, { useEffect, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  SafeAreaView, StyleSheet, ActivityIndicator, Alert, Platform, Modal, Pressable
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker"; // 🆕
import { me } from "../../lib/auth"; // uses your existing me()
import { createProject as apiCreateProject } from "../../lib/projects";

const STATUSES = ["On-going", "Planned", "Completed"];
const SDGS = [
  { id: 1, title: "No Poverty" },
  { id: 2, title: "Zero Hunger" },
  { id: 3, title: "Good Health and Well-being" },
  { id: 4, title: "Quality Education" },
  { id: 5, title: "Gender Equality" },
  { id: 6, title: "Clean Water and Sanitation" },
  { id: 7, title: "Affordable and Clean Energy" },
  { id: 8, title: "Decent Work and Economic Growth" },
  { id: 9, title: "Industry, Innovation and Infrastructure" },
  { id: 10, title: "Reduced Inequalities" },
  { id: 11, title: "Sustainable Cities and Communities" },
  { id: 12, title: "Responsible Consumption and Production" },
  { id: 13, title: "Climate Action" },
  { id: 14, title: "Life Below Water" },
  { id: 15, title: "Life on Land" },
  { id: 16, title: "Peace, Justice and Strong Institutions" },
  { id: 17, title: "Partnerships for the Goals" },
];

export default function ProjectCreate() {
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);

  // NGO Manager guard
  useEffect(() => {
    (async () => {
      try {
        const user = await me();
        if (!user || user.role !== "NGO_MANAGER") {
          Alert.alert("Access denied", "Only NGO Managers can create projects.", [
            { text: "OK", onPress: () => router.replace("/(tabs)/HomeScreen") },
          ]);
          return;
        }
      } finally {
        setAuthLoading(false);
      }
    })();
  }, []);

  // form state
  const [name, setName] = useState("");
  const [status, setStatus] = useState("On-going");
  const [sdg, setSdg] = useState(null);

  const [startDate, setStartDate] = useState(""); // "YYYY-MM-DD"
  const [endDate, setEndDate] = useState("");

  const [budget, setBudget] = useState("");
  const [donor, setDonor] = useState("");
  const [customDonors, setCustomDonors] = useState([]); // 🆕 multiple donors preview
  const [region, setRegion] = useState("");
  const [description, setDescription] = useState("");
  const [targetBeneficiaries, setTargetBeneficiaries] = useState(""); // 🆕

  // 🆕 dropdown modals
  const [statusOpen, setStatusOpen] = useState(false);
  const [sdgOpen, setSdgOpen] = useState(false);

  // 🆕 date pickers
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const canCreate = name.trim().length > 0 && sdg && budget !== "";

//   const createProject = () => {
//     // TODO: hook your backend endpoint
//     Alert.alert("Project created", "Your project has been created.", [
//       { text: "OK", onPress: () => router.back() },
//     ]);
//   };

  const createProject = async () => {
        try {
            // Map display → backend enum
            const statusEnum =
            status === "On-going" ? "ON_GOING" :
            status === "Planned"  ? "PLANNED"  :
                                    "COMPLETED";

            // include the currently typed donor if not added yet
            const donors = customDonors.includes(donor.trim()) || !donor.trim()
            ? customDonors
            : [...customDonors, donor.trim()];

            const payload = {
            name: name.trim(),
            status: statusEnum,
            sdg: sdg?.id,                        // number (1..17)
            start_date: startDate || null,       // "YYYY-MM-DD"
            end_date: endDate || null,
            budget_amount: Number(budget || 0),
            budget_currency: "USD",
            donors,
            region: region.trim(),
            description: description.trim(),
            target_beneficiaries: Number(targetBeneficiaries || 0),
            };

            const project = await apiCreateProject(payload);

            Alert.alert("Project created", `“${project.name}” has been created.`, [
            { text: "OK", onPress: () => router.back() },
            ]);
        } catch (e) {
            Alert.alert("Error", e?.message || "Failed to create project.");
        }
    };


  const addCustomDonor = () => {             // 🆕
    const trimmed = donor.trim();
    if (!trimmed) return;
    if (customDonors.includes(trimmed)) return;
    setCustomDonors((d) => [...d, trimmed]);
    setDonor("");
  };
  const removeCustomDonor = (name) => {      // 🆕
    setCustomDonors((d) => d.filter((x) => x !== name));
  };

  const formatDate = (d) => {                 // 🆕 YYYY-MM-DD
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  if (authLoading) {
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
            <Text style={styles.header}>New Project Setup</Text>
            <Text style={styles.subHeader}>
                Create a new SDG-aligned project for tracking and transparency
            </Text>
        </View>
        <View style={styles.card}>
          {/* Project Name + Status (dropdown) */}
          <Text style={styles.label}>Project Name</Text>
          <View style={styles.inputRow}>
            <Ionicons name="leaf-outline" size={18} color="#16a34a" />
            <TextInput
              style={styles.inputFlex}
              placeholder="Enter project name"
              value={name}
              onChangeText={setName}
            />
            {/* 🆕 Status dropdown trigger */}
            <TouchableOpacity style={styles.statusPill} onPress={() => setStatusOpen(true)}>
              <Text style={styles.statusText}>{status}</Text>
              <Ionicons name="chevron-down" size={16} color="#16a34a" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>

          {/* SDG Goal dropdown */}
          <Text style={styles.label}>SDG Goals</Text>
          <TouchableOpacity style={styles.dropdown} onPress={() => setSdgOpen(true)}>
            <Text style={{ color: sdg ? "#111827" : "#6b7280" }}>
              {sdg
                ? `SDG ${sdg.id} — ${sdg.title}`
                : "Select SDG Goal"}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#6b7280" />
          </TouchableOpacity>

          {/* Timeline with pop-up date pickers */}
          <Text style={styles.label}>Project Timeline</Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={[styles.inputRow, { flex: 1 }]}>
              <Ionicons name="calendar-outline" size={18} color="#16a34a" />
              <TextInput
                style={styles.inputFlex}
                placeholder="Start date (YYYY-MM-DD)"
                value={startDate}
                onChangeText={setStartDate}
              />
              <TouchableOpacity onPress={() => setShowStartPicker(true)}>
                <Ionicons name="calendar" size={18} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <View style={[styles.inputRow, { flex: 1 }]}>
              <Ionicons name="calendar-outline" size={18} color="#16a34a" />
              <TextInput
                style={styles.inputFlex}
                placeholder="End date (YYYY-MM-DD)"
                value={endDate}
                onChangeText={setEndDate}
              />
              <TouchableOpacity onPress={() => setShowEndPicker(true)}>
                <Ionicons name="calendar" size={18} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Budget */}
          <Text style={styles.label}>Total Budget</Text>
          <View style={styles.inputRow}>
            <Text style={{ color: "#6b7280", marginRight: 6 }}>$</Text>
            <TextInput
              style={styles.inputFlex}
              placeholder="0"
              keyboardType="numeric"
              value={budget}
              onChangeText={setBudget}
            />
            <Text style={{ color: "#6b7280" }}>USD</Text>
          </View>

          {/* total benficiery */}
          <Text style={styles.label}>Target Beneficiaries</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.inputFlex}
              placeholder="Enter number of target beneficiaries"
              keyboardType="numeric"
              value={targetBeneficiaries}
              onChangeText={setTargetBeneficiaries}
            />
          </View>

          {/* Donors */}
          <Text style={styles.label}>Donors / Funding Sources</Text>
          {/* Optionally show a dropdown of registered donors here */}
          <View style={styles.inputRow}>
            <Ionicons name="person-outline" size={18} color="#16a34a" />
            <TextInput
              style={styles.inputFlex}
              placeholder="Enter donor / funding source"
              value={donor}
              onChangeText={setDonor}
            />
            <TouchableOpacity onPress={addCustomDonor}>
              <Ionicons name="add" size={22} color="#16a34a" />
            </TouchableOpacity>
          </View>

          {/* 🆕 Donor preview chips */}
          {customDonors.length > 0 && (
            <View style={styles.chipsWrap}>
              {customDonors.map((d) => (
                <View key={d} style={styles.chip}>
                  <Text style={styles.chipText}>{d}</Text>
                  <TouchableOpacity onPress={() => removeCustomDonor(d)}>
                    <Ionicons name="close" size={14} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Region */}
          <Text style={styles.label}>Target Region / District</Text>
          <View style={styles.inputRow}>
            <Ionicons name="location-outline" size={18} color="#16a34a" />
            <TextInput
              style={styles.inputFlex}
              placeholder="Select region"
              value={region}
              onChangeText={setRegion}
            />
            {/* <Ionicons name="chevron-down" size={18} color="#6b7280" /> */}
          </View>

          {/* Description */}
          <Text style={styles.label}>Description / Objectives</Text>
          <TextInput
            style={styles.textarea}
            placeholder="Describe the project goals, target beneficiaries, and expected outcomes…"
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={1000}
          />

          {/* Actions */}
          <TouchableOpacity
            style={[styles.primaryBtn, !canCreate && { opacity: 0.6 }]}
            disabled={!canCreate}
            onPress={createProject}
          >
            <Text style={styles.primaryBtnText}>Create Project</Text>
          </TouchableOpacity>

          <View style={styles.row}>
            {/* <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => Alert.alert("Saved", "Draft saved locally.")}
            >
              <Text style={styles.secondaryText}>Save as Draft</Text>
            </TouchableOpacity> */}
            <TouchableOpacity style={styles.linkBtn} onPress={() => router.back()}>
              <Text style={styles.linkText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* 🆕 Status dropdown modal */}
      <Modal transparent visible={statusOpen} animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={() => setStatusOpen(false)}>
          <View style={styles.modalSheet}>
            {STATUSES.map((s) => (
              <TouchableOpacity
                key={s}
                style={styles.modalItem}
                onPress={() => {
                  setStatus(s);
                  setStatusOpen(false);
                }}
              >
                <Text style={{ fontSize: 16 }}>{s}</Text>
                {status === s && <Ionicons name="checkmark" size={18} color="#16a34a" />}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* 🆕 SDG dropdown modal */}
      <Modal transparent visible={sdgOpen} animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={() => setSdgOpen(false)}>
          <View style={[styles.modalSheet, { maxHeight: "70%" }]}>
            <Text style={{ fontWeight: "800", fontSize: 16, marginBottom: 8 }}>Select SDG</Text>
            <ScrollView>
              {SDGS.map((g) => (
                <TouchableOpacity
                  key={g.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setSdg(g);
                    setSdgOpen(false);
                  }}
                >
                  <Text style={{ fontSize: 16 }}>{`SDG ${g.id} — ${g.title}`}</Text>
                  {sdg?.id === g.id && <Ionicons name="checkmark" size={18} color="#16a34a" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* 🆕 Date pickers (native) */}
      {showStartPicker && (
        <DateTimePicker
          value={startDate ? new Date(startDate) : new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, d) => {
            setShowStartPicker(false);
            if (d) setStartDate(formatDate(d));
          }}
        />
      )}
      {showEndPicker && (
        <DateTimePicker
          value={endDate ? new Date(endDate) : new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, d) => {
            setShowEndPicker(false);
            if (d) setEndDate(formatDate(d));
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginTop: 12, marginBottom: 26 },
  header: { fontWeight: "800", fontSize: 20, color: "#a7eec9ff", marginBottom: 4, marginTop: 8 },
  subHeader: { color: "#7f889bff", marginBottom: 12, fontSize: 15 },
  label: { marginTop: 12, marginBottom: 6, color: "#111827", fontWeight: "700" },
  inputRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12
  },
  inputFlex: { flex: 1, color: "#0f172a" },
  dropdown: {
    borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10,
    paddingVertical: 12, paddingHorizontal: 12,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12
  },
  statusPill: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 6, paddingHorizontal: 10,
    backgroundColor: "#ecfdf5", borderRadius: 999,
  },
  statusText: { color: "#16a34a", fontWeight: "700" },
  textarea: {
    borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10,
    padding: 12, minHeight: 120, textAlignVertical: "top",
  },
  primaryBtn: {
    backgroundColor: "#16a34a", borderRadius: 10,
    paddingVertical: 14, alignItems: "center", marginTop: 16,
  },
  primaryBtnText: { color: "#fff", fontWeight: "800" },
  row: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  secondaryBtn: {
    paddingVertical: 12, paddingHorizontal: 12,
    borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, flex: 1, marginRight: 8,
  },
  secondaryText: { textAlign: "center", color: "#111827", fontWeight: "700" },
  linkBtn: { paddingVertical: 12, paddingHorizontal: 8 },
  linkText: { color: "#6b7280", fontWeight: "700", backgroundColor: "#f09191ad", padding: 10, borderRadius: 6   },

  // 🆕 modal styles
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.25)", justifyContent: "flex-end" },
  modalSheet: { backgroundColor: "#fff", padding: 12, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  modalItem: {
    paddingVertical: 14, paddingHorizontal: 6, flexDirection: "row",
    justifyContent: "space-between", alignItems: "center",
    borderBottomWidth: 1, borderColor: "#F2F4F7",
  },

  // 🆕 donor chips
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  chip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#16a34a", paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 999,
  },
  chipText: { color: "#fff", fontWeight: "700" },
});
