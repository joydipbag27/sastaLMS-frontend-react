import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useCourses } from "../../features/courses/hooks/useCourses";
import { useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../services/api/apiClient";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import CourseDetails from "./CourseDetails";
import FileUpload from "../../features/media/components/FileUpload";

const CourseImage = ({ src, alt, className = "" }) => {
  const [imgSrc, setImgSrc] = useState(src || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1020");

  useEffect(() => {
    setImgSrc(src || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1020");
  }, [src]);

  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={() => {
        setImgSrc("https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1020");
      }}
      className={`w-full h-44 object-cover ${className}`}
    />
  );
};

const CourseTab = ({ currentProfile, defaultViewMode = "catalog" }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Selected course for detail drill-down (transient UI selection)
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Sync viewMode and filters from URL Search Parameters
  const viewMode = searchParams.get("view") || defaultViewMode;
  const filterCategory = searchParams.get("category") || "";
  const filterLevel = searchParams.get("level") || "";
  
  // Set default filterStatus based on viewMode if not present in URL
  const defaultStatus = viewMode === "my-courses" ? "All" : "Published";
  const filterStatus = searchParams.get("status") || defaultStatus;
  const limit = parseInt(searchParams.get("limit")) || 10;

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
  } = useCourses(viewMode, {
    category: filterCategory,
    level: filterLevel,
    status: filterStatus,
  }, limit);

  // Course Form states (local, transient)
  const [showForm, setShowForm] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDesc, setCourseDesc] = useState("");
  const [courseThumbnail, setCourseThumbnail] = useState("");
  const [coursePrice, setCoursePrice] = useState(0);
  const [courseCategory, setCourseCategory] = useState("");
  const [courseLevel, setCourseLevel] = useState("Beginner"); // Beginner | Intermediate | Advanced
  const [courseStatus, setCourseStatus] = useState("Draft"); // Draft | Published
  const [originalStatus, setOriginalStatus] = useState("Draft");
  const [formLoading, setFormLoading] = useState(false);
  const [pendingThumbnailFile, setPendingThumbnailFile] = useState(null);

  const isCreatorOrAdmin = currentProfile && ["CREATOR", "ADMIN"].includes(currentProfile.role);

  // Helper functions to update URL search parameters
  const setViewMode = (mode) => {
    setSearchParams((prev) => {
      prev.set("view", mode);
      prev.set("status", mode === "my-courses" ? "All" : "Published");
      return prev;
    });
  };

  const setFilterCategory = (val) => {
    setSearchParams((prev) => {
      if (val) prev.set("category", val);
      else prev.delete("category");
      return prev;
    });
  };

  const setFilterLevel = (val) => {
    setSearchParams((prev) => {
      if (val) prev.set("level", val);
      else prev.delete("level");
      return prev;
    });
  };

  const setFilterStatus = (val) => {
    setSearchParams((prev) => {
      if (val) prev.set("status", val);
      else prev.delete("status");
      return prev;
    });
  };

  const setLimit = (val) => {
    setSearchParams((prev) => {
      if (val) prev.set("limit", val.toString());
      else prev.delete("limit");
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
      
      // 1. Create or Update Course
      if (editingCourseId) {
        await updateCourse({ id: editingCourseId, body });
        
        // Handle publish/unpublish if status changed
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
        
        // If they selected Published during creation (even though new course starts as Draft)
        if (courseStatus === "Published") {
          try {
            await publishCourse(courseId);
          } catch (pubErr) {
            console.warn("Could not publish new course immediately:", pubErr);
            alert(`Course created as Draft. Note: ${pubErr.message}`);
          }
        }
      }

      // 2. Handle Thumbnail Upload if file is pending
      if (pendingThumbnailFile) {
        const mimeType = pendingThumbnailFile.type || "image/png";
        
        // Stage A: Get upload URL
        const presignRes = await makeRequest(`/course/${courseId}/thumbnail/upload-url`, {
          method: "POST",
          body: { mimeType },
        });
        if (!presignRes.success) throw new Error(presignRes.data?.error || "Failed to generate upload URL");

        const { uploadUrl, mediaId } = presignRes.data;

        // Stage B: PUT binary to S3
        await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) resolve();
            else reject(new Error(`S3 upload failed with HTTP ${xhr.status}`));
          });
          xhr.addEventListener("error", () => reject(new Error("Network error during S3 upload")));
          xhr.open("PUT", uploadUrl);
          xhr.setRequestHeader("Content-Type", mimeType);
          xhr.send(pendingThumbnailFile);
        });

        // Stage C: Confirm with backend
        const confirmRes = await makeRequest(`/course/${courseId}/thumbnail/confirm`, {
          method: "POST",
          body: { mediaId },
        });
        if (!confirmRes.success) throw new Error(confirmRes.data?.error || "Failed to confirm upload");
      }

      queryClient.invalidateQueries({ queryKey: ["courses"] });
      if (editingCourseId) {
        queryClient.invalidateQueries({ queryKey: ["course", editingCourseId] });
      }

      alert(editingCourseId ? "Course updated successfully!" : "Course created successfully!");
      resetForm();
      if (viewMode !== "my-courses") {
        setViewMode("my-courses");
      }
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

  // If viewing details of a course, render the curriculum coordinator instead
  if (selectedCourse) {
    return (
      <CourseDetails
        course={selectedCourse}
        currentProfile={currentProfile}
        onBack={() => setSelectedCourse(null)}
      />
    );
  }


  return (
    <div className="space-y-6 font-sans text-sm">
      {/* View mode toggle sub-navigation (For Creator/Admin) */}
      {isCreatorOrAdmin && (
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div className="flex gap-1 bg-[#090e1a] p-1 rounded-xl border border-slate-800/60 shadow-inner">
            <button
              onClick={() => setViewMode("catalog")}
              className={`px-4 py-1.5 rounded-lg font-bold text-xs transition-all duration-200 ${
                viewMode === "catalog"
                  ? "bg-sky-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              🌐 Browse Catalog
            </button>
            <button
              onClick={() => setViewMode("my-courses")}
              className={`px-4 py-1.5 rounded-lg font-bold text-xs transition-all duration-200 ${
                viewMode === "my-courses"
                  ? "bg-sky-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              👨‍🏫 My Created Courses
            </button>
          </div>

          {!showForm && (
            <Button onClick={() => setShowForm(true)} variant="primary" className="py-1.5 px-4 font-outfit">
              + Create New Course
            </Button>
          )}
        </div>
      )}



      {/* Toggle Course Creation/Editing Form vs Courses List */}
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
                <label htmlFor="course-level" className="text-xs font-semibold text-slate-400">Difficulty Level</label>
                <select
                  id="course-level"
                  value={courseLevel}
                  onChange={(e) => setCourseLevel(e.target.value)}
                  className="bg-[#0c1220] border border-slate-800 text-slate-100 rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="course-status" className="text-xs font-semibold text-slate-400">Publication Status</label>
                <select
                  id="course-status"
                  value={courseStatus}
                  onChange={(e) => setCourseStatus(e.target.value)}
                  className="bg-[#0c1220] border border-slate-800 text-slate-100 rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15"
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                </select>
              </div>
            </div>

            <div className="space-y-3 bg-[#0c1220] border border-slate-800 p-4 rounded-lg">
              <span className="text-xs font-semibold text-slate-400 block">Course Thumbnail</span>
              
              {courseThumbnail || pendingThumbnailFile ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <img 
                    src={pendingThumbnailFile ? URL.createObjectURL(pendingThumbnailFile) : courseThumbnail} 
                    alt="Course Thumbnail" 
                    className="w-32 h-20 object-cover rounded-lg border border-slate-800 shadow-md bg-slate-900"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1020";
                    }}
                  />
                  <div className="space-y-2">
                    <p className="text-xs text-slate-400">
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
                    className="border border-dashed border-slate-700 hover:border-sky-500 bg-slate-900/20 hover:bg-slate-900/40 rounded-lg p-4 text-center cursor-pointer transition-colors text-xs text-slate-400 font-medium"
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
                        setPendingDeletion(false);
                      }
                    }}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" variant="success" isLoading={formLoading} className="font-outfit">
                {editingCourseId ? "Save Changes" : "Create Course"}
              </Button>
              <Button onClick={resetForm} variant="secondary" className="font-outfit">
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        /* Courses Catalog Card */
        <Card
          title={
            viewMode === "my-courses"
              ? "My Created Courses"
              : viewMode === "enrolled"
              ? "My Enrolled Courses"
              : isCreatorOrAdmin
              ? "Courses Catalog"
              : "Explore Courses"
          }
          subtitle={
            viewMode === "my-courses"
              ? "Review and manage your drafts and published curricula"
              : viewMode === "enrolled"
              ? "View and continue learning your enrolled courses"
              : isCreatorOrAdmin
              ? "Browse the public course catalog"
              : "Browse published courses and enroll to start learning"
          }
        >
          {/* Filters Header - Hide for Enrolled view */}
          {viewMode !== "enrolled" && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-900/40 p-4 rounded-xl border border-slate-800/50 mb-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-outfit">Category Filter</span>
                <input
                  type="text"
                  placeholder="e.g. Web Development"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-[#0c1220] border border-slate-800 text-slate-100 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 placeholder:text-slate-600"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-outfit">Difficulty Level</span>
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="bg-[#0c1220] border border-slate-800 text-slate-100 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10"
                >
                  <option value="">All Difficulty Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-outfit">Publish Status</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-[#0c1220] border border-slate-800 text-slate-100 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10"
                >
                  {viewMode === "my-courses" ? (
                    <>
                      <option value="All">All Statuses</option>
                      <option value="Published">Published Only</option>
                      <option value="Draft">Drafts Only</option>
                    </>
                  ) : (
                    <>
                      <option value="Published">Published Only</option>
                      <option value="Draft">Drafts Only</option>
                    </>
                  )}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-outfit">Page Size</span>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={limit}
                  onChange={(e) => setLimit(parseInt(e.target.value) || 10)}
                  className="bg-[#0c1220] border border-slate-800 text-slate-100 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 text-center"
                />
              </div>
            </div>
          )}

          {/* Courses Feed list */}
          {loading && courses.length === 0 ? (
            <div className="text-center py-12 italic text-slate-500">Querying courses database...</div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl italic text-slate-500">
              {viewMode === "my-courses"
                ? "You haven't created any courses matching these filters yet."
                : viewMode === "enrolled"
                ? "You are not enrolled in any courses yet. Browse the catalog to enroll!"
                : "No courses matching these filters were found in the catalog."}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {courses.map((crs) => {
                  const canModify = currentProfile && ["CREATOR", "ADMIN"].includes(currentProfile.role);

                  return (
                    <div
                      key={crs._id}
                      className="border border-slate-800/80 rounded-xl bg-slate-950/40 overflow-hidden flex flex-col justify-between hover:shadow-lg hover:border-slate-700/60 transition-all duration-300 gap-4"
                    >
                      <div>
                        <CourseImage src={crs.thumbnailUrl} alt={crs.title} />
                        
                        <div className="p-5 space-y-3">
                          <div className="flex justify-between items-center gap-2">
                            <span className="bg-sky-500/10 border border-sky-500/25 px-2.5 py-0.5 rounded text-[10px] text-sky-400 font-bold uppercase tracking-wider font-outfit">
                              {crs.category}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider font-outfit ${
                              crs.status === "Published"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/25"
                            }`}>
                              {crs.status}
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-slate-100 font-outfit tracking-wide truncate" title={crs.title}>{crs.title}</h4>
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{crs.description}</p>
                        </div>
                      </div>

                      <div className="px-5 pb-5 space-y-4 flex flex-col justify-end flex-1">
                        <div className="border-t border-slate-900 pt-3 flex justify-between items-center text-xs text-slate-500 font-sans">
                          <div>
                            Level: <span className="text-slate-300 font-bold">{crs.level}</span>
                          </div>
                          <div className="text-right">
                            Price: <span className="text-sky-400 font-bold">{crs.price === 0 ? "FREE" : `$${crs.price}`}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-900 pt-3 gap-3">
                          <Button
                            onClick={() => {
                              if (isCreatorOrAdmin) {
                                navigate(`/admin/courses/${crs._id}`);
                              } else {
                                navigate(`/dashboard/courses/${crs._id}`);
                              }
                            }}
                            variant="primary"
                            className="py-2 px-3 text-xs flex-1 font-bold font-outfit"
                          >
                            {isCreatorOrAdmin ? "📖 Curriculum Details" : "🎓 View Course"}
                          </Button>
                          
                          {canModify && (
                            <div className="flex gap-2">
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
                                  className="px-3 py-2 text-xs font-bold font-outfit text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
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
                                  className="px-3 py-2 text-xs font-bold font-outfit text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                                >
                                  Publish
                                </Button>
                              )}
                              <Button
                                onClick={(e) => handleEditClick(e, crs)}
                                variant="secondary"
                                className="px-3 py-2 text-xs font-bold font-outfit"
                              >
                                Edit
                              </Button>
                              <Button
                                onClick={(e) => handleDeleteClick(e, crs._id)}
                                variant="danger"
                                className="px-3 py-2 text-xs font-bold font-outfit"
                              >
                                Delete
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
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

export default CourseTab;
