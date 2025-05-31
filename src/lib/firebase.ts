
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
  doc as firestoreDoc, // Renamed to avoid conflict with react-hook-form's doc
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";
import type { Task, TaskStatus, TaskType } from "./types"; // Ensure TaskType is imported if used for defaults
import { TASK_TYPES } from "./types"; // Assuming TASK_TYPES is exported for default values

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};


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
      createdAt: serverTimestamp(), // Firestore will handle this timestamp
    });
    console.log("Task added with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding task: ", e);
    throw e;
  }
}

export async function getTasks(): Promise<Task[]> {
  const tasksCol = collection(db, "tasks");
  const taskQuery = query(tasksCol, orderBy("createdAt", "desc"));
  const taskSnapshot = await getDocs(taskQuery);
  
  const taskList = taskSnapshot.docs.map((document): Task => {
    const data = document.data();
    
    let dateString: string = ""; 
    if (data.date) {
      if (typeof data.date === 'string') {
        dateString = data.date;
      } else if (data.date.toDate && typeof data.date.toDate === 'function') { // Firestore Timestamp
        dateString = data.date.toDate().toISOString();
      } else if (data.date instanceof Date) { // JavaScript Date object
        dateString = data.date.toISOString();
      }
    }

    let createdAtString: string = "";
    if (data.createdAt) {
        if (typeof data.createdAt === 'string') {
            createdAtString = data.createdAt;
        } else if (data.createdAt.toDate && typeof data.createdAt.toDate === 'function') { // Firestore Timestamp
            createdAtString = data.createdAt.toDate().toISOString();
        } else if (data.createdAt instanceof Date) { // JavaScript Date object
            createdAtString = data.createdAt.toISOString();
        }
    }
    
    // Ensure all fields from Task interface are present, providing defaults if necessary
    return {
      id: document.id,
      entityName: data.entityName || "",
      taskType: data.taskType || TASK_TYPES[0], // Ensure TASK_TYPES is available or use a safe default
      time: data.time || "00:00",
      contactPerson: data.contactPerson || "",
      status: data.status || "open",
      note: data.note || undefined,
      ...data, // Spread the original data first
      date: dateString, // Override with the processed, guaranteed-string date
      createdAt: createdAtString, // Override with the processed, guaranteed-string createdAt
    } as Task; // Type assertion
  });
  return taskList;
}

export async function updateTask(taskId: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) {
  try {
    const taskRef = firestoreDoc(db, "tasks", taskId);
    await updateDoc(taskRef, updates);
    console.log("Task updated with ID: ", taskId);
  } catch (e) {
    console.error("Error updating task: ", e);
    throw e;
  }
}

export async function deleteTask(taskId: string) {
  try {
    const taskRef = firestoreDoc(db, "tasks", taskId);
    await deleteDoc(taskRef);
    console.log("Task deleted with ID: ", taskId);
  } catch (e) {
    console.error("Error deleting task: ", e);
    throw e;
  }
}

export async function updateTaskStatus(taskId: string, newStatus: TaskStatus) {
  try {
    const taskRef = firestoreDoc(db, "tasks", taskId);
    await updateDoc(taskRef, { status: newStatus });
    console.log("Task status updated for ID: ", taskId);
  } catch (e) {
    console.error("Error updating task status: ", e);
    throw e;
  }
}

// Function to add multiple tasks, e.g., for migration
export async function addMultipleTasks(tasks: Omit<Task, 'id' | 'createdAt'>[]) {
    const batch = writeBatch(db);
    tasks.forEach(task => {
        const docRef = firestoreDoc(collection(db, "tasks")); // Create a new doc reference for each task
        batch.set(docRef, {
            ...task,
            createdAt: serverTimestamp()
        });
    });
    try {
        await batch.commit();
        console.log("Successfully added multiple tasks.");
    } catch (e) {
        console.error("Error adding multiple tasks: ", e);
        throw e;
    }
}


export { app, analytics, firebaseConfig, db };
