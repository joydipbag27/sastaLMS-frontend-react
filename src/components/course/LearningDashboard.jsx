import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ChevronRight, ChevronDown, CheckCircle, Circle, Play, MessageSquare, FileText, Share2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useCurriculum, useLessons, useLesson } from "../../hooks/useCurriculum";
import { useCourses } from "../../hooks/useCourses";
import Card from "../common/Card";
import Button from "../common/Button";

// Separate Section Accordion item for the sidebar
const SidebarSectionItem = ({
  sect,
  isCreatorOrAdmin,
  activeLessonId,
  onSelectLesson,
  completedLessons,
  toggleLessonCompletion,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const { lessons, lessonsLoading } = useLessons(sect._id, isCreatorOrAdmin);

  const completedCount = lessons.filter(l => completedLessons[l._id]).length;

  return (
    <div className="border-b border-slate-800">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-slate-900/40 hover:bg-slate-900/80 transition-colors text-left"
      >
        <div>
          <h4 className="font-bold text-slate-100 text-xs sm:text-[13px] leading-snug">{sect.title}</h4>
          <span className="text-[10px] text-slate-400 font-medium">
            {completedCount} of {lessons.length} complete
          </span>
        </div>
        <span className="text-slate-400">
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
      </button>

      {isOpen && (
        <div className="bg-slate-950/60 divide-y divide-slate-900/60">
          {lessonsLoading ? (
            <div className="p-4 text-center text-[10px] italic text-slate-500">Loading lessons...</div>
          ) : lessons.length === 0 ? (
            <div className="p-4 text-center text-[10px] italic text-slate-500">No lessons inside this section</div>
          ) : (
            lessons.map((les, index) => {
              const isSelected = activeLessonId === les._id;
              const isCompleted = !!completedLessons[les._id];
              const displayOrder = (index + 1).toString().padStart(2, "0");

              return (
                <div
                  key={les._id}
                  onClick={() => onSelectLesson(les._id)}
                  className={`flex items-center justify-between p-3.5 cursor-pointer transition-colors ${
                    isSelected ? "bg-slate-800/45 border-l-2 border-sky-500" : "hover:bg-slate-900/50"
                  }`}
                >
                  <div className="flex gap-3 flex-1 min-w-0 pr-2">
                    <span className={`text-[11px] font-mono font-bold shrink-0 ${isSelected ? "text-sky-400" : "text-slate-500"}`}>
                      {displayOrder}
                    </span>
                    <div className="min-w-0">
                      <p className={`text-[11px] font-medium leading-tight truncate ${isSelected ? "text-slate-100 font-bold" : "text-slate-300"}`}>
                        {les.title}
                      </p>
                      <span className="text-[9px] text-slate-500 font-medium">Video</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => toggleLessonCompletion(les._id)}
                      className={`transition-transform hover:scale-110 ${isCompleted ? "text-emerald-400" : "text-slate-500 hover:text-slate-400"}`}
                    >
                      {isCompleted ? <CheckCircle size={16} /> : <Circle size={16} />}
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/classroom/${les.course}?lesson=${les._id}`);
                        alert("Lesson link copied to clipboard!");
                      }}
                      className="text-slate-500 hover:text-slate-400 transition-colors"
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

  // Q&A Comments State
  const [qnaList, setQnaList] = useState([
    { id: 1, user: "Alice Smith", comment: "Is there a GitHub repository for this chapter?", replies: 1 },
    { id: 2, user: "Bob Miller", comment: "Can anyone explain the difference between dynamic typing and generic mapping?", replies: 3 }
  ]);
  const [newQuestion, setNewQuestion] = useState("");

  // Retrieve selected lesson details
  const { data: activeLesson, isLoading: lessonLoading } = useLesson(activeLessonId);

  // Initialize first lesson and completed mapping from localStorage
  useEffect(() => {
    if (sections && sections.length > 0 && !activeLessonId) {
      // Find first section, we'll try to find first lesson to set active
      const firstSection = sections[0];
      if (firstSection) {
        // Query param check or default
        const params = new URLSearchParams(window.location.search);
        const queryLessonId = params.get("lesson");
        if (queryLessonId) {
          setActiveLessonId(queryLessonId);
        } else {
          // fetch first lesson from API
          makeRequest(`/lesson/section/${firstSection._id}`).then(res => {
            if (res.success && res.data.lessons?.length > 0) {
              setActiveLessonId(res.data.lessons[0]._id);
            }
          });
        }
      }
    }
  }, [sections]);

  // Load completion states
  useEffect(() => {
    if (profile?._id && courseId) {
      const stored = localStorage.getItem(`veo_progress_${profile._id}_${courseId}`);
      if (stored) {
        try {
          setCompletedLessons(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [profile?._id, courseId]);

  const toggleLessonCompletion = (lesId) => {
    setCompletedLessons(prev => {
      const updated = { ...prev, [lesId]: !prev[lesId] };
      if (profile?._id && courseId) {
        localStorage.setItem(`veo_progress_${profile._id}_${courseId}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

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

  // Compute overall completion stats
  const totalLessonsCount = sections.length * 4; // Mock estimate or total lessons if available
  const overallCompletedCount = Object.keys(completedLessons).filter(k => completedLessons[k]).length;

  const handleBack = () => {
    navigate(isCreatorOrAdmin ? `/admin/courses` : `/dashboard/courses`);
  };

  return (
    <div className="h-screen flex flex-col bg-[#0b0f19] text-slate-100 font-sans overflow-hidden">
      {/* Immersive Classroom Header */}
      <header className="h-14 bg-[#0d1222] border-b border-slate-800/80 px-4 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={handleBack}
            className="w-8 h-8 rounded-full bg-slate-900 border border-slate-850 flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all shrink-0"
          >
            <ArrowLeft size={16} />
          </button>
          
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-6 h-6 rounded-md bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-black text-xs text-white shadow-md">
              Pro
            </span>
          </div>

          <h1 className="font-bold text-xs sm:text-[13px] text-slate-200 truncate pr-4 font-mono max-w-[200px] md:max-w-md" title={currentCourse.title}>
            {currentCourse.title}
          </h1>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-slate-900/80 border border-slate-800/60 px-3 py-1 rounded-full flex items-center gap-2 text-[10px] text-slate-400 font-mono font-bold select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
            <span>{overallCompletedCount} lessons complete</span>
          </div>

          <div className="w-8 h-8 rounded-full bg-sky-950 border-2 border-sky-850 flex items-center justify-center font-bold text-xs text-sky-400">
            {profile?.username?.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Classroom Main Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Side: Video Player and Tabs Info */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-[#0b0f19]">
          {/* Main Video Viewport Wrapper */}
          <div className="w-full bg-black flex flex-col items-center justify-center relative group select-none shadow-2xl">
            {/* The Aspect Ratio Video Box */}
            <div className="w-full max-w-[1020px] aspect-video relative flex items-center justify-center bg-slate-950 shadow-inner overflow-hidden">
              {lessonLoading ? (
                <div className="flex flex-col items-center text-slate-400 animate-pulse">
                  <div className="w-10 h-10 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <span className="text-[10px] uppercase font-bold tracking-widest font-mono">Loading Media Context...</span>
                </div>
              ) : activeLesson ? (
                /* In a real scenario, this key maps to an S3 download URL from B2 or standard video path */
                activeLesson.video ? (
                  <video
                    src={activeLesson.video}
                    controls
                    className="w-full h-full object-contain"
                    poster={currentCourse.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1020"}
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-slate-500 p-6 text-center select-none">
                    <Play className="text-slate-700 mb-3 hover:text-sky-500 transition-colors" size={48} />
                    <p className="text-slate-400 font-bold text-xs font-mono">Mock High-Fidelity Video Player</p>
                    <p className="text-[10px] text-slate-600 font-mono mt-1">This lesson is configured. Video URL would load from Backblaze B2.</p>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-500 p-6 text-center">
                  <Play className="text-slate-800 mb-3" size={48} />
                  <p className="text-slate-400 font-bold text-xs font-mono">Select a lesson from the outline to start learning</p>
                </div>
              )}
            </div>
          </div>

          {/* Under-Player Metadata & Tabs */}
          <div className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-800/80 pb-2">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-100 font-mono leading-snug">
                  {activeLesson ? activeLesson.title : "Select a lesson"}
                </h2>
                {activeLesson?.duration && (
                  <span className="text-[10px] text-slate-500 font-mono">Duration: {activeLesson.duration} minutes</span>
                )}
              </div>

              {activeLesson && (
                <Button
                  onClick={() => toggleLessonCompletion(activeLesson._id)}
                  variant={completedLessons[activeLesson._id] ? "success" : "secondary"}
                  className="py-1 px-3 text-[10px] font-bold shrink-0 font-mono"
                >
                  {completedLessons[activeLesson._id] ? "✓ Completed" : "Mark Complete"}
                </Button>
              )}
            </div>

            {/* Premium LMS Navigation Tabs */}
            <div className="flex gap-6 border-b border-slate-800/80 text-[11px] font-bold font-mono">
              <button
                onClick={() => setActiveTab("description")}
                className={`pb-2.5 transition-colors relative ${
                  activeTab === "description" ? "text-sky-400 border-b-2 border-sky-400" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab("resources")}
                className={`pb-2.5 transition-colors relative ${
                  activeTab === "resources" ? "text-sky-400 border-b-2 border-sky-400" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Resources
              </button>
              <button
                onClick={() => setActiveTab("qna")}
                className={`pb-2.5 transition-colors relative ${
                  activeTab === "qna" ? "text-sky-400 border-b-2 border-sky-400" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                QnA
              </button>
            </div>

            {/* Tab Body Contents */}
            <div className="text-[11px] leading-relaxed text-slate-300 font-mono">
              {activeTab === "description" && (
                <div className="space-y-2 bg-slate-900/20 p-4 rounded-lg border border-slate-800/50">
                  <p>{activeLesson?.description || "No description provided for this lesson."}</p>
                </div>
              )}

              {activeTab === "resources" && (
                <div className="space-y-3 bg-slate-900/20 p-4 rounded-lg border border-slate-800/50">
                  <p className="text-slate-400">Downloadable lesson materials:</p>
                  <div className="space-y-2">
                    <a
                      href="#"
                      onClick={e => e.preventDefault()}
                      className="flex items-center gap-2.5 text-sky-400 hover:underline p-2 rounded bg-slate-950/60 border border-slate-900"
                    >
                      <FileText size={14} />
                      <span>Chapter Code Snippets.zip (1.2 MB)</span>
                    </a>
                  </div>
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
                      className="flex-1 bg-slate-950 border border-slate-800 text-slate-100 rounded px-3 py-1.5 text-[11px] focus:outline-none focus:border-sky-500"
                    />
                    <Button type="submit" variant="primary" className="py-1 px-3 shrink-0 font-bold">
                      Post
                    </Button>
                  </form>

                  <div className="space-y-2.5">
                    {qnaList.map(item => (
                      <div key={item.id} className="p-3 bg-slate-900/30 rounded border border-slate-800/40">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-slate-200">{item.user}</span>
                          <span className="text-[9px] text-slate-500 flex items-center gap-1">
                            <MessageSquare size={10} />
                            {item.replies} replies
                          </span>
                        </div>
                        <p className="text-slate-400 text-[10px] leading-relaxed">{item.comment}</p>
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
          className={`h-full border-l border-slate-800/80 bg-[#0d1222] flex flex-col shrink-0 transition-all duration-300 relative select-none z-10 ${
            sidebarOpen ? "w-80 md:w-96" : "w-0"
          }`}
        >
          {/* Toggle Collapsible Bar Trigger Button on Left Boundary */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute left-[-14px] top-4 w-7 h-7 rounded-full bg-slate-850 border border-slate-800 text-slate-300 hover:text-slate-100 flex items-center justify-center transition-all hover:scale-105 shadow-lg"
          >
            <span className="text-[10px] font-bold">
              {sidebarOpen ? ">" : "<"}
            </span>
          </button>

          {sidebarOpen && (
            <div className="w-full h-full flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-800/80 bg-slate-900/20">
                <h3 className="font-mono font-bold text-slate-200 text-xs sm:text-[13px] uppercase tracking-wider">Content Outline</h3>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80">
                {sectionsLoading ? (
                  <div className="p-6 text-center text-[10px] italic text-slate-500 font-mono">Retrieving sections database...</div>
                ) : sections.length === 0 ? (
                  <div className="p-6 text-center text-[10px] italic text-slate-500 font-mono">No sections in curriculum outline.</div>
                ) : (
                  sections.map((sect) => (
                    <SidebarSectionItem
                      key={sect._id}
                      sect={sect}
                      isCreatorOrAdmin={isCreatorOrAdmin}
                      activeLessonId={activeLessonId}
                      onSelectLesson={setActiveLessonId}
                      completedLessons={completedLessons}
                      toggleLessonCompletion={toggleLessonCompletion}
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
