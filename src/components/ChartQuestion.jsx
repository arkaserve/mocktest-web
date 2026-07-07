// ChartQuestion.jsx
// Drop-in component for ExamScreen.jsx
// Renders bar, line, or pie chart from metadata.chart_data
// Uses recharts (already in your package.json)

import {
  BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from "recharts"

const COLORS = ["#4f46e5","#06b6d4","#10b981","#f59e0b","#ef4444"]

export default function ChartQuestion({ question }) {
  const meta = question.metadata || {}

  // Only render chart if render_type = "chart"
  if (meta.render_type !== "chart") return null

  const { chart_type, chart_title, chart_data,
          chart_x_label, chart_y_label } = meta

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Chart Title */}
      <p style={{ fontWeight: 600, marginBottom: 8, textAlign: "center" }}>
        {chart_title}
      </p>

      {/* BAR CHART */}
      {chart_type === "bar" && (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chart_data}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" label={{ value: chart_x_label, position: "insideBottom", offset: -5 }} />
            <YAxis label={{ value: chart_y_label, angle: -90, position: "insideLeft" }} />
            <Tooltip />
            <Bar dataKey="value" fill="#4f46e5" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* LINE CHART */}
      {chart_type === "line" && (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chart_data}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" label={{ value: chart_x_label, position: "insideBottom", offset: -5 }} />
            <YAxis label={{ value: chart_y_label, angle: -90, position: "insideLeft" }} />
            <Tooltip />
            <Line type="monotone" dataKey="value"
              stroke="#4f46e5" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* PIE CHART */}
      {chart_type === "pie" && (
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={chart_data} dataKey="value"
              nameKey="name" cx="50%" cy="50%"
              outerRadius={90} label={({ name, value }) => name + " " + value + "%"}>
              {chart_data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => v + "%"} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
