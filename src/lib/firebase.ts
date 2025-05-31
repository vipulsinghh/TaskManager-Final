
import {
  initializeApp,
  getApps,
  getApp
} from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

import { Task, TaskStatus } from "./types";

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

let analytics;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

const db = getFirestore(app);

export async function addTask(task: Omit<Task, 'id' | 'createdAt'>) {
  try {
    const docRef = await addDoc(collection(db, "tasks"), {
      ...task,
      createdAt: serverTimestamp(),
    });
    console.log("Task added with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding task: ", e);
  }
}

export async function getTasks() {
  const tasksCol = collection(db, "tasks");
  const taskQuery = query(tasksCol, orderBy("createdAt", "desc"));
  const taskSnapshot = await getDocs(taskQuery);
  const taskList = taskSnapshot.docs.map((doc) => ({
    id: doc.id,
    // Convert Firestore Timestamp to ISO string for date
    date: (doc.data().date as any)?.toDate().toISOString() || '', // Handle potential undefined/null
    ...doc.data(), // Include other fields
    createdAt: (doc.data().createdAt as any)?.toDate()?.toISOString() || '', // Also convert createdAt if needed
  }));
  return taskList;
}

export async function updateTask(taskId: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) {
  try {
    const taskRef = collection(db, "tasks").doc(taskId);
    await updateDoc(taskRef, updates);
    console.log("Task updated with ID: ", taskId);
  } catch (e) {
    console.error("Error updating task: ", e);
  }
}

export async function deleteTask(taskId: string) {
  try {
    const taskRef = collection(db, "tasks").doc(taskId);
    await deleteDoc(taskRef);
    console.log("Task deleted with ID: ", taskId);
  } catch (e) {
    console.error("Error deleting task: ", e);
  }
}

export async function updateTaskStatus(taskId: string, newStatus: TaskStatus) {
  try {
    const taskRef = collection(db, "tasks").doc(taskId);
    await updateDoc(taskRef, { status: newStatus });
    console.log("Task status updated for ID: ", taskId);
  } catch (e) {
    console.error("Error updating task status: ", e);
  }
}
export { app, analytics, firebaseConfig, db };
