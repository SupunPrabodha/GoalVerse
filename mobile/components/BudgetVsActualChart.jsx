import React, { useMemo } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import {
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryGroup,
  VictoryLegend,
  VictoryTheme,
} from "victory-native";

const { width } = Dimensions.get("window");

function formatCurrency(n, currency = "$") {
  const x = Number(n || 0);
  if (x >= 1_000_000) return `${currency}${(x / 1_000_000).toFixed(1)}M`;
  if (x >= 1_000) return `${currency}${(x / 1_000).toFixed(0)}k`;
  return `${currency}${x.toLocaleString()}`;
}

/**
 * BudgetVsActualChart
 * props:
 *  - data: [{ name: "Infrastructure", budget: 120000, actual: 110000 }, ...]
 *  - title?: string
 *  - subtitle?: string
 *  - currency?: string       // default "$"
 *  - colors?: { budget: string, actual: string }  // default blue/green
 *  - height?: number         // default 240
 *  - showLegend?: boolean    // default true
 */
export default function BudgetVsActualChart({
  data = [],
  title = "Budget vs Actual",
  subtitle = "Comparison of planned budget against actual expenditures",
  currency = "$",
  colors = { budget: "#1D4ED8", actual: "#16A34A" },
  height = 240,
  showLegend = true,
}) {
  const chartData = useMemo(() => {
    const labels = data.map((d) => d.name);
    const budget = data.map((d, i) => ({ x: i + 1, y: Number(d.budget || 0) }));
    const actual = data.map((d, i) => ({ x: i + 1, y: Number(d.actual || 0) }));
    const maxY = Math.max(1, ...budget.map((b) => b.y), ...actual.map((a) => a.y));
    return { labels, budget, actual, maxY };
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <Text style={{ color: "#6b7280", marginTop: 12 }}>No expense data.</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <Text style={styles.spark}>↗</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
      {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

      <VictoryChart
        height={height}
        width={width - 32}               // card has horizontal padding 16 + 16
        theme={VictoryTheme.material}
        domainPadding={{ x: 30, y: 20 }}
        padding={{ top: 12, right: 24, bottom: 70, left: 60 }}
      >
        <VictoryAxis
          tickValues={chartData.budget.map((_, i) => i + 1)}
          tickFormat={(t) => {
            const label = chartData.labels[t - 1] || "";
            // Trim long labels but keep readable
            return label.length > 12 ? `${label.slice(0, 11)}…` : label;
          }}
          style={{
            tickLabels: { angle: 0, fontSize: 11, padding: 28, fill: "#6b7280" },
            axis: { stroke: "#e5e7eb" },
            grid: { stroke: "transparent" },
          }}
        />
        <VictoryAxis
          dependentAxis
          tickFormat={(t) => formatCurrency(t, currency)}
          style={{
            tickLabels: { fontSize: 11, fill: "#6b7280" },
            axis: { stroke: "#e5e7eb" },
            grid: { stroke: "#f1f5f9" },
          }}
        />
        <VictoryGroup offset={18}>
          <VictoryBar
            data={chartData.budget}
            barWidth={14}
            style={{ data: { fill: colors.budget } }}
          />
          <VictoryBar
            data={chartData.actual}
            barWidth={14}
            style={{ data: { fill: colors.actual } }}
          />
        </VictoryGroup>

        {showLegend && (
          <VictoryLegend
            x={width / 2 - 110}
            y={height - 70}
            orientation="horizontal"
            gutter={20}
            itemsPerRow={2}
            style={{ labels: { fontSize: 12, fill: "#374151" } }}
            data={[
              { name: "Budget", symbol: { fill: colors.budget } },
              { name: "Actual", symbol: { fill: colors.actual } },
            ]}
          />
        )}
      </VictoryChart>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  spark: { color: "#2563eb", fontWeight: "900" },
  title: { fontWeight: "800", color: "#0f172a", fontSize: 16 },
  subtitle: { color: "#6b7280", marginTop: 4 },
});
