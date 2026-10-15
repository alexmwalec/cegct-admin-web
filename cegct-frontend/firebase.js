import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";


const firebaseConfig = {
  apiKey: "AIzaSyCz_DWk9HcrtUp7EC52SlZNnYKbYQ_wbvk",
  authDomain: "cegct-9b839.firebaseapp.com",
  projectId: "cegct-9b839",
  storageBucket: "cegct-9b839.firebasestorage.app",
  messagingSenderId: "899724831482",
  appId: "1:899724831482:web:a5f01847d0114441ccb743",
  measurementId: "G-FDHH5ZSYF2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);