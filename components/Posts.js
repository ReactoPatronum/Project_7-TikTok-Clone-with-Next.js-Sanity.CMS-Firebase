/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import React, { useState } from "react";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import { ChatIcon, HeartIcon, TrashIcon } from "@heroicons/react/outline";
import toast from "react-hot-toast";
import { HeartIcon as SolidHeartIcon } from "@heroicons/react/solid";
import Link from "next/link";
import Moment from "react-moment";
import axios from "axios";
import { useRouter } from "next/router";
import moment from "moment";
import "moment/locale/tr";



const Posts = ({ post }) => {
  moment.locale("tr")
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [hasLiked, setHasLiked] = useState(false);
  const [likes, setLikes] = useState([]);
  const [hasFollowed, setHasFollowed] = useState(false);
  const [followed, setFollowed] = useState([]);
  const router = useRouter();

  const deletePost = async () => {
    const toastId = toast.loading("Gönderi Siliniyor");
    const deleteDocument = {
      _id: `${post._id}`,
    };
    await deleteDoc(doc(db, "posts", post._id));
    await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/deletePost`, deleteDocument);
    toast.success("Paylaşımınız Silindi!", { id: toastId });
  };

  const LikePost = async () => {
    if (user) {
      if (hasLiked) {
        await deleteDoc(doc(db, "posts", post._id, "likes", user?.uid));
      } else {
        await setDoc(doc(db, "posts", post._id, "likes", user?.uid), {
          user: user.email,
        });
      }
    } else {
      toast.error("Lütfen Oturum Açınız!");
    }
  };

  const Follow = async () => {
    if (user) {
      if (hasFollowed) {
        await deleteDoc(
          doc(db, "users", user?.email, "following", post?.postedBy.email)
        );
      } else {
        await setDoc(
          doc(db, "users", user?.email, "following", post?.postedBy.email),
          {
            userF: post?.postedBy?.userName,
            imageF: post?.postedBy?.image,
            emailF: post?.postedBy.email,
            uuidF:post?.postedBy.userId
          }
        );
      }
    } else {
      toast.error("Lütfen Oturum Açın");
    }
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "posts", post._id, "comments"),
      (snapshot) => setComments(snapshot.docs)
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "posts", post._id, "likes"),
      (snapshot) => setLikes(snapshot.docs)
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const unsubscribe = onSnapshot(
        collection(db, "users", user?.email, "following"),
        (snapshot) => setFollowed(snapshot.docs)
      );
      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    const setPost = async () => {
      await setDoc(doc(db, "posts", post._id), {
        timestamp: serverTimestamp(),
      });
    };
    setPost();
  }, []);

  useEffect(() => {
    setHasLiked(likes?.find((like) => like.id == user?.uid));
  }, [likes, user]);

  useEffect(() => {
    setHasFollowed(
      followed?.find((follow) => follow.id == post?.postedBy.email)
    );
  }, [user, followed]);

  return (
    <div className=" border-b p-2 ">
      <div className="flex space-x-2 md:space-x-4 ">
        <img
          referrerPolicy="no-referrer"
          className="w-6 h-6  md:w-14 md:h-14 rounded-full"
          src={post?.postedBy?.image}
          alt=""
        />
        <div className="">
          <div className="flex items-center justify-between cursor-pointer">
            <Link href={`/post/${post?._id}`}>
              <div className="flex space-x-1 items-center">
                <h2 className="font-semibold truncate">
                  {post?.postedBy?.userName}
                </h2>
                <h2 className="text-sm text-gray-500 truncate">
                  {post?.postedBy?.userName}
                </h2>{" "}
                -
                <Moment
                  className="text-xs md:text-sm text-gray-500 truncate"
                  fromNow
                >
                  {post?._updatedAt}
                </Moment>
              </div>
            </Link>

            {user?.email !== post?.postedBy?.email ? (
              hasFollowed ? (
                <button
                  onClick={Follow}
                  className=" bg-white hover:brightness-90 border-[#EF2A50] border-2  transition-all duration-200 hidden md:inline py-1 md:px-4 md:py-1 text-[#EF2A50] rounded-md font-semibold"
                >
                  Takipten Çık
                </button>
              ) : (
                <button
                  onClick={Follow}
                  className=" bg-white hover:brightness-90 border-[#EF2A50] border-2  transition-all duration-200 hidden md:inline py-1 md:px-4 md:py-1 text-[#EF2A50] rounded-md font-semibold"
                >
                  Takip Et
                </button>
              )
            ) : (
              ""
            )}
          </div>
          <Link href={`/post/${post?._id}`}>
            <h3 className="cursor-pointer">{post?.caption}</h3>
          </Link>
          <div className="md:flex">
            <Link href={`/post/${post?._id}`}>
              <video
                className="rounded-lg w-[600px] mt-2 cursor-pointer"
                controls
                src={post?.video.asset?.url}
              ></video>
            </Link>
            <div className="md:ml-2 flex md:flex-col justify-between md:justify-end mt-2 md:mt-0 md:space-y-2">
              <div className="flex md:inline space-x-4 md:space-x-0">
                <div
                  onClick={LikePost}
                  className="flex md:flex-col items-center"
                >
                  {hasLiked ? (
                    <SolidHeartIcon className="w-8 md:w-10 text-red-600 hover:text-red-600 hover:bg-red-100 rounded-full p-1 cursor-pointer transition-all duration-200" />
                  ) : (
                    <HeartIcon className="w-8 md:w-10 hover:text-red-600 hover:bg-red-100 rounded-full p-1 cursor-pointer transition-all duration-200" />
                  )}
                  <h3 className="text-sm font-semibold">{likes?.length}</h3>
                </div>
                <div
                  onClick={() => router.push(`/post/${post._id}`)}
                  className="flex md:flex-col items-center"
                >
                  <ChatIcon className="w-8 md:w-10 hover:text-blue-600 hover:bg-blue-100 rounded-full p-1 cursor-pointer transition-all duration-200" />
                  <h3 className="text-sm font-semibold">{comments?.length}</h3>
                </div>
                {user?.email === post?.postedBy?.email && (
                  <div onClick={deletePost}>
                    <TrashIcon className="w-8 md:w-10 hover:text-slate-600 hover:bg-slate-200 rounded-full p-1 cursor-pointer transition-all duration-200" />
                  </div>
                )}
              </div>
              <div>
                <button className=" bg-white border-[#EF2A50] border-2 hover:brightness-90  transition-all duration-200  md:hidden py-1 px-8 text-[#EF2A50]  rounded-md font-semibold">
                  Takip Et
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Posts;
