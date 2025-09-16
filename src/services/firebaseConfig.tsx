import { initializeApp } from "firebase/app";
import {
	getFirestore,
	collection,
	addDoc,
	getDocs,
	doc,
	updateDoc,
	deleteDoc,
} from "firebase/firestore";
import {
	getAuth,
	signInWithCredential,
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	signOut,
	updatePassword,
	sendPasswordResetEmail,
	reauthenticateWithCredential,
	EmailAuthProvider,
	onAuthStateChanged,
	type User,
	type Auth,
} from "firebase/auth";

const firebaseConfig = {
	apiKey: "AIzaSyDsm4GYknDAkMYzAdn8JS-_TX2hRJcbb-Y",
	authDomain: "cp4-mobile-fd837.firebaseapp.com",
	projectId: "cp4-mobile-fd837",
	storageBucket: "cp4-mobile-fd837.firebasestorage.app",
	messagingSenderId: "870502752857",
	appId: "1:870502752857:web:674122dc5c0722587a4748"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize Auth - usar getAuth para evitar warnings de persistência
const auth: Auth = getAuth(app);

export {
	auth,
	db,
	collection,
	addDoc,
	getDocs,
	doc,
	updateDoc,
	deleteDoc,
	signInWithCredential,
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	signOut,
	updatePassword,
	sendPasswordResetEmail,
	reauthenticateWithCredential,
	EmailAuthProvider,
	onAuthStateChanged,
};

export type { User };