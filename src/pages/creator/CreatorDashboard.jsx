import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useCourses } from "../../features/courses/hooks/useCourses";
import { useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../services/api/apiClient";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useS3Upload } from "../../features/media/hooks/useS3Upload";

import {
  GraduationCap,
  Layers,
  BookOpen,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Upload,
  Loader2,
  Image,
  Film,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

// Click-based dropdown menu (replaces group-hover for accessibility)
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
    <div className="relative" ref={dropdownRef}>
      <div onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}>
        {trigger}
      </div>
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-30 animate-zoom-in-95">
          {items.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                item.onClick(e);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
                item.danger
                  ? "text-rose-600 hover:bg-rose-50"
                  : item.warning
                    ? "text-amber-600 hover:bg-amber-50"
                    : item.success
                      ? "text-emerald-600 hover:bg-emerald-50"
                      : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Course image with fallback
const CourseImage = ({ src, alt, className = "" }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(!src);
  }, [src]);

  if (hasError || !src) {
    return (
      <div className={`w-full h-44 bg-gradient-to-br from-brand-50 to-sky-50 flex flex-col items-center justify-center text-brand-200 gap-1.5 ${className}`}>
        <GraduationCap size={32} className="stroke-[1.5]" />
        <span className="text-[9px] font-bold tracking-wider font-outfit uppercase">SastaLMS</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className={`w-full h-44 object-cover ${className}`}
    />
  );
};

// Inline toast notification
const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border shadow-lg text-xs font-bold animate-slide-up ${
      type === "success"
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : type === "error"
          ? "bg-rose-50 text-rose-700 border-rose-200"
          : "bg-amber-50 text-amber-700 border-amber-200"
    }`}>
      {type === "success" ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 text-current opacity-50 hover:opacity-100">×</button>
    </div>
  );
};

const CreatorDashboard = ({ currentProfile }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const filterStatus = searchParams.get("status") || "All";
  const limit = 12;

  const {
    courses,
    isLoading: loading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    createCourse,
    updateCourse,
    deleteCourse,
    publishCourse,
    unpublishCourse,
  } = useCourses("my-courses", {
    status: filterStatus,
  }, limit);

  const [showForm, setShowForm] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDesc, setCourseDesc] = useState("");
  const [courseThumbnail, setCourseThumbnail] = useState("");
  const [courseTrailer, setCourseTrailer] = useState("");
  const [coursePrice, setCoursePrice] = useState(0);
  const [courseDisplayName, setCourseDisplayName] = useState("");
  const [courseLevel, setCourseLevel] = useState("Beginner");
  const [courseStatus, setCourseStatus] = useState("Draft");
  const [originalStatus, setOriginalStatus] = useState("Draft");
  const [formLoading, setFormLoading] = useState(false);
  const [pendingThumbnailFile, setPendingThumbnailFile] = useState(null);
  const [pendingTrailerFile, setPendingTrailerFile] = useState(null);

  // Toast state
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => setToast({ message, type });

  const {
    isUploading: isThumbnailUploading,
    uploadPercent: thumbnailPercent,
    statusText: thumbnailStatusText,
    uploadFile: uploadThumbnail,
    resetUpload: resetThumbnailUpload,
  } = useS3Upload();

  const {
    isUploading: isTrailerUploading,
    uploadPercent: trailerPercent,
    statusText: trailerStatusText,
    uploadFile: uploadTrailer,
    resetUpload: resetTrailerUpload,
  } = useS3Upload();

  const setFilterStatus = (val) => {
    setSearchParams((prev) => {
      if (val) prev.set("status", val);
      else prev.delete("status");
      return prev;
    });
  };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    if (formLoading) return;
    setFormLoading(true);
    const body = {
      title: courseTitle,
      description: courseDesc,
      price: coursePrice,
      displayName: courseDisplayName,
      level: courseLevel,
    };

    try {
      let courseId = editingCourseId;

      if (editingCourseId) {
        await updateCourse({ id: editingCourseId, body });

        if (courseStatus !== originalStatus) {
          if (courseStatus === "Published") {
            await publishCourse(editingCourseId);
          } else if (courseStatus === "Draft") {
            await unpublishCourse(editingCourseId);
          }
        }
      } else {
        const newCourseRes = await createCourse(body);
        courseId = newCourseRes.course._id;

        if (courseStatus === "Published") {
          try {
            await publishCourse(courseId);
          } catch (pubErr) {
            console.warn("Could not publish new course immediately:", pubErr);
            showToast(`Course created as Draft. Note: ${pubErr.message}`, "warning");
          }
        }
      }

      if (pendingThumbnailFile) {
        await uploadThumbnail(
          pendingThumbnailFile,
          async (mimeType) => {
            const presignRes = await makeRequest(`/course/${courseId}/thumbnail/upload-url`, {
              method: "POST",
              body: { mimeType },
            });
            if (!presignRes.success) throw new Error(presignRes.data?.error || "Failed to generate thumbnail upload URL");
            return presignRes.data;
          },
          async ({ mediaId }) => {
            const confirmRes = await makeRequest(`/course/${courseId}/thumbnail/confirm`, {
              method: "POST",
              body: { mediaId },
            });
            if (!confirmRes.success) throw new Error(confirmRes.data?.error || "Failed to confirm thumbnail upload");
            return confirmRes.data;
          }
        );
      }

      if (pendingTrailerFile) {
        await uploadTrailer(
          pendingTrailerFile,
          async (mimeType) => {
            const presignRes = await makeRequest(`/course/${courseId}/trailer/upload-url`, {
              method: "POST",
              body: { mimeType },
            });
            if (!presignRes.success) throw new Error(presignRes.data?.error || "Failed to generate trailer upload URL");
            return presignRes.data;
          },
          async ({ mediaId }) => {
            const confirmRes = await makeRequest(`/course/${courseId}/trailer/confirm`, {
              method: "POST",
              body: { mediaId },
            });
            if (!confirmRes.success) throw new Error(confirmRes.data?.error || "Failed to confirm trailer upload");
            return confirmRes.data;
          }
        );
      }

      queryClient.invalidateQueries({ queryKey: ["courses"] });
      if (editingCourseId) {
        queryClient.invalidateQueries({ queryKey: ["course", editingCourseId] });
      }

      showToast(editingCourseId ? "Course updated successfully!" : "Course created successfully!");
      resetForm();
    } catch (err) {
      showToast(err.message || "Failed to submit course", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditClick = (e, crs) => {
    e.stopPropagation();
    setEditingCourseId(crs._id);
    setCourseTitle(crs.title);
    setCourseDesc(crs.description);
    setCourseThumbnail(crs.thumbnailUrl || crs.thumbnail || "");
    setCourseTrailer(crs.trailerUrl || crs.trailer || "");
    setCoursePrice(crs.price || 0);
    setCourseDisplayName(crs.displayName || "");
    setCourseLevel(crs.level || "Beginner");
    setCourseStatus(crs.status || "Draft");
    setOriginalStatus(crs.status || "Draft");
    setShowForm(true);
  };

  const handleDeleteClick = async (e, id) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this course? This cascades to delete all its sections and lessons.")) return;
    try {
      await deleteCourse(id);
      showToast("Course deleted successfully!");
    } catch (err) {
      showToast(err.message || "Failed to delete course", "error");
    }
  };

  const handlePublishToggle = async (e, crs) => {
    e.stopPropagation();
    try {
      if (crs.status === "Published") {
        await unpublishCourse(crs._id);
        showToast("Course unpublished");
      } else {
        await publishCourse(crs._id);
        showToast("Course published!");
      }
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    } catch (err) {
      showToast(err.message || "Failed to update course status", "error");
    }
  };

  const resetForm = () => {
    setCourseTitle("");
    setCourseDesc("");
    setCourseThumbnail("");
    setCourseTrailer("");
    setCoursePrice(0);
    setCourseDisplayName("");
    setCourseLevel("Beginner");
    setCourseStatus("Draft");
    setOriginalStatus("Draft");
    setEditingCourseId(null);
    setPendingThumbnailFile(null);
    setPendingTrailerFile(null);
    resetThumbnailUpload();
    resetTrailerUpload();
    setShowForm(false);
  };

  const handleDeleteThumbnail = async () => {
    if (!confirm("Are you sure you want to delete the course thumbnail?")) return;
    try {
      const res = await makeRequest(`/course/${editingCourseId}/thumbnail`, {
        method: "DELETE",
      });
      if (!res.success) throw new Error(res.data?.error || "Failed to delete thumbnail");

      setCourseThumbnail("");
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["course", editingCourseId] });
      showToast("Thumbnail deleted");
    } catch (err) {
      showToast(err.message || "Failed to delete thumbnail", "error");
    }
  };

  const handleDeleteTrailer = async () => {
    if (!confirm("Are you sure you want to delete the course trailer?")) return;
    try {
      const res = await makeRequest(`/course/${editingCourseId}/trailer`, {
        method: "DELETE",
      });
      if (!res.success) throw new Error(res.data?.error || "Failed to delete trailer");

      setCourseTrailer("");
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["course", editingCourseId] });
      showToast("Trailer deleted");
    } catch (err) {
      showToast(err.message || "Failed to delete trailer", "error");
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* Page Header */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight font-outfit">Course Creator</h2>
          <p className="text-sm text-slate-500 mt-0.5">Create and manage your course catalog</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} variant="primary" className="py-2 px-4 text-xs font-bold font-outfit">
            + New Course
          </Button>
        )}
      </div>

      {showForm ? (
        <Card title={editingCourseId ? "Edit Course" : "Create Course"} subtitle="Fill in the course details below">
          <form onSubmit={handleCourseSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Course Title"
                id="course-title"
                required
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
              />
              <Input
                label="Instructor Name"
                id="course-display-name"
                placeholder="e.g. Dr. Jane Doe"
                value={courseDisplayName}
                onChange={(e) => setCourseDisplayName(e.target.value)}
              />
            </div>

            <Input
              label="Course Description"
              id="course-desc"
              required
              placeholder="Provide a comprehensive summary of course goals"
              value={courseDesc}
              onChange={(e) => setCourseDesc(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Price ($ USD)"
                id="course-price"
                type="number"
                required
                value={coursePrice}
                onChange={(e) => setCoursePrice(parseFloat(e.target.value) || 0)}
              />

              <div className="flex flex-col gap-1.5">
                <label htmlFor="course-level" className="text-xs font-semibold text-slate-600">Difficulty</label>
                <select
                  id="course-level"
                  value={courseLevel}
                  onChange={(e) => setCourseLevel(e.target.value)}
                  className="bg-white border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:border-brand-200 focus:ring-2 focus:ring-brand/10 transition-all"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="course-status" className="text-xs font-semibold text-slate-600">Status</label>
                <select
                  id="course-status"
                  value={courseStatus}
                  onChange={(e) => setCourseStatus(e.target.value)}
                  className="bg-white border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:border-brand-200 focus:ring-2 focus:ring-brand/10 transition-all"
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                </select>
              </div>
            </div>

            {/* Media Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Thumbnail */}
              <div className="space-y-2.5 bg-slate-50 border border-slate-200 p-4 rounded-xl">
                <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <Image size={13} /> Thumbnail
                </span>

                {courseThumbnail || pendingThumbnailFile ? (
                  <div className="flex items-start gap-3">
                    <img
                      src={pendingThumbnailFile ? URL.createObjectURL(pendingThumbnailFile) : courseThumbnail}
                      alt="Course Thumbnail"
                      className="w-28 h-18 object-cover rounded-lg border border-slate-200 shadow-sm bg-slate-100"
                      onError={(e) => { e.target.onerror = null; e.target.style.display = "none"; }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-slate-500 mb-1.5 truncate">
                        {pendingThumbnailFile ? pendingThumbnailFile.name : "Current thumbnail"}
                      </p>
                      <button
                        type="button"
                        onClick={() => pendingThumbnailFile ? setPendingThumbnailFile(null) : handleDeleteThumbnail()}
                        className="text-[10px] font-bold text-rose-500 hover:text-rose-600 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-[10px] text-slate-400">PNG, JPEG, or WEBP. Max 2MB.</p>
                    <label className="flex items-center justify-center gap-2 border border-dashed border-slate-300 hover:border-brand-200 bg-white rounded-lg p-3 cursor-pointer transition-colors text-xs text-slate-500 font-medium">
                      <Upload size={14} />
                      <span>Select image</span>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            if (file.size > 2 * 1024 * 1024) {
                              showToast("File exceeds 2MB limit", "error");
                              return;
                            }
                            setPendingThumbnailFile(file);
                          }
                        }}
                      />
                    </label>
                  </>
                )}

                {isThumbnailUploading && (
                  <div className="space-y-1.5 border border-slate-200 p-2.5 rounded-lg bg-white">
                    <div className="flex justify-between items-center text-[10px] text-brand-200 font-bold font-mono">
                      <span>{thumbnailStatusText}</span>
                      <span>{thumbnailPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-brand-200 h-full transition-all duration-200 rounded-full" style={{ width: `${thumbnailPercent}%` }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Trailer */}
              <div className="space-y-2.5 bg-slate-50 border border-slate-200 p-4 rounded-xl">
                <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <Film size={13} /> Trailer Video
                </span>

                {courseTrailer || pendingTrailerFile ? (
                  <div className="flex items-start gap-3">
                    <div className="w-28 h-18 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-200 shadow-sm shrink-0">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-white ml-0.5" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-slate-500 mb-1.5 truncate">
                        {pendingTrailerFile ? pendingTrailerFile.name : "Current trailer"}
                      </p>
                      <button
                        type="button"
                        onClick={() => pendingTrailerFile ? setPendingTrailerFile(null) : handleDeleteTrailer()}
                        className="text-[10px] font-bold text-rose-500 hover:text-rose-600 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-[10px] text-slate-400">MP4, WebM, or MOV. Max 100MB.</p>
                    <label className="flex items-center justify-center gap-2 border border-dashed border-slate-300 hover:border-brand-200 bg-white rounded-lg p-3 cursor-pointer transition-colors text-xs text-slate-500 font-medium">
                      <Upload size={14} />
                      <span>Select video</span>
                      <input
                        type="file"
                        accept="video/mp4, video/webm, video/quicktime, video/x-matroska"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            if (file.size > 100 * 1024 * 1024) {
                              showToast("File exceeds 100MB limit", "error");
                              return;
                            }
                            setPendingTrailerFile(file);
                          }
                        }}
                      />
                    </label>
                  </>
                )}

                {isTrailerUploading && (
                  <div className="space-y-1.5 border border-slate-200 p-2.5 rounded-lg bg-white">
                    <div className="flex justify-between items-center text-[10px] text-brand-200 font-bold font-mono">
                      <span>{trailerStatusText}</span>
                      <span>{trailerPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-brand-200 h-full transition-all duration-200 rounded-full" style={{ width: `${trailerPercent}%` }} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-2">
              <Button type="submit" variant="success" isLoading={formLoading || isThumbnailUploading || isTrailerUploading} disabled={formLoading || isThumbnailUploading || isTrailerUploading}>
                {editingCourseId ? "Save Changes" : "Create Course"}
              </Button>
              <Button onClick={resetForm} disabled={formLoading} variant="secondary">
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Card title="My Courses" subtitle="Manage your drafts and published courses">
          {/* Filter */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-outfit">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:border-brand-200 focus:ring-2 focus:ring-brand/10"
              >
                <option value="All">All</option>
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>

          {/* Course List */}
          {loading && courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 size={24} className="animate-spin text-slate-300" />
              <span className="text-xs text-slate-400 font-medium">Loading courses...</span>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-200 rounded-xl text-slate-400 bg-slate-50/50">
              <BookOpen size={28} className="mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-medium">No courses found</p>
              <p className="text-xs text-slate-400 mt-1">Create your first course to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map((crs) => (
                  <div
                    key={crs._id}
                    onClick={() => navigate(`/creator/courses/${crs._id}`)}
                    className="border border-slate-200 rounded-xl bg-white hover:shadow-md hover:border-brand-100 transition-all duration-200 cursor-pointer group"
                  >
                    {/* Image */}
                    <div className="relative overflow-hidden rounded-t-xl">
                      <CourseImage src={crs.thumbnailUrl} alt={crs.title} className="group-hover:scale-[1.02] transition-transform duration-300" />
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider font-outfit backdrop-blur-sm ${
                          crs.status === "Published"
                            ? "bg-emerald-50/90 text-emerald-600 border border-emerald-200/50"
                            : "bg-amber-50/90 text-amber-600 border border-amber-200/50"
                        }`}>
                          {crs.status}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-2.5">
                      <div className="flex items-center gap-2">
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider font-outfit">
                          {crs.level}
                        </span>
                        {crs.price > 0 && (
                          <span className="text-[10px] font-bold text-slate-500 font-outfit">
                            ${crs.price}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-slate-800 tracking-tight leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-brand-600 transition-colors" title={crs.title}>
                        {crs.title}
                      </h4>

                      <p className="text-xs text-slate-500">
                        {crs.displayName || "LMS Creator"}
                      </p>

                      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-semibold font-outfit">
                        <span className="flex items-center gap-1">
                          <Layers size={11} />
                          {crs.stats?.sectionCount || 0} Sections
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="flex items-center gap-1">
                          <BookOpen size={11} />
                          {crs.stats?.lessonCount || 0} Lessons
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="px-4 pb-4 flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/creator/courses/${crs._id}`);
                        }}
                        className="flex-1 py-2 bg-brand-200 text-[#111111] hover:bg-brand-300 text-xs font-bold font-outfit rounded-lg transition-colors"
                      >
                        Curriculum
                      </button>

                      <DropdownMenu
                        trigger={
                          <button
                            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                            aria-label="More actions"
                          >
                            <MoreHorizontal size={16} />
                          </button>
                        }
                        items={[
                          {
                            icon: <Edit size={12} />,
                            label: "Edit Course",
                            onClick: (e) => handleEditClick(e, crs),
                          },
                          crs.status === "Published"
                            ? {
                                icon: <Eye size={12} />,
                                label: "Unpublish",
                                warning: true,
                                onClick: (e) => handlePublishToggle(e, crs),
                              }
                            : {
                                icon: <Eye size={12} />,
                                label: "Publish",
                                success: true,
                                onClick: (e) => handlePublishToggle(e, crs),
                              },
                          {
                            icon: <Trash2 size={12} />,
                            label: "Delete",
                            danger: true,
                            onClick: (e) => handleDeleteClick(e, crs._id),
                          },
                        ]}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {hasNextPage && (
                <Button
                  onClick={() => fetchNextPage()}
                  variant="secondary"
                  className="w-full py-2.5 mt-2 text-xs font-bold font-outfit"
                  isLoading={isFetchingNextPage}
                >
                  Load More
                </Button>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default CreatorDashboard;
