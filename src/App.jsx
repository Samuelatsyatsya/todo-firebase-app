import React, { useEffect, useState } from "react";
import { db, auth, provider } from "./firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  onSnapshot,
  updateDoc,
  doc
} from "firebase/firestore";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
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
        .filter(todo => todo.uid === user.uid);
      setTodos(userTodos);
    });

    return () => unsubscribe();
  }, [user]);

  // Add task
  const addTodo = async (e) => {
    e.preventDefault();
    if (input.trim()) {
      await addDoc(collection(db, "todos"), {
        text: input,
        completed: false,
        uid: user.uid
      });
      setInput("");
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
            />
            <button type="submit">Add</button>
          </form>

          <ul style={{ listStyle: "none", padding: 0, marginTop: "1rem" }}>
            {todos.map((todo) => (
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
                    {todo.text}
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

          {/* Footer */}
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
