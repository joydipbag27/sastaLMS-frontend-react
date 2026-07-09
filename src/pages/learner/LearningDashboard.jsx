import { useState, useEffect, useRef } from "react";
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
  HelpCircle
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

  return (
    <div className="border-b border-slate-100">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-slate-50/20 hover:bg-slate-50/50 transition-all text-left"
      >
        <div>
          <h4 className="font-bold text-slate-800 text-sm leading-snug font-outfit">{sect.title}</h4>
          <span className="text-[11px] text-slate-500 font-medium font-sans">
            {completedCount} of {lessons.length} complete
          </span>
        </div>
        <span className="text-slate-400">
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
      </button>

      {isOpen && (
        <div className="bg-slate-50/10 divide-y divide-slate-100/50">
          {lessonsLoading ? (
            <div className="p-4 text-center text-xs italic text-slate-400">Loading lessons...</div>
          ) : lessons.length === 0 ? (
            <div className="p-4 text-center text-xs italic text-slate-400">No lessons inside this section</div>
          ) : (
            lessons.map((les, index) => {
              const isSelected = activeLessonId === les._id;
              const isCompleted = !!completedLessons[les._id];
              const displayOrder = (index + 1).toString().padStart(2, "0");

              return (
                <div
                  key={les._id}
                  onClick={() => onSelectLesson(les._id)}
                  className={`flex items-center justify-between p-3.5 cursor-pointer transition-all ${
                    isSelected ? "bg-indigo-50 border-l-2 border-indigo-650 text-indigo-650" : "hover:bg-slate-50/30"
                  }`}
                >
                  <div className="flex gap-3 flex-1 min-w-0 pr-2">
                    <span className={`text-xs font-mono font-bold shrink-0 ${isSelected ? "text-indigo-600" : "text-slate-400"}`}>
                      {displayOrder}
                    </span>
                    <div className="min-w-0">
                      <p className={`text-xs font-semibold leading-tight truncate ${isSelected ? "text-indigo-650 font-bold" : "text-slate-700"}`}>
                        {les.title}
                      </p>
                      <span className="text-[10px] text-slate-400 font-medium font-outfit uppercase tracking-wider">Video</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5" onClick={e => e.stopPropagation()}>
                    <div
                      className={`${isCompleted ? "text-emerald-600" : "text-slate-350"}`}
                    >
                      {isCompleted ? <CheckCircle size={16} /> : <Circle size={16} />}
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/classroom/${les.course}?lesson=${les._id}`);
                        alert("Lesson link copied to clipboard!");
                      }}
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                      title="Share Lesson"
                    >
                      <Share2 size={13} />
                    </button>
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

  const handleBack = () => {
    navigate(isCreatorOrAdmin ? `/admin/courses` : `/dashboard/courses`);
  };

  return (
    <div className="h-screen flex flex-col bg-[#F8F9FD] text-slate-800 font-sans overflow-hidden">
      {/* Immersive Classroom Header */}
      <header className="h-14 bg-white border-b border-slate-100 px-4 flex items-center justify-between shrink-0 select-none z-20 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={handleBack}
            className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all shrink-0"
          >
            <ArrowLeft size={16} />
          </button>
          
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-6 h-6 rounded-md bg-gradient-to-tr from-indigo-500 to-indigo-650 flex items-center justify-center font-black text-xs text-white shadow-sm">
              Pro
            </span>
          </div>

          <h1 className="font-bold text-xs sm:text-sm text-slate-700 truncate pr-4 font-outfit max-w-[200px] md:max-w-md" title={currentCourse.title}>
            {currentCourse.title}
          </h1>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full flex items-center gap-2 text-[10px] text-indigo-650 font-sans font-bold select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
            <span>{overallCompletedCount} lessons complete</span>
          </div>

          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-600">
            {profile?.username?.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Classroom Main Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Side: Video Player and Tabs Info */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-[#F8F9FD]">
          {/* Main Video Viewport Wrapper */}
          <div className="w-full bg-[#F8F9FD] pt-6 px-6 pb-2 flex flex-col items-center justify-center relative group select-none">
            {/* The Aspect Ratio Video Box (Video frame remains dark for theater layout) */}
            <div className="w-full max-w-5xl aspect-video relative flex items-center justify-center bg-slate-950 shadow-lg rounded-xl border border-slate-800/40 overflow-hidden">
              {lessonLoading || videoUrlLoading || playbackStatus === "loading" || progressLoading ? (
                <div className="flex flex-col items-center text-slate-400 animate-pulse gap-3">
                  <div className="w-10 h-10 border-[3px] border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-[10px] uppercase font-bold tracking-widest font-mono text-indigo-400">Loading Media Context...</span>
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
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 text-slate-350 p-6 text-center select-none backdrop-blur-sm">
                    <div className="max-w-md p-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 shadow-2xl flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full border-[3px] border-amber-500 border-t-transparent animate-spin mb-1 flex items-center justify-center">
                        <Film size={20} className="text-amber-500 animate-pulse" />
                      </div>
                      <h3 className="text-amber-400 font-bold text-xs font-outfit uppercase tracking-wider">Video Content Processing</h3>
                      <p className="text-xs text-slate-400 font-sans leading-relaxed">
                        We are formatting this video stream for adaptive HLS resolution. Please wait a moment and refresh.
                      </p>
                    </div>
                  </div>
                ) : playbackStatus === "error" ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/95 p-6 text-center select-none backdrop-blur-md">
                    <div className="max-w-md p-6 rounded-2xl border border-rose-500/20 bg-rose-50/5 shadow-2xl flex flex-col items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shadow-lg">
                        <Lock size={26} />
                      </div>
                      <div>
                        <h3 className="text-rose-400 font-bold text-xs font-outfit uppercase tracking-wider">Lecture Content Locked</h3>
                        <p className="text-xs text-slate-400 font-sans leading-relaxed mt-2">
                          {playbackError || "You must be actively enrolled in this course to view this lesson video."}
                        </p>
                      </div>
                      <div className="flex gap-2.5 w-full mt-2">
                        <Button
                          onClick={() => navigate(`/courses/${courseId}`)}
                          variant="primary"
                          className="flex-1 py-2 font-bold font-outfit text-xs"
                        >
                          View Course to Enroll
                        </Button>
                        <Button
                          onClick={() => navigate(isCreatorOrAdmin ? `/admin/courses` : `/dashboard/courses`)}
                          variant="secondary"
                          className="flex-1 py-2 font-bold font-outfit text-xs border border-slate-800 hover:bg-slate-800 text-slate-300"
                        >
                          Explore Catalog
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 p-6 text-center select-none">
                    <div className="max-w-sm p-6 rounded-2xl border border-slate-800 bg-slate-800/10 shadow-xl flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-850 border border-slate-800 flex items-center justify-center text-slate-400">
                        <Film size={22} />
                      </div>
                      <h3 className="text-slate-300 font-bold text-xs font-outfit uppercase tracking-wider">No Media Content</h3>
                      <p className="text-xs text-slate-500 font-sans">
                        This lesson metadata is ready, but the instructor hasn't uploaded a video stream yet.
                      </p>
                    </div>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 p-6 text-center max-w-sm gap-3">
                  <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 shadow-md">
                    <Compass size={24} className="animate-spin" style={{ animationDuration: '6s' }} />
                  </div>
                  <h3 className="text-slate-300 font-bold text-sm font-outfit uppercase tracking-wider">Ready to Learn?</h3>
                  <p className="text-xs text-slate-500 font-sans">
                    Please select a lecture or module from the curriculum outline on the right to start watching.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Under-Player Metadata & Tabs */}
          <div className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 space-y-5">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-800 font-outfit leading-snug">
                  {activeLesson ? activeLesson.title : "Select a lesson"}
                </h2>
                {activeLesson?.duration && (
                  <span className="text-[11px] text-slate-450 font-sans mt-1 block">Duration: {formatDuration(activeLesson.duration)}</span>
                )}
              </div>

              {activeLesson && !isCreatorOrAdmin && (
                <div className={`py-1.5 px-4 text-xs font-bold shrink-0 font-outfit rounded-lg border ${
                  completedLessons[activeLesson._id]
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                    : "bg-slate-50 text-slate-500 border-slate-200"
                }`}>
                  {completedLessons[activeLesson._id] ? "✓ Completed" : "In Progress"}
                </div>
              )}
            </div>

            {/* Premium LMS Navigation Tabs */}
            <div className="flex gap-6 border-b border-slate-100 text-xs font-bold font-outfit tracking-wide">
              <button
                onClick={() => setActiveTab("description")}
                className={`pb-2.5 transition-colors relative ${
                  activeTab === "description" ? "text-indigo-650 border-b-2 border-indigo-600 font-bold" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab("resources")}
                className={`pb-2.5 transition-colors relative ${
                  activeTab === "resources" ? "text-indigo-650 border-b-2 border-indigo-600 font-bold" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Resources
              </button>
              <button
                onClick={() => setActiveTab("qna")}
                className={`pb-2.5 transition-colors relative ${
                  activeTab === "qna" ? "text-indigo-650 border-b-2 border-indigo-600 font-bold" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                QnA
              </button>
            </div>

            {/* Tab Body Contents */}
            <div className="text-xs sm:text-sm leading-relaxed text-slate-650 font-sans">
              {activeTab === "description" && (
                <div className="space-y-2 bg-white p-4 rounded-xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.01)] text-slate-600">
                  <p>{activeLesson?.description || "No description provided for this lesson."}</p>
                </div>
              )}

              {activeTab === "resources" && (
                <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.01)] text-slate-500">
                  <p>No downloadable resources have been attached to this lesson yet.</p>
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
                      className="flex-1 bg-white border border-slate-200 text-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                    />
                    <Button type="submit" variant="primary" className="py-1.5 px-4 shrink-0 font-bold font-outfit">
                      Post
                    </Button>
                  </form>

                  <div className="space-y-2.5">
                    {qnaList.map(item => (
                      <div key={item.id} className="p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-slate-800 text-xs font-outfit">{item.user}</span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <MessageSquare size={11} />
                            {item.replies} replies
                          </span>
                        </div>
                        <p className="text-slate-500 text-xs leading-relaxed">{item.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Collapsible Content Sidebar */}
        <div
          className={`h-full border-l border-slate-100 bg-white flex flex-col shrink-0 transition-all duration-300 relative select-none z-10 ${
            sidebarOpen ? "w-80 md:w-96" : "w-0"
          }`}
        >
          {/* Toggle Collapsible Bar Trigger Button on Left Boundary */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute left-[-14px] top-4 w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-slate-800 flex items-center justify-center transition-all hover:scale-105 shadow-sm"
          >
            <span className="text-xs font-bold font-mono">
              {sidebarOpen ? ">" : "<"}
            </span>
          </button>

          {sidebarOpen && (
            <div className="w-full h-full flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/20">
                <h3 className="font-outfit font-bold text-slate-800 text-xs uppercase tracking-wider">Content Outline</h3>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {sectionsLoading ? (
                  <div className="p-6 text-center text-xs italic text-slate-400">Retrieving sections database...</div>
                ) : sections.length === 0 ? (
                  <div className="p-6 text-center text-xs italic text-slate-400">No sections in curriculum outline.</div>
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
