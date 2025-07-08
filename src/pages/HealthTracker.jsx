// src/pages/HealthTracker.jsx
import React, { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  where
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../hooks/useAuth"; // make sure you have this!

const HealthTracker = () => {
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState('');

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "habits"),
      where("userId", "==", user.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const habitsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setHabits(habitsData);
    });

    return () => unsub();
  }, [user]);

  const addHabit = async (e) => {
    e.preventDefault();
    if (!newHabit.trim() || !user) return;

    await addDoc(collection(db, "habits"), {
      name: newHabit.trim(),
      completed: false,
      userId: user.uid
    });

    setNewHabit('');
  };

  const toggleHabit = async (habit) => {
    const habitRef = doc(db, "habits", habit.id);
    await updateDoc(habitRef, {
      completed: !habit.completed
    });
  };

  const deleteHabit = async (habitId) => {
    await deleteDoc(doc(db, "habits", habitId));
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
              <div className="flex gap-2">
                <button
                  onClick={() => toggleHabit(habit)}
                  className={`px-3 py-1 rounded text-sm ${
                    habit.completed
                      ? 'bg-gray-500 text-white hover:bg-gray-600'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {habit.completed ? 'Undo' : 'Mark Done'}
                </button>
                <button
                  onClick={() => deleteHabit(habit.id)}
                  className="px-3 py-1 rounded text-sm bg-red-600 text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
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
                habits.length === 0
                  ? 0
                  : (habits.filter((h) => h.completed).length / habits.length) * 100
              }%`
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
