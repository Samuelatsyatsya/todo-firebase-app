import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FiMenu, FiX, FiHome, FiCheckSquare } from 'react-icons/fi';
import { MdAttachMoney, MdEvent, MdHealthAndSafety, MdSupportAgent } from 'react-icons/md';
import { FaBook } from 'react-icons/fa';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const login = () => signInWithPopup(auth, provider);

  const navLinks = [
    { name: 'Dashboard', to: '/', icon: <FiHome size={20} /> },
    { name: 'To-Do List', to: '/todos', icon: <FiCheckSquare size={20} /> },
    { name: 'Finance Tracker', to: '/finance', icon: <MdAttachMoney size={20} /> },
    { name: 'Event Planner', to: '/events', icon: <MdEvent size={20} /> },
    { name: 'Health Tracker', to: '/health', icon: <MdHealthAndSafety size={20} /> },
    { name: 'Study Planner', to: '/study', icon: <FaBook size={20} /> },
    { name: 'Support Tickets', to: '/support', icon: <MdSupportAgent size={20} /> },
  ];

  return (
    <>
      {/* Hamburger - mobile only */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 text-2xl text-white bg-gray-800 rounded md:hidden focus:outline-none"
        aria-label="Toggle Sidebar"
      >
        {isOpen ? <FiX /> : <FiMenu />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-gray-800 text-white p-4
          transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 transition-transform duration-300 ease-in-out
          z-50 overflow-y-auto
        `}
      >
        <h2 className="text-2xl font-bold mb-6">MyLife Suite</h2>

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

          </>
        ) : (
          <button
            onClick={login}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Login with Google
          </button>
        )}

        <nav className="flex flex-col space-y-4">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-700 ${isActive ? 'bg-gray-700' : ''
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              {link.icon}
              <span>{link.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default Sidebar;
