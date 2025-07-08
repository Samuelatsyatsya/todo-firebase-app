// src/hooks/saveFCMToken.js

import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase"; // adjust path to your firebase.js!

export const saveFCMToken = async (userId, token) => {
  try {
    await setDoc(doc(db, "fcmTokens", userId), {
      token: token,
      updatedAt: Date.now()
    });
    console.log("✅ FCM token saved for user:", userId);
  } catch (error) {
    console.error("❌ Error saving FCM token:", error);
  }
};
