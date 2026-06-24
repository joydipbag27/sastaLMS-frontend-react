import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useCourses } from "../../hooks/useCourses";
import Card from "../common/Card";
import Button from "../common/Button";
import Input from "../common/Input";
import CourseDetails from "./CourseDetails";

const CourseTab = ({ currentProfile, defaultViewMode = "catalog" }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

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
  const [formLoading, setFormLoading] = useState(false);

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
      thumbnail: courseThumbnail || undefined,
      price: coursePrice,
      category: courseCategory,
      level: courseLevel,
      status: courseStatus,
    };

    try {
      if (editingCourseId) {
        await updateCourse({ id: editingCourseId, body });
        alert("Course updated successfully!");
      } else {
        await createCourse(body);
        alert("Course created successfully!");
      }
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
    setCourseThumbnail(crs.thumbnail || "");
    setCoursePrice(crs.price || 0);
    setCourseCategory(crs.category);
    setCourseLevel(crs.level || "Beginner");
    setCourseStatus(crs.status || "Draft");
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
    setEditingCourseId(null);
    setShowForm(false);
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
    <div className="space-y-4 font-mono text-xs">
      {/* View mode toggle sub-navigation (For Creator/Admin) */}
      {isCreatorOrAdmin && (
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div className="flex gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800/80">
            <button
              onClick={() => setViewMode("catalog")}
              className={`px-3 py-1 rounded font-bold text-[11px] transition-all duration-200 ${
                viewMode === "catalog"
                  ? "bg-sky-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              🌐 Browse Catalog
            </button>
            <button
              onClick={() => setViewMode("my-courses")}
              className={`px-3 py-1 rounded font-bold text-[11px] transition-all duration-200 ${
                viewMode === "my-courses"
                  ? "bg-sky-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              👨‍🏫 My Created Courses
            </button>
          </div>

          {!showForm && (
            <Button onClick={() => setShowForm(true)} variant="primary" className="py-1 px-3">
              + Create New Course
            </Button>
          )}
        </div>
      )}

      {/* View mode toggle sub-navigation (For Students) */}
      {!isCreatorOrAdmin && (
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div className="flex gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800/80">
            <button
              onClick={() => setViewMode("catalog")}
              className={`px-3 py-1 rounded font-bold text-[11px] transition-all duration-200 ${
                viewMode === "catalog"
                  ? "bg-sky-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              🌐 Explore Catalog
            </button>
            <button
              onClick={() => setViewMode("enrolled")}
              className={`px-3 py-1 rounded font-bold text-[11px] transition-all duration-200 ${
                viewMode === "enrolled"
                  ? "bg-sky-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              📚 My Enrolled Courses
            </button>
          </div>
        </div>
      )}

      {/* Toggle Course Creation/Editing Form vs Courses List */}
      {showForm ? (
        <Card title={editingCourseId ? "Edit Course Parameters" : "Create New Course"} subtitle="Add catalog courses to the LMS database">
          <form onSubmit={handleCourseSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                  className="bg-slate-900 border border-slate-700 text-slate-100 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-sky-500"
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
                  className="bg-slate-900 border border-slate-700 text-slate-100 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-sky-500"
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                </select>
              </div>
            </div>

            <Input
              label="Thumbnail URL (Optional)"
              id="course-thumbnail"
              type="url"
              placeholder="e.g. https://domain.com/image.png"
              value={courseThumbnail}
              onChange={(e) => setCourseThumbnail(e.target.value)}
            />

            <div className="flex gap-2 pt-1">
              <Button type="submit" variant="success" isLoading={formLoading}>
                {editingCourseId ? "Save Changes" : "Create Course"}
              </Button>
              <Button onClick={resetForm} variant="secondary">
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
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-slate-900/40 p-3 rounded border border-slate-800/80 mb-3">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Category Filter</span>
                <input
                  type="text"
                  placeholder="e.g. Web Development"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-slate-950 border border-slate-755 text-slate-100 rounded px-2 py-1 text-xs focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Difficulty Level</span>
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="bg-slate-950 border border-slate-755 text-slate-100 rounded px-2 py-1 text-xs focus:outline-none"
                >
                  <option value="">All Difficulty Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Publish Status</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-slate-950 border border-slate-755 text-slate-100 rounded px-2 py-1 text-xs focus:outline-none"
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
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Page Size</span>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={limit}
                  onChange={(e) => setLimit(parseInt(e.target.value) || 10)}
                  className="bg-slate-950 border border-slate-755 text-slate-100 rounded px-2 py-1 text-xs focus:outline-none text-center"
                />
              </div>
            </div>
          )}

          {/* Courses Feed list */}
          {loading && courses.length === 0 ? (
            <div className="text-center py-8 italic text-slate-500">Querying courses database...</div>
          ) : courses.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-slate-800 rounded italic text-slate-500">
              {viewMode === "my-courses"
                ? "You haven't created any courses matching these filters yet."
                : viewMode === "enrolled"
                ? "You are not enrolled in any courses yet. Browse the catalog to enroll!"
                : "No courses matching these filters were found in the catalog."}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map((crs) => {
                  const canModify = currentProfile && ["CREATOR", "ADMIN"].includes(currentProfile.role);

                  return (
                    <div
                      key={crs._id}
                      className="border border-slate-800 rounded bg-slate-950 p-4 flex flex-col justify-between hover:shadow-md gap-3 shadow-inner"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <span className="bg-slate-900 border border-slate-850 px-2 py-0.5 rounded text-[10px] text-sky-400 font-bold uppercase font-mono">
                            {crs.category}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            crs.status === "Published" ? "bg-emerald-950 text-emerald-300 border border-emerald-900/60" : "bg-amber-950 text-amber-300 border border-amber-900/60"
                          }`}>
                            {crs.status}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-100 truncate font-mono" title={crs.title}>{crs.title}</h4>
                        <p className="text-[11px] text-slate-400 line-clamp-2 h-8 leading-relaxed font-mono">{crs.description}</p>
                      </div>

                      <div className="border-t border-slate-900/80 pt-2 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                        <div>
                          Level: <span className="text-slate-300 font-bold">{crs.level}</span>
                        </div>
                        <div className="text-right">
                          Price: <span className="text-sky-400 font-bold">{crs.price === 0 ? "FREE" : `$${crs.price}`}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-900/80 pt-2 gap-2">
                        <Button
                          onClick={() => {
                            if (isCreatorOrAdmin) {
                              navigate(`/admin/courses/${crs._id}`);
                            } else {
                              navigate(`/dashboard/courses/${crs._id}`);
                            }
                          }}
                          variant="primary"
                          className="py-1 px-3 text-[10px] flex-1 font-bold"
                        >
                          {isCreatorOrAdmin ? "📖 Curriculum Details" : "🎓 View Course"}
                        </Button>
                        
                        {canModify && (
                          <div className="flex gap-1.5">
                            <Button
                              onClick={(e) => handleEditClick(e, crs)}
                              variant="secondary"
                              className="px-2 py-1 text-[10px] font-bold"
                            >
                              Edit
                            </Button>
                            <Button
                              onClick={(e) => handleDeleteClick(e, crs._id)}
                              variant="danger"
                              className="px-2 py-1 text-[10px] font-bold"
                            >
                              Delete
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {hasNextPage && (
                <Button
                  onClick={() => fetchNextPage()}
                  variant="secondary"
                  className="w-full py-1.5"
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
