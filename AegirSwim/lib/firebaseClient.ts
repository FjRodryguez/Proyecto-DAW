// firebaseClient.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAA5Uj8y7fkR9uHQcbZPmj6G4mdYOSfT4s",
    authDomain: "login-proyecto-54080.firebaseapp.com",
    projectId: "login-proyecto-54080",
    storageBucket: "login-proyecto-54080.firebasestorage.app",
    messagingSenderId: "643034085665",
    appId: "1:643034085665:web:f93f1bb2808660b41ba660",
    measurementId: "G-MSG1FTKY3R"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
