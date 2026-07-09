import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useCourses } from "../../features/courses/hooks/useCourses";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import CourseDetails from "./CourseDetails";
import { GraduationCap, Layers, BookOpen } from "lucide-react";

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

const CourseTab = ({ currentProfile }) => {
  const navigate = useNavigate();

  // Selected course for detail drill-down (transient UI selection)
  const [selectedCourse, setSelectedCourse] = useState(null);

  const limit = 12;

  // React Query hook for public course catalog
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

  return (
    <div className="space-y-6 font-sans text-sm pb-16">
      <Card
        title="Explore Courses"
        subtitle="Browse published courses and enroll to start learning"
      >
        {loading && courses.length === 0 ? (
          <div className="text-center py-12 italic text-slate-500">Querying courses catalog...</div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl italic text-slate-400 bg-slate-50/50">
            No courses were found in the catalog.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {courses.map((crs) => (
                <div
                  key={crs._id}
                  onClick={() => {
                    if (isCreatorOrAdmin) {
                      navigate(`/admin/courses/${crs._id}`);
                    } else {
                      navigate(`/dashboard/courses/${crs._id}`);
                    }
                  }}
                  className="border border-slate-100 rounded-2xl bg-white overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-indigo-200/50 transition-all duration-300 gap-4 cursor-pointer p-3"
                >
                  <div>
                    <div className="rounded-xl overflow-hidden">
                      <CourseImage src={crs.thumbnailUrl} alt={crs.title} className="h-44 object-cover" />
                    </div>
                    
                    <div className="pt-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider font-outfit">
                          {crs.level}
                        </span>
                      </div>

                      <h4 className="text-sm sm:text-base font-extrabold text-slate-800 font-sans tracking-tight leading-snug line-clamp-2 min-h-[2.5rem]" title={crs.title}>
                        {crs.title}
                      </h4>
                      
                      <p className="text-xs text-slate-450 font-medium">
                        {crs.displayName || crs.creator?.username || "LMS Tutor"}
                      </p>

                      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-semibold font-outfit mt-1">
                        <span className="flex items-center gap-1">
                          <Layers size={11} className="text-slate-400" />
                          {crs.stats?.sectionCount || 0} {crs.stats?.sectionCount === 1 ? "Section" : "Sections"}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <BookOpen size={11} className="text-slate-400" />
                          {crs.stats?.lessonCount || 0} {crs.stats?.lessonCount === 1 ? "Lesson" : "Lessons"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 flex flex-col justify-end">
                    {isCreatorOrAdmin ? (
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
                    ) : (
                      <Button
                        variant="primary"
                        className="w-full py-2.5 text-xs font-bold font-outfit uppercase tracking-wider"
                      >
                        {crs.price === 0 ? "Enroll for Free" : `Buy now to unlock - $${crs.price}`}
                      </Button>
                    )}
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
    </div>
  );
};

export default CourseTab;
