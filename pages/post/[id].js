/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";
import { useRouter } from "next/router";
import { client } from "../../utils/client";
import {
  ChatIcon,
  HeartIcon,
  XCircleIcon,
  EyeOffIcon
} from "@heroicons/react/outline";
import toast from "react-hot-toast";
import { HeartIcon as SolidHeartIcon } from "@heroicons/react/solid";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { useEffect } from "react";
import Moment from "react-moment";

const Post = ({ data }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const router = useRouter();
  const [hasLiked, setHasLiked] = useState(false);
  const [likes, setLikes] = useState([]);
  const [input, setInput] = useState("");

  const Comment = async () => {
    if(user){
      await addDoc(collection(db, "posts", data._id, "comments"), {
        comment: input,
        timestamp: serverTimestamp(),
        name: user?.email,
        userId: user?.uid,
      });
      setInput("");
    }else{
      toast.error("Lütfen Oturum Açınız")
    }
  };

  const LikePost = async () => {
    if (user) {
      if (hasLiked) {
        await deleteDoc(doc(db, "posts", data._id, "likes", user?.uid));
      } else {
        await setDoc(doc(db, "posts", data._id, "likes", user?.uid), {
          user: user.email,
        });
      }
    } else {
      toast.error("Lütfen Oturum Açınız!");
    }
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(
        collection(db, "posts", data._id, "comments"),
        orderBy("timestamp", "desc")
      ),
      (snapshot) => setComments(snapshot.docs)
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "posts", data._id, "likes"),
      (snapshot) => setLikes(snapshot.docs)
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setHasLiked(likes?.find((like) => like.id == user?.uid));
  }, [likes, user]);

  

  return (
    <main className="lg:grid grid-cols-9">
      <div className="lg:h-screen lg:bg-gray-900 col-span-6 flex items-center">
        <XCircleIcon
          onClick={() => router.back()}
          className="w-10 text-white absolute z-10 top-4 transition-all duration-200 hover:scale-110 cursor-pointer ml-2"
        />
        <video
          autoPlay
          className="rounded-lg  cursor-pointer"
          controls
          src={data?.video?.asset?.url}
        ></video>
      </div>
      <div className="lg:col-span-3 mt-6 p-5 ">
        <div className="flex space-x-2 lg:space-x-4 ">
          <img
            referrerPolicy="no-referrer"
            className="w-6 h-6  sm:w-14 sm:h-14 rounded-full"
            src={data?.postedBy?.image}
            alt=""
          />
          <div className="">
            <div className="flex items-center justify-between">
              <div className="flex space-x-1 items-center">
                <h2 className="font-semibold">{data?.postedBy?.userName}</h2>
                <h2 className="text-sm text-gray-500">
                  {data?.postedBy?.userName}
                </h2>
              </div>
            </div>
            <h2>{data.caption}</h2>
          </div>
        </div>
        <div className="border-b-2">
          <div className="flex  justify-between  mt-2 ">
            <div className="flex  space-x-4 ">
              <div onClick={LikePost} className="flex items-center">
                {hasLiked ? (
                  <SolidHeartIcon className="w-10 text-red-600 hover:text-red-600 hover:bg-red-100 rounded-full p-1 cursor-pointer transition-all duration-200" />
                ) : (
                  <HeartIcon className="w-10 hover:text-red-600 hover:bg-red-100 rounded-full p-1 cursor-pointer transition-all duration-200" />
                )}
                <h3 className="text-sm font-semibold">{likes?.length}</h3>
              </div>
              <div className="flex  items-center">
                <ChatIcon className="w-10 hover:text-blue-600 hover:bg-blue-100 rounded-full p-1 cursor-pointer transition-all duration-200" />
                <h3 className="text-sm font-semibold">{comments?.length}</h3>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-100 p-6">
          <div className="min-h-[200px] lg:min-h-[300px] lg:max-h-[600px] space-y-4 overflow-y-auto">
            {comments.length > 0
              ? comments.map((comment) => (
                  <div key={comment.id}>
                    <div className="flex space-x-2 lg:space-x-4 ">
                      <img
                        referrerPolicy="no-referrer"
                        className="w-6 h-6  sm:w-14 sm:h-14 rounded-full"
                        src={data?.postedBy?.image}
                        alt=""
                      />
                      <div className="">
                        <div className="flex items-center justify-between">
                          <div className="flex space-x-1 items-center">
                            <h2 className="font-semibold truncate">
                              {data?.postedBy?.userName}
                            </h2>
                            <h2 className="text-sm text-gray-500 hidden xl:inline truncate">
                              {data?.postedBy?.userName}
                            </h2>
                            -
                            <Moment
                              className="text-xs md:text-sm truncate text-gray-600 "
                              fromNow
                            >
                              {comment?.data().timestamp?.toDate()}
                            </Moment>
                          </div>
                        </div>
                        <span className=" break-all">
                          {comment.data().comment}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              : <div className="flex items-center justify-center mt-20 space-x-6">
                <EyeOffIcon className="w-12"/>
                <h2 className="text-lg ">Bu Paylaşıma Henüz Hiç Yorum Yapılmadı.</h2>
                </div>}
          </div>
          <div className="flex space-x-6 lg:space-x-2 items-center mt-4">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Yorum Yap"
              className="bg-gray-200 w-full outline-none h-12 text-lg px-4"
              type="text"
            />
            <button
              disabled={!input.trim()}
              onClick={Comment}
              className="disabled:bg-gray-300 lg:hidden bg-green-300 hover:bg-green-400 transition-all duration-200 p-2 text-lg font-semibold rounded-lg"
            >
              Gönder
            </button>
            <div className="hidden lg:block ">
              <button
               disabled={!input.trim()}
               onClick={Comment}
               className="disabled:bg-gray-300 w-18 disabled:cursor-auto bg-green-300 font-semibold rounded-md p-2 cursor-pointer transition-all duration-200"
              >
                Gönder
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Post;

export const getServerSideProps = async ({ params: { id } }) => {
  const query = `*[_type=="post"&&_id=="${id}"]{
    _id,
    caption,
      video{
       asset->{
         _id,
         url
       }
     },
     userId,
   postedBy->{
     _id,
     userName,
     image
   }
  }`;
  const res = await client.fetch(query);

  return {
    props: { data: res[0] },
  };
};
