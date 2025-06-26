import React, { useEffect, useState } from "react";
import { db, auth, provider } from "./firebase";
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import {
  collection,
  addDoc,
  deleteDoc,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
  arrayUnion
} from "firebase/firestore";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [category, setCategory] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [user, setUser] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(collection(db, "todos"), (snapshot) => {
      const userTodos = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(todo =>
          todo.userId === user.uid ||
          (todo.sharedWith && todo.sharedWith.includes(user.email))
        );
      setTodos(userTodos);
    });
    return () => unsubscribe();
  }, [user]);

  const addTodo = async (e) => {
    e.preventDefault();
    if (input.trim() && category.trim()) {
      await addDoc(collection(db, "todos"), {
        text: input,
        completed: false,
        category,
        createdAt: serverTimestamp(),
        userId: user.uid,
        sharedWith: [],
      });
      setInput("");
      setCategory("");
    }
  };

  const deleteTodo = async (id) => {
    await deleteDoc(doc(db, "todos", id));
  };

  const toggleComplete = async (todo) => {
    const todoRef = doc(db, "todos", todo.id);
    await updateDoc(todoRef, {
      completed: !todo.completed
    });
  };

  const startEdit = (todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = async (todo) => {
    if (editText.trim()) {
      const todoRef = doc(db, "todos", todo.id);
      await updateDoc(todoRef, { text: editText });
    }
    setEditingId(null);
    setEditText("");
  };

  const login = () => signInWithPopup(auth, provider);
  const logout = () => signOut(auth);

  const filteredTodos = filterCategory === "All"
    ? todos
    : todos.filter(todo => todo.category === filterCategory);

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ color: "#2c3e50" }}>📋 My To-Do App</h1>

      {user ? (
        <>
          <p>Welcome, <strong>{user.displayName}</strong></p>
          <button onClick={logout} style={{ marginBottom: "1rem", backgroundColor: "#c0392b", color: "white", padding: "0.5rem 1rem", border: "none", borderRadius: "5px" }}>Logout</button>

          <AnalyticsDashboard todos={todos} />

          <form onSubmit={addTodo} style={{ marginTop: "2rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Add a task"
              required
              style={{ flex: 1, padding: "0.5rem" }}
            />
            <select value={category} onChange={(e) => setCategory(e.target.value)} required style={{ padding: "0.5rem" }}>
              <option value="#">Select option</option>
              <option value="Work">Work</option>
              <option value="Personal">Personal</option>
              <option value="School">School</option>
            </select>
            <button type="submit" style={{ backgroundColor: "#27ae60", color: "white", padding: "0.5rem 1rem", border: "none", borderRadius: "5px" }}>Add</button>
          </form>

          <div style={{ marginTop: "1.5rem" }}>
            <label><strong>Filter by category:</strong> </label>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ padding: "0.4rem" }}>
              <option value="All">All</option>
              <option value="Work">Work</option>
              <option value="Personal">Personal</option>
              <option value="School">School</option>
            </select>
          </div>

          <ul style={{ listStyle: "none", padding: 0, marginTop: "1rem" }}>
            {filteredTodos.map((todo) => (
              <li key={todo.id} style={{ background: "#ecf0f1", padding: "1rem", borderRadius: "8px", marginBottom: "1rem", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleComplete(todo)}
                />

                {editingId === todo.id ? (
                  <input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onBlur={() => saveEdit(todo)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit(todo);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    autoFocus
                    style={{ marginLeft: "0.5rem", padding: "0.4rem", width: "60%" }}
                  />
                ) : (
                  <span
                    onClick={() => startEdit(todo)}
                    style={{ marginLeft: "0.5rem", textDecoration: todo.completed ? "line-through" : "none", cursor: "pointer" }}
                  >
                    {todo.text} ({todo.category})
                  </span>
                )}

                <button
                  onClick={() => deleteTodo(todo.id)}
                  style={{ marginLeft: "0.5rem", backgroundColor: "#e74c3c", color: "white", border: "none", padding: "0.3rem 0.7rem", borderRadius: "5px", cursor: "pointer" }}
                >
                  Delete
                </button>

                <CollaboratorInput todoId={todo.id} />

                {todo.sharedWith?.length > 0 && (
                  <div style={{ fontSize: "0.8rem", color: "#555", marginTop: "0.3rem" }}>
                    Shared with: {todo.sharedWith.join(", ")}
                  </div>
                )}
              </li>
            ))}
          </ul>

          <footer style={{ marginTop: "2rem", color: "#666", fontSize: "0.9rem" }}>
            &copy; {new Date().getFullYear()} SAM - K To-Do App. All rights reserved.
          </footer>
        </>
      ) : (
        <button onClick={login} style={{ backgroundColor: "#4285F4", color: "white", padding: "0.6rem 1.2rem", border: "none", borderRadius: "5px", fontSize: "1rem" }}>Login with Google</button>
      )}
    </div>
  );
}

function CollaboratorInput({ todoId }) {
  const [email, setEmail] = useState("");

  const handleInvite = async () => {
    if (!email) return;
    try {
      const todoRef = doc(db, "todos", todoId);
      await updateDoc(todoRef, {
        sharedWith: arrayUnion(email)
      });
      alert("Collaborator invited!");
      setEmail("");
    } catch (err) {
      console.error("Error adding collaborator:", err);
      alert("Failed to add collaborator.");
    }
  };

  return (
    <div style={{ marginTop: "0.5rem" }}>
      <input
        type="email"
        placeholder="Invite by email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ padding: "0.3rem", fontSize: "0.9rem" }}
      />
      <button
        onClick={handleInvite}
        style={{ marginLeft: "0.3rem", fontSize: "0.9rem", padding: "0.3rem 0.6rem", backgroundColor: "#3498db", color: "white", border: "none", borderRadius: "5px" }}
      >
        Invite
      </button>
    </div>
  );
}

export default App;
