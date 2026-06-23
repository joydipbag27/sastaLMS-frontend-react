import React, { useState, useEffect } from "react";
import { makeRequest } from "../../apiClient";
import Card from "../common/Card";
import Button from "../common/Button";
import Input from "../common/Input";

const CourseDetails = ({ course, currentProfile, viewMode = "catalog", onBack }) => {
  const [sections, setSections] = useState([]);
  const [lessonsMap, setLessonsMap] = useState({}); // sectionId -> lessons[]
  const [loading, setLoading] = useState(false);
  const [sectionLoadingId, setSectionLoadingId] = useState(null);

  // Forms states - Sections
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [sectionTitle, setSectionTitle] = useState("");
  const [sectionDesc, setSectionDesc] = useState("");
  const [sectionOrder, setSectionOrder] = useState(1);
  const [sectionFormLoading, setSectionFormLoading] = useState(false);

  // Forms states - Lessons
  const [showLessonFormForSectionId, setShowLessonFormForSectionId] = useState(null);
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDesc, setLessonDesc] = useState("");
  const [lessonVideo, setLessonVideo] = useState("");
  const [lessonDuration, setLessonDuration] = useState(0);
  const [lessonIsPreview, setLessonIsPreview] = useState(false);
  const [lessonOrder, setLessonOrder] = useState(1);
  const [lessonFormLoading, setLessonFormLoading] = useState(false);

  // Expandable sections list
  const [expandedSections, setExpandedSections] = useState({}); // sectionId -> boolean

  const canEdit =
    currentProfile &&
    ["CREATOR", "ADMIN"].includes(currentProfile.role);

  useEffect(() => {
    fetchSections();
  }, [course._id]);

  const fetchSections = async () => {
    setLoading(true);
    const url = viewMode === "my-courses"
      ? `/section/creator/course/${course._id}`
      : `/section/course/${course._id}`;
    const res = await makeRequest(url);
    setLoading(false);
    if (res.success) {
      setSections(res.data.sections || []);
    }
  };

  const fetchLessons = async (sectionId) => {
    setSectionLoadingId(sectionId);
    const url = viewMode === "my-courses"
      ? `/lesson/creator/section/${sectionId}`
      : `/lesson/section/${sectionId}`;
    const res = await makeRequest(url);
    setSectionLoadingId(null);
    if (res.success) {
      setLessonsMap((prev) => ({
        ...prev,
        [sectionId]: res.data.lessons || [],
      }));
    }
  };

  const toggleSectionExpand = (sectionId) => {
    const isExpanded = !expandedSections[sectionId];
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: isExpanded,
    }));
    if (isExpanded) {
      fetchLessons(sectionId);
    }
  };

  // CREATE/UPDATE SECTION
  const handleSectionSubmit = async (e) => {
    e.preventDefault();
    setSectionFormLoading(true);
    let res;
    if (editingSectionId) {
      res = await makeRequest(`/section/${editingSectionId}`, {
        method: "PATCH",
        body: { title: sectionTitle, description: sectionDesc, order: sectionOrder },
      });
    } else {
      res = await makeRequest("/section", {
        method: "POST",
        body: {
          title: sectionTitle,
          description: sectionDesc,
          course: course._id,
          order: sectionOrder,
        },
      });
    }
    setSectionFormLoading(false);
    if (res.success) {
      alert(editingSectionId ? "Section updated!" : "Section created!");
      const newSect = res.data.section;
      if (newSect && !editingSectionId) {
        setExpandedSections((prev) => ({
          ...prev,
          [newSect._id]: true,
        }));
        setLessonsMap((prev) => ({
          ...prev,
          [newSect._id]: [],
        }));
      }
      setSectionTitle("");
      setSectionDesc("");
      setSectionOrder(1);
      setEditingSectionId(null);
      setShowSectionForm(false);
      fetchSections();
    } else {
      alert(res.data?.error || "Section operation failed");
    }
  };

  // DELETE SECTION
  const handleDeleteSection = async (sectionId) => {
    if (!confirm("Are you sure? Deleting a section cascades to delete all lessons inside it.")) return;
    const res = await makeRequest(`/section/${sectionId}`, {
      method: "DELETE",
    });
    if (res.success) {
      alert("Section deleted!");
      fetchSections();
    } else {
      alert(res.data?.error || "Failed to delete section");
    }
  };

  const handleEditSectionClick = (sect) => {
    setEditingSectionId(sect._id);
    setSectionTitle(sect.title);
    setSectionDesc(sect.description || "");
    setSectionOrder(sect.order || 1);
    setShowSectionForm(true);
  };

  const handleAddLessonClick = (sectionId) => {
    if (!expandedSections[sectionId]) {
      setExpandedSections((prev) => ({
        ...prev,
        [sectionId]: true,
      }));
      fetchLessons(sectionId);
    }
    setShowLessonFormForSectionId(sectionId);
    setEditingLessonId(null);
    setLessonTitle("");
    setLessonDesc("");
    setLessonVideo("");
    setLessonDuration(0);
    setLessonIsPreview(false);
    setLessonOrder(1);
  };

  // CREATE/UPDATE LESSON
  const handleLessonSubmit = async (e) => {
    e.preventDefault();
    const sectionId = showLessonFormForSectionId;
    setLessonFormLoading(true);
    let res;
    if (editingLessonId) {
      res = await makeRequest(`/lesson/${editingLessonId}`, {
        method: "PATCH",
        body: {
          title: lessonTitle,
          description: lessonDesc,
          video: lessonVideo,
          duration: lessonDuration,
          isPreview: lessonIsPreview,
          order: lessonOrder,
        },
      });
    } else {
      res = await makeRequest("/lesson", {
        method: "POST",
        body: {
          title: lessonTitle,
          description: lessonDesc,
          course: course._id,
          section: sectionId,
          video: lessonVideo,
          duration: lessonDuration,
          isPreview: lessonIsPreview,
          order: lessonOrder,
        },
      });
    }
    setLessonFormLoading(false);
    if (res.success) {
      alert(editingLessonId ? "Lesson updated!" : "Lesson created!");
      setLessonTitle("");
      setLessonDesc("");
      setLessonVideo("");
      setLessonDuration(0);
      setLessonIsPreview(false);
      setLessonOrder(1);
      setEditingLessonId(null);
      setShowLessonFormForSectionId(null);
      fetchLessons(sectionId);
    } else {
      alert(res.data?.error || "Lesson operation failed");
    }
  };

  // DELETE LESSON
  const handleDeleteLesson = async (sectionId, lessonId) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;
    const res = await makeRequest(`/lesson/${lessonId}`, {
      method: "DELETE",
    });
    if (res.success) {
      alert("Lesson deleted!");
      fetchLessons(sectionId);
    } else {
      alert(res.data?.error || "Failed to delete lesson");
    }
  };

  const handleEditLessonClick = (sectionId, les) => {
    setEditingLessonId(les._id);
    setLessonTitle(les.title);
    setLessonDesc(les.description || "");
    setLessonVideo(les.video || "");
    setLessonDuration(les.duration || 0);
    setLessonIsPreview(les.isPreview || false);
    setLessonOrder(les.order || 1);
    setShowLessonFormForSectionId(sectionId);
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Back Header */}
      <div className="flex items-center gap-2">
        <Button onClick={onBack} variant="secondary" className="px-3 py-1 font-bold">
          ← Back to Courses
        </Button>
        <span className="text-slate-500 font-bold">Course ID: {course._id}</span>
      </div>

      {/* Course Summary Card */}
      <Card title={course.title} subtitle={`Category: ${course.category} | Level: ${course.level}`}>
        <div className="space-y-2 text-slate-300">
          <p className="text-slate-400 bg-slate-900/40 p-3 rounded border border-slate-800 leading-relaxed">
            {course.description}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
            <div>
              <span className="text-slate-500 block">Price</span>
              <span className="font-bold text-sky-400">{course.price === 0 ? "FREE" : `$${course.price}`}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Status</span>
              <span className={`font-bold ${course.status === "Published" ? "text-emerald-400" : "text-amber-400"}`}>
                {course.status}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Creator</span>
              <span className="font-bold text-slate-300">
                {course.creator?.username || course.creator || "Unknown"}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Permitted Editor</span>
              <span className={`font-bold ${canEdit ? "text-emerald-400" : "text-rose-400"}`}>
                {canEdit ? "YES" : "NO"}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Section Form */}
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
                onClick={() => {
                  setShowSectionForm(false);
                  setEditingSectionId(null);
                  setSectionTitle("");
                  setSectionDesc("");
                  setSectionOrder(1);
                }}
                variant="secondary"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Course Sections List Card */}
      <Card
        title="Course Curriculum"
        subtitle={
          <div className="flex justify-between items-center w-full mt-1.5 flex-wrap gap-2">
            <span>Course Sections and Lessons list</span>
            {canEdit && !showSectionForm && (
              <Button onClick={() => setShowSectionForm(true)} variant="primary" className="py-1 px-3 text-[10px]">
                + Add Section
              </Button>
            )}
          </div>
        }
      >
        {loading ? (
          <div className="text-center py-4 italic text-slate-500">Loading curriculum...</div>
        ) : sections.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-slate-800 rounded italic text-slate-500">
            No curriculum sections added yet.
          </div>
        ) : (
          <div className="space-y-3">
            {sections.map((sect) => {
              const isExpanded = expandedSections[sect._id];
              const lessons = lessonsMap[sect._id] || [];
              const isSectionLoading = sectionLoadingId === sect._id;

              return (
                <div key={sect._id} className="border border-slate-800/80 rounded bg-slate-950">
                  {/* Section Title Header */}
                  <div
                    onClick={() => toggleSectionExpand(sect._id)}
                    className="flex justify-between items-center p-3 cursor-pointer bg-slate-900/60 hover:bg-slate-900 transition-colors rounded-t select-none"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sky-400 font-bold">[{sect.order}]</span>
                      <span className="font-bold text-slate-200">{sect.title}</span>
                      {sect.description && <span className="text-[10px] text-slate-500">({sect.description})</span>}
                    </div>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {canEdit && (
                        <>
                          <Button
                            onClick={() => handleAddLessonClick(sect._id)}
                            variant="success"
                            className="px-2 py-0.5 text-[9px] font-bold text-white bg-emerald-600 hover:bg-emerald-500"
                          >
                            + Lesson
                          </Button>
                          <Button
                            onClick={() => handleEditSectionClick(sect)}
                            variant="secondary"
                            className="px-2 py-0.5 text-[9px] font-bold"
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDeleteSection(sect._id)}
                            variant="danger"
                            className="px-2 py-0.5 text-[9px] font-bold"
                          >
                            Delete
                          </Button>
                        </>
                      )}
                      <span className="text-slate-500 font-bold text-sm w-4 text-center">
                        {isExpanded ? "▼" : "▶"}
                      </span>
                    </div>
                  </div>

                  {/* Section Lessons Body */}
                  {isExpanded && (
                    <div className="p-3 border-t border-slate-900 space-y-3 bg-slate-950">
                      {isSectionLoading ? (
                        <div className="text-center py-2 italic text-slate-600">Retrieving lessons...</div>
                      ) : lessons.length === 0 ? (
                        <div className="text-center py-4 border border-dashed border-slate-900 rounded italic text-slate-600">
                          No lessons inside this section yet.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {lessons.map((les) => (
                            <div
                              key={les._id}
                              className="flex justify-between items-start gap-4 p-2.5 rounded bg-slate-900/40 border border-slate-900 hover:border-slate-800 transition-colors"
                            >
                              <div className="space-y-1 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-emerald-500 font-bold">L{les.order}:</span>
                                  <span className="font-bold text-slate-300">{les.title}</span>
                                  {les.isPreview && (
                                    <span className="bg-emerald-950/60 text-emerald-400 border border-emerald-900/60 px-1 rounded text-[9px] font-bold">
                                      PREVIEW
                                    </span>
                                  )}
                                  <span className="text-slate-500 font-mono text-[10px]">({les.duration} mins)</span>
                                </div>
                                {les.description && <p className="text-[10px] text-slate-500 leading-relaxed">{les.description}</p>}
                                <div className="text-[9px] text-sky-400/80 font-mono select-all truncate max-w-sm">
                                  Video: {les.video}
                                </div>
                              </div>

                              {canEdit && (
                                <div className="flex gap-1.5 shrink-0">
                                  <Button
                                    onClick={() => handleEditLessonClick(sect._id, les)}
                                    variant="secondary"
                                    className="px-1.5 py-0.5 text-[9px]"
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    onClick={() => handleDeleteLesson(sect._id, les._id)}
                                    variant="danger"
                                    className="px-1.5 py-0.5 text-[9px]"
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
                      {canEdit && showLessonFormForSectionId !== sect._id && (
                        <Button
                          onClick={() => setShowLessonFormForSectionId(sect._id)}
                          variant="secondary"
                          className="w-full py-1 text-[10px]"
                        >
                          + Add Lesson to Section
                        </Button>
                      )}

                      {/* Add/Edit Lesson Form block */}
                      {canEdit && showLessonFormForSectionId === sect._id && (
                        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-900 space-y-3 mt-3">
                          <h5 className="font-bold text-sky-400 border-b border-slate-800 pb-1.5 mb-2">
                            {editingLessonId ? "Modify Lesson" : "New Lesson for Section"}
                          </h5>
                          <form onSubmit={handleLessonSubmit} className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <Input
                                label="Lesson Title"
                                id="lesson-title"
                                required
                                value={lessonTitle}
                                onChange={(e) => setLessonTitle(e.target.value)}
                              />
                              <Input
                                label="Video Resource Link"
                                id="lesson-video"
                                required
                                value={lessonVideo}
                                onChange={(e) => setLessonVideo(e.target.value)}
                              />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <Input
                                label="Duration (Minutes)"
                                id="lesson-duration"
                                type="number"
                                required
                                value={lessonDuration}
                                onChange={(e) => setLessonDuration(parseInt(e.target.value) || 0)}
                              />
                              <Input
                                label="Order Rank"
                                id="lesson-order"
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
                              id="lesson-desc"
                              value={lessonDesc}
                              onChange={(e) => setLessonDesc(e.target.value)}
                            />
                            <div className="flex gap-2 pt-1">
                              <Button type="submit" variant="success" isLoading={lessonFormLoading} className="py-1">
                                {editingLessonId ? "Save Lesson" : "Create Lesson"}
                              </Button>
                              <Button
                                onClick={() => {
                                  setShowLessonFormForSectionId(null);
                                  setEditingLessonId(null);
                                  setLessonTitle("");
                                  setLessonDesc("");
                                  setLessonVideo("");
                                  setLessonDuration(0);
                                  setLessonIsPreview(false);
                                  setLessonOrder(1);
                                }}
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
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default CourseDetails;
