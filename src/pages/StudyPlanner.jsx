// src/pages/StudyPlanner.jsx
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
import { useAuth } from "../hooks/useAuth"; // must exist!

const StudyPlanner = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "studySessions"),
      where("userId", "==", user.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const sessionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSessions(sessionsData);
    });

    return () => unsub();
  }, [user]);

  const handleAddSession = async (e) => {
    e.preventDefault();
    if (!subject || !date || !user) return;

    await addDoc(collection(db, "studySessions"), {
      subject,
      date,
      notes,
      userId: user.uid
    });

    setSubject('');
    setDate('');
    setNotes('');
  };

  const handleDeleteSession = async (id) => {
    await deleteDoc(doc(db, "studySessions", id));
  };

  return (
    <div className="flex-1 p-4 ml-0 md:ml-64">
      <h1 className="text-2xl font-bold mb-4">Study Planner</h1>

      {/* Add Session Form */}
      <form onSubmit={handleAddSession} className="mb-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Subject"
          className="p-2 border rounded"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />
        <input
          type="date"
          className="p-2 border rounded"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Notes (optional)"
          className="p-2 border rounded"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Session
        </button>
      </form>

      {/* Upcoming Sessions */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Upcoming Study Sessions</h2>
        {sessions.length === 0 ? (
          <p className="text-gray-600">No sessions yet. Add your study plan!</p>
        ) : (
          <ul className="space-y-2">
            {sessions
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .map((session) => (
                <li
                  key={session.id}
                  className="p-4 bg-white rounded shadow flex justify-between items-center"
                >
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-lg font-semibold">{session.subject}</h3>
                      <span className="text-sm text-gray-500">{session.date}</span>
                    </div>
                    {session.notes && (
                      <p className="text-gray-700">{session.notes}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteSession(session.id)}
                    className="ml-4 px-3 py-1 rounded bg-red-600 text-white text-sm hover:bg-red-700"
                  >
                    Delete
                  </button>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default StudyPlanner;
