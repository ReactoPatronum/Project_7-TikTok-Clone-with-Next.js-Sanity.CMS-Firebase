import { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, db } from "../firebase";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/router";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import axios from "axios";


const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthContextProvider = ({ children }) => {
  const googleProvider = new GoogleAuthProvider();
  const [user, setUser] = useState(null);
  const [check, setCheck] = useState(false);

  const saveUsers = async () => {
    await setDoc(doc(db, "users", user?.email), {
      uid: user?.uid,
      email: user?.email,
      displayName: user?.displayName,
      photoURL: user?.photoURL,
      timestamp: serverTimestamp(),
    });
  };

  const sanitySaveUser=async()=>{
    const saveUser = {
        _id: user?.uid,
        _type: "user",
        userName: user?.displayName,
        image: user?.photoURL,
        userId:user?.uid,
        email:user?.email
      };
      await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/saveUser`,saveUser)
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser({
          uid: user?.uid,
          email: user?.email,
          displayName: user?.displayName,
          photoURL: user?.photoURL,
        });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user !== null && user.photoURL && check === true) {
      saveUsers();
      sanitySaveUser()
      toast.success("Giriş Başarılı")
      console.log("Başarı İle Kayıt Edildi...");
    }
  }, [user, check]);

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
    setCheck(true);
  };

  const logOut = async () => {
    setUser(null);
    setCheck(false);
    await signOut(auth);
    toast.success("Oturum başarı ile kapatıldı!")
  };

  const contextValue = { user, signInWithGoogle, logOut };

  return (
    <AuthContext.Provider value={contextValue}>
      <Toaster />
      {children}
    </AuthContext.Provider>
  );
};
