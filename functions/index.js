const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// OPTIONAL: Your helper function to get user's FCM token from Firestore
async function getUserFCMToken(userId) {
  const userDoc = await admin.firestore().collection('users').doc(userId).get();
  return userDoc.exists ? userDoc.data().fcmToken : null;
}
exports.sendReminders = functions.pubsub.schedule('every 2 minutes').onRun(async (context) => {
  console.log('⏰ Checking for tasks to remind...');

  const now = admin.firestore.Timestamp.now();

  const tasksSnapshot = await admin.firestore()
    .collection('tasks')
    .where('completed', '==', false)
    .where('remindAt', '<=', now)
    .get();

  console.log(`✅ Found ${tasksSnapshot.size} tasks to remind.`);

  for (const doc of tasksSnapshot.docs) {
    const task = doc.data();
    const fcmToken = await getUserFCMToken(task.userId);

    if (fcmToken) {
      await admin.messaging().send({
        token: fcmToken,
        notification: {
          title: 'Task Reminder',
          body: `Don't forget to: ${task.title}`
        }
      });

      console.log(`📲 Sent reminder for task "${task.title}" to user ${task.userId}.`);
    } else {
      console.log(`⚠️ No FCM token for user ${task.userId}.`);
    }
  }

  console.log('✅ Finished sending reminders.');
  return null;
});
