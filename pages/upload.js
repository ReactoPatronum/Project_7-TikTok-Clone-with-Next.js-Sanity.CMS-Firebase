import React, { useState } from "react";
import { CloudUploadIcon } from "@heroicons/react/outline";
import { useRef } from "react";
import { client } from "../utils/client";
import { useAuth } from "../context/AuthContext";
import Modal from "react-modal";
import axios from "axios";
import toast from "react-hot-toast";
import Header from "../components/Header";

const Upload = () => {
  const uploadRef = useRef(null);
  const [uploadedVideo, setUploadedVideo] = useState();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const { user } = useAuth();

  const handleUpload = async () => {
    if (input && uploadVideo) {
      const document = {
        _type: "post",
        caption: input,
        video: {
          _type: "file",
          asset: {
            _type: "reference",
            _ref: uploadedVideo?._id,
          },
        },
        userId: user?.uid,
        postedBy: {
          _type: "postedBy",
          _ref: user?.uid,
        },
      };
      await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/sendPost`, document);
      toast.success("Video Paylaşıldı!");
      reset()
      
    } else {
      toast.error("Bir Hata Meydana Geldi!");
    }
  };

  if (!user)
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold">Lütfen Oturum Açınız.</h2>
      </div>
    );

  const uploadVideo = async (e) => {
    const selectedFile = e.target.files[0];
    const fileTypes = ["video/mp4", "video/webm"];

    if (fileTypes.includes(selectedFile.type)) {
      setLoading(true);
      const loadToast=toast.loading("Videonuz Yükleniyor Lütfen Bekleyin")
      client.assets
        .upload("file", selectedFile, {
          contentType: selectedFile.type,
          filename: selectedFile.name,
        })
        .then((data) => setUploadedVideo(data))
        .then(()=>toast.success("Video Başarı İle Yüklendi!", { id: loadToast }));
    }
  };

  const reset = () => {
    setLoading(false);
    setUploadedVideo();
    setOpen(false);
    setInput("");
  };

  return (
    <>
    <Header/>
    <div className="bg-[#F8F8F8] min-h-screen p-6">
      <div className="bg-white max-w-6xl mx-auto p-4 md:p-16 mt-5">
        <h2 className="text-3xl font-semibold">Video Yükle</h2>
        <p className="text-gray-500 mt-2">Hesabında bir video paylaş</p>
      </div>
      <div className=" bg-white md:flex max-w-6xl mx-auto md:space-x-10 p-4 md:p-16 min-h-[500px]">
        <div
          onClick={() => uploadRef.current.click()}
          className="max-h-[500px] p-6 border-dashed border-4 rounded-md cursor-pointer transition-all duration-200 hover:border-[#FE2C55] hover:bg-gray-100"
        >
          {uploadedVideo ? (
            <>
              <video
                src={uploadedVideo.url}
                controls
                loop
                className="rounded-xl md:max-w-sm"
              ></video>
              <h2 className="mt-3 break-words">
                <span className="text-red-600 font-bold">Dosya Adı:</span>
                {uploadedVideo?.originalFilename}
              </h2>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-6 ">
              <CloudUploadIcon className="w-9 text-gray-500 " />
              <h2 className="font-semibold text-lg">Yüklemek için video seç</h2>
              <h3 className="font-semibold">Veya bir dosya sürükle ve bırak</h3>
              {loading ? (
                <div className="animate-pulse max-w-[400px]">
                  <h3 className="text-xl mt-6 text-red-400">
                    Videonuz Yükleniyor...
                  </h3>
                  <h3 className="text-red-400">
                    Bu İşlem Videonun Boyutuna ve İnternet Hızınıza Bağlı Olarak
                    1-2 Dakika Sürebilir
                  </h3>
                </div>
              ) : (
                <>
                  <div className="text-gray-500 text-center space-y-4">
                    <p>MP4 veya WebM</p>
                    <p>720x1280 veya üstü çözünürlük</p>
                    <p>180 saniyeye kadar</p>
                    <p>50 mb&apos;dan az</p>
                    <p></p>
                  </div>
                  <button className="bg-[#FE2C55] py-2 px-10 text-white font-semibold transition-all duration-200 hover:bg-[#ee1943]">
                    Dosya Seçin
                  </button>
                </>
              )}
              <input
                onChange={(e) => uploadVideo(e)}
                hidden
                ref={uploadRef}
                type="file"
              />
            </div>
          )}
        </div>
        <div className="flex-1 p-4">
          <div className="space-y-2 ">
            <h3 className="text-lg font-semibold">Başlık</h3>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full border-gray-300 border-2 p-2 outline-none rounded-md"
              type="text"
            />
          </div>
          <div className="mt-10 ">
            <button
              onClick={() => setOpen(true)}
              className="hover:bg-gray-100 transition-all duration-200 border border-gray-500 py-3 px-12 rounded-md ml-4 "
            >
              At
            </button>
            <button
              disabled={input === "" || !uploadedVideo}
              onClick={handleUpload}
              className="bg-[#FE2C55] transition-all duration-200 hover:bg-[#ee1943] text-white font-semibold border border-gray-500 py-3 px-10 rounded-md ml-4 mt-2 disabled:bg-slate-400"
            >
              Gönder
            </button>
          </div>
        </div>
      </div>
      <Modal
        isOpen={open}
        ariaHideApp={false}
        onRequestClose={() => setOpen(false)}
        className="p-5 h-40 max-w-lg w-[90%] absolute top-24 left-[50%] translate-x-[-50%] bg-white border-2 rounded-xl shadow-md"
      >
        <div className="flex flex-col items-center">
          <h2 className="text-red-500 font-semibold">
            Bu Gönderiyi Gerçekten Silmek İstiyor Musunuz?
          </h2>
          <div className="space-x-6 mt-8">
            <button
              className=" bg-blue-400 py-2 px-4 text-white font-semibold hover:bg-red-400 transition-all duration-200"
              onClick={reset}
            >
              EVET
            </button>
            <button
              className=" bg-blue-400 py-2 px-4 text-white font-semibold hover:bg-red-400 transition-all duration-200"
              onClick={() => setOpen(false)}
            >
              HAYIR
            </button>
          </div>
        </div>
      </Modal>
    </div>
    </>
  );
};

export default Upload;
