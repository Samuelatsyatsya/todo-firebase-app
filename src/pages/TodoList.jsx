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
import { Timestamp } from "firebase/firestore";

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

  const now = Timestamp.now();
  const remindAt = Timestamp.fromMillis(now.toMillis() + 2 * 60 * 1000); // 2 min later

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
      remindAt: remindAt,
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
// import { db, auth, provider } from "../firebase";
// import {
//   collection,
//   addDoc,
//   deleteDoc,
//   onSnapshot,
//   updateDoc,
//   doc,
//   serverTimestamp,
//   arrayUnion
// } from "firebase/firestore";
// import {
//   signInWithPopup,
//   signOut,
//   onAuthStateChanged
// } from "firebase/auth";
// import { Timestamp } from "firebase/firestore";

// import AddTodoForm from "../components/AddTodoForm";
// import Footer from "../components/Footer";

// const TodoList = () => {
//   const [todos, setTodos] = useState([]);
//   const [input, setInput] = useState("");
//   const [category, setCategory] = useState("");
//   const [filterCategory, setFilterCategory] = useState("All");
//   const [user, setUser] = useState(null);
//   const [editingId, setEditingId] = useState(null);
//   const [editText, setEditText] = useState("");

//   const now = Timestamp.now();
//   const remindAt = Timestamp.fromMillis(now.toMillis() + 2 * 60 * 1000);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       setUser(currentUser);
//     });
//     return unsubscribe;
//   }, []);

//   useEffect(() => {
//     if (!user) return;
//     const unsubscribe = onSnapshot(collection(db, "todos"), (snapshot) => {
//       const userTodos = snapshot.docs
//         .map(doc => ({ id: doc.id, ...doc.data() }))
//         .filter(todo =>
//           todo.userId === user.uid || (todo.sharedWith?.includes(user.email))
//         );
//       setTodos(userTodos);
//     });
//     return unsubscribe;
//   }, [user]);

//   const addTodo = async (e) => {
//     e.preventDefault();
//     if (!input.trim() || !category) return;

//     await addDoc(collection(db, "todos"), {
//       text: input.trim(),
//       completed: false,
//       category,
//       createdAt: serverTimestamp(),
//       remindAt: remindAt,
//       userId: user.uid,
//       sharedWith: [],
//     });
//     setInput("");
//     setCategory("");
//   };

//   const toggleComplete = async (todo) => {
//     const ref = doc(db, "todos", todo.id);
//     await updateDoc(ref, { completed: !todo.completed });
//   };

//   const deleteTodo = async (id) => {
//     await deleteDoc(doc(db, "todos", id));
//   };

//   const startEdit = (todo) => {
//     setEditingId(todo.id);
//     setEditText(todo.text);
//   };

//   const saveEdit = async (todo) => {
//     if (editText.trim()) {
//       const ref = doc(db, "todos", todo.id);
//       await updateDoc(ref, { text: editText.trim() });
//       setEditingId(null);
//       setEditText("");
//     }
//   };

//   const login = () => signInWithPopup(auth, provider);
//   const logout = () => signOut(auth);

//   const filteredTodos = filterCategory === "All"
//     ? todos
//     : todos.filter(todo => todo.category === filterCategory);

//   return (
// // {/* <div className="flex-1 p-4 ml-0 md:ml-64">
// // //       <h1 className="text-2xl font-bold mb-4">To-Do List</h1> */}


//     <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 p-6 flex flex-col md:ml-64">
//       <header className="max-w-4xl mx-auto w-full text-center mb-6">
//         <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 drop-shadow-lg">
//         To-Do List 
//         </h1>
//         <p className="text-indigo-200">Organize. Share. Achieve.</p>
//       </header>

//       <main className="max-w-4xl w-full mx-auto bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-6">
//         {user ? (
//           <>
//             <div className="flex justify-between items-center mb-6">
//               <div className="text-white">
//                 Welcome, <span className="font-bold">{user.displayName}</span>
//               </div>
//               <button
//                 onClick={logout}
//                 className="bg-red-500 text-white px-4 py-2 rounded-xl hover:scale-105 transition"
//               >
//                 Logout
//               </button>
//             </div>

//             <AddTodoForm
//               input={input}
//               setInput={setInput}
//               category={category}
//               setCategory={setCategory}
//               addTodo={addTodo}
//             />

//             <div className="my-4 flex items-center gap-2">
//               <label className="text-white font-semibold">Filter:</label>
//               <select
//                 value={filterCategory}
//                 onChange={(e) => setFilterCategory(e.target.value)}
//                 className="rounded px-3 py-1 bg-white/20 text-gray-700 backdrop-blur focus:outline-none"
//               >
//                 <option>All</option>
//                 <option>Work</option>
//                 <option>Personal</option>
//                 <option>School</option>
//               </select>
//             </div>

//             <ul className="space-y-4 mt-6">
//               {filteredTodos.map(todo => (
//                 <li
//                   key={todo.id}
//                   className="bg-white/20 backdrop-blur-lg rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow hover:shadow-xl transition"
//                 >
//                   <div className="flex items-center w-full md:w-auto">
//                     <input
//                       type="checkbox"
//                       checked={todo.completed}
//                       onChange={() => toggleComplete(todo)}
//                       className="accent-purple-500 w-5 h-5 mr-3"
//                     />

//                     {editingId === todo.id ? (
//                       <input
//                         value={editText}
//                         onChange={(e) => setEditText(e.target.value)}
//                         onBlur={() => saveEdit(todo)}
//                         onKeyDown={(e) => {
//                           if (e.key === "Enter") saveEdit(todo);
//                           if (e.key === "Escape") setEditingId(null);
//                         }}
//                         autoFocus
//                         className="flex-1 rounded bg-white/20 text-white px-2 py-1 outline-none"
//                       />
//                     ) : (
//                       <span
//                         onClick={() => startEdit(todo)}
//                         className={`cursor-pointer text-white ${todo.completed ? "line-through opacity-60" : ""}`}
//                       >
//                         {todo.text} <span className="italic text-xs">({todo.category})</span>
//                       </span>
//                     )}
//                   </div>

//                   <div className="flex flex-col md:flex-row items-start md:items-center gap-2 w-full md:w-auto">
//                     <button
//                       onClick={() => deleteTodo(todo.id)}
//                       className="bg-red-500  text-white px-3 py-1 rounded-md hover:scale-105 transition"
//                     >
//                       Delete
//                     </button>
//                     <CollaboratorInput todoId={todo.id} />
//                   </div>

//                   {todo.sharedWith?.length > 0 && (
//                     <p className="text-xs text-white/80 w-full">
//                       Shared with: {todo.sharedWith.join(", ")}
//                     </p>
//                   )}
//                 </li>
//               ))}
//             </ul>

//             <Footer />
//           </>
//         ) : (
//           <div className="flex flex-col items-center justify-center text-center">
//             <p className="text-white mb-4 text-xl">Login to manage your tasks</p>
//             <button
//               onClick={login}
//               className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full hover:scale-105 transition"
//             >
//               Login with Google
//             </button>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// };

// function CollaboratorInput({ todoId }) {
//   const [email, setEmail] = useState("");

//   const inviteCollaborator = async () => {
//     if (!email.trim()) return;

//     try {
//       const ref = doc(db, "todos", todoId);
//       await updateDoc(ref, {
//         sharedWith: arrayUnion(email.trim())
//       });
//       alert("Collaborator added!");
//       setEmail("");
//     } catch (err) {
//       console.error(err);
//       alert("Error adding collaborator");
//     }
//   };

//   return (
//     <div className="flex gap-2 items-center w-full md:w-auto">
//       <input
//         type="email"
//         placeholder="Invite by email"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//         className="rounded px-2 py-1 text-sm bg-white/20 text-white placeholder-white/80 backdrop-blur focus:outline-none"
//       />
//       <button
//         onClick={inviteCollaborator}
//         className="bg-blue-500 text-white px-3 py-1 rounded-md text-xs hover:scale-105 transition"
//       >
//         Invite
//       </button>
//     </div>
//   );
// }

// export default TodoList;
