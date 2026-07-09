import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useCourses } from "../../features/courses/hooks/useCourses";
import { useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../services/api/apiClient";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import FileUpload from "../../features/media/components/FileUpload";
import { useS3Upload } from "../../features/media/hooks/useS3Upload";

import { GraduationCap } from "lucide-react";

const CourseImage = ({ src, alt, className = "" }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(!src);
  }, [src]);

  if (hasError || !src) {
    return (
      <div className={`w-full h-44 bg-gradient-to-br from-indigo-50 to-sky-50 flex flex-col items-center justify-center text-indigo-400 gap-1.5 ${className}`}>
        <GraduationCap size={36} className="stroke-[1.5] animate-pulse" />
        <span className="text-[10px] font-bold tracking-wider font-outfit uppercase">veoLMS Class</span>
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

const CreatorDashboard = ({ currentProfile }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const filterStatus = searchParams.get("status") || "All";
  const limit = 12;

  // React Query hook for course listing
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

  // Course Form states
  const [showForm, setShowForm] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDesc, setCourseDesc] = useState("");
  const [courseThumbnail, setCourseThumbnail] = useState("");
  const [coursePrice, setCoursePrice] = useState(0);
  const [courseCategory, setCourseCategory] = useState("");
  const [courseLevel, setCourseLevel] = useState("Beginner"); 
  const [courseStatus, setCourseStatus] = useState("Draft"); 
  const [originalStatus, setOriginalStatus] = useState("Draft");
  const [formLoading, setFormLoading] = useState(false);
  const [pendingThumbnailFile, setPendingThumbnailFile] = useState(null);

  const {
    isUploading: isThumbnailUploading,
    uploadPercent: thumbnailPercent,
    statusText: thumbnailStatusText,
    uploadFile: uploadThumbnail,
    resetUpload: resetThumbnailUpload,
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
    setFormLoading(true);
    const body = {
      title: courseTitle,
      description: courseDesc,
      price: coursePrice,
      category: courseCategory,
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
            alert(`Course created as Draft. Note: ${pubErr.message}`);
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
            if (!presignRes.success) throw new Error(presignRes.data?.error || "Failed to generate upload URL");
            return presignRes.data;
          },
          async ({ mediaId }) => {
            const confirmRes = await makeRequest(`/course/${courseId}/thumbnail/confirm`, {
              method: "POST",
              body: { mediaId },
            });
            if (!confirmRes.success) throw new Error(confirmRes.data?.error || "Failed to confirm upload");
            return confirmRes.data;
          }
        );
      }

      queryClient.invalidateQueries({ queryKey: ["courses"] });
      if (editingCourseId) {
        queryClient.invalidateQueries({ queryKey: ["course", editingCourseId] });
      }

      alert(editingCourseId ? "Course updated successfully!" : "Course created successfully!");
      resetForm();
    } catch (err) {
      alert(err.message || "Failed to submit course");
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
    setCoursePrice(crs.price || 0);
    setCourseCategory(crs.category);
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
      alert("Course deleted successfully!");
    } catch (err) {
      alert(err.message || "Failed to delete course");
    }
  };

  const resetForm = () => {
    setCourseTitle("");
    setCourseDesc("");
    setCourseThumbnail("");
    setCoursePrice(0);
    setCourseCategory("");
    setCourseLevel("Beginner");
    setCourseStatus("Draft");
    setOriginalStatus("Draft");
    setEditingCourseId(null);
    setPendingThumbnailFile(null);
    resetThumbnailUpload();
    setShowForm(false);
  };

  const handleDeleteThumbnail = async () => {
    if (!confirm("Are you sure you want to delete the course thumbnail from storage?")) return;
    try {
      const res = await makeRequest(`/course/${editingCourseId}/thumbnail`, {
        method: "DELETE",
      });
      if (!res.success) throw new Error(res.data?.error || "Failed to delete thumbnail");
      
      setCourseThumbnail("");
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["course", editingCourseId] });
      alert("Thumbnail deleted successfully!");
    } catch (err) {
      alert(err.message || "Failed to delete thumbnail");
    }
  };

  return (
    <div className="space-y-6 font-sans text-sm pb-16">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight font-outfit">Course Creator Dashboard</h2>
          <p className="text-sm text-slate-500 mt-1">Manage your LMS curriculum and published courses.</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} variant="primary" className="py-1.5 px-4 font-outfit">
            + Create New Course
          </Button>
        )}
      </div>

      {showForm ? (
        <Card title={editingCourseId ? "Edit Course Parameters" : "Create New Course"} subtitle="Add catalog courses to the LMS database">
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
                label="Category"
                id="course-category"
                required
                placeholder="e.g. Web Development, Data Science"
                value={courseCategory}
                onChange={(e) => setCourseCategory(e.target.value)}
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
                <label htmlFor="course-level" className="text-xs font-semibold text-slate-500">Difficulty Level</label>
                <select
                  id="course-level"
                  value={courseLevel}
                  onChange={(e) => setCourseLevel(e.target.value)}
                  className="bg-white border border-slate-250 text-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="course-status" className="text-xs font-semibold text-slate-500">Publication Status</label>
                <select
                  id="course-status"
                  value={courseStatus}
                  onChange={(e) => setCourseStatus(e.target.value)}
                  className="bg-white border border-slate-250 text-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                </select>
              </div>
            </div>

            <div className="space-y-3 bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <span className="text-xs font-semibold text-slate-500 block">Course Thumbnail</span>
              
              {courseThumbnail || pendingThumbnailFile ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <img 
                    src={pendingThumbnailFile ? URL.createObjectURL(pendingThumbnailFile) : courseThumbnail} 
                    alt="Course Thumbnail" 
                    className="w-32 h-20 object-cover rounded-lg border border-slate-200 shadow-md bg-slate-100"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = "none";
                    }}
                  />
                  <div className="space-y-2">
                    <p className="text-xs text-slate-500">
                      {pendingThumbnailFile ? "New thumbnail selected (pending save)" : "Current course thumbnail"}
                    </p>
                    <Button 
                      type="button" 
                      variant="danger" 
                      className="py-1 px-3 text-[11px] font-bold font-outfit"
                      onClick={() => {
                        if (pendingThumbnailFile) {
                          setPendingThumbnailFile(null);
                        } else {
                          handleDeleteThumbnail();
                        }
                      }}
                    >
                      Remove Thumbnail
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500">
                    No thumbnail selected. Select a PNG, JPEG, or WEBP image (Max size: 2MB).
                  </p>
                  
                  <div 
                    onClick={() => document.getElementById("thumbnail-file-input").click()}
                    className="border border-dashed border-slate-350 hover:border-indigo-500 bg-white rounded-lg p-4 text-center cursor-pointer transition-colors text-xs text-slate-500 font-medium"
                  >
                    Click to select thumbnail image
                  </div>
                  
                  <input
                    id="thumbnail-file-input"
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        if (file.size > 2 * 1024 * 1024) {
                          alert("File size exceeds 2MB limit.");
                          return;
                        }
                        setPendingThumbnailFile(file);
                      }
                    }}
                  />
                </div>
              )}

              {isThumbnailUploading && (
                <div className="mt-3 space-y-1.5 border border-slate-200 p-2.5 rounded bg-slate-50">
                  <div className="flex justify-between items-center text-[10px] text-indigo-650 font-bold font-mono">
                    <span>{thumbnailStatusText}</span>
                    <span>{thumbnailPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-indigo-600 h-full transition-all duration-200" style={{ width: `${thumbnailPercent}%` }} />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" variant="success" isLoading={formLoading || isThumbnailUploading} className="font-outfit">
                {editingCourseId ? "Save Changes" : "Create Course"}
              </Button>
              <Button onClick={resetForm} variant="secondary" className="font-outfit">
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Card
          title="My Created Courses"
          subtitle="Review and manage your drafts and published curricula"
        >
          <div className="flex gap-4 items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4 max-w-xs">
            <div className="flex-1 flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-outfit">Publish Status</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white border border-slate-200 text-slate-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 font-medium"
              >
                <option value="All">All Statuses</option>
                <option value="Published">Published Only</option>
                <option value="Draft">Drafts Only</option>
              </select>
            </div>
          </div>

          {loading && courses.length === 0 ? (
            <div className="text-center py-12 italic text-slate-500">Querying courses database...</div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl italic text-slate-400 bg-slate-50/50">
              You haven't created any courses matching these filters yet.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {courses.map((crs) => (
                  <div
                    key={crs._id}
                    onClick={() => navigate(`/admin/courses/${crs._id}`)}
                    className="border border-slate-100 rounded-2xl bg-white overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-indigo-200/50 transition-all duration-300 gap-4 cursor-pointer p-3"
                  >
                    <div>
                      <div className="rounded-xl overflow-hidden relative">
                        <CourseImage src={crs.thumbnailUrl} alt={crs.title} className="h-44 object-cover" />
                        <div className="absolute top-2 right-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider font-outfit shadow-sm ${
                            crs.status === "Published"
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                              : "bg-amber-50 text-amber-600 border border-amber-100"
                          }`}>
                            {crs.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="pt-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider font-outfit">
                            {crs.category}
                          </span>
                          <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider font-outfit">
                            {crs.level}
                          </span>
                        </div>

                        <h4 className="text-sm sm:text-base font-extrabold text-slate-800 font-sans tracking-tight leading-snug line-clamp-2 min-h-[2.5rem]" title={crs.title}>
                          {crs.title}
                        </h4>
                      </div>
                    </div>

                    <div className="space-y-3 flex flex-col justify-end">
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="primary"
                          className="w-full py-2 text-xs font-bold font-outfit"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/courses/${crs._id}`);
                          }}
                        >
                          📖 Curriculum Details
                        </Button>
                        
                        <div className="flex gap-1.5 justify-between">
                          {crs.status === "Published" ? (
                            <Button
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  await unpublishCourse(crs._id);
                                  alert("Course unpublished successfully!");
                                } catch (err) {
                                  alert(err.message || "Failed to unpublish course");
                                }
                              }}
                              variant="secondary"
                              className="px-2 py-1.5 text-[10px] font-bold font-outfit text-amber-600 border-amber-150 hover:bg-amber-50 flex-1"
                            >
                              Unpublish
                            </Button>
                          ) : (
                            <Button
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  await publishCourse(crs._id);
                                  alert("Course published successfully!");
                                } catch (err) {
                                  alert(err.message || "Failed to publish course");
                                }
                              }}
                              variant="secondary"
                              className="px-2 py-1.5 text-[10px] font-bold font-outfit text-emerald-600 border-emerald-150 hover:bg-emerald-50 flex-1"
                            >
                              Publish
                            </Button>
                          )}
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(e, crs);
                            }}
                            variant="secondary"
                            className="px-2 py-1.5 text-[10px] font-bold font-outfit flex-1"
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(e, crs._id);
                            }}
                            variant="danger"
                            className="px-2 py-1.5 text-[10px] font-bold font-outfit flex-1"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {hasNextPage && (
                <Button
                  onClick={() => fetchNextPage()}
                  variant="secondary"
                  className="w-full py-2.5 font-outfit mt-2"
                  isLoading={isFetchingNextPage}
                >
                  Load More Courses
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
