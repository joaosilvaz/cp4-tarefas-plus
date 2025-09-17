import { collection } from "firebase/firestore";
import { db } from "./firebaseConfig";

export const userTasksCol = (uid: string) =>
  collection(db, "users", uid, "tasks");