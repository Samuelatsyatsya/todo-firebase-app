import React from "react";

const AddTodoForm = ({ input, setInput, category, setCategory, addTodo }) => (
  <form
    onSubmit={addTodo}
    style={{
      marginTop: "2rem",
      display: "flex",
      flexWrap: "wrap",
      gap: "0.5rem"
    }}
  >
    <input
      value={input}
      onChange={(e) => setInput(e.target.value)}
      placeholder="Add a New task"
      required
      style={{
        flex: "1 1 200px",
        padding: "0.7rem",
        border: "1px solid #ccc",
        borderRadius: "4px"
      }}
    />
    <select
      value={category}
      onChange={(e) => setCategory(e.target.value)}
      required
      style={{
        padding: "0.7rem",
        border: "1px solid #ccc",
        borderRadius: "4px"
      }}
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
        color: "#fff",
        padding: "0.7rem 1.2rem",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer"
      }}
    >
      Add
    </button>
  </form>
);

export default AddTodoForm;
