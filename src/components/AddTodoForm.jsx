// src/components/AddTodoForm.js
import React from "react";

export default function AddTodoForm({ input, setInput, category, setCategory, addTodo }) {
  return (
    <form
      onSubmit={addTodo}
      style={{
        marginTop: "2rem",
        display: "flex",
        gap: "0.5rem",
        flexWrap: "wrap",
      }}
    >
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Add a task"
        required
        style={{ flex: 1, padding: "0.5rem" }}
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        required
        style={{ padding: "0.5rem" }}
      >
        <option value="#">Select option</option>
        <option value="Work">Work</option>
        <option value="Personal">Personal</option>
        <option value="School">School</option>
      </select>
      <button
        type="submit"
        style={{
          backgroundColor: "#27ae60",
          color: "white",
          padding: "0.5rem 1rem",
          border: "none",
          borderRadius: "5px",
        }}
      >
        Add
      </button>
    </form>
  );
}
