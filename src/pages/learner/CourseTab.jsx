import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useCourses } from "../../features/courses/hooks/useCourses";
import Button from "../../components/ui/Button";
import CourseDetails from "./CourseDetails";
import { GraduationCap, Layers, BookOpen, Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";

const CourseImage = ({ src, alt, className = "" }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(!src);
  }, [src]);

  if (hasError || !src) {
    return (
      <div className={`w-full h-full bg-gradient-to-br from-indigo-50 to-sky-50 flex flex-col items-center justify-center text-indigo-400 gap-1.5 ${className}`}>
        <GraduationCap size={36} className="stroke-[1.5]" />
        <span className="text-[10px] font-bold tracking-wider font-outfit uppercase">veoLMS Class</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className={`w-full h-full object-cover ${className}`}
    />
  );
};

const CourseCardSkeleton = () => (
  <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm p-3 animate-pulse space-y-3">
    <div className="aspect-video w-full rounded-lg bg-slate-100" />
    <div className="space-y-2">
      <div className="h-3 w-16 bg-slate-100 rounded" />
      <div className="h-4 w-3/4 bg-slate-100 rounded" />
      <div className="h-3 w-1/2 bg-slate-100 rounded" />
    </div>
    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
      <div className="h-3 w-12 bg-slate-100 rounded" />
      <div className="h-7 w-24 bg-slate-100 rounded-lg" />
    </div>
  </div>
);

const CourseCard = ({ crs, isCreatorOrAdmin, navigate }) => {
  const handleCardClick = () => {
    if (isCreatorOrAdmin) {
      navigate(`/admin/courses/${crs._id}`);
    } else {
      navigate(`/dashboard/courses/${crs._id}`);
    }
  };

  return (
    <button
      onClick={handleCardClick}
      className="group border border-slate-200 rounded-xl bg-white overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-indigo-200 transition-all duration-200 cursor-pointer p-3 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none h-full text-left"
    >
      <div className="space-y-3">
        <div className="rounded-lg overflow-hidden aspect-video relative bg-slate-50">
          <CourseImage src={crs.thumbnailUrl} alt={crs.title} className="w-full h-full object-cover" />

          <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-outfit shadow-sm border border-slate-200">
            {crs.level}
          </span>
        </div>

        <div className="space-y-1.5">
          <h4 className="text-sm font-bold text-slate-800 tracking-tight leading-snug line-clamp-2 min-h-[2.5rem]" title={crs.title}>
            {crs.title}
          </h4>

          <p className="text-xs text-slate-500">
            by <span className="font-semibold text-slate-700">{crs.displayName || crs.creator?.username || "LMS Tutor"}</span>
          </p>

          <div className="flex items-center gap-3 text-[10px] text-slate-400 font-semibold font-outfit">
            <span className="flex items-center gap-1">
              <Layers size={11} />
              {crs.stats?.sectionCount || 0} {crs.stats?.sectionCount === 1 ? "Section" : "Sections"}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <BookOpen size={11} />
              {crs.stats?.lessonCount || 0} {crs.stats?.lessonCount === 1 ? "Lesson" : "Lessons"}
            </span>
          </div>

          {crs.description && (
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed pt-1">
              {crs.description}
            </p>
          )}
        </div>
      </div>

      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-sm font-bold text-slate-800">
          {crs.price === 0 ? "Free" : `$${crs.price}`}
        </span>
        <span className="text-xs font-semibold text-indigo-650 bg-indigo-50 px-2.5 py-1 rounded-lg group-hover:bg-indigo-100 transition-colors">
          {isCreatorOrAdmin ? "Manage" : "Explore"}
        </span>
      </div>
    </button>
  );
};

const CourseTab = ({ currentProfile }) => {
  const navigate = useNavigate();

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");

  const limit = 12;

  const {
    courses,
    isLoading: loading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCourses("catalog", {
    status: "Published",
  }, limit);

  const isCreatorOrAdmin = currentProfile && ["CREATOR", "ADMIN"].includes(currentProfile.role);

  if (selectedCourse) {
    return (
      <CourseDetails
        course={selectedCourse}
        currentProfile={currentProfile}
        onBack={() => setSelectedCourse(null)}
      />
    );
  }

  const filteredCourses = courses.filter((crs) => {
    const matchesSearch =
      crs.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (crs.displayName || crs.creator?.username || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === "All" || crs.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    if (sortBy === "Course Name A-Z") {
      return a.title.localeCompare(b.title);
    } else if (sortBy === "Course Name Z-A") {
      return b.title.localeCompare(a.title);
    } else {
      return new Date(b.createdAt || b._id) - new Date(a.createdAt || a._id);
    }
  });

  return (
    <div className="space-y-6 pb-16">

      {/* Catalog Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black font-outfit text-slate-800 tracking-tight">Explore Courses</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Discover courses, explore the curriculum, and start learning.
          </p>
        </div>
        {!loading && (
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 rounded-full px-3 py-1 font-outfit">
            {filteredCourses.length} {filteredCourses.length === 1 ? "course" : "courses"} available
          </span>
        )}
      </div>

      {/* Catalog Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">

        <div className="flex-1 relative">
          <label htmlFor="search-input" className="sr-only">Search courses</label>
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="search-input"
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 placeholder:text-slate-400 transition-all"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-3">
          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
            <SlidersHorizontal size={14} className="text-slate-400 shrink-0" />
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all cursor-pointer w-full"
              aria-label="Filter by level"
            >
              <option value="All">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
            <ArrowUpDown size={14} className="text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all cursor-pointer w-full"
              aria-label="Sort courses"
            >
              <option value="Newest">Newest</option>
              <option value="Course Name A-Z">Course Name A-Z</option>
              <option value="Course Name Z-A">Course Name Z-A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div>
        {loading && courses.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-slate-200 rounded-xl bg-white flex flex-col items-center justify-center p-6 space-y-2">
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 mb-2">
              <GraduationCap size={28} className="text-slate-400" />
            </div>
            <h4 className="font-bold text-slate-700 text-sm">No courses available yet</h4>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              Published courses will appear here when they become available.
            </p>
          </div>
        ) : sortedCourses.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-slate-200 rounded-xl bg-white flex flex-col items-center justify-center p-6 space-y-3">
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 mb-2">
              <Search size={28} className="text-slate-400" />
            </div>
            <h4 className="font-bold text-slate-700 text-sm">No courses found</h4>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              Try adjusting your search or filters to discover other courses.
            </p>
            <Button
              variant="secondary"
              onClick={() => {
                setSearchQuery("");
                setLevelFilter("All");
                setSortBy("Newest");
              }}
              className="py-1.5 px-3 text-xs"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedCourses.map((crs) => (
                <div key={crs._id} className="w-full h-full">
                  <CourseCard crs={crs} isCreatorOrAdmin={isCreatorOrAdmin} navigate={navigate} />
                </div>
              ))}
            </div>

            {hasNextPage && (
              <div className="pt-4 flex justify-center">
                <Button
                  onClick={() => fetchNextPage()}
                  variant="secondary"
                  className="px-6 py-2"
                  isLoading={isFetchingNextPage}
                >
                  Load More Courses
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

export default CourseTab;
