/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from "react";
import { HomeIcon, UsersIcon } from "@heroicons/react/solid";
import Posts from "./Posts";
import {
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  query,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import Modal from "react-modal";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const MainPage = ({ data }) => {
  const { signInWithGoogle, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [suggestion, setSuggestion] = useState(3);
  const [openModal, setOpenModal] = useState(false);
  const [followed, setFollowed] = useState([]);

  const deleteFollowedPerson = async (follow) => {
    await deleteDoc(doc(db, "users", user?.email, "following", follow.id));
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, "users"), limit(suggestion)),
      (snapshot) => setUsers(snapshot.docs)
    );
    return () => unsubscribe();
  }, [suggestion]);

  console.log(user);

  useEffect(() => {
    if (user) {
      const unsubscribe = onSnapshot(
        collection(db, "users", user?.email, "following"),
        (snapshot) => setFollowed(snapshot.docs)
      );
      return () => unsubscribe();
    }
  }, [user]);

  return (
    <main className="max-w-6xl mx-auto grid grid-cols-9 mt-4 p-2">
      <div className="col-span-1 lg:col-span-3 border-r h-screen sticky top-20">
        <div className="lg:border-b space-y-4 flex flex-col items-center justify-center lg:inline">
          <div className="flex items-center space-x-2 ">
            <Link href="/">
              <HomeIcon className="w-8 text-[#EF2A50] cursor-pointer" />
            </Link>
            <h2 className="hidden lg:block text-lg font-semibold text-[#EF2A50]">
              Sizin İçin
            </h2>
          </div>
          <div
            onClick={
              user
                ? () => setOpenModal(true)
                : () => toast.error("Lütfen Oturum Açın")
            }
            className="flex items-center space-x-2 cursor-pointer"
          >
            <UsersIcon className="w-8 text-blue-400" />
            <h2 className="hidden lg:block text-lg font-semibold text-blue-400">
              Takip Edilen
            </h2>
          </div>
        </div>
        {!user ? (
          <div className="mt-5 hidden lg:block">
            <h3 className="text-gray-400">
              İçerik Üreticilerini takip etmek, videoları beğenmek ve yorumları
              görüntülemek için giriş yapın.
            </h3>
            <button
              onClick={signInWithGoogle}
              className=" w-[320px] border border-[#EF2A50] rounded-lg h-12 text-[#EF2A50]  font-semibold text-xl mt-5 hover:bg-red-100 transition-all duration-200"
            >
              Giriş Yapın
            </button>
          </div>
        ) : (
          <>
           <div className=" ml-1 mt-6  flex justify-center lg:justify-start space-x-2 lg:space-x-4 ">
              <img
                referrerPolicy="no-referrer"
                className="lg:w-12 lg:h-12 max-w-[40px] lg:max-w-[48px] rounded-full "
                src={user?.photoURL}
                alt=""
              />
              <div className="">
                <div className="flex items-center justify-between">
                  <div className="space-x-1 items-center">
                    <h2 className="font-semibold hidden lg:block">
                      {user?.displayName}
                    </h2>
                    <h2 className="text-sm text-gray-500 hidden lg:block">
                      {user?.displayName}
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        <hr className=" border-gray-300 mt-2 max-w-[330px]" />
        <div className=" mt-10">
          <h3 className="font-semibold m-2 hidden lg:block">
            Önerilen Hesaplar
          </h3>
          <div className="space-y-4 mr-1 lg:mr-0  lg:block">
            {users.map((user) => (
              <div key={user.id}>
                <div className="flex justify-center lg:justify-start space-x-2 lg:space-x-4 ">
                  <img
                    referrerPolicy="no-referrer"
                    className="lg:w-12 lg:h-12 max-w-[40px] lg:max-w-[48px] rounded-full "
                    src={user?.data().photoURL}
                    alt=""
                  />
                  <div className="">
                    <div className="flex items-center justify-between">
                      <div className="space-x-1 items-center">
                        <h2 className="font-semibold hidden lg:block">
                          {user?.data().displayName}
                        </h2>
                        <h2 className="text-sm text-gray-500 hidden lg:block">
                          {user?.data().displayName}
                        </h2>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            hidden={suggestion !== 3}
            onClick={() => setSuggestion(6)}
            className=" mt-4 text-red-500 text-[10px] md:text-base mr-2"
          >
            Tümünü Gör
          </button>
          <button
            hidden={suggestion == 3}
            onClick={() => setSuggestion(3)}
            className=" mt-4 text-red-500 text-[10px] md:text-base mr-2"
          >
            Daha Az Gör
          </button>
        </div>
      </div>
      <div className="col-span-8 lg:col-span-6 space-y-6">
        {data && data.map((post) => <Posts key={post._id} post={post} />)}
      </div>
      <Modal
        isOpen={openModal}
        ariaHideApp={false}
        onRequestClose={() => setOpenModal(false)}
        className="p-5 min-h-[400px] max-w-lg w-[90%] absolute top-24 left-[50%] translate-x-[-50%] bg-white border-2 rounded-xl shadow-md"
      >
        <motion.div initial={{ y: -100 }} animate={{ y: 0 }} className="">
          <div className="flex flex-col items-center">
            <h2 className="text-lg font-semibold">Takip Ettikleri</h2>
            <hr className="w-[200px] sm:w-[300px] md:w-[400px] " />
          </div>
          {followed.length > 0 ? (
            followed.map((follow) => (
              <div className="" key={follow.id}>
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2 lg:space-x-4 mt-4">
                    <img
                      referrerPolicy="no-referrer"
                      className="w-6 h-6  sm:w-14 sm:h-14 rounded-full"
                      src={follow?.data().imageF}
                      alt=""
                    />
                    <div className="">
                      <div className="flex items-center justify-between">
                        <div className="">
                          <h2 className="font-semibold">
                            {follow?.data().userF}
                          </h2>
                          <h2 className="text-sm text-gray-500">
                            {follow?.data().emailF}
                          </h2>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <button
                      onClick={() => deleteFollowedPerson(follow)}
                      className="border py-1 px-2 font-bold"
                    >
                      Çıkar
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="mt-3">
              <h2 className="text-lg">Takip Edilen Kimse Bulunamadı.</h2>
            </div>
          )}
        </motion.div>
      </Modal>
    </main>
  );
};

export default MainPage;
