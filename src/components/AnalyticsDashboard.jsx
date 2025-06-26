import React from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const AnalyticsDashboard = ({todos}) => {

    const total = todos.length;
  const completed = todos.filter(t => t.completed).length;
  const completionRate = total ? Math.round((completed / total) * 100) : 0;

  // Tasks added per day
  const dailyCounts = {};
  todos.forEach(todo => {
    const date = todo.createdAt?.toDate().toLocaleDateString() || "Unknown";
    dailyCounts[date] = (dailyCounts[date] || 0) + 1;
  });
  const barData = Object.entries(dailyCounts).map(([date, count]) => ({ date, count }));

  return (
     <div style={{ marginTop: "3rem" }}>
      <h2>📊 Analytics Dashboard</h2>

      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "2rem", marginTop: "2rem" }}>
        {/* Pie Chart */}
        <div>
          <h4>Task Completion Rate</h4>
          <ResponsiveContainer width={200} height={200}>
            <PieChart>
              <Pie dataKey="value" data={[
                { name: "Completed", value: completed },
                { name: "Pending", value: total - completed }
              ]}
                outerRadius={80}
                label
              >
                <Cell fill="#4CAF50" />
                <Cell fill="#FF5722" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <p>{completionRate}% Completed</p>
        </div>

        {/* Bar Chart */}
        <div>
          <h4>Tasks Added per Day</h4>
          <ResponsiveContainer width={300} height={200}>
            <BarChart data={barData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#2196F3" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsDashboard