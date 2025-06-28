import React from 'react'

const Footer = () => {
    return (
        <footer style={{ marginTop: "2rem", color: "#666", fontSize: "0.9rem" }}>
            &copy; {new Date().getFullYear()} SAM - K To-Do App. All rights reserved.
        </footer>
    )
}

export default Footer