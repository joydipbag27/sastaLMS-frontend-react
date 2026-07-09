import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useCurriculum, useLessons } from "../../features/courses/hooks/useCurriculum";
import { useMedia } from "../../features/media/hooks/useMedia";
import FileUpload from "../../features/media/components/FileUpload";
import ManualIngestionWizard from "../../features/media/components/ManualIngestionWizard";
import { makeRequest } from "../../services/api/apiClient";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import {
  Play,
  Lock,
  Unlock,
  CheckCircle,
  GraduationCap,
  Clock,
  BookOpen,
  Star,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Award,
  Trash2,
  Edit,
  Plus,
  ArrowLeft,
  Shield,
  Video,
  Layers,
  Users,
  Calendar
} from "lucide-react";

const CourseImage = ({ src, alt, className = "" }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(!src);
  }, [src]);

  if (hasError || !src) {
    return (
      <div className={`relative group overflow-hidden w-full h-56 bg-gradient-to-br from-indigo-50 to-sky-50 flex flex-col items-center justify-center text-indigo-400 gap-1.5 ${className}`}>
        <GraduationCap size={36} className="stroke-[1.5] animate-pulse" />
        <span className="text-[10px] font-bold tracking-wider font-outfit uppercase">veoLMS Class</span>
        <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
          <div className="p-4 rounded-full bg-indigo-650/20 border border-indigo-400/40 text-indigo-600 transform scale-90 group-hover:scale-100 transition-all duration-300 shadow-lg shadow-indigo-500/10">
            <Play size={28} className="fill-current ml-0.5" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group overflow-hidden">
      <img
        src={src}
        alt={alt}
        onError={() => setHasError(true)}
        className={`w-full h-56 object-cover transform transition-transform duration-500 group-hover:scale-105 ${className}`}
      />
      <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
        <div className="p-4 rounded-full bg-indigo-650/20 border border-indigo-400/40 text-indigo-600 transform scale-90 group-hover:scale-100 transition-all duration-300 shadow-lg shadow-indigo-500/10">
          <Play size={28} className="fill-current ml-0.5" />
        </div>
      </div>
    </div>
  );
};

const formatDuration = (seconds) => {
  if (!seconds) return "";
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  if (mins > 0) {
    return `${mins}m ${secs > 0 ? `${secs}s` : ""}`;
  }
  return `${secs}s`;
};

const LessonRow = ({ les, canEdit, isEnrolled }) => {
  return (
    <div className="flex justify-between items-center p-3.5 rounded-xl bg-white border border-slate-100 hover:bg-slate-50/50 hover:border-indigo-100 transition-all duration-200">
      <div className="flex items-center gap-3.5 min-w-0">
        <span className="text-[10px] font-mono shrink-0 bg-indigo-50 text-indigo-650 font-bold px-2 py-0.5 rounded border border-indigo-100">
          L{les.order}
        </span>
        <div className="min-w-0">
          <p className="font-semibold text-slate-800 text-xs sm:text-sm truncate leading-tight hover:text-indigo-650 transition-colors">
            {les.title}
          </p>
          <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
            <Video size={10} className="text-slate-400" />
            Video {les.duration > 0 ? `(${formatDuration(les.duration)})` : ""}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 shrink-0 ml-3">
        {les.isPreview ? (
          <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1 font-outfit tracking-wide animate-pulse">
            <Unlock size={10} /> PREVIEW
          </span>
        ) : (!canEdit && !isEnrolled) ? (
          <span className="text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full text-[9px] font-medium flex items-center gap-1 font-outfit tracking-wider">
            <Lock size={10} /> LOCKED
          </span>
        ) : null}
      </div>
    </div>
  );
};

const SectionItem = ({
  sect,
  isCreatorOrAdmin,
  canEdit,
  courseId,
  onEditSectionClick,
  onDeleteSection,
  currentProfile,
  isEnrolled,
  handleEnroll,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { lessons, lessonsLoading, createLesson, updateLesson, deleteLesson, refetchLessons } = useLessons(sect._id, isCreatorOrAdmin, isExpanded);
  const mediaHook = useMedia();
  const { getLessonVideoHook } = mediaHook;
  const [uploadingLessonId, setUploadingLessonId] = useState(null);
  const [uploadMode, setUploadMode] = useState("standard"); // "standard" | "manual"
  const navigate = useNavigate();

  const handleLessonClick = (les) => {
    if (isCreatorOrAdmin || isEnrolled) {
      navigate(`/classroom/${courseId}?lesson=${les._id}`);
      return;
    }
    if (les.isPreview) {
      if (!currentProfile) {
        navigate(`/login?returnTo=${encodeURIComponent(`/classroom/${courseId}?lesson=${les._id}`)}`);
      } else {
        navigate(`/classroom/${courseId}?lesson=${les._id}`);
      }
      return;
    }
    if (!currentProfile) {
      navigate(`/login?returnTo=${encodeURIComponent(`/courses/${courseId}`)}`);
    } else {
      handleEnroll();
    }
  };

  // Lesson Form states
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDesc, setLessonDesc] = useState("");
  const [lessonVideo, setLessonVideo] = useState("");
  const [lessonIsPreview, setLessonIsPreview] = useState(false);
  const [lessonOrder, setLessonOrder] = useState(1);
  const [lessonFormLoading, setLessonFormLoading] = useState(false);

  const handleLessonSubmit = async (e) => {
    e.preventDefault();
    setLessonFormLoading(true);
    const body = {
      title: lessonTitle,
      description: lessonDesc,
      course: courseId,
      isPreview: lessonIsPreview,
      order: lessonOrder,
    };

    try {
      if (editingLessonId) {
        await updateLesson({ lessonId: editingLessonId, body });
        alert("Lesson updated!");
      } else {
        await createLesson(body);
        alert("Lesson created!");
      }
      resetLessonForm();
    } catch (err) {
      alert(err.message || "Lesson operation failed");
    } finally {
      setLessonFormLoading(false);
    }
  };

  const handleEditLessonClick = async (les) => {
    try {
      const res = await makeRequest(`/lesson/creator/${les._id}`);
      const fullLesson = res.success ? res.data.lesson : les;
      setEditingLessonId(fullLesson._id);
      setLessonTitle(fullLesson.title);
      setLessonDesc(fullLesson.description || "");
      setLessonVideo(fullLesson.video || "");
      setLessonIsPreview(fullLesson.isPreview || false);
      setLessonOrder(fullLesson.order || 1);
      setShowLessonForm(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;
    try {
      await deleteLesson(lessonId);
      alert("Lesson deleted!");
    } catch (err) {
      alert(err.message || "Failed to delete lesson");
    }
  };

  const resetLessonForm = () => {
    setLessonTitle("");
    setLessonDesc("");
    setLessonVideo("");
    setLessonIsPreview(false);
    setLessonOrder(1);
    setEditingLessonId(null);
    setShowLessonForm(false);
  };

  return (
    <div className="border border-slate-100 rounded-xl bg-white overflow-hidden shadow-sm hover:border-indigo-100 transition-all duration-300">
      {/* Section Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex justify-between items-center p-4 cursor-pointer bg-slate-50/20 hover:bg-slate-50/50 transition-all select-none"
      >
        <div className="flex items-center gap-3">
          <span className="text-indigo-650 font-mono font-bold text-[10px] bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-lg">
            S{sect.order}
          </span>
          <div className="min-w-0">
            <span className="font-bold text-slate-800 text-sm">{sect.title}</span>
            {sect.description && (
              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{sect.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          {canEdit && (
            <div className="flex items-center gap-1.5">
              <Button
                onClick={() => {
                  setIsExpanded(true);
                  setShowLessonForm(true);
                  setEditingLessonId(null);
                }}
                variant="success"
                className="px-2 py-1 text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 font-outfit"
              >
                + Lesson
              </Button>
              <Button
                onClick={() => onEditSectionClick(sect)}
                variant="secondary"
                className="px-2 py-1 text-[10px] font-bold font-outfit"
              >
                Edit
              </Button>
              <Button
                onClick={() => onDeleteSection(sect._id)}
                variant="danger"
                className="px-2 py-1 text-[10px] font-bold font-outfit"
              >
                Delete
              </Button>
            </div>
          )}
          <span className="text-slate-400 p-1 hover:text-slate-600 transition-colors">
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </span>
        </div>
      </div>

      {/* Section Lessons Body */}
      {isExpanded && (
        <div className="p-4 border-t border-slate-100 space-y-2 bg-slate-50/30">
          {lessonsLoading ? (
            <div className="text-center py-4 italic text-slate-500 text-[11px] font-mono">Retrieving lessons...</div>
          ) : lessons.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl italic text-slate-450 text-[11px] font-mono bg-white">
              No lessons inside this section yet.
            </div>
          ) : (
            <div className="space-y-2">
              {lessons.map((les) => (
                <div 
                  key={les._id} 
                  className="relative group border border-slate-100 rounded-xl bg-white overflow-hidden shadow-sm"
                >
                  <div 
                    onClick={() => handleLessonClick(les)}
                    className="cursor-pointer transition-all"
                  >
                    <LessonRow les={les} canEdit={canEdit} isEnrolled={isEnrolled} />
                  </div>
                  {canEdit && (
                    <div 
                      className="px-3 py-2 bg-slate-50/50 flex flex-wrap items-center justify-between border-t border-slate-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-2">
                        {les.video ? (
                          <span className="text-emerald-600 font-bold font-mono text-[9px] flex items-center gap-1">
                            ✅ Video Attached
                          </span>
                        ) : (
                          <span className="text-amber-600 font-medium font-mono text-[9px] flex items-center gap-1">
                            ⚠️ No Video Attached
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {!les.video && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              setUploadingLessonId(uploadingLessonId === les._id ? null : les._id);
                            }}
                            variant="secondary"
                            className="px-2 py-0.5 text-[9px] font-mono text-slate-600 hover:text-slate-800"
                          >
                            {uploadingLessonId === les._id ? "Close Uploader" : "Upload Video"}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {canEdit && uploadingLessonId === les._id && (
                    <div 
                      className="p-4 border-t border-slate-100 bg-slate-50 space-y-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Mode Toggle */}
                      <div className="flex gap-2 border-b border-slate-100 pb-3">
                        <button
                          type="button"
                          onClick={() => setUploadMode("standard")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            uploadMode === "standard"
                              ? "bg-indigo-650 text-white shadow-sm"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 border border-slate-200"
                          }`}
                        >
                          Standard Upload
                        </button>
                        <button
                          type="button"
                          onClick={() => setUploadMode("manual")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            uploadMode === "manual"
                              ? "bg-indigo-650 text-white shadow-sm"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 border border-slate-200"
                          }`}
                        >
                          Manual Ingestion (Local)
                        </button>
                      </div>

                      {uploadMode === "standard" ? (
                        <FileUpload
                          useMediaHook={getLessonVideoHook(les._id, !!les.video)}
                          onUploadSuccess={() => {
                            refetchLessons();
                            setUploadingLessonId(null);
                            alert("Video uploaded and attached successfully!");
                          }}
                        />
                      ) : (
                        <ManualIngestionWizard 
                          useMediaHook={mediaHook}
                          initialLessonId={les._id}
                          onSuccess={() => {
                            refetchLessons();
                          }}
                        />
                      )}
                    </div>
                  )}

                  {canEdit && (
                    <div 
                      className="absolute right-2 top-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditLessonClick(les);
                        }}
                        variant="secondary"
                        className="px-1.5 py-0.5 text-[9px] font-mono"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLesson(les._id);
                        }}
                        variant="danger"
                        className="px-1.5 py-0.5 text-[9px] font-mono"
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add Lesson form trigger */}
          {canEdit && !showLessonForm && (
            <Button
              onClick={() => setShowLessonForm(true)}
              variant="secondary"
              className="w-full py-1.5 text-[10px] font-mono border border-dashed border-slate-200 hover:border-slate-350 bg-white"
            >
              + Add Lesson to Section
            </Button>
          )}

          {/* Add/Edit Lesson Form block */}
          {canEdit && showLessonForm && (
            <div className="bg-white p-4 rounded-xl border border-slate-100 space-y-3 mt-3 shadow-sm">
              <h5 className="font-bold text-indigo-650 border-b border-slate-100 pb-2 mb-2 font-mono text-xs flex items-center gap-1.5">
                <Sparkles size={13} />
                {editingLessonId ? "Modify Lesson" : "New Lesson for Section"}
              </h5>
              <form onSubmit={handleLessonSubmit} className="space-y-3">
                <div>
                  <Input
                    label="Lesson Title"
                    id={`lesson-title-${sect._id}`}
                    required
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Input
                    label="Order Rank"
                    id={`lesson-order-${sect._id}`}
                    type="number"
                    required
                    value={lessonOrder}
                    onChange={(e) => setLessonOrder(parseInt(e.target.value) || 1)}
                  />
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-slate-500">Lesson Setting</span>
                    <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={lessonIsPreview}
                        onChange={(e) => setLessonIsPreview(e.target.checked)}
                        className="bg-white border border-slate-300 rounded text-indigo-600 focus:ring-indigo-500/20"
                      />
                      <span className="text-xs text-slate-700 font-bold">Enable Preview</span>
                    </label>
                  </div>
                </div>
                <Input
                  label="Lesson Summary / description"
                  id={`lesson-desc-${sect._id}`}
                  value={lessonDesc}
                  onChange={(e) => setLessonDesc(e.target.value)}
                />
                <div className="flex gap-2 pt-1">
                  <Button type="submit" variant="success" isLoading={lessonFormLoading} className="py-1">
                    {editingLessonId ? "Save Lesson" : "Create Lesson"}
                  </Button>
                  <Button
                    onClick={resetLessonForm}
                    variant="secondary"
                    className="py-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CourseDetails = ({ course: initialCourse, currentProfile, onBack }) => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const actualCourseId = initialCourse?._id || courseId;

  // React Query hook to fetch course details if not passed as a prop
  const { data: fetchedCourse, isLoading: courseLoading } = useQuery({
    queryKey: ["course", actualCourseId],
    queryFn: async () => {
      const res = await makeRequest(`/course/${actualCourseId}`);
      return res.success ? res.data.course : null;
    },
    enabled: !initialCourse && !!actualCourseId,
  });

  const course = initialCourse || fetchedCourse;

  const canEdit = currentProfile && ["CREATOR", "ADMIN"].includes(currentProfile.role);
  const isStudent = currentProfile && currentProfile.role === "STUDENT";
  const isCreatorOrAdmin = canEdit;

  // React Query hook for sections and enrollment
  const {
    sections,
    sectionsLoading: loading,
    enroll,
    enrollLoading,
    enrollmentStatus,
    createSection,
    updateSection,
    deleteSection,
  } = useCurriculum(actualCourseId, isCreatorOrAdmin);

  // Section Form states
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [sectionTitle, setSectionTitle] = useState("");
  const [sectionDesc, setSectionDesc] = useState("");
  const [sectionOrder, setSectionOrder] = useState(1);
  const [sectionFormLoading, setSectionFormLoading] = useState(false);

  const handleEnroll = async () => {
    if (enrollLoading) return;
    if (!currentProfile) {
      navigate("/login");
      return;
    }
    if (course.price > 0) {
      navigate(`/dashboard/checkout/${course._id}`);
      return;
    }

    try {
      await enroll();
      alert("Enrolled successfully!");
    } catch (err) {
      alert(err.message || "Enrollment failed");
    }
  };

  const handleSectionSubmit = async (e) => {
    e.preventDefault();
    setSectionFormLoading(true);
    const body = {
      title: sectionTitle,
      description: sectionDesc,
      order: sectionOrder,
    };

    try {
      if (editingSectionId) {
        await updateSection({ sectionId: editingSectionId, body });
        alert("Section updated!");
      } else {
        await createSection(body);
        alert("Section created!");
      }
      resetSectionForm();
    } catch (err) {
      alert(err.message || "Section operation failed");
    } finally {
      setSectionFormLoading(false);
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!confirm("Are you sure? Deleting a section cascades to delete all lessons inside it.")) return;
    try {
      await deleteSection(sectionId);
      alert("Section deleted!");
    } catch (err) {
      alert(err.message || "Failed to delete section");
    }
  };

  const handleEditSectionClick = (sect) => {
    setEditingSectionId(sect._id);
    setSectionTitle(sect.title);
    setSectionDesc(sect.description || "");
    setSectionOrder(sect.order || 1);
    setShowSectionForm(true);
  };

  const resetSectionForm = () => {
    setShowSectionForm(false);
    setEditingSectionId(null);
    setSectionTitle("");
    setSectionDesc("");
    setSectionOrder(1);
  };

  const isEnrolled = enrollmentStatus === "enrolled";

  if (courseLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400 relative">
        <div className="w-10 h-10 border-[3px] border-indigo-600 border-t-transparent rounded-full animate-spin mb-5"></div>
        <p className="font-mono text-xs uppercase font-bold tracking-widest text-indigo-650">Loading Course Details...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-20 font-mono text-xs text-slate-500 bg-white border border-dashed border-slate-200 rounded-lg max-w-5xl mx-auto shadow-sm">
        <p className="font-bold">Course Not Found</p>
        <Button onClick={onBack || (() => navigate(-1))} variant="secondary" className="mt-4 py-1.5 px-4 font-mono font-bold">
          ← Go Back
        </Button>
      </div>
    );
  }

  const handleBack = onBack || (() => navigate(-1));

  return (
    <div className="space-y-8 font-sans text-sm relative pb-16">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Navigation and Top Bar */}
      <div className="flex items-center justify-between relative z-10">
        <Button onClick={handleBack} variant="secondary" className="px-4 py-2 font-bold font-outfit text-xs border border-slate-200 bg-white hover:bg-slate-50 flex items-center gap-2">
          <ArrowLeft size={14} /> Back to Catalog
        </Button>
        {isCreatorOrAdmin && (
          <Link to={`/classroom/${course._id}`}>
            <Button variant="primary" className="px-4 py-2 font-bold font-outfit text-xs flex items-center gap-1.5">
              <GraduationCap size={15} /> Preview Classroom
            </Button>
          </Link>
        )}
      </div>

      {/* Hero Header Section */}
      <div className="relative z-10 border-b border-slate-200 pb-8 space-y-4">
        <div className="flex flex-wrap gap-2">
          <span className="bg-indigo-50 text-indigo-600 border border-indigo-100 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-outfit">
            {course.category}
          </span>
          <span className="bg-indigo-50 text-indigo-600 border border-indigo-100 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-outfit">
            {course.level}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black font-outfit text-slate-800 tracking-tight leading-tight max-w-4xl">
          {course.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Instructor:</span>
            <span className="font-semibold text-indigo-600">{course.creator?.username || course.creator || "LMS Tutor"}</span>
          </div>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 items-start">
        {/* Left Area: Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Description Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold font-outfit text-slate-800 tracking-wide">Course Overview</h3>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.01)] leading-relaxed text-xs sm:text-sm text-slate-600 space-y-4">
              <p>{course.description || "No description provided for this course yet."}</p>
            </div>
          </div>

          {/* Section Creation Form (Admins only) */}
          {showSectionForm && (
            <Card title={editingSectionId ? "Edit Section" : "Add Section"} subtitle="Group lessons inside this course">
              <form onSubmit={handleSectionSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Section Title"
                    id="section-title"
                    required
                    value={sectionTitle}
                    onChange={(e) => setSectionTitle(e.target.value)}
                  />
                  <Input
                    label="Order Rank"
                    id="section-order"
                    type="number"
                    required
                    value={sectionOrder}
                    onChange={(e) => setSectionOrder(parseInt(e.target.value) || 1)}
                  />
                </div>
                <Input
                  label="Description (Optional)"
                  id="section-desc"
                  value={sectionDesc}
                  onChange={(e) => setSectionDesc(e.target.value)}
                />
                <div className="flex gap-3">
                  <Button type="submit" variant="success" isLoading={sectionFormLoading} className="font-outfit">
                    {editingSectionId ? "Save Changes" : "Create Section"}
                  </Button>
                  <Button
                    onClick={resetSectionForm}
                    variant="secondary"
                    className="font-outfit"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Curriculum Accordion */}
          <div className="space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-3 border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold font-outfit text-slate-800 tracking-wide">Course Curriculum</h3>
              {canEdit && !showSectionForm && (
                <Button onClick={() => setShowSectionForm(true)} variant="primary" className="py-1.5 px-3 font-outfit text-xs flex items-center gap-1.5">
                  <Plus size={14} /> Add Section
                </Button>
              )}
            </div>

            {loading ? (
              <div className="text-center py-10 italic text-slate-400 text-xs">Loading curriculum details...</div>
            ) : sections.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl italic text-slate-400 text-xs bg-white shadow-sm">
                No curriculum sections added yet.
              </div>
            ) : (
              <div className="space-y-3">
                {sections.map((sect) => (
                  <SectionItem
                    key={sect._id}
                    sect={sect}
                    isCreatorOrAdmin={isCreatorOrAdmin}
                    canEdit={canEdit}
                    courseId={course._id}
                    onEditSectionClick={handleEditSectionClick}
                    onDeleteSection={handleDeleteSection}
                    currentProfile={currentProfile}
                    isEnrolled={isEnrolled}
                    handleEnroll={handleEnroll}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Area: Dynamic Action Enrollment CTA Card */}
        <div className="space-y-6 md:sticky md:top-24">
          <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm bg-white">
            <CourseImage src={course.thumbnailUrl} alt={course.title} />
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-md shadow-slate-100/50 space-y-5">
            <div>
              <span className="text-slate-400 text-[10px] font-bold block uppercase tracking-widest mb-1.5 font-outfit">
                {isEnrolled ? "YOUR ACCESS STATUS" : "COURSE TUITION"}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-800 font-outfit tracking-tight">
                  {isEnrolled ? "UNLOCKED" : course.price === 0 ? "FREE" : `$${course.price}`}
                </span>
                {!isEnrolled && course.price > 0 && <span className="text-xs text-slate-400 font-bold font-outfit">USD</span>}
              </div>
            </div>

            <div className="space-y-3">
              {!currentProfile ? (
                <Button
                  onClick={() => navigate(`/login?returnTo=${encodeURIComponent(window.location.pathname)}`)}
                  variant="primary"
                  className="w-full py-3 text-xs font-bold font-outfit uppercase tracking-wider"
                >
                  {course.price === 0 ? "Login to Enroll" : "Login to Buy"}
                </Button>
              ) : isCreatorOrAdmin ? (
                <Link to={`/classroom/${course._id}`} className="block">
                  <Button variant="success" className="w-full py-3 text-xs font-bold font-outfit uppercase tracking-wider flex items-center justify-center gap-2">
                    <GraduationCap size={16} />
                    Start Learning (Creator)
                  </Button>
                </Link>
              ) : isEnrolled ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 text-xs font-semibold leading-snug">
                    <CheckCircle size={16} className="shrink-0 text-emerald-500" />
                    <span>You are actively enrolled in this classroom!</span>
                  </div>
                  <Link to={`/classroom/${course._id}`} className="block">
                    <Button variant="success" className="w-full py-3 text-xs font-bold font-outfit uppercase tracking-wider flex items-center justify-center gap-2">
                      <GraduationCap size={16} />
                      Continue Learning
                    </Button>
                  </Link>
                </div>
              ) : (
                <Button
                  onClick={handleEnroll}
                  variant="primary"
                  isLoading={enrollLoading}
                  className="w-full py-3 text-xs font-bold font-outfit uppercase tracking-wider"
                >
                  {course.price === 0 ? "Enroll for Free" : "Buy Course"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
