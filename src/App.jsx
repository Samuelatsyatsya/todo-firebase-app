import React, { useEffect, useState } from "react";
import { db, auth, provider } from "./firebase";
import { collection, addDoc, deleteDoc, onSnapshot, updateDoc, doc, serverTimestamp, arrayUnion } from "firebase/firestore";
// import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
// import AnalyticsDashboard from "./components/AnalyticsDashboard";
// import AddTodoForm from "./components/AddTodoForm";
// import Footer from "./components/Footer";
import Dashboard from "./pages/Dashboard";
import FinanceTracker from "./pages/FinanceTracker";
import TodoList from "./pages/TodoList";
import EventPlanner from "./pages/EventPlanner";
import HealthTracker from "./pages/HealthTracker";
import StudyPlanner from "./pages/StudyPlanner";
import SupportTickets from "./pages/SupportTickets";
import Sidebar from "./components/Sidebar";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

function App() {
  const [user, setUser] = useState(null);
  const [todos, setTodos] = useState([]);

  // useEffect( () => {
  //    setTodos([
  //     { id: 1, text: "Task A", category: "Work" },
  //     { id: 2, text: "Task B", category: "School" }
  //   ]);
  // }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);
  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(collection(db, "todos"), (snapshot) => {
      const userTodos = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(todo =>
          todo.userId === user.uid || (todo.sharedWith?.includes(user.email))
        );
      setTodos(userTodos);
    });
    return unsubscribe;
  }, [user]);

  return (
    <Router>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4">
          <Routes>
            <Route path="/" element={<Dashboard todos={todos} />} />
            <Route path="/todos" element={<TodoList />} />
            <Route path="/finance" element={<FinanceTracker />} />
            <Route path="/events" element={<EventPlanner />} />
            <Route path="/health" element={<HealthTracker />} />
            <Route path="/study" element={<StudyPlanner />} />
            <Route path="/support" element={<SupportTickets />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}


export default App;
