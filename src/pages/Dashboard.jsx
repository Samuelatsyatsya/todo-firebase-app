import React from 'react';
import { Link } from 'react-router-dom';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
const Dashboard = ({ todos = [] }) => {
    
  return (
    <div className="min-h-screen p-4 md:ml-64 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* Analytics */}
      <div className="mb-12">
        <AnalyticsDashboard todos={todos} />
      </div>

      {/* Recent Tasks */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4"> Recent Tasks</h2>
        <ul className="space-y-2">
          {todos.slice(0, 5).map(todo => (
            <li key={todo.id} className="p-4 bg-white rounded shadow flex justify-between">
              <span>{todo.text}</span>
              <span className="text-sm text-gray-500">({todo.category})</span>
            </li>
          ))}
        </ul>
        <Link to="/todos" className="inline-block mt-4 text-blue-600 hover:underline">
          View All Tasks →
        </Link>
      </div>

      {/* Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/finance" className="p-6 bg-green-100 rounded shadow hover:bg-green-200 transition">
          💰 <strong>Personal Finance Tracker</strong>
          <p className="text-sm text-gray-600 mt-1">Manage budget & expenses.</p>
        </Link>
        <Link to="/events" className="p-6 bg-yellow-100 rounded shadow hover:bg-yellow-200 transition">
          📅 <strong>Event Planner</strong>
          <p className="text-sm text-gray-600 mt-1">Plan & track your events.</p>
        </Link>
        <Link to="/health" className="p-6 bg-red-100 rounded shadow hover:bg-red-200 transition">
          💪 <strong>Health & Wellness Tracker</strong>
          <p className="text-sm text-gray-600 mt-1">Track habits & goals.</p>
        </Link>
        <Link to="/study" className="p-6 bg-blue-100 rounded shadow hover:bg-blue-200 transition">
          📚 <strong>Study Planner</strong>
          <p className="text-sm text-gray-600 mt-1">Organize study sessions.</p>
        </Link>
        <Link to="/support" className="p-6 bg-purple-100 rounded shadow hover:bg-purple-200 transition">
          🎫 <strong>Support Tickets</strong>
          <p className="text-sm text-gray-600 mt-1">Manage support requests.</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
