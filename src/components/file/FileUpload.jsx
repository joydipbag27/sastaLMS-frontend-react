import React, { useState } from "react";
import { makeRequest } from "../../apiClient";
import Card from "../common/Card";
import Button from "../common/Button";
import Input from "../common/Input";

const FileUpload = ({ onUploadSuccess, onAddLog }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [contentType, setContentType] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [statusText, setStatusText] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
      setContentType(file.type || "application/octet-stream");
      setStatusText("");
      setUploadPercent(0);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }

    const finalKey = fileName.trim();
    if (!finalKey) {
      alert("S3 Key / Destination file name cannot be empty.");
      return;
    }

    setIsUploading(true);
    setUploadPercent(0);
    setStatusText("Requesting presigned upload URL...");

    // 1. Get Presigned S3 PUT URL
    const res = await makeRequest("/file/upload-url", {
      method: "POST",
      body: { fileName: finalKey, contentType },
    });

    if (!res.success) {
      setStatusText(`Presigned URL request failed: ${res.data?.error || "Unknown error"}`);
      setIsUploading(false);
      return;
    }

    const { uploadUrl, key } = res.data;
    setStatusText("Uploading binary payload directly to S3 bucket...");

    // 2. Perform direct S3 PUT upload via XHR to trace progress
    const startTime = Date.now();
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadPercent(percent);
      }
    });

    xhr.addEventListener("load", () => {
      const duration = Date.now() - startTime;
      const isSuccess = xhr.status >= 200 && xhr.status < 300;
      const responseText = xhr.statusText || "";

      // Log direct S3 operation to our global log window
      if (onAddLog) {
        onAddLog({
          timestamp: new Date().toLocaleTimeString(),
          method: "PUT (S3 Direct)",
          url: uploadUrl.substring(0, 75) + "...",
          body: `[Binary Payload: ${selectedFile.name}]`,
          status: xhr.status,
          response: responseText || `[Direct S3 code: ${xhr.status}]`,
          duration: `${duration}ms`,
          success: isSuccess,
        });
      }

      if (isSuccess) {
        setStatusText("Upload completed successfully!");
        onUploadSuccess({
          key,
          name: selectedFile.name,
          size: selectedFile.size,
          type: contentType,
          date: new Date().toLocaleString(),
        });
        setSelectedFile(null);
        setFileName("");
        setContentType("");
        setUploadPercent(0);
      } else {
        setStatusText(`S3 Upload failed: HTTP ${xhr.status}`);
      }
      setIsUploading(false);
    });

    xhr.addEventListener("error", () => {
      const duration = Date.now() - startTime;
      if (onAddLog) {
        onAddLog({
          timestamp: new Date().toLocaleTimeString(),
          method: "PUT (S3 Direct)",
          url: uploadUrl.substring(0, 75) + "...",
          body: `[Binary Payload: ${selectedFile.name}]`,
          status: 0,
          response: "Network Connection Timeout",
          duration: `${duration}ms`,
          success: false,
        });
      }
      setStatusText("Network error occurred during direct S3 transfer.");
      setIsUploading(false);
    });

    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.send(selectedFile);
  };

  return (
    <Card title="Upload File to S3" subtitle="Files are uploaded directly to the cloud storage bucket via presigned PUT URLs">
      <div className="space-y-4">
        {/* Upload Dropzone */}
        <div className="border-2 border-dashed border-slate-700 hover:border-sky-500 rounded-lg p-5 text-center cursor-pointer transition-colors relative bg-slate-900/40 hover:bg-slate-900/60">
          <input
            type="file"
            onChange={handleFileChange}
            disabled={isUploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          <div className="text-xs space-y-1">
            <p className="text-slate-300 font-bold">Drag and drop file here, or click to choose a file</p>
            <p className="text-slate-500">Supports documents, images, video or zip files</p>
          </div>
        </div>

        {/* Selected file details configuration */}
        {selectedFile && (
          <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-slate-500 block">Selected Name</span>
                <span className="text-slate-200 font-bold truncate block">{selectedFile.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block">File Size</span>
                <span className="text-slate-300 font-mono">{(selectedFile.size / 1024).toFixed(2)} KB</span>
              </div>
              <div>
                <span className="text-slate-500 block">Original Mime-Type</span>
                <span className="text-slate-300 truncate block">{selectedFile.type || "unknown"}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <Input
                label="Destination Key (S3 Filename)"
                id="upload-filename"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                disabled={isUploading}
                required
              />
              <Input
                label="Content Type Header"
                id="upload-content-type"
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                disabled={isUploading}
                required
              />
            </div>

            {/* Live Progress Bar */}
            {isUploading && (
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[10px] text-sky-400 font-bold">
                  <span>Transfer progress...</span>
                  <span>{uploadPercent}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-sky-500 h-1.5 transition-all duration-150"
                    style={{ width: `${uploadPercent}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 pt-1.5">
              <Button onClick={handleUpload} variant="success" isLoading={isUploading} className="text-xs py-1 px-3">
                {isUploading ? "Uploading..." : "Start Direct Upload"}
              </Button>
              <Button onClick={() => setSelectedFile(null)} variant="secondary" disabled={isUploading} className="text-xs py-1 px-3">
                Cancel
              </Button>
              {statusText && (
                <span className="text-xs text-sky-300 font-semibold truncate flex-1 block pl-2">
                  {statusText}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default FileUpload;
