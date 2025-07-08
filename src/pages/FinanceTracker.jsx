// src/pages/FinanceTracker.jsx
import React, { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const FinanceTracker = () => {
  const [transactions, setTransactions] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('income');
  const [user, setUser] = useState(null);

  // Listen for auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Listen for user transactions in Firestore
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'finance'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTransactions(items);
    });

    return () => unsubscribe();
  }, [user]);

  // Add new transaction
  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!description || !amount || !user) return;

    await addDoc(collection(db, 'finance'), {
      description,
      amount: parseFloat(amount),
      type,
      userId: user.uid,
      createdAt: new Date()
    });

    setDescription('');
    setAmount('');
    setType('income');
  };

  // Delete transaction
  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'finance', id));
  };

  // Calculate totals
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const balance = income - expenses;

  return (
    <div className="flex-1 p-4 ml-0 md:ml-64">
      <h1 className="text-2xl font-bold mb-4">Personal Finance Tracker</h1>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-green-100 rounded">
          <h2 className="text-lg font-semibold">Income</h2>
          <p className="text-2xl font-bold text-green-700">${income.toFixed(2)}</p>
        </div>
        <div className="p-4 bg-red-100 rounded">
          <h2 className="text-lg font-semibold">Expenses</h2>
          <p className="text-2xl font-bold text-red-700">${expenses.toFixed(2)}</p>
        </div>
        <div className="p-4 bg-blue-100 rounded">
          <h2 className="text-lg font-semibold">Balance</h2>
          <p className="text-2xl font-bold text-blue-700">${balance.toFixed(2)}</p>
        </div>
      </div>

      {/* Add Transaction */}
      <form onSubmit={handleAddTransaction} className="mb-6 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Description"
          className="flex-1 p-2 border rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Amount"
          className="flex-1 p-2 border rounded"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <select
          className="p-2 border rounded"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add
        </button>
      </form>

      {/* Transaction List */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Transactions</h2>
        <ul className="space-y-2">
          {transactions.map(t => (
            <li
              key={t.id}
              className={`p-3 rounded shadow flex justify-between items-center ${
                t.type === 'income' ? 'bg-green-50' : 'bg-red-50'
              }`}
            >
              <span>{t.description}</span>
              <span className="font-mono">
                {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
              </span>
              <button
                onClick={() => handleDelete(t.id)}
                className="text-red-500 ml-4 hover:underline"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FinanceTracker;
