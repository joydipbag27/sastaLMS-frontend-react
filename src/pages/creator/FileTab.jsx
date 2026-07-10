import React, { useState } from "react";
import { Film, Info, Link as LinkIcon } from "lucide-react";
import FileLibrary from "../../features/media/components/FileLibrary";
import ManualIngestionWizard from "../../features/media/components/ManualIngestionWizard";
import { useMedia } from "../../features/media/hooks/useMedia";
import { Link } from "react-router-dom";

const FileTab = ({ currentProfile }) => {
  const mediaHook = useMedia();
  const [activeTab, setActiveTab] = useState("manual");
  const [mediaFiles, setMediaFiles] = useState([]);

  if (!currentProfile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <Film size={28} className="text-slate-400" />
        </div>
        <p className="text-sm font-semibold text-slate-600">Sign in to access Media Manager</p>
        <p className="text-xs text-slate-400 mt-1">Manage your course video assets</p>
      </div>
    );
  }

  const handleDeleteMediaFile = (mediaId) => {
    setMediaFiles(prev => prev.filter(file => file._id !== mediaId));
  };

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight font-outfit">Media Manager</h2>
        <p className="text-sm text-slate-500 mt-1">
          Upload and verify adaptive HLS streams or view active assets.
        </p>
      </div>

      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("manual")}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-sm font-semibold transition-all ${
            activeTab === "manual"
              ? "border-indigo-650 text-indigo-650"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Film size={16} />
          Manual Ingestion (Local)
        </button>
        <button
          onClick={() => setActiveTab("library")}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-sm font-semibold transition-all ${
            activeTab === "library"
              ? "border-indigo-650 text-indigo-650"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Film size={16} />
          Media Session Library
        </button>
      </div>

      {activeTab === "manual" ? (
        <div className="space-y-6">
          <div className="flex gap-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-sm">
            <Info size={20} className="text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-indigo-700 mb-1">Standard video uploads are lesson-scoped</p>
              <p className="text-slate-600 text-xs leading-relaxed">
                If you prefer automated transcoding, open a course from the{" "}
                <strong className="text-slate-700">Courses</strong> tab, expand a section, and use the{" "}
                <strong className="text-slate-700">Upload Video</strong> button directly on the lesson.
                This manual flow is reserved for local processing, bypassing AWS costs.
              </p>
              <Link
                to="/courses"
                className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-indigo-650 hover:text-indigo-700 transition-colors"
              >
                <LinkIcon size={13} />
                Go to Courses
              </Link>
            </div>
          </div>

          <ManualIngestionWizard useMediaHook={mediaHook} />
        </div>
      ) : (
        <FileLibrary
          mediaFiles={mediaFiles}
          onDelete={handleDeleteMediaFile}
          useMediaHook={mediaHook}
        />
      )}
    </div>
  );
};

export default FileTab;
