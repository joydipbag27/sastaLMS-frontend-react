import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  CheckCircle,
  Circle,
  Play,
  MessageSquare,
  FileText,
  Share2,
  Lock,
  Film,
  Compass,
  HelpCircle,
  BookOpen,
  Loader2,
  Check,
  PanelRightClose,
  PanelRightOpen,
  X
} from "lucide-react";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { useCurriculum, useLessons, useLesson } from "../../features/courses/hooks/useCurriculum";
import { useCourses } from "../../features/courses/hooks/useCourses";
import { useLessonProgress } from "../../features/learning/hooks/useLessonProgress";
import Button from "../../components/ui/Button";
import VideoPlayer from "../../components/shared/VideoPlayer";
import { makeRequest } from "../../services/api/apiClient";

const formatDuration = (seconds) => {
  if (!seconds) return "";
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  if (mins > 0) {
    return `${mins}m ${secs > 0 ? `${secs}s` : ""}`;
  }
  return `${secs}s`;
};

// Inline share feedback button (replaces alert)
const ShareButton = ({ courseId, lessonId }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/classroom/${courseId}?lesson=${lessonId}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`transition-all ${
        copied
          ? "text-emerald-500"
          : "text-slate-400 hover:text-slate-600"
      }`}
      title="Share Lesson"
    >
      {copied ? <Check size={13} /> : <Share2 size={13} />}
    </button>
  );
};

// Separate Section Accordion item for the sidebar
const SidebarSectionItem = ({
  sect,
  isCreatorOrAdmin,
  activeLessonId,
  onSelectLesson,
  completedLessons,
}) => {
  const [isOpen, setIsOpen] = useState(sect.order === 1);
  const { lessons, lessonsLoading } = useLessons(sect._id, isCreatorOrAdmin, isOpen);

  const completedCount = lessons.filter(l => completedLessons[l._id]).length;
  const progressPercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  return (
    <div className="border-b border-slate-200 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-all duration-150 text-left group"
      >
        <div className="min-w-0 flex-1">
          <h4 className="font-bold text-slate-800 text-sm leading-snug font-outfit group-hover:text-indigo-650 transition-colors">{sect.title}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-slate-500 font-medium font-sans">
              {completedCount}/{lessons.length} complete
            </span>
            {lessons.length > 0 && (
              <div className="w-16 h-1 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}
          </div>
        </div>
        <span className="text-slate-400 ml-2 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(0deg)' }}>
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
      </button>

      {isOpen && (
        <div className="bg-white divide-y divide-slate-100">
          {lessonsLoading ? (
            <div className="p-4 flex items-center justify-center gap-2 text-xs text-slate-400">
              <Loader2 size={14} className="animate-spin" />
              <span>Loading lessons...</span>
            </div>
          ) : lessons.length === 0 ? (
            <div className="p-4 flex flex-col items-center justify-center gap-1.5 text-xs text-slate-400">
              <BookOpen size={16} className="text-slate-300" />
              <span>No lessons in this section</span>
            </div>
          ) : (
            lessons.map((les, index) => {
              const isSelected = activeLessonId === les._id;
              const isCompleted = !!completedLessons[les._id];
              const displayOrder = (index + 1).toString().padStart(2, "0");

              return (
                <div
                  key={les._id}
                  onClick={() => onSelectLesson(les._id)}
                  className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? "bg-indigo-50 border-l-2 border-indigo-650"
                      : "hover:bg-slate-50 border-l-2 border-transparent"
                  }`}
                >
                  <div className="flex gap-3 flex-1 min-w-0 pr-2">
                    <span className={`text-[10px] font-mono font-bold shrink-0 w-5 h-5 rounded-md flex items-center justify-center ${
                      isSelected
                        ? "bg-indigo-650 text-white"
                        : isCompleted
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-slate-100 text-slate-500"
                    }`}>
                      {isCompleted ? <CheckCircle size={12} /> : displayOrder}
                    </span>
                    <div className="min-w-0">
                      <p className={`text-xs font-semibold leading-tight truncate ${
                        isSelected ? "text-indigo-650" : "text-slate-700"
                      }`}>
                        {les.title}
                      </p>
                      <span className="text-[9px] text-slate-400 font-medium font-outfit uppercase tracking-wider">
                        {formatDuration(les.duration) || "Video"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <ShareButton courseId={les.course} lessonId={les._id} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

// Simple debounce utility with flush capability
const createDebouncedFunc = (func, delay) => {
  let timeoutId;
  let latestArgs;

  const debounced = (...args) => {
    latestArgs = args;
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...latestArgs);
      timeoutId = null;
    }, delay);
  };

  debounced.flush = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      func(...latestArgs);
      timeoutId = null;
    }
  };

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced;
};

const LearningDashboard = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const isCreatorOrAdmin = ["CREATOR", "ADMIN"].includes(profile?.role);

  // Curriculum and course details
  const { sections, sectionsLoading } = useCurriculum(courseId, isCreatorOrAdmin);
  const { courses } = useCourses("catalog", {}, 1);
  const currentCourse = courses?.find(c => c._id === courseId) || { title: "Course Learning Panel" };

  // UI state
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("description"); // description | resources | qna
  const [completedLessons, setCompletedLessons] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);

  // Q&A Comments State
  const [qnaList, setQnaList] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");

  // Retrieve selected lesson details
  const { data: activeLesson, isLoading: lessonLoading } = useLesson(activeLessonId);

  // Lesson Progress Hook integration
  const { progress, progressLoading, updateProgress } = useLessonProgress(activeLessonId, isCreatorOrAdmin);

  const [videoUrl, setVideoUrl] = useState(null);
  const [videoUrlLoading, setVideoUrlLoading] = useState(false);
  const [playbackStatus, setPlaybackStatus] = useState("none"); // "none" | "loading" | "ready" | "processing" | "error"
  const [playbackError, setPlaybackError] = useState("");

  // Playback position refs for debounced/periodic saving
  const lastSavedPositionRef = useRef(0);
  const currentPositionRef = useRef(0);

  // Sync refs when new progress loads
  useEffect(() => {
    const initialPos = progress?.lastPosition || 0;
    lastSavedPositionRef.current = initialPos;
    currentPositionRef.current = initialPos;
  }, [activeLessonId, progressLoading, progress?.lastPosition]);

  // Sync completion status to local mapping to reflect instantly in the sidebar
  useEffect(() => {
    if (activeLessonId && progress) {
      setTimeout(() => {
        setCompletedLessons(prev => ({
          ...prev,
          [activeLessonId]: progress.completed,
        }));
      }, 0);
    }
  }, [activeLessonId, progress]);

  // Ref to hold the latest saveProgress function to avoid dependency updates in the debounced function
  const saveProgressRef = useRef();
  useEffect(() => {
    saveProgressRef.current = async (lessonId, position) => {
      if (isCreatorOrAdmin || !lessonId) return;
      try {
        console.log(`[Progress] Saving position ${position} for lesson ${lessonId}`);
        await updateProgress(position);
        lastSavedPositionRef.current = position;
      } catch (err) {
        console.error("Failed to save progress:", err);
      }
    };
  }, [updateProgress, isCreatorOrAdmin]);

  // Setup debounced progress updater
  const saveProgressDebouncedRef = useRef(null);
  useEffect(() => {
    saveProgressDebouncedRef.current = createDebouncedFunc((lessonId, position) => {
      if (saveProgressRef.current) {
        saveProgressRef.current(lessonId, position);
      }
    }, 1000);

    return () => {
      if (saveProgressDebouncedRef.current) {
        saveProgressDebouncedRef.current.cancel();
      }
    };
  }, []);

  // Flush any pending save on lesson switch or component unmount
  useEffect(() => {
    return () => {
      if (saveProgressDebouncedRef.current) {
        saveProgressDebouncedRef.current.flush();
      }
    };
  }, [activeLessonId]);

  // 30-second periodic save interval during active playback
  useEffect(() => {
    if (isCreatorOrAdmin || !activeLessonId || !isPlaying) return;

    const intervalId = setInterval(() => {
      const currentPos = currentPositionRef.current;
      const lastSaved = lastSavedPositionRef.current;

      if (Math.abs(currentPos - lastSaved) > 0.5) {
        console.log("[Progress] Periodic 30s tick: saving progress");
        if (saveProgressDebouncedRef.current) {
          saveProgressDebouncedRef.current(activeLessonId, currentPos);
        }
      }
    }, 30000);

    return () => clearInterval(intervalId);
  }, [isPlaying, activeLessonId, isCreatorOrAdmin]);

  // Event handlers to update references & trigger saves on important events
  const handleTimeUpdate = (time) => {
    currentPositionRef.current = time;
  };

  const handlePause = () => {
    setIsPlaying(false);
    if (!isCreatorOrAdmin && activeLessonId) {
      console.log("[Progress] Event: Pause. Saving immediately.");
      if (saveProgressDebouncedRef.current) {
        saveProgressDebouncedRef.current(activeLessonId, currentPositionRef.current);
        saveProgressDebouncedRef.current.flush();
      }
    }
  };

  const handleSeeked = (time) => {
    currentPositionRef.current = time;
    if (!isCreatorOrAdmin && activeLessonId) {
      console.log("[Progress] Event: Seeked. Saving immediately.");
      if (saveProgressDebouncedRef.current) {
        saveProgressDebouncedRef.current(activeLessonId, time);
        saveProgressDebouncedRef.current.flush();
      }
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (!isCreatorOrAdmin && activeLessonId) {
      console.log("[Progress] Event: Ended. Saving immediately.");
      if (saveProgressDebouncedRef.current) {
        saveProgressDebouncedRef.current(activeLessonId, currentPositionRef.current);
        saveProgressDebouncedRef.current.flush();
      }
    }
  };

  // Browser level exit events
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (saveProgressDebouncedRef.current) {
        saveProgressDebouncedRef.current.flush();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && saveProgressDebouncedRef.current) {
        saveProgressDebouncedRef.current.flush();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    let active = true;

    setVideoUrl(null);
    setVideoUrlLoading(true);
    setPlaybackStatus("loading");
    setPlaybackError("");

    if (activeLesson && activeLesson.video) {
      makeRequest(`/lesson/${activeLesson._id}/play`)
        .then((res) => {
          if (!active) return;
          if (res.success && res.data?.playlistUrl) {
            setVideoUrl(res.data.playlistUrl);
            setPlaybackStatus("ready");
          } else {
            setVideoUrl(null);
            if (res.status === 423) {
              setPlaybackStatus("processing");
            } else {
              setPlaybackStatus("error");
              setPlaybackError(res.data?.error || "Failed to load video stream.");
            }
          }
        })
        .catch((err) => {
          if (!active) return;
          console.error("Failed to fetch HLS playback stream URL:", err);
          setVideoUrl(null);
          setPlaybackStatus("error");
          setPlaybackError(err.message || "An unexpected network error occurred.");
        })
        .finally(() => {
          if (!active) return;
          setVideoUrlLoading(false);
        });
    } else {
      setVideoUrl(null);
      setPlaybackStatus("none");
      setVideoUrlLoading(false);
      setPlaybackError("");
    }

    return () => {
      active = false;
    };
  }, [activeLesson]);

  // Initialize first lesson
  useEffect(() => {
    if (sections && sections.length > 0 && !activeLessonId) {
      const firstSection = sections[0];
      if (firstSection) {
        const params = new URLSearchParams(window.location.search);
        const queryLessonId = params.get("lesson");
        if (queryLessonId) {
          setTimeout(() => {
            setActiveLessonId(queryLessonId);
          }, 0);
        } else {
          makeRequest(`/lesson/section/${firstSection._id}`).then(res => {
            if (res.success && res.data.lessons?.length > 0) {
              setActiveLessonId(res.data.lessons[0]._id);
            }
          });
        }
      }
    }
  }, [sections, activeLessonId]);

  const handlePostQuestion = (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    setQnaList(prev => [
      {
        id: Date.now(),
        user: profile?.username || "You",
        comment: newQuestion,
        replies: 0,
      },
      ...prev,
    ]);
    setNewQuestion("");
  };

  const overallCompletedCount = Object.keys(completedLessons).filter(k => completedLessons[k]).length;
  const totalLessons = Object.keys(completedLessons).length;
  const overallProgress = totalLessons > 0 ? Math.round((overallCompletedCount / totalLessons) * 100) : 0;

  const handleBack = () => {
    navigate(isCreatorOrAdmin ? `/admin/courses` : `/dashboard/courses`);
  };

  return (
    <div className="h-screen flex flex-col bg-[#F8F9FD] text-slate-800 font-sans overflow-hidden">
      {/* Classroom Header */}
      <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0 select-none z-20">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={handleBack}
            className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 hover:border-slate-300 transition-all shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft size={16} />
          </button>

          <h1 className="font-bold text-xs sm:text-sm text-slate-700 truncate pr-4 font-outfit max-w-[200px] md:max-w-md" title={currentCourse.title}>
            {currentCourse.title}
          </h1>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Progress indicator */}
          <div className="hidden sm:flex items-center gap-2.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
            <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-600 font-bold font-outfit whitespace-nowrap">
              {overallCompletedCount}/{totalLessons || "?"}
            </span>
          </div>

          {/* Sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all"
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
          </button>

          <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center font-bold text-xs text-indigo-650">
            {profile?.username?.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Classroom Main Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Side: Video Player and Tabs Info */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-[#F8F9FD]">
          {/* Main Video Viewport Wrapper */}
          <div className="w-full pt-5 px-4 md:pt-6 md:px-6 pb-2 flex flex-col items-center justify-center relative select-none">
            {/* The Aspect Ratio Video Box */}
            <div className="w-full max-w-5xl aspect-video relative flex items-center justify-center bg-slate-950 rounded-xl overflow-hidden">
              {lessonLoading || videoUrlLoading || playbackStatus === "loading" || progressLoading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-[3px] border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-[10px] uppercase font-bold tracking-widest font-mono text-indigo-400">Loading Media...</span>
                </div>
              ) : activeLesson ? (
                playbackStatus === "ready" && videoUrl ? (
                  <VideoPlayer
                    src={videoUrl}
                    initialTime={progress?.lastPosition || 0}
                    onTimeUpdate={handleTimeUpdate}
                    onPlay={() => setIsPlaying(true)}
                    onPause={handlePause}
                    onSeeked={handleSeeked}
                    onEnded={handleEnded}
                  />
                ) : playbackStatus === "processing" ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/95 p-6 text-center">
                    <div className="max-w-sm p-6 rounded-xl border border-amber-500/20 bg-slate-900 flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full border-[3px] border-amber-500 border-t-transparent animate-spin flex items-center justify-center">
                        <Film size={18} className="text-amber-500" />
                      </div>
                      <h3 className="text-amber-400 font-bold text-xs font-outfit uppercase tracking-wider">Processing Video</h3>
                      <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                        This video is being encoded for streaming. It will be ready shortly — try refreshing in a moment.
                      </p>
                    </div>
                  </div>
                ) : playbackStatus === "error" ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/95 p-6 text-center">
                    <div className="max-w-sm p-6 rounded-xl border border-rose-500/20 bg-slate-900 flex flex-col items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                        <Lock size={22} />
                      </div>
                      <div>
                        <h3 className="text-rose-400 font-bold text-xs font-outfit uppercase tracking-wider">Content Unavailable</h3>
                        <p className="text-[11px] text-slate-400 font-sans leading-relaxed mt-1.5">
                          {playbackError || "You must be enrolled in this course to view this lesson."}
                        </p>
                      </div>
                      <div className="flex gap-2 w-full mt-1">
                        <Button
                          onClick={() => navigate(`/courses/${courseId}`)}
                          variant="primary"
                          className="flex-1 py-2 text-xs font-bold font-outfit"
                        >
                          Enroll Now
                        </Button>
                        <Button
                          onClick={() => navigate(isCreatorOrAdmin ? `/admin/courses` : `/dashboard/courses`)}
                          variant="secondary"
                          className="flex-1 py-2 text-xs font-bold font-outfit"
                        >
                          Browse Courses
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 p-6 text-center">
                    <div className="max-w-xs p-6 rounded-xl border border-slate-700/50 bg-slate-900 flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                        <Film size={20} />
                      </div>
                      <h3 className="text-slate-300 font-bold text-xs font-outfit uppercase tracking-wider">No Video</h3>
                      <p className="text-[11px] text-slate-500 font-sans">
                        The instructor hasn't uploaded a video for this lesson yet.
                      </p>
                    </div>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 p-6 text-center max-w-sm gap-3">
                  <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-indigo-400">
                    <Compass size={24} />
                  </div>
                  <h3 className="text-slate-300 font-bold text-sm font-outfit uppercase tracking-wider">Ready to Learn?</h3>
                  <p className="text-[11px] text-slate-500 font-sans">
                    Select a lesson from the curriculum outline to start watching.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Under-Player Metadata & Tabs */}
          <div className="flex-1 max-w-4xl w-full mx-auto px-4 md:px-6 py-5 space-y-4">
            {/* Lesson Title + Status */}
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-slate-800 font-outfit leading-snug">
                  {activeLesson ? activeLesson.title : "Select a lesson"}
                </h2>
                {activeLesson?.duration && (
                  <span className="text-[11px] text-slate-500 font-sans mt-1 block">
                    {formatDuration(activeLesson.duration)}
                    {activeLesson?.description && (
                      <span className="text-slate-300 mx-1.5">·</span>
                    )}
                    {activeLesson?.description?.substring(0, 80)}
                    {activeLesson?.description?.length > 80 ? "..." : ""}
                  </span>
                )}
              </div>

              {activeLesson && !isCreatorOrAdmin && (
                <div className={`flex items-center gap-1.5 py-1 px-3 text-[10px] font-bold shrink-0 font-outfit rounded-full border ${
                  completedLessons[activeLesson._id]
                    ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                    : "bg-slate-50 text-slate-500 border-slate-200"
                }`}>
                  {completedLessons[activeLesson._id] ? (
                    <><CheckCircle size={12} /> Completed</>
                  ) : (
                    <><Play size={10} /> In Progress</>
                  )}
                </div>
              )}
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-0 border-b border-slate-200">
              {[
                { key: "description", label: "Description", icon: FileText },
                { key: "resources", label: "Resources", icon: FileText },
                { key: "qna", label: "Q&A", icon: MessageSquare },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`relative px-4 py-3 text-xs font-bold font-outfit tracking-wide transition-colors ${
                    activeTab === key
                      ? "text-indigo-650"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {label}
                  {activeTab === key && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-650 rounded-t-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="text-xs sm:text-sm leading-relaxed text-slate-600 font-sans">
              {activeTab === "description" && (
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-slate-600 leading-relaxed">
                    {activeLesson?.description || "No description provided for this lesson."}
                  </p>
                </div>
              )}

              {activeTab === "resources" && (
                <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center">
                  <FileText size={24} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-400 text-xs">
                    No resources attached to this lesson yet.
                  </p>
                </div>
              )}

              {activeTab === "qna" && (
                <div className="space-y-4">
                  <form onSubmit={handlePostQuestion} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask a question about this lesson..."
                      value={newQuestion}
                      onChange={e => setNewQuestion(e.target.value)}
                      className="flex-1 bg-white border border-slate-200 text-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 placeholder-slate-400"
                    />
                    <Button type="submit" variant="primary" className="py-2 px-4 shrink-0 text-xs font-bold font-outfit">
                      Post
                    </Button>
                  </form>

                  <div className="space-y-2">
                    {qnaList.length === 0 ? (
                      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center">
                        <HelpCircle size={24} className="text-slate-300 mx-auto mb-2" />
                        <p className="text-slate-400 text-xs">
                          No questions yet. Be the first to ask!
                        </p>
                      </div>
                    ) : (
                      qnaList.map(item => (
                        <div key={item.id} className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                          <div className="flex justify-between items-center mb-1.5">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-[9px] font-bold text-indigo-650">
                                {item.user.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-bold text-slate-800 text-xs font-outfit">{item.user}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <MessageSquare size={10} />
                              {item.replies} {item.replies === 1 ? "reply" : "replies"}
                            </span>
                          </div>
                          <p className="text-slate-600 text-xs leading-relaxed pl-7">{item.comment}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Collapsible Content Sidebar */}
        <div
          className={`h-full bg-white flex flex-col shrink-0 transition-all duration-300 relative select-none z-10 border-l border-slate-200 ${
            sidebarOpen ? "w-80 lg:w-96" : "w-0 border-l-0"
          }`}
        >
          {sidebarOpen && (
            <div className="w-full h-full flex flex-col overflow-hidden">
              {/* Sidebar Header */}
              <div className="px-4 py-3 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
                <h3 className="font-outfit font-bold text-slate-800 text-xs uppercase tracking-wider">Curriculum</h3>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                  aria-label="Close sidebar"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Sidebar Content */}
              <div className="flex-1 overflow-y-auto">
                {sectionsLoading ? (
                  <div className="p-6 flex flex-col items-center justify-center gap-2 text-xs text-slate-400">
                    <Loader2 size={16} className="animate-spin text-slate-300" />
                    <span>Loading curriculum...</span>
                  </div>
                ) : sections.length === 0 ? (
                  <div className="p-6 flex flex-col items-center justify-center gap-2 text-xs text-slate-400">
                    <BookOpen size={20} className="text-slate-300" />
                    <span>No sections available</span>
                  </div>
                ) : (
                  sections.map((sect) => (
                    <SidebarSectionItem
                      key={sect._id}
                      sect={sect}
                      isCreatorOrAdmin={isCreatorOrAdmin}
                      activeLessonId={activeLessonId}
                      onSelectLesson={setActiveLessonId}
                      completedLessons={completedLessons}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningDashboard;
