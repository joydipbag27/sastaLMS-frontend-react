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
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-mono text-[10px] uppercase font-bold tracking-widest text-sky-400">Loading Enrolled Courses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 font-mono text-xs text-slate-500 bg-slate-900/10 border border-dashed border-slate-800 rounded-lg max-w-5xl mx-auto space-y-4">
        <p className="font-bold text-rose-400">Failed to load enrollments: {error.message}</p>
      </div>
    );
  }

  if (!enrollments || enrollments.length === 0) {
    return (
      <div className="text-center py-20 bg-slate-950/20 border border-dashed border-slate-800/80 rounded-xl max-w-2xl mx-auto space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-slate-900/50 flex items-center justify-center border border-slate-800">
          <GraduationCap size={28} className="text-slate-500" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-200">No enrolled courses yet</h3>
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-100 tracking-tight">My Learning</h2>
        <p className="text-sm text-slate-500 mt-1">Access and continue learning your enrolled classrooms.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrollments.map((enr) => {
          const course = enr.course;
          const isUnavailable = !course || course.status === "Draft";
          const isCompleted = enr.status === "Completed";

          if (!course) return null;

          return (
            <div key={enr._id} className="bg-slate-950/40 border border-slate-800/80 rounded-xl overflow-hidden shadow-md flex flex-col justify-between">
              <div>
                <img 
                  src={course.thumbnailUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500"} 
                  alt={course.title}
                  className="w-full h-44 object-cover border-b border-slate-900 bg-slate-900"
                />
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-400 font-bold uppercase tracking-wider">
                      {course.category}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      isCompleted ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/30" : "bg-sky-950/40 text-sky-400 border border-sky-900/30"
                    }`}>
                      {enr.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-200 text-sm leading-snug line-clamp-1">{course.title}</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Instructor: {course.creator?.username || "Tutor"}</p>

                  {isUnavailable && (
                    <div className="flex gap-2 p-2.5 bg-rose-950/20 border border-rose-900/40 rounded-lg text-rose-400 text-[10px] leading-relaxed">
                      <AlertCircle size={14} className="shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Course temporarily unavailable</p>
                        <p className="text-slate-550 mt-0.5 text-[9px]">The creator has unpublished this course.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-slate-900/85">
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
