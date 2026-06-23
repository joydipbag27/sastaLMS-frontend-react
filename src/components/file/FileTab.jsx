import React, { useState } from "react";
import FileUpload from "./FileUpload";
import FileLibrary from "./FileLibrary";

const FileTab = ({ currentProfile, onAddLog }) => {
  const [uploadedFiles, setUploadedFiles] = useState(() => {
    try {
      const saved = localStorage.getItem("veo_uploaded_files");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleUploadSuccess = (newFile) => {
    const updated = [newFile, ...uploadedFiles];
    setUploadedFiles(updated);
    localStorage.setItem("veo_uploaded_files", JSON.stringify(updated));
  };

  const handleRemoveFile = (key) => {
    const updated = uploadedFiles.filter((f) => f.key !== key);
    setUploadedFiles(updated);
    localStorage.setItem("veo_uploaded_files", JSON.stringify(updated));
  };

  const handleClearHistory = () => {
    if (!confirm("Are you sure you want to clear your local file history list? This will not affect files on S3.")) return;
    setUploadedFiles([]);
    localStorage.removeItem("veo_uploaded_files");
  };

  if (!currentProfile) {
    return (
      <div className="bg-slate-950 p-6 text-center border border-slate-800 rounded-lg">
        <p className="text-slate-400 italic">Please sign in to access file storage uploads and manager.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <FileUpload onUploadSuccess={handleUploadSuccess} onAddLog={onAddLog} />
      <FileLibrary
        uploadedFiles={uploadedFiles}
        onRemoveFile={handleRemoveFile}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
};

export default FileTab;
