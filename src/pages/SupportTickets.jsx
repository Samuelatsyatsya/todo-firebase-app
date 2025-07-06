// src/pages/SupportTickets.jsx
import React, { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  doc,
  deleteDoc
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../hooks/useAuth";

const SupportTickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "supportTickets"),
      where("userId", "==", user.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const ticketsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTickets(ticketsData);
    });

    return () => unsub();
  }, [user]);

  const submitTicket = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim() || !user) return;

    await addDoc(collection(db, "supportTickets"), {
      title,
      message,
      status: 'Open',
      createdAt: new Date().toISOString().split('T')[0],
      userId: user.uid
    });

    setTitle('');
    setMessage('');
  };

  const handleDeleteTicket = async (id) => {
    await deleteDoc(doc(db, "supportTickets", id));
  };

  return (
    <div className="flex-1 p-4 ml-0 md:ml-64">
      <h1 className="text-2xl font-bold mb-4">Support Tickets</h1>

      {/* Submit Ticket */}
      <form onSubmit={submitTicket} className="mb-8 space-y-4">
        <input
          type="text"
          placeholder="Ticket Title"
          className="w-full p-3 border rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Describe your issue"
          className="w-full p-3 border rounded h-32"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        ></textarea>
        <button
          type="submit"
          className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700"
        >
          Submit Ticket
        </button>
      </form>

      {/* Ticket List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Your Tickets</h2>
        {tickets.length === 0 ? (
          <p className="text-gray-600">No tickets yet. Need help? Submit one above!</p>
        ) : (
          <ul className="space-y-4">
            {tickets.map((ticket) => (
              <li key={ticket.id} className="p-4 bg-white rounded shadow">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">{ticket.title}</h3>
                  <span className="text-xs text-gray-500">{ticket.createdAt}</span>
                </div>
                <p className="mb-2 text-gray-700">{ticket.message}</p>
                <span
                  className={`inline-block px-3 py-1 text-xs rounded-full ${
                    ticket.status === 'Open'
                      ? 'bg-green-200 text-green-800'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {ticket.status}
                </span>
                <button
                  onClick={() => handleDeleteTicket(ticket.id)}
                  className="ml-4 px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
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

export default SupportTickets;
