import React, { useEffect, useState } from "react";
import { db, auth, provider } from "./firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp
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

  // Monitor login state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Load user's todos
  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(collection(db, "todos"), (snapshot) => {
      const userTodos = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(todo => todo.userId === user.uid);
      setTodos(userTodos);
    });

    return () => unsubscribe();
  }, [user]);

  // Add task
  const addTodo = async (e) => {
    e.preventDefault();
    if (input.trim() && category.trim()) {
      await addDoc(collection(db, "todos"), {
        text: input,
        completed: false,
        category,
        createdAt: serverTimestamp(),
        userId: user.uid,
      });
      setInput("");
      setCategory("");
    }
  };

  // Delete task
  const deleteTodo = async (id) => {
    await deleteDoc(doc(db, "todos", id));
  };

  // Toggle completion
  const toggleComplete = async (todo) => {
    const todoRef = doc(db, "todos", todo.id);
    await updateDoc(todoRef, {
      completed: !todo.completed
    });
  };

  // Start editing
  const startEdit = (todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  // Save edited task
  const saveEdit = async (todo) => {
    if (editText.trim()) {
      const todoRef = doc(db, "todos", todo.id);
      await updateDoc(todoRef, { text: editText });
    }
    setEditingId(null);
    setEditText("");
  };

  // Google login/logout
  const login = () => signInWithPopup(auth, provider);
  const logout = () => signOut(auth);

  // Filtered tasks
  const filteredTodos = filterCategory === "All"
    ? todos
    : todos.filter(todo => todo.category === filterCategory);

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1>To-Do App</h1>

      {user ? (
        <>
          <p>Welcome, {user.displayName}</p>
          <button onClick={logout}>Logout</button>

          <form onSubmit={addTodo} style={{ marginTop: "1rem" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Add a task"
              required
            />
            <select value={category} onChange={(e) => setCategory(e.target.value)} required>
            <option value="Work">Select option</option>
              <option value="Work">Work</option>
              <option value="Personal">Personal</option>
              <option value="School">School</option>
            </select>
            <button type="submit">Add</button>
          </form>

          <div style={{ marginTop: "1rem" }}>
            <label>Filter by category: </label>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="All">All</option>
              <option value="Work">Work</option>
              <option value="Personal">Personal</option>
              <option value="School">School</option>
            </select>
          </div>

          <ul style={{ listStyle: "none", padding: 0, marginTop: "1rem" }}>
            {filteredTodos.map((todo) => (
              <li key={todo.id} style={{ marginBottom: "0.5rem" }}>
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
                    style={{ marginLeft: "0.5rem" }}
                  />
                ) : (
                  <span
                    onClick={() => startEdit(todo)}
                    style={{
                      marginLeft: "0.5rem",
                      textDecoration: todo.completed ? "line-through" : "none",
                      cursor: "pointer"
                    }}
                  >
                    {todo.text} ({todo.category})
                  </span>
                )}

                <button
                  onClick={() => deleteTodo(todo.id)}
                  style={{ marginLeft: "0.5rem", color: "white", backgroundColor: "red", border: "none", padding: "0 6px", borderRadius: "3px", cursor: "pointer" }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>

          <footer style={{ marginTop: "2rem", color: "#666", fontSize: "0.9rem" }}>
            &copy; {new Date().getFullYear()} SAM - K To-Do App. All rights reserved.
          </footer>
        </>
      ) : (
        <button onClick={login}>Login with Google</button>
      )}
    </div>
  );
}

export default App;
