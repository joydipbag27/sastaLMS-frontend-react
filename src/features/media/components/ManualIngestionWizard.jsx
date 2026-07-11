import React, { useState } from "react";
import { Play, Copy, CheckCheck, Loader2, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import StepFlow from "../../../components/shared/StepFlow";

const ManualIngestionWizard = ({ useMediaHook, initialLessonId = "", onSuccess }) => {
  const { createManualMedia, isCreatingManual, verifyManualMedia, isVerifyingManual } = useMediaHook;

  const [currentStep, setCurrentStep] = useState(1);
  const [lessonId, setLessonId] = useState(initialLessonId);
  const [mediaId, setMediaId] = useState("");

  const [copiedTextType, setCopiedTextType] = useState(null);
  const [error, setError] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedTextType(type);
    setTimeout(() => setCopiedTextType(null), 2000);
  };

  const handleCreateMedia = async (e) => {
    e.preventDefault();
    if (!lessonId.trim()) return;
    setError("");
    try {
      const data = await createManualMedia(lessonId.trim());
      if (data && data.mediaId) {
        setMediaId(data.mediaId);
        setCurrentStep(2);
      }
    } catch (err) {
      setError(err.message || "Failed to create manual media record.");
    }
  };

  const handleVerifyMedia = async () => {
    setError("");
    try {
      const data = await verifyManualMedia(mediaId);
      setVerificationResult(data.media);
      setCurrentStep(3);
      if (onSuccess) {
        onSuccess(data.media);
      }
    } catch (err) {
      setError(err.message || "Verification failed. Ensure your directories and files are exactly matched.");
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setLessonId("");
    setMediaId("");
    setError("");
    setVerificationResult(null);
  };

  const psScriptCommand = `.\\process-video.ps1 -InputFile ".\\input\\YOUR_VIDEO_FILE" -OutputRoot ".\\output" -MediaId "${mediaId}"`;
  const ffmpegCommand = `ffmpeg -i input.mp4 -codec:v libx264 -codec:a aac -map 0 -f hls -hls_time 6 -hls_playlist_type vod -master_pl_name ${mediaId}.m3u8 -var_stream_map "v:0,a:0 v:1,a:1" -b:v:0 800k -s:v:0 640x360 -b:v:1 2000k -s:v:1 1280x720 output_%v.m3u8`;
  const rclonePlaylistsCommand = `rclone copy ./output/${mediaId} veolms-b2:veoLMS/videos/${mediaId} --include "*.m3u8" --header-upload "Content-Type: application/vnd.apple.mpegurl" --progress --transfers 8 --checkers 16`;
  const rcloneSegmentsCommand = `rclone copy ./output/${mediaId} veolms-b2:veoLMS/videos/${mediaId} --include "*.ts" --header-upload "Content-Type: video/mp2t" --progress --transfers 8 --checkers 16`;

  const [showManualCommands, setShowManualCommands] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-sm">
      <StepFlow
        currentStep={currentStep}
        steps={["Register Media", "Local Processing & Upload", "Verify Status"]}
      />

      {error && (
        <div className="flex gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-600">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Error encountered</p>
            <p className="text-xs text-rose-500 mt-1">{error}</p>
          </div>
        </div>
      )}

      {currentStep === 1 && (
        <form onSubmit={handleCreateMedia} className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Step 1: Associate Media with Lesson</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Create a new media record mapped directly to a Lesson ID. This initiates a database entry in the
              PROCESSING state so that B2 matches against this ID during verification.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600">Lesson MongoDB Object ID</label>
            <input
              type="text"
              placeholder="e.g. 64b2f15fa841b80c3d90214a"
              value={lessonId}
              onChange={(e) => !initialLessonId && setLessonId(e.target.value)}
              disabled={!!initialLessonId}
              className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-brand-200 focus:ring-2 focus:ring-brand/10 transition-all font-mono disabled:opacity-60 disabled:cursor-not-allowed"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isCreatingManual}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-200 hover:bg-brand-300 text-[#111111] rounded-lg font-semibold text-sm transition-all duration-150 shadow-sm disabled:opacity-50"
          >
            {isCreatingManual ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Registering...
              </>
            ) : (
              <>
                <Play size={16} />
                Generate Media ID
              </>
            )}
          </button>
        </form>
      )}

      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800">Step 2: Transcode Locally & Upload to B2</h3>
              <p className="text-xs text-slate-500 mt-1">
                Process your video using local system resources, then upload the bundle directly.
              </p>
            </div>
            <span className="text-xs bg-brand-50 border border-brand-100 text-brand-200 font-mono px-2 py-1 rounded">
              Media ID generated
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500">Your New Media Folder ID</p>
              <p className="text-sm font-mono font-bold text-brand-200 mt-1 select-all">{mediaId}</p>
            </div>
            <button
              onClick={() => handleCopy(mediaId, "mediaId")}
              className="p-2 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 rounded-lg transition-colors border border-slate-200"
              title="Copy Media ID"
            >
              {copiedTextType === "mediaId" ? <CheckCheck size={16} className="text-emerald-500" /> : <Copy size={16} />}
            </button>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-brand-200 uppercase tracking-wider block font-outfit">Recommended Workflow</span>
                <span className="text-xs font-semibold text-slate-700">Run PowerShell Processing Script</span>
              </div>
              <button
                onClick={() => handleCopy(psScriptCommand, "psScript")}
                className="text-[11px] text-brand-200 hover:text-brand-300 flex items-center gap-1 font-semibold"
              >
                {copiedTextType === "psScript" ? "Copied!" : "Copy Command"}
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Place the source video in the <code className="bg-slate-200 px-1 rounded text-[10px]">HLSconvert/input/</code> folder on your local machine and run the command inside the <code className="bg-slate-200 px-1 rounded text-[10px]">HLSconvert/</code> directory:
            </p>
            <pre className="bg-white border border-slate-200 rounded-lg p-3 text-[11px] text-slate-600 font-mono overflow-x-auto select-all whitespace-pre-wrap leading-relaxed">
              {psScriptCommand}
            </pre>
          </div>

          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowManualCommands(!showManualCommands)}
              className="text-xs text-slate-500 hover:text-slate-700 font-semibold underline flex items-center gap-1"
            >
              {showManualCommands ? "Hide manual FFmpeg/rclone commands" : "Show manual FFmpeg/rclone commands"}
            </button>
          </div>

          {showManualCommands && (
            <div className="space-y-4 border-l-2 border-slate-200 pl-4 mt-2">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-600">1. Transcode via Local FFmpeg (HLS 360p + 720p)</span>
                  <button
                    onClick={() => handleCopy(ffmpegCommand, "ffmpeg")}
                    className="text-[11px] text-brand-200 hover:text-brand-300 flex items-center gap-1 font-semibold"
                  >
                    {copiedTextType === "ffmpeg" ? "Copied!" : "Copy Command"}
                  </button>
                </div>
                <pre className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[11px] text-slate-600 font-mono overflow-x-auto select-all whitespace-pre-wrap leading-relaxed">
                  {ffmpegCommand}
                </pre>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-600">2. Upload Playlists (*.m3u8) to B2</span>
                  <button
                    onClick={() => handleCopy(rclonePlaylistsCommand, "rclonePlaylists")}
                    className="text-[11px] text-brand-200 hover:text-brand-300 flex items-center gap-1 font-semibold"
                  >
                    {copiedTextType === "rclonePlaylists" ? "Copied!" : "Copy Command"}
                  </button>
                </div>
                <pre className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[11px] text-slate-600 font-mono overflow-x-auto select-all whitespace-pre-wrap leading-relaxed">
                  {rclonePlaylistsCommand}
                </pre>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-600">3. Upload Segments (*.ts) to B2</span>
                  <button
                    onClick={() => handleCopy(rcloneSegmentsCommand, "rcloneSegments")}
                    className="text-[11px] text-brand-200 hover:text-brand-300 flex items-center gap-1 font-semibold"
                  >
                    {copiedTextType === "rcloneSegments" ? "Copied!" : "Copy Command"}
                  </button>
                </div>
                <pre className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[11px] text-slate-600 font-mono overflow-x-auto select-all whitespace-pre-wrap leading-relaxed">
                  {rcloneSegmentsCommand}
                </pre>
              </div>
            </div>
          )}

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 space-y-1">
            <p className="font-bold text-slate-700">Expected B2 directory structure:</p>
            <ul className="list-disc list-inside space-y-0.5 pl-1 font-mono">
              <li>videos/{mediaId}/{mediaId}.m3u8 (MIME: application/vnd.apple.mpegurl)</li>
              <li>videos/{mediaId}/{mediaId}_360p.m3u8</li>
              <li>videos/{mediaId}/{mediaId}_720p.m3u8</li>
              <li>videos/{mediaId}/*.ts (MIME: video/mp2t)</li>
            </ul>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleVerifyMedia}
              disabled={isVerifyingManual}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-sm transition-all duration-150 shadow-sm disabled:opacity-50"
            >
              {isVerifyingManual ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Verifying B2 assets...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  Proceed to Verify
                </>
              )}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-600 rounded-lg font-medium text-sm transition-colors border border-slate-200"
            >
              Cancel & Start Over
            </button>
          </div>
        </div>
      )}

      {currentStep === 3 && verificationResult && (
        <div className="space-y-6 text-center py-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-500 mb-2">
            <CheckCircle2 size={32} />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-black text-slate-800">Manual Ingestion Complete!</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Your HLS segments and playlists have been successfully validated on Backblaze B2, and the lesson is updated.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 max-w-sm mx-auto grid grid-cols-2 gap-4 text-left">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500">Video Duration</p>
              <p className="text-sm font-bold text-slate-800 mt-0.5">
                {verificationResult.duration ? `${Math.round(verificationResult.duration)}s` : "Unknown"}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500">Folder Size</p>
              <p className="text-sm font-bold text-slate-800 mt-0.5">
                {(verificationResult.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            <div className="col-span-2 border-t border-slate-200 pt-3">
              <p className="text-[10px] uppercase font-bold text-slate-500">Media Status</p>
              <p className="text-sm font-bold text-emerald-600 mt-0.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {verificationResult.status}
              </p>
            </div>
          </div>

          <div className="pt-4 flex justify-center gap-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-200 hover:bg-brand-300 text-[#111111] rounded-lg font-semibold text-sm transition-all duration-150 shadow-sm"
            >
              <RefreshCw size={15} />
              Register New Video
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManualIngestionWizard;
