import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD3Zh9ahAKTAfAgA39BnlhYujciRf9JAEc",
  authDomain: "forkliftia.firebaseapp.com",
  projectId: "forkliftia",
  appId: "1:204245512440:web:f98fcb8e9917b8b7b34b0d",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
