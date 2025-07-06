import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiMenu,
  FiX,
  FiHome,
  FiCheckSquare,
  FiLogOut,
  FiUser
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { MdAttachMoney, MdEvent, MdHealthAndSafety } from 'react-icons/md';
import { FaBook } from 'react-icons/fa';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, provider } from '../firebase';

const navItems = [
  { name: 'Dashboard', to: '/', icon: <FiHome size={20} /> },
  { name: 'To‑Do List', to: '/todos', icon: <FiCheckSquare size={20} /> },
  { name: 'Finance', to: '/finance', icon: <MdAttachMoney size={20} /> },
  { name: 'Events', to: '/events', icon: <MdEvent size={20} /> },
  { name: 'Health', to: '/health', icon: <MdHealthAndSafety size={20} /> },
  { name: 'Study', to: '/study', icon: <FaBook size={20} /> },
  { name: 'Support', to: '/support', icon: <FiUser size={20} /> },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Listen to auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return unsubscribe;
  }, []);

  const toggle = () => setIsOpen(open => !open);
  const login = () => signInWithPopup(auth, provider);
  const logout = async () => {
    try {
      await signOut(auth);
      navigate('/login'); // or navigate('/') if login is on your home page
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navigate = useNavigate();
  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={toggle}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        className="fixed top-4 left-4 z-50 p-2 text-2xl text-white bg-gray-800 rounded-md md:hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        {isOpen ? <FiX /> : <FiMenu />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-gray-800 text-white p-6
          transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 transition-transform duration-300 ease-in-out
          flex flex-col
        `}
        aria-label="Sidebar navigation"
      >
        {/* Brand */}
        <h1 className="text-2xl font-bold mb-4">MyLife Suite</h1>

        {/* User Info */}
        {user && (
          <div className="mb-8 flex items-center space-x-3">
            <FiUser size={32} className="text-indigo-400" aria-hidden />
            <div>
              <p className="text-sm">Welcome,</p>
              <p className="font-medium">{user.displayName}</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1">
          <ul className="space-y-2">
            {navItems.map(item => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2 rounded-md hover:bg-gray-700 transition-colors ${isActive ? 'bg-gray-700' : ''
                    }`
                  }
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon}
                  <span className="text-sm font-medium">{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        {user && (
          <div className="mt-auto">
            <button
              onClick={logout}
              className="flex items-center gap-2 w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <FiLogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        )}
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={toggle}
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          aria-hidden="true"
        />
      )}
    </>
  );
}
