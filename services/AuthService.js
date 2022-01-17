import axios from "axios";
import swal from "sweetalert";
import { loginConfirmedAction, logout } from "../store/actions/AuthActions";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { getAuth, setPersistence, signInWithEmailAndPassword, browserSessionPersistence } from "firebase/auth";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDKsrcdskkXI0O-LCT4nhLT4D5ZaFlN-Js",
  authDomain: "pentagon-2ee17.firebaseapp.com",
  databaseURL: "https://pentagon-2ee17-default-rtdb.firebaseio.com",
  projectId: "pentagon-2ee17",
  storageBucket: "pentagon-2ee17.appspot.com",
  messagingSenderId: "250029447330",
  appId: "1:250029447330:web:89585ceb11792fd3ab1ffb",
  measurementId: "G-GZJQG25P7P",
};

const Fire = initializeApp(firebaseConfig);
const auth = getAuth();

export function signUp(email, password) {
  //axios call
  const postData = {
    email,
    password,
    returnSecureToken: true,
  };
  return axios.post(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyD3RPAp3nuETDn9OQimqn_YF6zdzqWITII`,
    postData
  );
}

export function login(email, password) {
  const postData = {
    email,
    password,
    returnSecureToken: true,
  };
  return axios.post(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyD3RPAp3nuETDn9OQimqn_YF6zdzqWITII`,
    postData
  );
}

export function formatError(errorResponse) {
  console.log("errorResponse", errorResponse);
  switch (errorResponse) {
    case "This email is already registered":
      //return 'Email already exists';
      swal("Oops", "Email already exists", "error");
      break;
    case "User not found":
      //return 'Email not found';
      swal("Oops", "Email not found", "error", { button: "Try Again!" });
      break;
    case "Wrong credentials":
      //return 'Invalid Password';
      swal("Oops", "Invalid Password", "error", { button: "Try Again!" });
      break;
    case "USER_DISABLED":
      return "User Disabled";

    default:
      return "";
  }
}

export function saveTokenInLocalStorage(tokenDetails) {
  tokenDetails.expireDate = new Date(
    new Date().getTime() + tokenDetails.expiresIn * 1000
  );
  console.log("tokenDetails", tokenDetails);
  localStorage.setItem("userDetails", JSON.stringify(tokenDetails));
}

export function runLogoutTimer(dispatch, timer, history, id) {
  setTimeout(async () => {
    try {
      const db = getFirestore();
      console.log("runLogoutTimer", id, timer);
      var docRef = doc(db, "users", id);
      await updateDoc(docRef, { status: "offline" })
        .then(() => {})
        .catch((errors) => {
          console.log("errorsa", errors.message);
        });
    } catch (e) {
      console.log("Ran mutation error", e);
    }
    dispatch(logout(history));
  }, timer);
}

export function getUserdetails() {
  return JSON.parse(localStorage.getItem("userDetails"));
}

export function checkAutoLogin(dispatch, history) {
  const tokenDetailsString = localStorage.getItem("userDetails");
  let tokenDetails = "";
  if (!tokenDetailsString) {
    dispatch(logout(history));
    return;
  }
  tokenDetails = JSON.parse(tokenDetailsString);
  let expireDate = new Date(tokenDetails.expireDate);
  let todaysDate = new Date();

  if (todaysDate > expireDate) {
    dispatch(logout(history));
    return;
  }
  setPersistence(auth, browserSessionPersistence)
    .then(() => {
      // Existing and future Auth states are now persisted in the current
      // session only. Closing the window would clear any existing state even
      // if a user forgets to sign out.
      // ...
      // New sign-in will be persisted with session persistence.
      return signInWithEmailAndPassword(auth, tokenDetails.email, tokenDetails.password);
    })
    .catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log("login", errorCode + errorMessage);
    });
  dispatch(loginConfirmedAction(tokenDetails));

  const timer = expireDate.getTime() - todaysDate.getTime();
  runLogoutTimer(dispatch, timer, history, tokenDetails.id);
}
