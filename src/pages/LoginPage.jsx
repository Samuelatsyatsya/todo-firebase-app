import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { auth, provider } from '../firebase';

const LoginPage = () => {
  const navigate = useNavigate();

  const login = async () => {
    try {
      await signInWithPopup(auth, provider);
      // You don't need navigate() here because onAuthStateChanged will handle it.
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/'); // Redirect to dashboard or home if user is logged in
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome to MyLife Suite</h1>
        <p className="mb-6 text-gray-600">Please log in to continue</p>
        <button
          onClick={login}
          className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
        >
          Login with Google
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
