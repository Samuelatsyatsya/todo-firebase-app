// src/pages/EventPlanner.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // make sure your firebase config exports 'db'
import {
  collection,
  addDoc,
  query,
  orderBy,
  where,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth'; // OR however you get your current user

const EventPlanner = () => {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const { user } = useAuth(); // however you handle auth

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'events'),
      where('userId', '==', user.uid),
      orderBy('date', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEvents(eventsData);
    });

    return unsubscribe;
  }, [user]);

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!title || !date) return;

    await addDoc(collection(db, 'events'), {
      userId: user.uid,
      title,
      date,
      description,
      createdAt: new Date()
    });

    setTitle('');
    setDate('');
    setDescription('');
  };

  const handleDeleteEvent = async (id) => {
    await deleteDoc(doc(db, 'events', id));
  };

  const startEditing = (event) => {
    setEditingId(event.id);
    setEditTitle(event.title);
    setEditDate(event.date);
    setEditDescription(event.description || '');
  };

  const handleUpdateEvent = async (id) => {
    const eventRef = doc(db, 'events', id);
    await updateDoc(eventRef, {
      title: editTitle,
      date: editDate,
      description: editDescription
    });
    setEditingId(null);
  };

  return (
    <div className="flex-1 p-4 ml-0 md:ml-64">
      <h1 className="text-2xl font-bold mb-4">Event Planner</h1>

      {/* Add Event */}
      <form onSubmit={handleAddEvent} className="mb-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Event Title"
          className="p-2 border rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
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
          placeholder="Description"
          className="p-2 border rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Event
        </button>
      </form>

      {/* Event List */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Upcoming Events</h2>
        {events.length === 0 ? (
          <p className="text-gray-600">No events yet. Start planning!</p>
        ) : (
          <ul className="space-y-2">
            {events.map(event => (
              <li key={event.id} className="p-4 bg-white rounded shadow">
                {editingId === event.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                    <input
                      type="text"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                    <button
                      onClick={() => handleUpdateEvent(event.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded mr-2"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-gray-500 text-white px-3 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-lg font-semibold">{event.title}</h3>
                      <span className="text-sm text-gray-500">{event.date}</span>
                    </div>
                    {event.description && (
                      <p className="text-gray-700 mb-2">{event.description}</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditing(event)}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default EventPlanner;
