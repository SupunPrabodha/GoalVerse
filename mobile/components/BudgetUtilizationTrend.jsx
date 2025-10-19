import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path, G, Line, Text as SvgText, Circle } from "react-native-svg";
import { scaleLinear, scaleTime } from "d3-scale";
import { line as d3Line, curveMonotoneX } from "d3-shape";
import { extent } from "d3-array";

/**
 * BudgetUtilizationTrend
 * Shows a monthly time series of cumulative actual / cumulative budget across all projects.
 * Props:
 * - projects: Array<Project> with fields: budget.amount, expenses[{ actual, updatedAt }], start_date, end_date
 * - height?: number
 * - width?: number (optional; defaults to container width via Flex)
 * - currency?: string
 */
export default function BudgetUtilizationTrend({ projects = [], height = 200, currency = "$" }) {
  // Build monthly points: { date: Date, ratio: number (0..1), cumActual, cumBudget }
  const points = useMemo(() => buildMonthlySeries(projects), [projects]);

  if (!points.length) {
    return (
      <View style={s.card}><Text style={s.title}>Budget Utilization Trend</Text><Text style={s.muted}>No data</Text></View>
    );
  }

  const margin = { top: 16, right: 16, bottom: 28, left: 40 };
  const w = 340; // fixed width for now; can be made responsive
  const h = height;
  const innerW = w - margin.left - margin.right;
  const innerH = h - margin.top - margin.bottom;

  const x = scaleTime()
    .domain(extent(points, (d) => d.date))
    .range([0, innerW]);
  const y = scaleLinear()
    .domain([0, 1])
    .range([innerH, 0]);

  const lineGen = d3Line()
    .x((d) => x(d.date))
    .y((d) => y(d.ratio))
    .curve(curveMonotoneX);

  const path = lineGen(points);

  // simple ticks (max 6)
  const xTicks = niceXTicks(points, 6);
  const yTicks = [0, 0.25, 0.5, 0.75, 1];

  const last = points[points.length - 1];

  return (
    <View style={s.card}>
      <Text style={s.title}>Budget Utilization Trend</Text>
      <Text style={s.subtitle}>Cumulative actual / cumulative budget over time</Text>
      <Svg width={w} height={h}>
        <G transform={`translate(${margin.left},${margin.top})`}>
          {/* axes */}
          <Line x1={0} y1={innerH} x2={innerW} y2={innerH} stroke="#e5e7eb" />
          <Line x1={0} y1={0} x2={0} y2={innerH} stroke="#e5e7eb" />

          {/* y ticks */}
          {yTicks.map((t, i) => (
            <G key={`yt-${i}`} transform={`translate(0,${y(t)})`}>
              <Line x1={0} y1={0} x2={innerW} y2={0} stroke="#f3f4f6" />
              <SvgText x={-8} y={0} textAnchor="end" fontSize={10} fill="#6b7280">{Math.round(t * 100)}%</SvgText>
            </G>
          ))}

          {/* x ticks */}
          {xTicks.map((d, i) => (
            <G key={`xt-${i}`} transform={`translate(${x(d)},${innerH})`}>
              <Line x1={0} y1={0} x2={0} y2={6} stroke="#9ca3af" />
              <SvgText x={0} y={18} textAnchor="middle" fontSize={10} fill="#6b7280">
                {fmtMonth(d)}
              </SvgText>
            </G>
          ))}

          {/* line path */}
          {path && <Path d={path} stroke="#16a34a" strokeWidth={2} fill="none" />}

          {/* last point marker */}
          {last && (
            <G transform={`translate(${x(last.date)},${y(last.ratio)})`}>
              <Circle r={3} fill="#16a34a" />
              <SvgText x={6} y={-6} fontSize={10} fill="#065f46">{Math.round(last.ratio * 100)}%</SvgText>
            </G>
          )}
        </G>
      </Svg>
    </View>
  );
}

function buildMonthlySeries(projects) {
  // Gather all months between min start and max end across projects
  const allStarts = projects.map((p) => new Date(p.start_date)).filter((d) => isFinite(d));
  const allEnds = projects.map((p) => new Date(p.end_date)).filter((d) => isFinite(d));
  const minStart = allStarts.length ? new Date(Math.min(...allStarts)) : null;
  const maxEnd = allEnds.length ? new Date(Math.max(...allEnds)) : new Date();
  if (!minStart) return [];

  const months = enumerateMonths(minStart, maxEnd);

  // Pre-compute totals per project
  const projectBudgets = projects.map((p) => Number(p?.budget?.amount || 0));

  // For simplicity: treat budget as fully available at project start; actual accumulates by expense.updatedAt
  const totalBudget = projectBudgets.reduce((s, v) => s + v, 0);

  // Collect expense actuals by month
  const monthKey = (d) => `${d.getFullYear()}-${d.getMonth()}`;
  const actualByMonth = new Map();
  for (const p of projects) {
    for (const e of p?.expenses || []) {
      const ts = e.updatedAt ? new Date(e.updatedAt) : null;
      if (!ts || !isFinite(ts)) continue;
      const k = monthKey(new Date(ts.getFullYear(), ts.getMonth(), 1));
      actualByMonth.set(k, (actualByMonth.get(k) || 0) + Number(e.actual || 0));
    }
  }

  // Build cumulative series
  let cumActual = 0;
  let cumBudget = totalBudget;
  const result = [];
  for (const m of months) {
    const k = monthKey(m);
    cumActual += actualByMonth.get(k) || 0;
    const ratio = cumBudget > 0 ? Math.max(0, Math.min(1, cumActual / cumBudget)) : 0;
    result.push({ date: m, ratio, cumActual, cumBudget });
  }
  return result;
}

function enumerateMonths(start, end) {
  const out = [];
  const d = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date(end.getFullYear(), end.getMonth(), 1);
  while (d <= last) {
    out.push(new Date(d));
    d.setMonth(d.getMonth() + 1);
  }
  return out;
}

// Select up to maxTicks evenly spaced dates across the series
function niceXTicks(points, maxTicks = 6) {
  const n = points.length;
  if (n === 0) return [];
  if (n <= maxTicks) return points.map((p) => p.date);
  const step = Math.ceil(n / maxTicks);
  const ticks = [];
  for (let i = 0; i < n; i += step) ticks.push(points[i].date);
  const last = points[n - 1].date;
  const lastTick = ticks[ticks.length - 1];
  if (!lastTick || lastTick.getTime() !== last.getTime()) ticks.push(last);
  return ticks;
}

function fmtMonth(d) {
  const m = d.getMonth() + 1;
  const y = d.getFullYear();
  return `${y}-${m < 10 ? "0" + m : m}`;
}

const s = StyleSheet.create({
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 12, marginTop: 12 },
  title: { fontWeight: "800", color: "#0f172a" },
  subtitle: { color: "#6b7280", marginBottom: 8 },
  muted: { color: "#6b7280" },
});
