import React, { useState } from "react";
import { Film, Info, Link as LinkIcon } from "lucide-react";
import FileLibrary from "../../features/media/components/FileLibrary";
import { useMedia } from "../../features/media/hooks/useMedia";
import { Link } from "react-router-dom";

const FileTab = ({ currentProfile }) => {
  const mediaHook = useMedia();
  // Media files would come from a future dedicated listing endpoint.
  // For now this panel is informational — uploads happen inside the course curriculum editor.
  const [mediaFiles] = useState([]);

  if (!currentProfile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-950/50 rounded-xl border border-slate-800/60">
        <div className="w-16 h-16 rounded-2xl bg-slate-800/60 flex items-center justify-center mb-4">
          <Film size={28} className="text-slate-600" />
        </div>
        <p className="text-sm font-semibold text-slate-400">Sign in to access Media Manager</p>
        <p className="text-xs text-slate-600 mt-1">Manage your course video assets</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-black text-slate-100 tracking-tight">Media Manager</h2>
        <p className="text-sm text-slate-500 mt-1">
          View and manage media assets attached to your course lessons.
        </p>
      </div>

      {/* Info banner: uploads are lesson-scoped */}
      <div className="flex gap-4 p-4 bg-sky-950/30 border border-sky-800/40 rounded-xl text-sm">
        <Info size={20} className="text-sky-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-sky-300 mb-1">Video uploads are lesson-scoped</p>
          <p className="text-slate-400 text-xs leading-relaxed">
            To upload or replace a video, open a course from the{" "}
            <strong className="text-slate-300">Courses</strong> tab, expand a section, and use the{" "}
            <strong className="text-slate-300">Upload Video</strong> button on the lesson. This ensures
            every video is properly associated with its lesson and processed through the HLS pipeline.
          </p>
          <Link
            to="/courses"
            className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors"
          >
            <LinkIcon size={13} />
            Go to Courses
          </Link>
        </div>
      </div>

      {/* Media library — empty until a listing endpoint is added */}
      <FileLibrary
        mediaFiles={mediaFiles}
        onDelete={() => {}}
        useMediaHook={mediaHook}
      />
    </div>
  );
};

export default FileTab;
