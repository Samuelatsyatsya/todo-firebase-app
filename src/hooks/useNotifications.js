// src/hooks/useNotifications.js
import { useEffect } from 'react';
import { messaging } from '../firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { saveFCMToken } from './saveFCMToken';

export const useNotifications = () => {
  useEffect(() => {
    const requestPermission = async () => {
      console.log('Requesting permission...');
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        console.log('Notification permission granted.');
        const token = await getToken(messaging, {
          vapidKey: "BEwlA_rlz-3lzKj5jB1-TXNXUJouJ12Qt2rScgC16_XKCU1RD_0gzdkJQ_VcsZ3S70EJ9m02vcDQZlAD0ffxlL8",
            serviceWorkerRegistration: await navigator.serviceWorker.register('/firebase-messaging-sw.js'),

        //   import.meta.env.VITE_YOUR_WEB_PUSH_CERTIFICATE_KEY

          

        });
        console.log('FCM Token:', token);

        // TODO: Save this token to Firestore under the user!
      } else {
        console.log('Notification permission denied.');
      }
    };

    requestPermission();

    // Foreground listener
    onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      alert(payload.notification?.title + ': ' + payload.notification?.body);
    });
  }, []);
};
