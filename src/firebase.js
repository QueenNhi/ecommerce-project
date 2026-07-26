import { initializeApp } from "firebase/app";
import {
    getAuth,
    GoogleAuthProvider
} from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBev43j-IrJsODr_FrWhuSMdp-nmtPq50M",
    authDomain: "luxury-handbags-92cc4.firebaseapp.com",
    projectId: "luxury-handbags-92cc4",
    storageBucket: "luxury-handbags-92cc4.firebasestorage.app",
    messagingSenderId: "802728776783",
    appId: "1:802728776783:web:86557bdad42d9b4618063a",
    measurementId: "G-J61EDMLZ27"
  };


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();