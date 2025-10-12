import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * Shows 4 rows:
 *  - Program Implementation
 *  - Administrative Costs
 *  - Emergency Fund
 *  - Available Budget (computed: project.budget.amount - sum(allocated))
 *
 * props:
 *  - project: { budget: {amount, currency}, expenses: [...] }
 *  - currency?: string (fallback to "$" if not in project)
 *  - useAllocated?: boolean  // show allocated (true) or actual (false) for first 3 rows (default true)
 */
export default function BudgetBreakdownCard({ project, currency, useAllocated = true }) {
  const cur = currency || project?.budget?.currency || "$";

  const rows = useMemo(() => {
    const list = project?.expenses || [];
    const byCode = (code) => list.find((e) => e.type === "CORE" && e.code === code);

    const totalBudget = Number(project?.budget?.amount || 0);
    const allocatedTotal = list.reduce((s, e) => s + Number(e.allocated || 0), 0);

    const getVal = (e) => Number(useAllocated ? e?.allocated || 0 : e?.actual || 0);

    const prog = byCode("PROGRAM_IMPLEMENTATION");
    const admin = byCode("ADMINISTRATIVE_COSTS");
    const emerg = byCode("EMERGENCY_FUND");

    const vProg  = getVal(prog);
    const vAdmin = getVal(admin);
    const vEmerg = getVal(emerg);
    const vAvail = Math.max(0, totalBudget - allocatedTotal); // available budget is from allocated

    const toPct = (v) => (totalBudget > 0 ? Math.round((v / totalBudget) * 100) : 0);

    return [
      { label: "Program Implementation", value: vProg,  pct: toPct(vProg)  },
      { label: "Administrative Costs",  value: vAdmin, pct: toPct(vAdmin) },
      { label: "Emergency Fund",        value: vEmerg, pct: toPct(vEmerg) },
      { label: "Available Budget",      value: vAvail, pct: toPct(vAvail), dim: true },
    ];
  }, [project, currency, useAllocated]);

  const money = (n) =>
    Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 });

  return (
    <View style={s.card}>
      <View style={s.header}>
        <Ionicons name="cash-outline" size={18} color="#059669" />
        <Text style={s.title}>Budget Breakdown</Text>
      </View>

      {rows.map((r) => (
        <View key={r.label} style={[s.row, r.dim && { opacity: 0.9 }]}>
          <Text style={s.label}>{r.label}</Text>
          <Text style={s.amount}>
            {cur}{money(r.value)} <Text style={s.pct}>({r.pct}%)</Text>
          </Text>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  header: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  title: { color: "#0f172a", fontWeight: "900", fontSize: 18 },
  row: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#EEF2F7",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: { color: "#1f2937" },
  amount: { color: "#111827", fontWeight: "800" },
  pct: { color: "#6b7280", fontWeight: "700" },
});
