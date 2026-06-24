import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useCurriculum, useLessons } from "../../hooks/useCurriculum";
import { makeRequest } from "../../apiClient";
import Card from "../common/Card";
import Button from "../common/Button";
import Input from "../common/Input";
import { Play, Lock, Unlock, CheckCircle, GraduationCap } from "lucide-react";

const LessonRow = ({ les, canEdit }) => {
  return (
    <div className="flex justify-between items-center p-3 rounded bg-slate-900/20 border border-slate-900 hover:border-slate-800 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-slate-500 font-mono text-[10px] shrink-0">L{les.order}</span>
        <div className="min-w-0">
          <p className="font-bold text-slate-300 text-[11px] truncate leading-tight">{les.title}</p>
          <span className="text-[9px] text-slate-500 font-medium">Video {les.duration > 0 ? `(${les.duration}m)` : ""}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 shrink-0">
        {les.isPreview ? (
          <span className="bg-emerald-950/60 text-emerald-400 border border-emerald-900/60 px-2 py-0.5 rounded text-[9px] font-bold flex items-center gap-1 font-mono">
            <Unlock size={10} /> PREVIEW
          </span>
        ) : !canEdit ? (
          <span className="text-slate-600 flex items-center gap-1 font-mono text-[9px]">
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
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { lessons, lessonsLoading, createLesson, updateLesson, deleteLesson } = useLessons(sect._id, isCreatorOrAdmin);

  // Lesson Form states
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDesc, setLessonDesc] = useState("");
  const [lessonVideo, setLessonVideo] = useState("");
  const [lessonDuration, setLessonDuration] = useState(0);
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
      video: lessonVideo,
      duration: lessonDuration,
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
      setLessonDuration(fullLesson.duration || 0);
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
    setLessonDuration(0);
    setLessonIsPreview(false);
    setLessonOrder(1);
    setEditingLessonId(null);
    setShowLessonForm(false);
  };

  return (
    <div className="border border-slate-800 rounded bg-slate-950 overflow-hidden shadow-sm">
      {/* Section Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex justify-between items-center p-3.5 cursor-pointer bg-slate-900/60 hover:bg-slate-900 transition-colors select-none"
      >
        <div className="flex items-center gap-2">
          <span className="text-sky-400 font-mono font-bold text-xs">Section {sect.order}</span>
          <span className="font-bold text-slate-200 text-xs sm:text-[13px]">{sect.title}</span>
          {sect.description && <span className="text-[10px] text-slate-500 hidden sm:inline">({sect.description})</span>}
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {canEdit && (
            <>
              <Button
                onClick={() => {
                  setIsExpanded(true);
                  setShowLessonForm(true);
                  setEditingLessonId(null);
                }}
                variant="success"
                className="px-2 py-0.5 text-[9px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 font-mono"
              >
                + Lesson
              </Button>
              <Button
                onClick={() => onEditSectionClick(sect)}
                variant="secondary"
                className="px-2 py-0.5 text-[9px] font-bold font-mono"
              >
                Edit
              </Button>
              <Button
                onClick={() => onDeleteSection(sect._id)}
                variant="danger"
                className="px-2 py-0.5 text-[9px] font-bold font-mono"
              >
                Delete
              </Button>
            </>
          )}
          <span className="text-slate-500 font-mono text-sm w-4 text-center">
            {isExpanded ? "▼" : "▶"}
          </span>
        </div>
      </div>

      {/* Section Lessons Body */}
      {isExpanded && (
        <div className="p-3 border-t border-slate-900 space-y-2 bg-slate-950/80">
          {lessonsLoading ? (
            <div className="text-center py-2 italic text-slate-600 text-[10px] font-mono">Retrieving lessons...</div>
          ) : lessons.length === 0 ? (
            <div className="text-center py-4 border border-dashed border-slate-900 rounded italic text-slate-655 text-[10px] font-mono">
              No lessons inside this section yet.
            </div>
          ) : (
            <div className="space-y-2">
              {lessons.map((les) => (
                <div key={les._id} className="relative group">
                  <LessonRow les={les} canEdit={canEdit} />
                  {canEdit && (
                    <div className="absolute right-2 top-2 flex gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                      <Button
                        onClick={() => handleEditLessonClick(les)}
                        variant="secondary"
                        className="px-1.5 py-0.5 text-[9px] font-mono"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeleteLesson(les._id)}
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
              className="w-full py-1 text-[10px] font-mono"
            >
              + Add Lesson to Section
            </Button>
          )}

          {/* Add/Edit Lesson Form block */}
          {canEdit && showLessonForm && (
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-900 space-y-3 mt-3">
              <h5 className="font-bold text-sky-400 border-b border-slate-800 pb-1.5 mb-2 font-mono text-[11px]">
                {editingLessonId ? "Modify Lesson" : "New Lesson for Section"}
              </h5>
              <form onSubmit={handleLessonSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Input
                    label="Lesson Title"
                    id={`lesson-title-${sect._id}`}
                    required
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                  />
                  <Input
                    label="Video Resource Link"
                    id={`lesson-video-${sect._id}`}
                    required
                    value={lessonVideo}
                    onChange={(e) => setLessonVideo(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Input
                    label="Duration (Minutes)"
                    id={`lesson-duration-${sect._id}`}
                    type="number"
                    required
                    value={lessonDuration}
                    onChange={(e) => setLessonDuration(parseInt(e.target.value) || 0)}
                  />
                  <Input
                    label="Order Rank"
                    id={`lesson-order-${sect._id}`}
                    type="number"
                    required
                    value={lessonOrder}
                    onChange={(e) => setLessonOrder(parseInt(e.target.value) || 1)}
                  />
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-slate-400">Lesson Setting</span>
                    <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={lessonIsPreview}
                        onChange={(e) => setLessonIsPreview(e.target.checked)}
                        className="bg-slate-950 border border-slate-700 rounded text-sky-500 focus:ring-sky-500/20"
                      />
                      <span className="text-xs text-slate-300 font-bold">Enable Preview</span>
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
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-mono text-[10px] uppercase font-bold tracking-widest text-sky-400">Querying Course Details...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-20 font-mono text-xs text-slate-500 bg-slate-900/10 border border-dashed border-slate-800 rounded-lg max-w-5xl mx-auto">
        <p className="font-bold">Course Not Found</p>
        <Button onClick={onBack || (() => navigate(-1))} variant="secondary" className="mt-4 py-1.5 px-4 font-mono font-bold">
          ← Go Back
        </Button>
      </div>
    );
  }

  const handleBack = onBack || (() => navigate(-1));

  return (
    <div className="space-y-6 font-mono text-xs max-w-5xl mx-auto">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Button onClick={handleBack} variant="secondary" className="px-4 py-1.5 font-bold font-mono">
          ← Back to Catalog
        </Button>
        {isCreatorOrAdmin && (
          <Link to={`/classroom/${course._id}`}>
            <Button variant="primary" className="px-4 py-1.5 font-bold font-mono">
              👁️ Preview Classroom
            </Button>
          </Link>
        )}
      </div>

      {/* Hero Section Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Summary Card */}
        <div className="md:col-span-2 space-y-4">
          <Card title={course.title} subtitle={`Category: ${course.category} | Level: ${course.level}`}>
            <div className="space-y-4 text-slate-300">
              <p className="text-slate-400 bg-slate-900/40 p-4 rounded-lg border border-slate-800 leading-relaxed text-xs">
                {course.description}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px] pt-1">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Level</span>
                  <span className="font-bold text-slate-200">{course.level}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Category</span>
                  <span className="font-bold text-slate-200">{course.category}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Instructor</span>
                  <span className="font-bold text-sky-400">{course.creator?.username || course.creator || "LMS Tutor"}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Dynamic Action Enrollment CTA Card */}
        <div className="space-y-4">
          <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between gap-4">
            <div>
              <span className="text-slate-500 text-[10px] font-bold block uppercase tracking-wider mb-1">
                {isEnrolled ? "YOUR STUDENT ACCESS" : "COURSE TUITION"}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-100">
                  {isEnrolled ? "UNLOCKED" : course.price === 0 ? "FREE" : `$${course.price}`}
                </span>
                {!isEnrolled && course.price > 0 && <span className="text-[10px] text-slate-500 font-bold">USD</span>}
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              {isEnrolled ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-2.5 bg-emerald-950/20 border border-emerald-900/50 rounded-lg text-emerald-300 text-[10px] font-bold">
                    <CheckCircle size={16} className="shrink-0" />
                    <span>You are actively enrolled in this classroom!</span>
                  </div>
                  <Link to={`/classroom/${course._id}`} className="block">
                    <Button variant="success" className="w-full py-2.5 text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-2">
                      <GraduationCap size={16} />
                      Start Learning
                    </Button>
                  </Link>
                </div>
              ) : (
                <Button
                  onClick={handleEnroll}
                  variant="primary"
                  isLoading={enrollLoading}
                  className="w-full py-2.5 text-xs font-bold font-mono uppercase tracking-wider"
                >
                  {course.price === 0 ? "Enroll for Free" : `Enroll — $${course.price}`}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section Creation Form (Admins only) */}
      {showSectionForm && (
        <Card title={editingSectionId ? "Edit Section" : "Add Section"} subtitle="Group lessons inside this course">
          <form onSubmit={handleSectionSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            <div className="flex gap-2">
              <Button type="submit" variant="success" isLoading={sectionFormLoading}>
                {editingSectionId ? "Save Changes" : "Create Section"}
              </Button>
              <Button
                onClick={resetSectionForm}
                variant="secondary"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Curriculum/Syllabus listing */}
      <Card
        title="Course Curriculum Syllabus"
        subtitle={
          <div className="flex justify-between items-center w-full mt-1.5 flex-wrap gap-2">
            <span>Review the structured lectures and assignments</span>
            {canEdit && !showSectionForm && (
              <Button onClick={() => setShowSectionForm(true)} variant="primary" className="py-1 px-3 text-[10px] font-mono">
                + Add Section
              </Button>
            )}
          </div>
        }
      >
        {loading ? (
          <div className="text-center py-4 italic text-slate-500 text-[11px] font-mono">Loading curriculum...</div>
        ) : sections.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-slate-800 rounded italic text-slate-500 text-[11px] font-mono">
            No curriculum sections added yet.
          </div>
        ) : (
          <div className="space-y-4">
            {sections.map((sect) => (
              <SectionItem
                key={sect._id}
                sect={sect}
                isCreatorOrAdmin={isCreatorOrAdmin}
                canEdit={canEdit}
                courseId={course._id}
                onEditSectionClick={handleEditSectionClick}
                onDeleteSection={handleDeleteSection}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default CourseDetails;
