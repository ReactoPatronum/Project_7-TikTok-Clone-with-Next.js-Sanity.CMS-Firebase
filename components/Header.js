import Image from "next/image";
import React from "react";
import logo from "/public/tiktok-logo.png";
import { SearchIcon, PlusIcon } from "@heroicons/react/outline";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { useRouter } from "next/router";


const Header = () => {
  const { user, signInWithGoogle, logOut } = useAuth();
  const router=useRouter()

  return (
    <header className="border-b sticky top-0 z-10 bg-white">
      <div className="flex items-center justify-between px-2 max-w-6xl mx-auto ">
        <div
          onClick={() => router.push("/")}
          className="w-32 h-12 mt-3 cursor-pointer"
        >
          <Image className="" alt="logo" src={logo} layout="responsive" />
        </div>
        <div className="hidden md:flex  bg-gray-100 border border-gray-300 px-6 rounded-full w-[380px] h-12">
          <input
            placeholder="Hesapları ve Videoları Arayın"
            className="bg-transparent outline-none w-full "
            type="text"
          />
          <SearchIcon className="w-8 text-gray-400" />
        </div>
        <div className="flex space-x-4">
          <button
            onClick={
              user
                ? () => router.push("/upload")
                : () => toast.error("Lütfen Oturum Açın")
            }
            className="hover:brightness-90 transition-all duration-200 flex items-center space-x-2 border px-3 py-1 md:px-6 md:py-2"
          >
            <PlusIcon className="w-5" />
            <h2 className="font-semibold">Yükle</h2>
          </button>
          {user ? (
            <button className="bg-[#EF2A50] hover:brightness-90  transition-all duration-200 px-2 py-1 md:px-4 md:py-2 text-white rounded-md font-semibold" onClick={logOut}>Çıkış Yap</button>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="bg-[#EF2A50] hover:brightness-90  transition-all duration-200 px-2 py-1 md:px-4 md:py-2 text-white rounded-md font-semibold"
            >
              Giriş Yapın
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
