import React, { useMemo } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { VictoryPie } from "victory-native";
// ...existing code...

const { width } = Dimensions.get("window");

const DEFAULT_COLORS = [
  "#2563EB", // blue
  "#10B981", // green
  "#F59E0B", // amber
  "#22C55E", // emerald
  "#EF4444", // red
  "#8B5CF6", // violet
  "#06B6D4", // cyan
];

// 🆕 robust number parser: "85,000", "$130,000" -> 85000
function parseNum(v) {
  if (typeof v === "number") return isFinite(v) ? v : 0;
  if (typeof v === "string") {
    const cleaned = v.replace(/[^0-9.\-]/g, ""); // strip commas, currency, spaces
    const n = Number(cleaned);
    return isFinite(n) ? n : 0;
  }
  return 0;
}


/**
 * Donut chart for Cost per Beneficiary
 *
 * props:
 *  - data: Array<{ name: string, actual: number, beneficiaries: number }>
 *  - title?: string
 *  - subtitle?: string
 *  - currency?: string (default "$")
 *  - colors?: string[]  // optional palette; falls back to DEFAULT_COLORS
 *  - metric?: "cpb" | "actual"  // slice size by cost-per-beneficiary (default) or by actual cost
 *  - height?: number  // default 240
 */
export default function DonutCostPerBeneficiary({
  data = [],
  title = "Cost per Beneficiary Breakdown",
  subtitle = "Distribution of beneficiary-related costs",
  currency = "$",
  colors = DEFAULT_COLORS,
  metric = "cpb",
  height = 240,
}) {
  // prepare values
  const prepared = useMemo(() => {
    if (!Array.isArray(data)) return { slices: [], legend: [], total: 0, anyBen: false };

    const rows = data.map((d, i) => {
      const actual = parseNum(d.actual);
      const ben = parseNum(d.beneficiaries);
      const cpb = ben > 0 ? actual / ben : 0;
      return { name: d.name, actual, beneficiaries: ben, cpb, color: colors[i % colors.length] };
    });

    const anyBen = rows.some((r) => r.beneficiaries > 0);     // 🆕
    const useMetric = metric === "cpb" && anyBen ? "cpb" : "actual"; // 🆕 auto-fallback
    const slices = rows.map((r) => ({ x: r.name, y: Math.max(0, r[useMetric] || 0), fill: r.color }));

    const total = slices.reduce((s, v) => s + (isFinite(v.y) ? v.y : 0), 0);

    // Debug log for chart data
    if (__DEV__) {
      console.log("[DonutCostPerBeneficiary] slices:", slices);
      console.log("[DonutCostPerBeneficiary] total:", total);
      console.log("[DonutCostPerBeneficiary] useMetric:", useMetric);
    }

    return {
      slices,
      legend: rows.map((r) => ({ label: r.name, color: r.color })),
      total,
      useMetric,
      anyBen,
    };
  }, [data, metric, colors]);

  const hasData = prepared.slices.some((s) => s.y > 0);
  const allZero = prepared.slices.every((s) => s.y === 0);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

      {!hasData ? (
        <Text style={{ color: "#6b7280", marginTop: 16 }}>No data available.</Text>
      ) : allZero ? (
        <Text style={{ color: "#ef4444", marginTop: 16 }}>All categories have zero value. Chart cannot be displayed.</Text>
      ) : (
        <>
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <VictoryPie
              data={prepared.slices}
              width={220}
              height={180}
              innerRadius={55}
              padAngle={2}
              labels={() => null}
              animate={{ duration: 500 }}
              standalone
              style={{
                data: {
                  fill: ({ datum, index }) => datum?.fill || (Array.isArray(colors) ? colors[index % colors.length] : "#2563EB"),
                  stroke: "#fff",
                  strokeWidth: 2,
                },
              }}
            />
            <View pointerEvents="none" style={styles.centerWrap}>
              <Text style={styles.centerTop}>{prepared.useMetric === "actual" ? "Total Cost" : "Avg Cost/Ben."}</Text>
              <Text style={styles.centerValue}>{prepared.useMetric === "actual" ? currency + formatNumber(prepared.total) : currency + formatNumber(averageCpb(prepared.slices))}</Text>
            </View>
          </View>
          <View style={styles.legendRowWrap}>
            {prepared.legend.map((l) => (
              <View key={l.label} style={styles.legendRowItem}>
                <View style={[styles.dot, { backgroundColor: l.color }]} />
                <Text style={styles.legendText}>{l.label}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

function averageCpb(slices) {
  const vals = slices.map((s) => s.y).filter((n) => isFinite(n) && n > 0);
  if (!vals.length) return 0;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function formatNumber(n) {
  const x = Number(n || 0);
  if (x >= 1_000_000) return (x / 1_000_000).toFixed(1) + "M";
  if (x >= 1_000) return (x / 1_000).toFixed(1) + "k";
  return x.toLocaleString();
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    // overflow: "hidden", // Removed to fix VictoryPie rendering
  },
  title: { fontWeight: "800", color: "#0f172a", fontSize: 16 },
  subtitle: { color: "#6b7280", marginTop: 4 },

  centerWrap: {
    position: "absolute",
    top: 72,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  centerTop: { color: "#6b7280", fontSize: 12 },
  centerValue: { color: "#0f172a", fontWeight: "900", fontSize: 16, marginTop: 2 },

  legendRowWrap: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
  },
  legendRowItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
  },
  dot: { width: 12, height: 12, borderRadius: 999 },
  legendText: { color: "#0f172a", fontWeight: "700", fontSize: 15 },
});
