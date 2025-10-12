import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * ExpenseCategoriesCard
 * props:
 *  - title?: string
 *  - categories: Array<{ name: string, actual: number }>
 *  - currency?: string (default "$")
 *  - onReportPress?: () => void
 *  - showReportsButton?: boolean (default true)
 */
export default function ExpenseCategoriesCard({
  title = "Expenses Breakdown",
  categories = [],
  currency = "$",
  onReportPress,
  showReportsButton = true,
}) {
  const fmtMoney = (n) =>
    (Number(n || 0)).toLocaleString(undefined, { maximumFractionDigits: 0 });

  const iconFor = (name = "") => {
    const n = name.toLowerCase();
    if (/(seedling|tree|plant|nursery|reforestation)/.test(n)) return ["leaf-outline", "#16a34a"];
    if (/(train|capacity|edu|workshop)/.test(n)) return ["school-outline", "#f59e0b"];
    if (/(community|mobilization|engage|volunteer)/.test(n)) return ["people-outline", "#0ea5e9"];
    if (/(equipment|tools|device)/.test(n)) return ["construct-outline", "#8b5cf6"];
    if (/(monitor|audit|m&e|evaluation)/.test(n)) return ["analytics-outline", "#10b981"];
    return ["pricetag-outline", "#6b7280"];
  };

  const renderItem = ({ item }) => {
    const [icon, color] = iconFor(item.name);
    return (
      <View style={s.row}>
        <View style={s.rowLeft}>
          <Ionicons name={icon} size={16} color={color} />
          <Text style={s.rowLabel}>
            {item.name} <Text style={{ color: "#6b7280" }}>({currency})</Text>
          </Text>
        </View>
        <View style={s.amountBox}>
          <Text style={s.amountText}>{fmtMoney(item.actual)}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={s.card}>
      <View style={s.header}>
        <Text style={s.title}>Expenses Breakdown</Text>
        {/* {showReportsButton && (
          <TouchableOpacity style={s.reportsBtn} onPress={onReportPress}>
            <Text style={s.reportsText}>Reports</Text>
          </TouchableOpacity>
        )} */}
      </View>

      {(!categories || categories.length === 0) ? (
        <Text style={{ color: "#6b7280" }}>No expenses recorded.</Text>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(it, idx) => it.name + String(idx)}
          renderItem={renderItem}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}
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
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  title: { color: "#0f172a", fontWeight: "800", fontSize: 18 },
  reportsBtn: { backgroundColor: "#10b981", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999 },
  reportsText: { color: "#fff", fontWeight: "800" },

  row: { },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  rowLabel: { color: "#0f172a", fontWeight: "700" },

  amountBox: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  amountText: { color: "#6b7280", fontWeight: "800" },
});
