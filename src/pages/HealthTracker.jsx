import React, { useState } from 'react';

const HealthTracker = () => {
  const [habits, setHabits] = useState([
    { id: 1, name: 'Drink 8 glasses of water', completed: false },
    { id: 2, name: '30 min exercise', completed: false },
    { id: 3, name: 'Eat 5 servings of veggies', completed: false },
  ]);
  const [newHabit, setNewHabit] = useState('');

  const toggleHabit = (id) => {
    setHabits(
      habits.map((habit) =>
        habit.id === id ? { ...habit, completed: !habit.completed } : habit
      )
    );
  };

  const addHabit = (e) => {
    e.preventDefault();
    if (!newHabit.trim()) return;

    const newEntry = {
      id: Date.now(),
      name: newHabit.trim(),
      completed: false,
    };

    setHabits([newEntry, ...habits]);
    setNewHabit('');
  };

  return (
    <div className="flex-1 p-4 ml-0 md:ml-64">
      <h1 className="text-2xl font-bold mb-4">Health & Wellness Tracker</h1>

      {/* Add New Habit */}
      <form onSubmit={addHabit} className="mb-6 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="New Habit (e.g., Morning Walk)"
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          className="p-2 border rounded flex-1"
          required
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add Habit
        </button>
      </form>

      {/* Habit List */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Your Habits</h2>
        <ul className="space-y-2">
          {habits.map((habit) => (
            <li
              key={habit.id}
              className={`p-4 rounded shadow flex justify-between items-center ${
                habit.completed ? 'bg-green-100' : 'bg-white'
              }`}
            >
              <span
                className={`${
                  habit.completed ? 'line-through text-gray-500' : ''
                }`}
              >
                {habit.name}
              </span>
              <button
                onClick={() => toggleHabit(habit.id)}
                className={`px-3 py-1 rounded text-sm ${
                  habit.completed
                    ? 'bg-gray-500 text-white hover:bg-gray-600'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {habit.completed ? 'Undo' : 'Mark Done'}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Simple Progress */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Progress</h3>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-green-600 h-4 rounded-full"
            style={{
              width: `${
                (habits.filter((h) => h.completed).length / habits.length) * 100
              }%`,
            }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {habits.filter((h) => h.completed).length} of {habits.length} habits completed
        </p>
      </div>
    </div>
  );
};

export default HealthTracker;
