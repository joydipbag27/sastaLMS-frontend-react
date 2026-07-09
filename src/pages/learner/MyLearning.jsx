import React from "react";
import { Link } from "react-router-dom";
import { useEnrollments } from "../../features/learning/hooks/useEnrollments";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { GraduationCap, Play, AlertCircle, Loader2 } from "lucide-react";

const MyLearning = () => {
  const { data: enrollments, isLoading, error } = useEnrollments();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <Loader2 className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4 text-indigo-650" />
        <p className="font-mono text-[10px] uppercase font-bold tracking-widest text-indigo-650">Loading Enrolled Courses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 font-mono text-xs text-slate-600 bg-white border border-dashed border-slate-200 rounded-lg max-w-5xl mx-auto space-y-4 shadow-sm">
        <p className="font-bold text-rose-500">Failed to load enrollments: {error.message}</p>
      </div>
    );
  }

  if (!enrollments || enrollments.length === 0) {
    return (
      <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-2xl max-w-2xl mx-auto space-y-6 shadow-sm">
        <div className="mx-auto w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
          <GraduationCap size={28} className="text-slate-400" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-800">No enrolled courses yet</h3>
          <p className="text-xs text-slate-500">Explore our catalogs and enroll to start your learning journey!</p>
        </div>
        <Link to="/courses" className="inline-block">
          <Button variant="primary" className="py-2 px-6 font-bold font-outfit uppercase">
            Browse Catalog
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight font-outfit">My Learning</h2>
        <p className="text-sm text-slate-500 mt-1">Access and continue learning your enrolled classrooms.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrollments.map((enr) => {
          const course = enr.course;
          const isUnavailable = !course || course.status === "Draft";
          const isCompleted = enr.status === "Completed";

          if (!course) return null;

          return (
            <div key={enr._id} className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200">
              <div>
                {course.thumbnailUrl ? (
                  <img 
                    src={course.thumbnailUrl} 
                    alt={course.title}
                    className="w-full h-44 object-cover border-b border-slate-100 bg-slate-50"
                  />
                ) : (
                  <div className="w-full h-44 bg-gradient-to-br from-indigo-50 to-sky-50 flex flex-col items-center justify-center text-indigo-400 border-b border-slate-100 gap-1.5">
                    <GraduationCap size={36} className="stroke-[1.5] animate-pulse" />
                    <span className="text-[10px] font-bold tracking-wider font-outfit uppercase">veoLMS Class</span>
                  </div>
                )}
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded text-indigo-650 font-bold uppercase tracking-wider font-outfit">
                      {course.category}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${
                      isCompleted ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-indigo-50 text-indigo-600 border-indigo-100"
                    }`}>
                      {enr.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-800 text-sm leading-snug line-clamp-1">{course.title}</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Instructor: {course.creator?.username || "Tutor"}</p>

                  {isUnavailable && (
                    <div className="flex gap-2 p-2.5 bg-rose-50 border border-rose-100 rounded-lg text-rose-600 text-[10px] leading-relaxed">
                      <AlertCircle size={14} className="shrink-0 mt-0.5 animate-bounce" />
                      <div>
                        <p className="font-bold">Course temporarily unavailable</p>
                        <p className="text-slate-500 mt-0.5 text-[9px]">The creator has unpublished this course.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-slate-100">
                {isUnavailable ? (
                  <Button disabled variant="secondary" className="w-full py-2 text-xs font-bold font-outfit uppercase">
                    Unavailable
                  </Button>
                ) : (
                  <Link to={`/classroom/${course._id}`} className="block">
                    <Button variant="success" className="w-full py-2 text-xs font-bold font-outfit uppercase flex items-center justify-center gap-1.5">
                      <Play size={12} fill="currentColor" />
                      Continue Learning
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyLearning;
