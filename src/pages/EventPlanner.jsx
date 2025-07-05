// src/pages/EventPlanner.jsx
import React, { useState } from 'react';

const EventPlanner = () => {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!title || !date) return;

    const newEvent = {
      id: Date.now(),
      title,
      date,
      description,
    };

    setEvents([newEvent, ...events]);
    setTitle('');
    setDate('');
    setDescription('');
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

      {/* Upcoming Events */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Upcoming Events</h2>
        {events.length === 0 ? (
          <p className="text-gray-600">No events yet. Start planning!</p>
        ) : (
          <ul className="space-y-2">
            {events
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .map(event => (
                <li key={event.id} className="p-4 bg-white rounded shadow">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-lg font-semibold">{event.title}</h3>
                    <span className="text-sm text-gray-500">{event.date}</span>
                  </div>
                  {event.description && (
                    <p className="text-gray-700">{event.description}</p>
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
