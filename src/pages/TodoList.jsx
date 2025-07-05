import React, { useEffect, useState } from "react";
import { db, auth, provider } from "../firebase";
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

import AddTodoForm from "../components/AddTodoForm";
import Footer from "../components/Footer";

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [category, setCategory] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [user, setUser] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  //  Auth check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  // Listen to todos for this user
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

  const addTodo = async (e) => {
    e.preventDefault();
    if (!input.trim() || !category) return;

    await addDoc(collection(db, "todos"), {
      text: input.trim(),
      completed: false,
      category,
      createdAt: serverTimestamp(),
      userId: user.uid,
      sharedWith: [],
    });
    setInput("");
    setCategory("");
  };

  const toggleComplete = async (todo) => {
    const ref = doc(db, "todos", todo.id);
    await updateDoc(ref, { completed: !todo.completed });
  };

  const deleteTodo = async (id) => {
    await deleteDoc(doc(db, "todos", id));
  };

  const startEdit = (todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = async (todo) => {
    if (editText.trim()) {
      const ref = doc(db, "todos", todo.id);
      await updateDoc(ref, { text: editText.trim() });
      setEditingId(null);
      setEditText("");
    }
  };

  const login = () => signInWithPopup(auth, provider);
  const logout = () => signOut(auth);

  const filteredTodos = filterCategory === "All"
    ? todos
    : todos.filter(todo => todo.category === filterCategory);

  return (
    <div className="flex-1 p-4 ml-0 md:ml-64">
      <h1 className="text-2xl font-bold mb-4">To-Do List</h1>

      {user ? (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p>Welcome, <strong>{user.displayName}</strong></p>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>

          <AddTodoForm
            input={input}
            setInput={setInput}
            category={category}
            setCategory={setCategory}
            addTodo={addTodo}
          />

          <div className="mt-4">
            <label><strong>Filter by:</strong></label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="ml-2 p-2 border rounded"
            >
              <option>All</option>
              <option>Work</option>
              <option>Personal</option>
              <option>School</option>
            </select>
          </div>

          <ul className="mt-6 space-y-4">
            {filteredTodos.map(todo => (
              <li
                key={todo.id}
                className="bg-gray-100 p-4 rounded shadow flex flex-wrap justify-between items-center"
              >
                <div className="flex items-center flex-1">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleComplete(todo)}
                    className="mr-2"
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
                      className="flex-1 border px-2 py-1 rounded"
                    />
                  ) : (
                    <span
                      onClick={() => startEdit(todo)}
                      className={`cursor-pointer ${todo.completed ? "line-through text-gray-500" : ""}`}
                    >
                      {todo.text} ({todo.category})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-2 md:mt-0">
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                  <CollaboratorInput todoId={todo.id} />
                </div>

                {todo.sharedWith?.length > 0 && (
                  <p className="text-xs text-gray-600 mt-1 w-full">
                    Shared with: {todo.sharedWith.join(", ")}
                  </p>
                )}
              </li>
            ))}
          </ul>

          <Footer />
        </>
      ) : (
        <button
          onClick={login}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Login with Google
        </button>
      )}
    </div>
  );
};

function CollaboratorInput({ todoId }) {
  const [email, setEmail] = useState("");

  const inviteCollaborator = async () => {
    if (!email.trim()) return;

    try {
      const ref = doc(db, "todos", todoId);
      await updateDoc(ref, {
        sharedWith: arrayUnion(email.trim())
      });
      alert("Collaborator added!");
      setEmail("");
    } catch (err) {
      console.error(err);
      alert("Error adding collaborator");
    }
  };

  return (
    <div className="flex items-center">
      <input
        type="email"
        placeholder="Invite by email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-1 rounded text-sm"
      />
      <button
        onClick={inviteCollaborator}
        className="ml-1 bg-blue-500 text-white px-2 py-1 rounded text-xs"
      >
        Invite
      </button>
    </div>
  );
}

export default TodoList;

// import React, { useEffect, useState } from "react";
// // import { db, auth, provider } from "./firebase";
// // import { collection, addDoc, deleteDoc, onSnapshot, updateDoc, doc, serverTimestamp, arrayUnion } from "firebase/firestore";
// // import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
// // import AnalyticsDashboard from "./components/AnalyticsDashboard";
// // import AddTodoForm from "./components/AddTodoForm";
// // import Footer from "./components/Footer";

// const TodoList = () => {
//      const [todos, setTodos] = useState([]);
//   const [input, setInput] = useState("");
//   const [category, setCategory] = useState("");
//   const [filterCategory, setFilterCategory] = useState("All");
//   const [user, setUser] = useState(null);
//   const [editingId, setEditingId] = useState(null);
//   const [editText, setEditText] = useState("");

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       setUser(currentUser);
//     });
//     return () => unsubscribe();
//   }, []);

//   useEffect(() => {
//     if (!user) return;
//     const unsubscribe = onSnapshot(collection(db, "todos"), (snapshot) => {
//       const userTodos = snapshot.docs
//         .map(doc => ({ id: doc.id, ...doc.data() }))
//         .filter(todo =>
//           todo.userId === user.uid || (todo.sharedWith && todo.sharedWith.includes(user.email))
//         );
//       setTodos(userTodos);
//     });
//     return () => unsubscribe();
//   }, [user]);

//   const addTodo = async (e) => {
//     e.preventDefault();
//     if (input.trim() && category.trim()) {
//       await addDoc(collection(db, "todos"), {
//         text: input,
//         completed: false,
//         category,
//         createdAt: serverTimestamp(),
//         userId: user.uid,
//         sharedWith: [],
//       });
//       setInput("");
//       setCategory("");
//     }
//   };

//   const deleteTodo = async (id) => {
//     await deleteDoc(doc(db, "todos", id));
//   };

//   const toggleComplete = async (todo) => {
//     const todoRef = doc(db, "todos", todo.id);
//     await updateDoc(todoRef, { completed: !todo.completed });
//   };

//   const startEdit = (todo) => {
//     setEditingId(todo.id);
//     setEditText(todo.text);
//   };

//   const saveEdit = async (todo) => {
//     if (editText.trim()) {
//       const todoRef = doc(db, "todos", todo.id);
//       await updateDoc(todoRef, { text: editText });
//     }
//     setEditingId(null);
//     setEditText("");
//   };

//   const login = () => signInWithPopup(auth, provider);
//   const logout = () => signOut(auth);

//   const filteredTodos = filterCategory === "All" ? todos : todos.filter(todo => todo.category === filterCategory);

//   return (
//     <div style={{ display: "flex", minHeight: "100vh", flexDirection: "row", flexWrap: "wrap" }}>
//       {/* Sidebar
//       <aside style={{
//         flexBasis: "200px",
//         background: "#2c3e50",
//         color: "#fff",
//         padding: "2rem",
//         minHeight: "100vh"
//       }}>
//         <h2 style={{ marginBottom: "2rem" }}>Menu</h2>
//         <nav>
//           <ul style={{ listStyle: "none", padding: 0 }}>
//             <li style={{ marginBottom: "1rem" }}>Dashboard</li>
//             <li style={{ marginBottom: "1rem" }}>Tasks</li>
//             <li>Settings</li>
//           </ul>
//         </nav>
//       </aside> */}

//       {/* Main Content */}
//       <main style={{
//         flex: 1,
//         padding: "2rem",
//         maxWidth: "800px",
//         margin: "0 auto",
//         width: "100%",
//         boxSizing: "border-box",
//         fontFamily: "system-ui, sans-serif",
//       }}>
//         <h1 style={{ color: "#2c3e50" }}>To-Do App</h1>

//         {user ? (
//           <>
//             <p>Welcome, <strong>{user.displayName}</strong></p>
//             <button onClick={logout} style={{
//               marginBottom: "1rem",
//               backgroundColor: "#c0392b",
//               color: "#fff",
//               padding: "0.6rem 1.2rem",
//               border: "none",
//               borderRadius: "5px",
//               cursor: "pointer"
//             }}>Logout</button>

//             <AnalyticsDashboard todos={todos} />

//             <AddTodoForm
//               input={input}
//               setInput={setInput}
//               category={category}
//               setCategory={setCategory}
//               addTodo={addTodo}
//             />

//             <div style={{ marginTop: "1.5rem" }}>
//               <label><strong>Filter by category:</strong></label>
//               <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ padding: "0.5rem", marginLeft: "0.5rem" }}>
//                 <option value="All">All</option>
//                 <option value="Work">Work</option>
//                 <option value="Personal">Personal</option>
//                 <option value="School">School</option>
//               </select>
//             </div>

//             <ul style={{ listStyle: "none", padding: 0, marginTop: "1rem" }}>
//               {filteredTodos.map((todo) => (
//                 <li key={todo.id} style={{
//                   background: "#f9f9f9",
//                   padding: "1rem",
//                   borderRadius: "8px",
//                   marginBottom: "1rem",
//                   display: "flex",
//                   flexWrap: "wrap",
//                   alignItems: "center",
//                   justifyContent: "space-between",
//                   boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
//                 }}>
//                   <input type="checkbox" checked={todo.completed} onChange={() => toggleComplete(todo)} />

//                   {editingId === todo.id ? (
//                     <input
//                       value={editText}
//                       onChange={(e) => setEditText(e.target.value)}
//                       onBlur={() => saveEdit(todo)}
//                       onKeyDown={(e) => {
//                         if (e.key === "Enter") saveEdit(todo);
//                         if (e.key === "Escape") setEditingId(null);
//                       }}
//                       autoFocus
//                       style={{
//                         marginLeft: "0.5rem",
//                         padding: "0.4rem",
//                         flex: "1 1 auto"
//                       }}
//                     />
//                   ) : (
//                     <span onClick={() => startEdit(todo)} style={{
//                       marginLeft: "0.5rem",
//                       cursor: "pointer",
//                       textDecoration: todo.completed ? "line-through" : "none"
//                     }}>
//                       {todo.text} ({todo.category})
//                     </span>
//                   )}

//                   <button onClick={() => deleteTodo(todo.id)} style={{
//                     marginLeft: "0.5rem",
//                     backgroundColor: "#e74c3c",
//                     color: "#fff",
//                     border: "none",
//                     padding: "0.4rem 0.8rem",
//                     borderRadius: "4px",
//                     cursor: "pointer"
//                   }}>Delete</button>

//                   <CollaboratorInput todoId={todo.id} />

//                   {todo.sharedWith?.length > 0 && (
//                     <div style={{ fontSize: "0.8rem", color: "#555", marginTop: "0.5rem" }}>
//                       Shared with: {todo.sharedWith.join(", ")}
//                     </div>
//                   )}
//                 </li>
//               ))}
//             </ul>

//             <Footer />
//           </>
//         ) : (
//           <button onClick={login} style={{
//             backgroundColor: "#4285F4",
//             color: "#fff",
//             padding: "0.7rem 1.4rem",
//             border: "none",
//             borderRadius: "5px",
//             fontSize: "1rem",
//             cursor: "pointer"
//           }}>
//             Login with Google
//           </button>
//         )}
//       </main>
//     </div>
//   )
// }


// function CollaboratorInput({ todoId }) {
//   const [email, setEmail] = useState("");

//   const handleInvite = async () => {
//     if (!email) return;
//     try {
//       const todoRef = doc(db, "todos", todoId);
//       await updateDoc(todoRef, { sharedWith: arrayUnion(email) });
//       alert("Collaborator invited!");
//       setEmail("");
//     } catch (err) {
//       console.error(err);
//       alert("Failed to add collaborator.");
//     }
//   };

//   return (
//     <div style={{ marginTop: "0.5rem" }}>
//       <input
//         type="email"
//         placeholder="Invite by email"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//         style={{
//           padding: "0.4rem",
//           border: "1px solid #ccc",
//           borderRadius: "4px",
//           fontSize: "0.9rem",
//           marginRight: "0.5rem"
//         }}
//       />
//       <button onClick={handleInvite} style={{
//         padding: "0.4rem 0.8rem",
//         backgroundColor: "#3498db",
//         color: "#fff",
//         border: "none",
//         borderRadius: "4px",
//         fontSize: "0.9rem",
//         cursor: "pointer"
//       }}>Invite</button>
//     </div>
//   );
// }

// export default TodoList



