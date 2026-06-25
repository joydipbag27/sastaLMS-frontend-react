import React, { useState } from "react";
import { Image } from "lucide-react";
import FileUpload from "./FileUpload";
import FileLibrary from "./FileLibrary";
import { useMedia } from "../../hooks/useMedia";

const FileTab = ({ currentProfile }) => {
  const mediaHook = useMedia();
  const [mediaFiles, setMediaFiles] = useState([]);

  const handleUploadSuccess = (media) => {
    setMediaFiles((prev) => [media, ...prev]);
  };

  const handleDelete = (mediaId) => {
    setMediaFiles((prev) => prev.filter((m) => m._id !== mediaId));
  };

  if (!currentProfile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-950/50 rounded-xl border border-slate-800/60">
        <div className="w-16 h-16 rounded-2xl bg-slate-800/60 flex items-center justify-center mb-4">
          <Image size={28} className="text-slate-600" />
        </div>
        <p className="text-sm font-semibold text-slate-400">Sign in to access Media Manager</p>
        <p className="text-xs text-slate-600 mt-1">Upload, preview, and manage your course media files</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-black text-slate-100 tracking-tight">Media Manager</h2>
        <p className="text-sm text-slate-500 mt-1">
          Upload and manage media files for your courses. Files are stored securely in cloud storage.
        </p>
      </div>

      {/* Upload section */}
      <FileUpload onUploadSuccess={handleUploadSuccess} useMediaHook={mediaHook} />

      {/* Library section */}
      <FileLibrary
        mediaFiles={mediaFiles}
        onDelete={handleDelete}
        useMediaHook={mediaHook}
      />
    </div>
  );
};

export default FileTab;
