import React, { useState } from "react";
import { makeRequest } from "../../apiClient";
import Card from "../common/Card";
import Button from "../common/Button";

const FileLibrary = ({ uploadedFiles, onRemoveFile, onClearHistory }) => {
  const [previewingFileKey, setPreviewingFileKey] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loadingKey, setLoadingKey] = useState(null);

  const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  const handleDownload = async (key) => {
    setLoadingKey(`${key}-download`);
    const res = await makeRequest(`/file/download-url/${encodeURIComponent(key)}`);
    setLoadingKey(null);
    if (res.success) {
      const downloadUrl = res.data.downloadUrl;
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", key);
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert(res.data?.error || "Failed to retrieve download link");
    }
  };

  const handlePreview = async (key) => {
    if (previewingFileKey === key) {
      setPreviewingFileKey(null);
      setPreviewUrl("");
      return;
    }
    setLoadingKey(`${key}-preview`);
    const res = await makeRequest(`/file/download-url/${encodeURIComponent(key)}`);
    setLoadingKey(null);
    if (res.success) {
      setPreviewingFileKey(key);
      setPreviewUrl(res.data.downloadUrl);
    } else {
      alert(res.data?.error || "Failed to retrieve preview link");
    }
  };

  const copyKeyToClipboard = (key) => {
    navigator.clipboard.writeText(key);
    alert("S3 resource key copied to clipboard!");
  };

  return (
    <Card>
      <div className="flex justify-between items-center pb-2 border-b border-slate-800/80 mb-3">
        <div>
          <h3 className="text-base font-bold text-sky-400">File Manager Library</h3>
          <p className="text-xs text-slate-500">Tracked locally (localStorage). Delete actions here do not delete files from S3.</p>
        </div>
        {uploadedFiles.length > 0 && (
          <Button onClick={onClearHistory} variant="secondary" className="py-0.5 px-2 text-[10px] text-rose-400 border-rose-900/60 hover:bg-rose-950/20">
            Wipe Local History
          </Button>
        )}
      </div>

      {uploadedFiles.length === 0 ? (
        <div className="text-center py-8 text-slate-500 italic text-xs bg-slate-900/20 border border-slate-800 rounded">
          No files uploaded yet. Add a file to start tracking.
        </div>
      ) : (
        <div className="space-y-3">
          <div className="overflow-x-auto border border-slate-800 rounded">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-850 text-slate-400 font-bold">
                  <th className="p-2.5 border-r border-slate-850">File Key</th>
                  <th className="p-2.5 border-r border-slate-850">Size</th>
                  <th className="p-2.5 border-r border-slate-850">Mime Type</th>
                  <th className="p-2.5 border-r border-slate-850">Uploaded At</th>
                  <th className="p-2.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {uploadedFiles.map((file) => {
                  const isImage = file.type && file.type.startsWith("image/");
                  return (
                    <React.Fragment key={file.key}>
                      <tr className="border-b border-slate-850 hover:bg-slate-900/20">
                        <td className="p-2.5 border-r border-slate-850 text-slate-200 font-bold font-mono text-[11px] max-w-[200px] truncate" title={file.key}>
                          {file.key}
                        </td>
                        <td className="p-2.5 border-r border-slate-850 text-slate-300 font-mono text-[11px]">
                          {formatBytes(file.size)}
                        </td>
                        <td className="p-2.5 border-r border-slate-850 text-slate-400 font-mono text-[11px]">
                          {file.type || "binary"}
                        </td>
                        <td className="p-2.5 border-r border-slate-850 text-slate-500 text-[10px]">
                          {file.date}
                        </td>
                        <td className="p-2.5 flex items-center gap-1.5 flex-wrap">
                          <Button
                            onClick={() => handleDownload(file.key)}
                            variant="secondary"
                            isLoading={loadingKey === `${file.key}-download`}
                            className="px-2 py-0.5 text-[10px] font-medium"
                          >
                            Download
                          </Button>
                          {isImage && (
                            <Button
                              onClick={() => handlePreview(file.key)}
                              variant="secondary"
                              isLoading={loadingKey === `${file.key}-preview`}
                              className="px-2 py-0.5 text-[10px] font-medium text-violet-400 border-violet-850 hover:bg-violet-950/20"
                            >
                              {previewingFileKey === file.key ? "Hide" : "Preview"}
                            </Button>
                          )}
                          <Button
                            onClick={() => copyKeyToClipboard(file.key)}
                            variant="secondary"
                            className="px-2 py-0.5 text-[10px] font-medium"
                          >
                            Copy Key
                          </Button>
                          <Button
                            onClick={() => onRemoveFile(file.key)}
                            variant="danger"
                            className="px-2 py-0.5 text-[10px] font-medium"
                          >
                            Remove
                          </Button>
                        </td>
                      </tr>

                      {/* Inline Image Preview */}
                      {previewingFileKey === file.key && previewUrl && (
                        <tr className="bg-slate-950/80 border-b border-slate-850">
                          <td colSpan={5} className="p-3">
                            <div className="flex flex-col items-center bg-slate-900 border border-slate-800 rounded p-2 max-w-sm mx-auto shadow-inner">
                              <span className="text-[10px] text-slate-500 font-bold mb-1 block">Image Preview</span>
                              <img
                                src={previewUrl}
                                alt={file.key}
                                className="max-h-48 object-contain rounded border border-slate-750 bg-slate-950 shadow"
                              />
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Card>
  );
};

export default FileLibrary;
