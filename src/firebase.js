import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyDJYpWHL0yppLUtFxICG3wbVMSNLRoQ9IM",
  authDomain: "konoz-yemen.firebaseapp.com",
  projectId: "konoz-yemen",
  storageBucket: "konoz-yemen.firebasestorage.app",
  messagingSenderId: "1004077060626",
  appId: "1:1004077060626:web:49c5aefc19f845c61efecb",
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)