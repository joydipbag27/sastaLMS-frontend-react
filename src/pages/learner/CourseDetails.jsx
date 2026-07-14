import React, { useState, useEffect, useRef } from "react";
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
  Calendar,
  MoreHorizontal
} from "lucide-react";

// Reusable Accessible Dropdown Menu Component
const DropdownMenu = ({ trigger, items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }} className="cursor-pointer">
        {trigger}
      </div>
      {isOpen && (
        <div className="absolute right-0 mt-1 w-44 rounded-xl bg-white shadow-lg ring-1 ring-black/5 focus:outline-none z-30 py-1.5 border border-slate-200 animate-zoom-in-95">
          {items.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                item.onClick(e);
              }}
              className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center gap-2 hover:bg-slate-50 transition-colors ${item.className || "text-slate-700"}`}
            >
              <span className="shrink-0">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const CourseImage = ({ src, alt, className = "" }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(!src);
  }, [src]);

  if (hasError || !src) {
    return (
      <div className={`relative group overflow-hidden w-full aspect-video bg-gradient-to-br from-brand-50 to-sky-50 flex flex-col items-center justify-center text-brand-200 gap-1.5 ${className}`}>
        <GraduationCap size={36} className="stroke-[1.5]" />
        <span className="text-[10px] font-bold tracking-wider font-outfit uppercase">SastaLMS Class</span>
        <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="p-4 rounded-full bg-white/80 border border-slate-200 text-brand-200 transform scale-90 group-hover:scale-100 transition-all duration-200 shadow-sm">
            <Play size={28} className="fill-current ml-0.5" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group overflow-hidden w-full aspect-video">
      <img
        src={src}
        alt={alt}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105 ${className}`}
      />
      <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
        <div className="p-4 rounded-full bg-white/80 border border-slate-200 text-brand-200 transform scale-90 group-hover:scale-100 transition-all duration-200 shadow-sm">
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

const LessonRow = ({
  les,
  canEdit,
  isEnrolled,
  onEdit,
  onDelete,
  onUploadVideo,
  onManualIngestion,
  isUploading,
  handleLessonClick,
  className = ""
}) => {
  return (
    <div 
      className={`group/lesson flex items-center justify-between p-3.5 hover:bg-slate-50/50 transition-all duration-200 cursor-pointer ${className}`}
      onClick={() => handleLessonClick(les)}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-[10px] font-mono shrink-0 bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded border border-slate-200/60">
          L{les.order}
        </span>
        <div className="min-w-0">
          <p className="font-bold text-slate-800 text-xs sm:text-sm truncate leading-tight group-hover/lesson:text-brand-200 transition-colors">
            {les.title}
          </p>
          <span className="text-[10px] text-slate-450 font-semibold flex items-center gap-1.5 mt-1">
            <Video size={11} className="text-slate-400" />
            Video {les.duration > 0 ? `(${formatDuration(les.duration)})` : ""}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 ml-3" onClick={(e) => e.stopPropagation()}>
        {les.isPreview ? (
          <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 font-outfit tracking-wide">
            <Unlock size={10} /> PREVIEW
          </span>
        ) : (!canEdit && !isEnrolled) ? (
          <span className="text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 font-outfit tracking-wider">
            <Lock size={10} /> LOCKED
          </span>
        ) : null}

        {canEdit && (
          les.video ? (
            <span className="text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 font-outfit tracking-wide">
              Video Attached
            </span>
          ) : (
            <span className="text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 font-outfit tracking-wide">
              Missing Video
            </span>
          )
        )}

        {canEdit && (
          <DropdownMenu
            trigger={
              <button className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-150 transition-all" aria-label="Lesson actions">
                <MoreHorizontal size={14} />
              </button>
            }
            items={[
              {
                label: "Edit Lesson",
                icon: <Edit size={12} />,
                onClick: () => onEdit(les),
              },
              ...(!les.video ? [
                {
                  label: isUploading ? "Close Uploader" : "Upload Video",
                  icon: <Video size={12} />,
                  onClick: () => onUploadVideo(les._id),
                },
                {
                  label: "Manual Ingestion",
                  icon: <Sparkles size={12} />,
                  onClick: () => onManualIngestion(les._id),
                }
              ] : []),
              {
                label: "Delete Lesson",
                icon: <Trash2 size={12} className="text-rose-500" />,
                onClick: () => onDelete(les._id),
                className: "text-rose-600 hover:bg-rose-50/50",
              }
            ]}
          />
        )}
        
        <ChevronRight size={14} className="text-slate-350 group-hover/lesson:translate-x-0.5 transition-transform" />
      </div>
    </div>
  );
};

const CourseOverview = ({ description }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLong = description && description.length > 350;

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative space-y-4">
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider font-outfit">Course Overview</h3>
      <div className="relative">
        <div
          className={`text-slate-650 text-sm leading-relaxed whitespace-pre-line font-sans transition-all duration-300 ${
            !isExpanded && isLong ? "max-h-36 overflow-hidden" : ""
          }`}
        >
          {description || "No description provided for this course yet."}
        </div>
        {!isExpanded && isLong && (
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        )}
      </div>
      {isLong && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-bold font-outfit text-brand-200 hover:text-brand-300 transition-colors flex items-center gap-1 focus:outline-none"
        >
          {isExpanded ? "Show less" : "Show more"}
        </button>
      )}
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

  const handleUploadVideoToggle = (lesId) => {
    setUploadMode("standard");
    setUploadingLessonId(uploadingLessonId === lesId && uploadMode === "standard" ? null : lesId);
  };

  const handleManualIngestionToggle = (lesId) => {
    setUploadMode("manual");
    setUploadingLessonId(uploadingLessonId === lesId && uploadMode === "manual" ? null : lesId);
  };

  const displayLessonCount = sect.lessons?.length || (isExpanded && lessons ? lessons.length : 0);

  return (
    <div className="border border-slate-200 rounded-xl bg-white shadow-sm hover:border-brand-100 transition-all duration-200">
      {/* Section Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex justify-between items-center p-4 cursor-pointer bg-slate-50 hover:bg-slate-100/50 transition-all select-none border-b border-transparent rounded-t-xl ${!isExpanded ? "rounded-b-xl" : ""}`}
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <span className="text-brand-200 font-mono font-bold text-[10px] bg-brand-50 border-brand-100 px-2 py-0.5 rounded-lg shrink-0">
            S{sect.order}
          </span>
          <div className="min-w-0">
            <span className="font-bold text-slate-800 text-sm block truncate leading-snug">{sect.title}</span>
            <div className="flex items-center gap-2 mt-0.5">
              {sect.description && (
                <p className="text-[11px] text-slate-450 truncate max-w-[200px] sm:max-w-xs">{sect.description}</p>
              )}
              {sect.description && displayLessonCount > 0 && <span className="text-[11px] text-slate-350">•</span>}
              {displayLessonCount > 0 && (
                <span className="text-[11px] text-slate-450 font-medium">{displayLessonCount} {displayLessonCount === 1 ? "lesson" : "lessons"}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
          {canEdit && (
            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  setIsExpanded(true);
                  setShowLessonForm(true);
                  setEditingLessonId(null);
                }}
                variant="secondary"
                className="px-2 py-1 text-[10px] font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 font-outfit"
              >
                + Lesson
              </Button>
              
              <DropdownMenu
                trigger={
                  <button className="p-1.5 rounded-lg text-slate-450 hover:text-slate-700 hover:bg-slate-100 transition-all" aria-label="Section options">
                    <MoreHorizontal size={16} />
                  </button>
                }
                items={[
                  {
                    label: "Edit Section",
                    icon: <Edit size={12} />,
                    onClick: () => onEditSectionClick(sect),
                  },
                  {
                    label: "Delete Section",
                    icon: <Trash2 size={12} className="text-rose-500" />,
                    onClick: () => onDeleteSection(sect._id),
                    className: "text-rose-600 hover:bg-rose-50/50",
                  }
                ]}
              />
            </div>
          )}
          <span className="text-slate-400 p-1 hover:text-slate-600 transition-colors">
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </span>
        </div>
      </div>

      {/* Section Lessons Body */}
      {isExpanded && (
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 space-y-3 rounded-b-xl">
          {lessonsLoading ? (
            <div className="text-center py-4 italic text-slate-400 text-[11px] font-mono">Retrieving lessons...</div>
          ) : lessons.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl italic text-slate-400 text-[11px] font-mono bg-white">
              No lessons inside this section yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white shadow-sm">
              {lessons.map((les, index) => (
                <div key={les._id} className="relative">
                  <LessonRow
                    les={les}
                    canEdit={canEdit}
                    isEnrolled={isEnrolled}
                    onEdit={handleEditLessonClick}
                    onDelete={handleDeleteLesson}
                    onUploadVideo={handleUploadVideoToggle}
                    onManualIngestion={handleManualIngestionToggle}
                    isUploading={uploadingLessonId === les._id}
                    handleLessonClick={handleLessonClick}
                    className={`${index === 0 ? "rounded-t-xl" : ""} ${index === lessons.length - 1 && uploadingLessonId !== les._id ? "rounded-b-xl" : ""}`}
                  />

                  {canEdit && uploadingLessonId === les._id && (
                    <div 
                      className={`p-4 border-t border-slate-200 bg-slate-50 space-y-4 ${index === lessons.length - 1 ? "rounded-b-xl" : ""}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Mode Toggle */}
                      <div className="flex gap-2 border-b border-slate-200 pb-3">
                        <button
                          type="button"
                          onClick={() => setUploadMode("standard")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            uploadMode === "standard"
                              ? "bg-brand-200 text-[#111111] shadow-sm"
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
                              ? "bg-brand-200 text-[#111111] shadow-sm"
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
                </div>
              ))}
            </div>
          )}

          {/* Add Lesson form trigger */}
          {canEdit && !showLessonForm && (
            <Button
              onClick={() => setShowLessonForm(true)}
              variant="secondary"
              className="w-full py-2 text-[10px] font-bold border border-slate-200 hover:bg-slate-50 bg-white"
            >
              + Add Lesson to Section
            </Button>
          )}

          {/* Add/Edit Lesson Form block */}
          {canEdit && showLessonForm && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 mt-3 shadow-sm">
              <h5 className="font-bold text-brand-200 border-b border-slate-200 pb-2 mb-2 font-mono text-xs flex items-center gap-1.5">
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
                        className="bg-white border border-slate-300 rounded text-brand-200 focus:ring-brand/20"
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

  const canEdit = currentProfile && currentProfile.role === "CREATOR";
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
        <div className="w-10 h-10 border-[3px] border-brand-200 border-t-transparent rounded-full animate-spin mb-5"></div>
        <p className="font-mono text-xs uppercase font-bold tracking-widest text-brand-200">Loading Course Details...</p>
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
  const sCount = course.stats?.sectionCount || sections.length || 0;
  const lCount = course.stats?.lessonCount || 0;

  return (
    <div className="space-y-6 font-sans text-sm relative pb-16">
      {/* Navigation and Top Bar */}
      <div className="flex items-center justify-between relative z-10">
        <Button 
          onClick={handleBack} 
          variant="secondary" 
          className="px-3.5 py-1.5 font-bold font-outfit text-xs border border-slate-200 bg-white hover:bg-slate-50 flex items-center gap-2"
        >
          <ArrowLeft size={14} /> Back to Catalog
        </Button>
        {isCreatorOrAdmin && (
          <Link to={`/classroom/${course._id}`}>
            <Button variant="primary" className="px-3.5 py-1.5 font-bold font-outfit text-xs flex items-center gap-1.5">
              <GraduationCap size={15} /> Preview Classroom
            </Button>
          </Link>
        )}
      </div>

      {/* Hero Header Section */}
      <div className="relative z-10 border-b border-slate-200 pb-5 space-y-3">
        <div className="flex flex-wrap gap-2">
          <span className="bg-brand-50 text-brand-200 border-brand-100 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-outfit">
            {course.level}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black font-outfit text-slate-850 tracking-tight leading-tight max-w-4xl">
          {course.title}
        </h1>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <span className="text-slate-400">Instructor:</span>
            <span className="font-semibold text-brand-200">{course.displayName || course.creator?.username || course.creator || "LMS Tutor"}</span>
          </div>
          <span className="text-slate-350">•</span>
          <div className="flex items-center gap-1.5">
            <Layers size={13} className="text-slate-400" />
            <span className="font-medium text-slate-600">{sCount} {sCount === 1 ? "Section" : "Sections"}</span>
          </div>
          <span className="text-slate-350">•</span>
          <div className="flex items-center gap-1.5">
            <BookOpen size={13} className="text-slate-400" />
            <span className="font-medium text-slate-600">{lCount} {lCount === 1 ? "Lesson" : "Lessons"}</span>
          </div>
        </div>
      </div>

      {/* Responsive Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10 items-start">
        
        {/* Main Column: Overview & Curriculum */}
        <div className="lg:col-span-2 order-2 lg:order-1 space-y-6">
          {/* Overview Card */}
          <CourseOverview description={course.description} />

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
            <div className="flex justify-between items-center flex-wrap gap-3 border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-lg font-bold font-outfit text-slate-800 tracking-wide">Course Curriculum</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {sCount} {sCount === 1 ? "section" : "sections"} • {lCount} {lCount === 1 ? "lesson" : "lessons"}
                </p>
              </div>
              {canEdit && !showSectionForm && (
                <Button 
                  onClick={() => setShowSectionForm(true)} 
                  variant="secondary" 
                  className="py-1.5 px-3 font-outfit text-xs flex items-center gap-1.5 text-slate-700 border border-slate-200 hover:bg-slate-50"
                >
                  <Plus size={14} /> Add Section
                </Button>
              )}
            </div>

            {loading ? (
              <div className="text-center py-10 italic text-slate-400 text-xs">Loading curriculum details...</div>
            ) : sections.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl italic text-slate-400 text-xs bg-white shadow-sm">
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

        {/* Sidebar Column: Media & Enrollment */}
        <div className="lg:col-span-1 order-1 lg:order-2 space-y-6 lg:sticky lg:top-24">
          
          {/* Media Preview Card */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white aspect-video relative">
            {course.trailerUrl ? (
              <video 
                src={course.trailerUrl} 
                poster={course.thumbnailUrl} 
                controls 
                className="w-full h-full object-cover"
              />
            ) : (
              <CourseImage src={course.thumbnailUrl} alt={course.title} />
            )}
          </div>

          {/* Access Status Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
            <div>
              <span className="text-slate-500 text-[10px] font-bold block uppercase tracking-widest mb-1.5 font-outfit">
                YOUR ACCESS STATUS
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-800 font-outfit tracking-tight">
                  {isEnrolled ? "UNLOCKED" : course.price === 0 ? "FREE" : `₹${course.price}`}
                </span>
                {!isEnrolled && course.price > 0 && <span className="text-xs text-slate-500 font-bold font-outfit">INR</span>}
              </div>
              {isCreatorOrAdmin && (
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-200 mt-3 border-brand-100 font-outfit uppercase tracking-wider">
                  <Shield size={10} /> Creator Access
                </div>
              )}
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
                    Start Learning
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
