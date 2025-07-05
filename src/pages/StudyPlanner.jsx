import React, { useState } from 'react';

const StudyPlanner = () => {
  const [sessions, setSessions] = useState([]);
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');

  const handleAddSession = (e) => {
    e.preventDefault();
    if (!subject || !date) return;

    const newSession = {
      id: Date.now(),
      subject,
      date,
      notes,
    };

    setSessions([newSession, ...sessions]);
    setSubject('');
    setDate('');
    setNotes('');
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
                  className="p-4 bg-white rounded shadow"
                >
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-lg font-semibold">{session.subject}</h3>
                    <span className="text-sm text-gray-500">{session.date}</span>
                  </div>
                  {session.notes && (
                    <p className="text-gray-700">{session.notes}</p>
                  )}
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default StudyPlanner;

