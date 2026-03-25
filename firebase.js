import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBdpxsejwbJdPb2LxbpQhtxedK3CXScrzw",
  authDomain: "regalo-naroa.firebaseapp.com",
  projectId: "regalo-naroa",
  storageBucket: "regalo-naroa.firebasestorage.app",
  messagingSenderId: "877486723369",
  appId: "1:877486723369:web:4dc859cfa98b03be7f2738",
  measurementId: "G-5TW48Q3CEV"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);

window.firebaseAuth = auth;
window.firebaseStorage = storage;
window.firebaseFns = {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  ref,
  uploadBytes,
  getDownloadURL
};
