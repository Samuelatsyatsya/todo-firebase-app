import { collection, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { auth, db } from "./firebase";
// import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
// import AnalyticsDashboard from "./components/AnalyticsDashboard";
// import AddTodoForm from "./components/AddTodoForm";
// import Footer from "./components/Footer";
import {
  onAuthStateChanged
} from "firebase/auth";
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import ProtectedRoute from "./components/ProtectedRoutes";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import EventPlanner from "./pages/EventPlanner";
import FinanceTracker from "./pages/FinanceTracker";
import HealthTracker from "./pages/HealthTracker";
import LoginPage from "./pages/LoginPage";
import StudyPlanner from "./pages/StudyPlanner";
import SupportTickets from "./pages/SupportTickets";
import TodoList from "./pages/TodoList";

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
        <main className="flex-1 p-4 pt-10">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<ProtectedRoute><Dashboard todos={todos} /></ProtectedRoute>} />
            <Route path="/todos" element={<ProtectedRoute><TodoList /></ProtectedRoute>} />
            <Route path="/finance" element={<ProtectedRoute><FinanceTracker /></ProtectedRoute>} />
            <Route path="/events" element={<ProtectedRoute><EventPlanner /></ProtectedRoute>} />
            <Route path="/health" element={<ProtectedRoute><HealthTracker /> </ProtectedRoute>} />
            <Route path="/study" element={<ProtectedRoute><StudyPlanner /></ProtectedRoute>} />
            <Route path="/support" element={<ProtectedRoute><SupportTickets /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}


export default App;
