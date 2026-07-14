import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronLeft,
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
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { useCurriculum, useLesson } from "../../features/courses/hooks/useCurriculum";
import { useLessonProgress } from "../../features/learning/hooks/useLessonProgress";
import { useLearningSectionData } from "../../features/learning/hooks/useLearningSectionData";
import { useCourseProgress } from "../../features/learning/hooks/useCourseProgress";
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

// Separate Section Accordion item for the sidebar.
// Uses the new Learning Section endpoint to load lessons + inline progress
// in a single request, replacing the previous dual useLessons + progress-map approach.
const SidebarSectionItem = ({
  sect,
  courseId,
  isCreatorOrAdmin,
  activeLessonId,
  onSelectLesson,
}) => {
  const [isOpen, setIsOpen] = useState(sect.order === 1);

  // Fetch lessons + per-lesson progress from the aggregated Learning endpoint.
  // Only fires when the accordion is open (lazy loading per section).
  const { data, isLoading: sectionLoading } = useLearningSectionData(
    courseId,
    sect._id,
    { enabled: isOpen }
  );

  const lessons = data?.section?.lessons ?? [];

  // Derive completion counts directly from server-side progress fields.
  const completedCount = lessons.filter((l) => l.progress?.completed).length;

  return (
    <div className="border-b border-slate-100 last:border-b-0 bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-all duration-150 text-left group"
      >
        <div className="min-w-0 flex-1">
          <h4 className="font-bold text-slate-800 text-sm leading-snug font-outfit group-hover:text-brand-600 transition-colors">
            {sect.title}
          </h4>
          <span className="text-[11px] text-slate-500 font-medium font-sans mt-0.5 block">
            {completedCount} of {lessons.length}
          </span>
        </div>
        <span className="text-slate-400 ml-2">
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
      </button>

      {isOpen && (
        <div className="bg-[#F8F9FD]/40 divide-y divide-slate-100">
          {sectionLoading ? (
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
              const isCompleted = !!les.progress?.completed;
              const displayOrder = (index + 1).toString().padStart(2, "0");

              return (
                <div
                  key={les._id}
                  onClick={() => onSelectLesson(les._id)}
                  className={`flex items-center justify-between px-5 py-3 cursor-pointer transition-all duration-150 border-l-4 ${
                    isSelected
                      ? "bg-brand-50/70 border-brand-600"
                      : "hover:bg-slate-50 border-transparent"
                  }`}
                >
                  <div className="flex gap-3 flex-1 min-w-0 pr-2">
                    <div className="min-w-0">
                      <p className={`text-xs font-semibold leading-tight ${
                        isSelected ? "text-brand-600" : "text-slate-700"
                      }`}>
                        <span className="text-slate-400 font-mono mr-1.5">{displayOrder}</span>
                        {les.title}
                      </p>
                      <span className="text-[10px] text-slate-400 font-medium font-outfit mt-1 block">
                        Video • {formatDuration(les.duration) || "Video"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    {isCompleted ? (
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                        <Check size={11} strokeWidth={3} />
                      </span>
                    ) : (
                      <span className="w-5 h-5 rounded-full border border-slate-200 flex items-center justify-center shrink-0" />
                    )}
                    <ShareButton courseId={courseId} lessonId={les._id} />
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
  const queryClient = useQueryClient();

  const isCreatorOrAdmin = profile?.role === "CREATOR";

  // Curriculum (sections list) and server-authoritative course progress
  const { sections, sectionsLoading } = useCurriculum(courseId, isCreatorOrAdmin);
  const { courseProgress, invalidateCourseProgress } = useCourseProgress(courseId, {
    enabled: !!courseId,
  });

  // Fetch the first section's learning data eagerly — the response includes
  // course.title which we use in the header, without an extra catalog call.
  const firstSectionId = sections?.[0]?._id ?? null;
  const { data: firstSectionData } = useLearningSectionData(courseId, firstSectionId, {
    enabled: !!firstSectionId,
  });
  const courseTitle = firstSectionData?.course?.title ?? "Course Classroom";

  // UI state
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("description"); // description | resources | qna
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

  // Ref to hold the latest saveProgress function to avoid dependency updates in the debounced function
  const saveProgressRef = useRef();
  useEffect(() => {
    saveProgressRef.current = async (lessonId, position) => {
      if (isCreatorOrAdmin || !lessonId) return;
      try {
        console.log(`[Progress] Saving position ${position} for lesson ${lessonId}`);
        const updatedProgress = await updateProgress(position);
        lastSavedPositionRef.current = position;

        // If completion status newly transitions to true, update cache in-place
        // and invalidate global course progress.
        if (updatedProgress?.completed) {
          if (activeLesson?.section) {
            const sectionQueryKey = ["learningSectionData", courseId, activeLesson.section];
            queryClient.setQueryData(sectionQueryKey, (oldData) => {
              if (!oldData || !oldData.section || !oldData.section.lessons) return oldData;
              const updatedLessons = oldData.section.lessons.map((les) => {
                if (les._id === lessonId) {
                  return {
                    ...les,
                    progress: {
                      completed: updatedProgress.completed,
                      completedAt: updatedProgress.completedAt,
                      lastPosition: updatedProgress.lastPosition,
                      maxPositionReached: updatedProgress.maxPositionReached,
                      watchDuration: updatedProgress.duration,
                    },
                  };
                }
                return les;
              });
              return {
                ...oldData,
                section: {
                  ...oldData.section,
                  lessons: updatedLessons,
                },
              };
            });
          }
          invalidateCourseProgress();
        }
      } catch (err) {
        console.error("Failed to save progress:", err);
      }
    };
  }, [updateProgress, isCreatorOrAdmin, activeLesson, courseId, queryClient, invalidateCourseProgress]);

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

  const handleEnded = (duration) => {
    setIsPlaying(false);
    if (!isCreatorOrAdmin && activeLessonId) {
      console.log("[Progress] Event: Ended. Saving immediately with position:", duration);
      const finalPosition = duration && duration > 0 ? duration : currentPositionRef.current;
      if (saveProgressDebouncedRef.current) {
        saveProgressDebouncedRef.current.cancel();
      }
      if (saveProgressRef.current) {
        saveProgressRef.current(activeLessonId, finalPosition);
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

  const overallCompletedCount = courseProgress?.completedLessons ?? 0;
  const totalLessons = courseProgress?.totalLessons ?? 0;
  const overallProgress = courseProgress?.progressPercentage ?? 0;

  const handleBack = () => {
    navigate(isCreatorOrAdmin ? `/creator/courses` : `/dashboard/courses`);
  };

  const handlePrevLesson = async () => {
    if (!activeLesson || !sections || sections.length === 0) return;
    const currentSectionId = activeLesson.section;
    
    const currentSectionRes = await queryClient.ensureQueryData({
      queryKey: ["learningSectionData", courseId, currentSectionId],
      queryFn: () => makeRequest(`/learning/courses/${courseId}/sections/${currentSectionId}`).then(r => r.data)
    });
    
    const currentSectionLessons = currentSectionRes?.section?.lessons || [];
    const currentIndex = currentSectionLessons.findIndex(l => l._id === activeLessonId);
    
    if (currentIndex > 0) {
      setActiveLessonId(currentSectionLessons[currentIndex - 1]._id);
    } else {
      const currentSectionIdx = sections.findIndex(s => s._id === currentSectionId);
      if (currentSectionIdx > 0) {
        const prevSection = sections[currentSectionIdx - 1];
        const prevSectionRes = await queryClient.ensureQueryData({
          queryKey: ["learningSectionData", courseId, prevSection._id],
          queryFn: () => makeRequest(`/learning/courses/${courseId}/sections/${prevSection._id}`).then(r => r.data)
        });
        const prevSectionLessons = prevSectionRes?.section?.lessons || [];
        if (prevSectionLessons.length > 0) {
          setActiveLessonId(prevSectionLessons[prevSectionLessons.length - 1]._id);
        }
      }
    }
  };

  const handleNextLesson = async () => {
    if (!activeLesson || !sections || sections.length === 0) return;
    const currentSectionId = activeLesson.section;
    
    const currentSectionRes = await queryClient.ensureQueryData({
      queryKey: ["learningSectionData", courseId, currentSectionId],
      queryFn: () => makeRequest(`/learning/courses/${courseId}/sections/${currentSectionId}`).then(r => r.data)
    });
    
    const currentSectionLessons = currentSectionRes?.section?.lessons || [];
    const currentIndex = currentSectionLessons.findIndex(l => l._id === activeLessonId);
    
    if (currentIndex >= 0 && currentIndex < currentSectionLessons.length - 1) {
      setActiveLessonId(currentSectionLessons[currentIndex + 1]._id);
    } else {
      const currentSectionIdx = sections.findIndex(s => s._id === currentSectionId);
      if (currentSectionIdx >= 0 && currentSectionIdx < sections.length - 1) {
        const nextSection = sections[currentSectionIdx + 1];
        const nextSectionRes = await queryClient.ensureQueryData({
          queryKey: ["learningSectionData", courseId, nextSection._id],
          queryFn: () => makeRequest(`/learning/courses/${courseId}/sections/${nextSection._id}`).then(r => r.data)
        });
        const nextSectionLessons = nextSectionRes?.section?.lessons || [];
        if (nextSectionLessons.length > 0) {
          setActiveLessonId(nextSectionLessons[0]._id);
        }
      }
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#F8F9FD] text-slate-800 font-sans overflow-hidden">
      {/* Classroom Header */}
      <header className="sticky top-0 h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0 select-none z-20">
        <div className="flex items-center gap-3.5 min-w-0">
          <button
            onClick={handleBack}
            className="w-8 h-8 rounded-full bg-[#EBF0F5] hover:bg-[#D9E2EC] flex items-center justify-center text-slate-700 hover:text-slate-900 transition-all shrink-0 cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft size={16} />
          </button>

          <h1 className="font-bold text-sm sm:text-base text-slate-800 truncate font-outfit max-w-[200px] md:max-w-md" title={courseTitle}>
            {courseTitle}
          </h1>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Progress indicator pill */}
          <div className="hidden sm:flex items-center gap-2 bg-[#F1F3F9] px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-700">
            <Film size={13} className="text-slate-500 fill-slate-500 stroke-none" />
            <span>
              {overallCompletedCount} of {totalLessons > 0 ? totalLessons : "?"} complete
            </span>
          </div>

          <div className="w-8 h-8 rounded-full bg-brand-50 border-brand-100 flex items-center justify-center font-bold text-xs text-brand-600">
            {profile?.username?.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Classroom Main Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Side: Video Player and Tabs Info */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-[#F8F9FD]">
          {/* Main Video Viewport Wrapper */}
          <div className="w-full pt-5 px-4 md:pt-6 md:px-10 pb-2 relative select-none max-w-5xl mx-auto">
            {/* The Aspect Ratio Video Box */}
            <div className="w-full aspect-video relative flex items-center justify-center bg-slate-950 rounded-xl overflow-hidden shadow-lg border border-slate-100/10">
              {lessonLoading || videoUrlLoading || playbackStatus === "loading" || progressLoading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-[3px] border-brand-200 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-[10px] uppercase font-bold tracking-widest font-mono text-brand-600">Loading Media...</span>
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
                          onClick={() => navigate(isCreatorOrAdmin ? `/creator/courses` : `/dashboard/courses`)}
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
                  <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-brand-600">
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
          <div className="max-w-5xl w-full mx-auto px-4 md:px-10 py-5">
            {/* Header row with Title on left and Tabs on right */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-3 mb-5">
              <div className="min-w-0">
                <h2 className="text-lg md:text-xl font-bold text-slate-850 font-outfit leading-tight">
                  {activeLesson ? activeLesson.title : "Select a lesson"}
                </h2>
                {activeLesson?.duration && (
                  <span className="text-[11px] text-slate-400 font-sans mt-1 block">
                    Duration: {formatDuration(activeLesson.duration)}
                  </span>
                )}
              </div>

              {/* Tab Navigation */}
              <div className="flex gap-4">
                {[
                  { key: "description", label: "Description" },
                  { key: "resources", label: "Resources" },
                  { key: "qna", label: "Q&A" },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`relative pb-3 text-sm font-bold font-outfit tracking-wide transition-colors cursor-pointer ${
                      activeTab === key
                        ? "text-brand-600 border-b-2 border-brand-600"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="text-xs sm:text-sm leading-relaxed text-slate-650 font-sans">
              {activeTab === "description" && (
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-slate-600 leading-relaxed font-outfit">
                    {activeLesson?.description || "No description provided for this lesson."}
                  </p>
                </div>
              )}

              {activeTab === "resources" && (
                <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center">
                  <FileText size={24} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-400 text-xs font-outfit">
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
                      className="flex-1 bg-white border border-slate-200 text-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-brand-200 focus:ring-2 focus:ring-brand/10 placeholder-slate-400"
                    />
                    <Button type="submit" variant="primary" className="py-2 px-4 shrink-0 text-xs font-bold font-outfit">
                      Post
                    </Button>
                  </form>

                  <div className="space-y-2">
                    {qnaList.length === 0 ? (
                      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center">
                        <HelpCircle size={24} className="text-slate-300 mx-auto mb-2" />
                        <p className="text-slate-400 text-xs font-outfit">
                          No questions yet. Be the first to ask!
                        </p>
                      </div>
                    ) : (
                      qnaList.map(item => (
                        <div key={item.id} className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                          <div className="flex justify-between items-center mb-1.5">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-brand-50 border-brand-100 flex items-center justify-center text-[9px] font-bold text-brand-600">
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
          {/* Sliding collapse toggle button on the left edge */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute left-[-16px] top-1/2 -translate-y-1/2 w-4 h-12 bg-white border border-slate-200 border-r-0 rounded-l-md flex items-center justify-center text-slate-400 hover:text-slate-600 shadow-sm z-20 cursor-pointer"
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? <ChevronRight size={10} /> : <ChevronLeft size={10} />}
          </button>

          {sidebarOpen && (
            <div className="w-full h-full flex flex-col overflow-hidden">
              {/* Sidebar Header */}
              <div className="px-4 py-3 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
                <h3 className="font-outfit font-bold text-slate-800 text-sm uppercase tracking-wider">Content</h3>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                  aria-label="Close sidebar"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Sidebar Content */}
              <div className="flex-1 overflow-y-auto bg-white">
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
                      courseId={courseId}
                      isCreatorOrAdmin={isCreatorOrAdmin}
                      activeLessonId={activeLessonId}
                      onSelectLesson={setActiveLessonId}
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
