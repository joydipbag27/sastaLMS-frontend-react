import React, { useState } from "react";
import {
  Download, Trash2, Eye, EyeOff, Copy, CheckCheck,
  Image, Film, Music, FileText, Archive, File, Grid, List, RefreshCw,
} from "lucide-react";

const FileLibrary = ({ mediaFiles, onDelete, useMediaHook }) => {
  const { getDownloadUrl, deleteMedia, isDeleting, retryTransfer, isRetrying } = useMediaHook;
  const [view, setView] = useState("grid"); // "grid" | "list"
  const [loadingId, setLoadingId] = useState(null);
  const [previewId, setPreviewId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [retryingId, setRetryingId] = useState(null);

  const formatBytes = (bytes) => {
    if (!bytes) return "0 B";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const getFileTypeInfo = (mimeType) => {
    if (!mimeType) return { icon: File, label: "File", color: "text-slate-400", bg: "bg-slate-800" };
    if (mimeType.startsWith("image/")) return { icon: Image, label: "Image", color: "text-violet-400", bg: "bg-violet-500/10" };
    if (mimeType.startsWith("video/")) return { icon: Film, label: "Video", color: "text-sky-400", bg: "bg-sky-500/10" };
    if (mimeType.startsWith("audio/")) return { icon: Music, label: "Audio", color: "text-amber-400", bg: "bg-amber-500/10" };
    if (mimeType.includes("pdf")) return { icon: FileText, label: "PDF", color: "text-rose-400", bg: "bg-rose-500/10" };
    if (mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("tar"))
      return { icon: Archive, label: "Archive", color: "text-emerald-400", bg: "bg-emerald-500/10" };
    return { icon: FileText, label: "Document", color: "text-slate-400", bg: "bg-slate-800" };
  };

  const handleDownload = async (media) => {
    setLoadingId(`${media._id}-download`);
    try {
      const url = await getDownloadUrl(media._id);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", media.originalName || media.storageKey);
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert(err.message || "Failed to download");
    } finally {
      setLoadingId(null);
    }
  };

  const handlePreview = async (media) => {
    if (previewId === media._id) {
      setPreviewId(null);
      setPreviewUrl("");
      return;
    }
    setLoadingId(`${media._id}-preview`);
    try {
      const url = await getDownloadUrl(media._id);
      setPreviewId(media._id);
      setPreviewUrl(url);
    } catch (err) {
      alert(err.message || "Failed to load preview");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (media) => {
    if (!confirm(`Delete "${media.originalName || media.storageKey}"? This permanently removes it from cloud storage.`)) return;
    setDeletingId(media._id);
    try {
      await deleteMedia(media._id);
      onDelete(media._id);
      if (previewId === media._id) {
        setPreviewId(null);
        setPreviewUrl("");
      }
    } catch (err) {
      alert(err.message || "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  const handleRetryTransfer = async (media) => {
    setRetryingId(media._id);
    try {
      const result = await retryTransfer(media._id);
      alert(result?.message || "Retry complete!");
    } catch (err) {
      alert(err.message || "Retry failed");
    } finally {
      setRetryingId(null);
    }
  };

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isPreviewable = (mimeType) =>
    mimeType?.startsWith("image/") || mimeType?.startsWith("video/") || mimeType?.startsWith("audio/");

  // ─── Empty state ───
  if (mediaFiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 bg-slate-950/50 rounded-xl border border-slate-800/60">
        <div className="w-16 h-16 rounded-2xl bg-slate-800/60 flex items-center justify-center mb-4">
          <Image size={28} className="text-slate-600" />
        </div>
        <p className="text-sm font-semibold text-slate-400 mb-1">No media files yet</p>
        <p className="text-xs text-slate-600">Upload your first file to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header toolbar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-200">Media Library</h3>
          <p className="text-xs text-slate-500 mt-0.5">{mediaFiles.length} file{mediaFiles.length !== 1 ? "s" : ""} uploaded this session</p>
        </div>
        <div className="flex items-center gap-1 bg-slate-900 rounded-lg p-1 border border-slate-800">
          <button
            onClick={() => setView("grid")}
            className={`p-2 rounded-md transition-all ${view === "grid" ? "bg-slate-800 text-sky-400 shadow-sm" : "text-slate-500 hover:text-slate-300"}`}
          >
            <Grid size={16} />
          </button>
          <button
            onClick={() => setView("list")}
            className={`p-2 rounded-md transition-all ${view === "list" ? "bg-slate-800 text-sky-400 shadow-sm" : "text-slate-500 hover:text-slate-300"}`}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* ─── Grid View ─── */}
      {view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {mediaFiles.map((media) => {
            const { icon: TypeIcon, label, color, bg } = getFileTypeInfo(media.mimeType);
            const isThisPreview = previewId === media._id;

            return (
              <div
                key={media._id}
                className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden hover:border-slate-700 transition-all duration-200 group"
              >
                {/* Preview area / Icon */}
                {isThisPreview && previewUrl ? (
                  <div className="relative bg-slate-900 border-b border-slate-800">
                    {media.mimeType?.startsWith("image/") && (
                      <img src={previewUrl} alt={media.originalName} className="w-full h-40 object-contain bg-slate-950" />
                    )}
                    {media.mimeType?.startsWith("video/") && (
                      <video src={previewUrl} controls className="w-full h-40 object-contain bg-slate-950" />
                    )}
                    {media.mimeType?.startsWith("audio/") && (
                      <div className="p-4 flex items-center justify-center h-24">
                        <audio src={previewUrl} controls className="w-full" />
                      </div>
                    )}
                    <button
                      onClick={() => handlePreview(media)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-900/80 backdrop-blur text-slate-300 hover:text-white transition-colors"
                    >
                      <EyeOff size={14} />
                    </button>
                  </div>
                ) : (
                  <div className={`flex items-center justify-center h-24 ${bg} border-b border-slate-800`}>
                    <TypeIcon size={32} className={color} />
                  </div>
                )}

                {/* File info */}
                <div className="p-3.5">
                  <p className="text-sm font-semibold text-slate-200 truncate" title={media.originalName || media.storageKey}>
                    {media.originalName || media.storageKey}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${bg} ${color}`}>{label}</span>
                    <span className="text-[11px] text-slate-500">{formatBytes(media.size)}</span>
                    <span className="text-slate-700">·</span>
                    <span className="text-[11px] text-slate-600">{formatDate(media.createdAt)}</span>
                  </div>

                  {/* Status badge */}
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      media.status === "READY" ? "bg-emerald-500/10 text-emerald-400" :
                      media.status === "PROCESSING" ? "bg-amber-500/10 text-amber-400" :
                      media.status === "COPY_PENDING" ? "bg-orange-500/10 text-orange-400" :
                      media.status === "UPLOADING" ? "bg-sky-500/10 text-sky-400" :
                      "bg-rose-500/10 text-rose-400"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        media.status === "READY" ? "bg-emerald-400" :
                        media.status === "PROCESSING" ? "bg-amber-400 animate-pulse" :
                        media.status === "COPY_PENDING" ? "bg-orange-400 animate-pulse" :
                        media.status === "UPLOADING" ? "bg-sky-400 animate-pulse" :
                        "bg-rose-400"
                      }`} />
                      {media.status}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-800/60">
                    <button
                      onClick={() => handleDownload(media)}
                      disabled={loadingId === `${media._id}-download`}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors disabled:opacity-50"
                      title="Download"
                    >
                      <Download size={13} />
                      <span className="hidden sm:inline">Download</span>
                    </button>
                    {isPreviewable(media.mimeType) && (
                      <button
                        onClick={() => handlePreview(media)}
                        disabled={loadingId === `${media._id}-preview`}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-violet-400 text-xs font-medium transition-colors disabled:opacity-50"
                        title="Preview"
                      >
                        {isThisPreview ? <EyeOff size={13} /> : <Eye size={13} />}
                        <span className="hidden sm:inline">{isThisPreview ? "Hide" : "Preview"}</span>
                      </button>
                    )}
                    {media.status === "COPY_PENDING" && retryTransfer && (
                      <button
                        onClick={() => handleRetryTransfer(media)}
                        disabled={retryingId === media._id}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-orange-950/40 hover:bg-orange-950/70 text-orange-400 text-xs font-medium transition-colors disabled:opacity-50"
                        title="Retry pending file transfer"
                      >
                        {retryingId === media._id ? (
                          <div className="w-3 h-3 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <RefreshCw size={13} />
                        )}
                        <span className="hidden sm:inline">Retry</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleCopyId(media._id)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-medium transition-colors"
                      title="Copy Media ID"
                    >
                      {copiedId === media._id ? <CheckCheck size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    </button>
                    <button
                      onClick={() => handleDelete(media)}
                      disabled={deletingId === media._id}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-rose-400 text-xs font-medium transition-colors disabled:opacity-50 ml-auto"
                      title="Delete permanently"
                    >
                      {deletingId === media._id ? (
                        <div className="w-3.5 h-3.5 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 size={13} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ─── List View ─── */
        <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-bold uppercase text-[11px] tracking-wide">
                <th className="py-3 px-4">File</th>
                <th className="py-3 px-4 hidden sm:table-cell">Type</th>
                <th className="py-3 px-4 hidden md:table-cell">Size</th>
                <th className="py-3 px-4 hidden md:table-cell">Status</th>
                <th className="py-3 px-4 hidden lg:table-cell">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mediaFiles.map((media) => {
                const { icon: TypeIcon, label, color, bg } = getFileTypeInfo(media.mimeType);
                const isThisPreview = previewId === media._id;

                return (
                  <React.Fragment key={media._id}>
                    <tr className="border-b border-slate-800/60 hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                            <TypeIcon size={16} className={color} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-200 truncate max-w-[200px]" title={media.originalName || media.storageKey}>
                              {media.originalName || media.storageKey}
                            </p>
                            <p className="text-[10px] text-slate-600 font-mono truncate max-w-[200px]">{media._id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 hidden sm:table-cell">
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${bg} ${color}`}>{label}</span>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell text-slate-400 font-mono">{formatBytes(media.size)}</td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          media.status === "READY" ? "bg-emerald-500/10 text-emerald-400" :
                          media.status === "PROCESSING" ? "bg-amber-500/10 text-amber-400" :
                          media.status === "COPY_PENDING" ? "bg-orange-500/10 text-orange-400" :
                          media.status === "UPLOADING" ? "bg-sky-500/10 text-sky-400" :
                          "bg-rose-500/10 text-rose-400"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            media.status === "READY" ? "bg-emerald-400" :
                            media.status === "PROCESSING" ? "bg-amber-400 animate-pulse" :
                            media.status === "COPY_PENDING" ? "bg-orange-400 animate-pulse" :
                            media.status === "UPLOADING" ? "bg-sky-400 animate-pulse" :
                            "bg-rose-400"
                          }`} />
                          {media.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 hidden lg:table-cell text-slate-500">{formatDate(media.createdAt)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => handleDownload(media)}
                            disabled={loadingId === `${media._id}-download`}
                            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-sky-400 transition-colors disabled:opacity-50"
                            title="Download"
                          >
                            <Download size={14} />
                          </button>
                          {isPreviewable(media.mimeType) && (
                            <button
                              onClick={() => handlePreview(media)}
                              disabled={loadingId === `${media._id}-preview`}
                              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-violet-400 transition-colors disabled:opacity-50"
                              title="Preview"
                            >
                              {isThisPreview ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          )}
                          {media.status === "COPY_PENDING" && retryTransfer && (
                            <button
                              onClick={() => handleRetryTransfer(media)}
                              disabled={retryingId === media._id}
                              className="p-2 rounded-lg hover:bg-orange-950/40 text-orange-400 transition-colors disabled:opacity-50"
                              title="Retry pending transfer"
                            >
                              {retryingId === media._id ? (
                                <div className="w-3.5 h-3.5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <RefreshCw size={14} />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => handleCopyId(media._id)}
                            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition-colors"
                            title="Copy ID"
                          >
                            {copiedId === media._id ? <CheckCheck size={14} className="text-emerald-400" /> : <Copy size={14} />}
                          </button>
                          <button
                            onClick={() => handleDelete(media)}
                            disabled={deletingId === media._id}
                            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            {deletingId === media._id ? (
                              <div className="w-3.5 h-3.5 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Inline preview row */}
                    {isThisPreview && previewUrl && (
                      <tr className="bg-slate-900/60 border-b border-slate-800/60">
                        <td colSpan={6} className="p-4">
                          <div className="flex justify-center">
                            {media.mimeType?.startsWith("image/") && (
                              <img src={previewUrl} alt={media.originalName} className="max-h-64 rounded-lg border border-slate-800 object-contain bg-slate-950 shadow-lg" />
                            )}
                            {media.mimeType?.startsWith("video/") && (
                              <video src={previewUrl} controls className="max-h-64 rounded-lg border border-slate-800 bg-slate-950 shadow-lg" />
                            )}
                            {media.mimeType?.startsWith("audio/") && (
                              <audio src={previewUrl} controls className="w-full max-w-md" />
                            )}
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
      )}
    </div>
  );
};

export default FileLibrary;
