import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEnrollments } from "../../features/learning/hooks/useEnrollments";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { makeRequest } from "../../services/api/apiClient";
import Button from "../../components/ui/Button";
import {
  GraduationCap,
  Play,
  AlertCircle,
  Loader2,
  Layers,
  BookOpen,
  CreditCard,
  Download,
  IndianRupee,
  TrendingUp,
  History,
  FileSpreadsheet,
  ShieldCheck
} from "lucide-react";

// Metric card sub-component
const SummaryCard = ({ label, value, icon: Icon, iconColor }) => (
  <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 flex items-center gap-3">
    <div className={`shrink-0 rounded-lg flex items-center justify-center w-9 h-9 ${iconColor}`}>
      <Icon size={16} />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-bold text-slate-450 uppercase tracking-wider font-outfit truncate">{label}</p>
      <p className="font-black text-slate-800 tracking-tight font-outfit text-base mt-0.5">{value}</p>
    </div>
  </div>
);

const MyLearning = () => {
  const { profile } = useAuth();
  const isCreator = profile?.role === "CREATOR";

  // Standard student queries (only enabled for students)
  const { data: enrollments, isLoading: enrollLoading, error: enrollError } = useEnrollments();

  // Creator payment queries (only enabled for creators)
  const { data: paySummary, isLoading: summaryLoading } = useQuery({
    queryKey: ["paymentsSummary"],
    queryFn: async () => {
      const res = await makeRequest("/admin/payments/summary");
      if (!res.success) throw new Error(res.data?.error || "Failed to fetch summary");
      return res.data;
    },
    enabled: isCreator,
  });

  const { data: payTx, isLoading: txLoading } = useQuery({
    queryKey: ["paymentsTransactions"],
    queryFn: async () => {
      const res = await makeRequest("/admin/payments/successful?limit=25");
      if (!res.success) throw new Error(res.data?.error || "Failed to fetch payments");
      return res.data;
    },
    enabled: isCreator,
  });

  const [downloadingId, setDownloadingId] = useState(null);

  const handleDownloadInvoice = async (paymentId) => {
    setDownloadingId(paymentId);
    try {
      const res = await makeRequest(`/admin/payments/${paymentId}/invoice`);
      if (res.success && res.data?.invoiceUrl) {
        window.open(res.data.invoiceUrl, "_blank");
      } else {
        alert(res.data?.error || "Invoice url is not generated yet for this payment.");
      }
    } catch (err) {
      alert(err.message || "Failed to retrieve invoice.");
    } finally {
      setDownloadingId(null);
    }
  };

  // 1. RENDER CREATOR PAYMENT FLOW
  if (isCreator) {
    const formatCurrency = (val) => {
      const amount = val || 0;
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(amount);
    };

    return (
      <div className="space-y-6 pb-16">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight font-outfit">Payments & Payouts</h2>
          <p className="text-sm text-slate-500 mt-1">Monitor course transaction history, monthly revenues, and download payment receipts.</p>
        </div>

        {summaryLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-xl h-[70px]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              label="Total Revenue"
              value={formatCurrency(paySummary?.totalRevenue)}
              icon={TrendingUp}
              iconColor="bg-brand-50 text-brand-200"
            />
            <SummaryCard
              label="Monthly Revenue"
              value={formatCurrency(paySummary?.monthlyRevenue)}
              icon={IndianRupee}
              iconColor="bg-emerald-50 text-emerald-600"
            />
            <SummaryCard
              label="Successful Purchases"
              value={paySummary?.totalSuccessfulPayments ?? 0}
              icon={ShieldCheck}
              iconColor="bg-brand-50 text-brand-200"
            />
            <SummaryCard
              label="Purchase Attempts"
              value={paySummary?.totalPaymentAttempts ?? 0}
              icon={History}
              iconColor="bg-slate-100 text-slate-500"
            />
          </div>
        )}

        <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-bold font-outfit text-slate-850">Successful Transactions</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Most recent incoming student enrollment payments</p>
          </div>

          {txLoading ? (
            <div className="p-8 flex items-center justify-center gap-2 text-xs text-slate-400">
              <Loader2 size={16} className="animate-spin text-brand-200" />
              <span>Loading transaction history...</span>
            </div>
          ) : !payTx || !payTx.payments || payTx.payments.length === 0 ? (
            <div className="text-center py-16 m-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <FileSpreadsheet size={28} className="mx-auto mb-2 text-slate-350" />
              <p className="text-sm font-medium text-slate-650">No payment records found</p>
              <p className="text-xs text-slate-400 mt-1">Payments will populate as students buy your courses</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-outfit">Student</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-outfit">Course Purchased</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-outfit">Amount</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-outfit">Transaction ID</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-outfit text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payTx.payments.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800">{p.user?.username || "Anonymous"}</p>
                          <p className="text-[10px] text-slate-450 font-mono mt-0.5">{p.user?.email || ""}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-slate-700">{p.course?.title || "Deleted Course"}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Ordered: {new Date(p.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-800">{formatCurrency(p.amount)}</td>
                      <td className="px-5 py-3.5 font-mono text-[10px] text-slate-500">{p.razorpayPaymentId || "N/A"}</td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleDownloadInvoice(p._id)}
                          disabled={downloadingId === p._id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-200 text-[10px] font-bold transition-all border border-brand-100 shadow-sm cursor-pointer disabled:opacity-50"
                        >
                          {downloadingId === p._id ? (
                            <Loader2 size={11} className="animate-spin" />
                          ) : (
                            <Download size={11} />
                          )}
                          Get Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. RENDER STUDENT ENROLLMENT FLOW
  if (enrollLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <Loader2 className="w-8 h-8 border-2 border-brand-200 border-t-transparent rounded-full animate-spin mb-4 text-brand-200" />
        <p className="text-xs font-semibold text-slate-550">Loading enrolled courses...</p>
      </div>
    );
  }

  if (enrollError) {
    return (
      <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-xl max-w-5xl mx-auto space-y-4 shadow-sm">
        <p className="font-bold text-rose-500 text-sm">Failed to load enrollments: {enrollError.message}</p>
      </div>
    );
  }

  if (!enrollments || enrollments.length === 0) {
    return (
      <div className="space-y-6 pb-16">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight font-outfit">My Learning</h2>
          <p className="text-sm text-slate-500 mt-1">Access and continue learning your enrolled classrooms.</p>
        </div>

        <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-xl max-w-2xl mx-auto space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
            <GraduationCap size={28} className="text-slate-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">No enrolled courses yet</h3>
            <p className="text-xs text-slate-500">Explore our catalogs and enroll to start your learning journey!</p>
          </div>
          <Link to="/courses" className="inline-block">
            <Button variant="primary" className="py-2 px-6 font-semibold">
              Browse Catalog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight font-outfit">My Learning</h2>
        <p className="text-sm text-slate-550 mt-1">Access and continue learning your enrolled classrooms.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrollments.map((enr) => {
          const course = enr.course;
          const isUnavailable = !course || course.status === "Draft";
          const isCompleted = enr.status === "Completed";

          if (!course) return null;

          return (
            <div key={enr._id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200">
              <div>
                {course.thumbnailUrl ? (
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-full h-44 object-cover border-b border-slate-100 bg-slate-50"
                  />
                ) : (
                  <div className="w-full h-44 bg-gradient-to-br from-brand-50 to-sky-50 flex flex-col items-center justify-center text-brand-200 border-b border-slate-100 gap-1.5">
                    <GraduationCap size={36} className="stroke-[1.5]" />
                    <span className="text-[10px] font-bold tracking-wider font-outfit uppercase">veoLMS Class</span>
                  </div>
                )}
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${
                      isCompleted ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-brand-50 text-brand-200 border-brand-100"
                    }`}>
                      {enr.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-800 text-sm leading-snug line-clamp-1">{course.title}</h3>
                  <p className="text-xs text-slate-500">Instructor: {course.displayName || course.creator?.username || "Tutor"}</p>

                  <div className="flex items-center gap-3 text-[10px] text-slate-400 font-semibold font-outfit mt-1">
                    <span className="flex items-center gap-1">
                      <Layers size={11} />
                      {course.stats?.sectionCount || 0} {course.stats?.sectionCount === 1 ? "Section" : "Sections"}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <BookOpen size={11} />
                      {course.stats?.lessonCount || 0} {course.stats?.lessonCount === 1 ? "Lesson" : "Lessons"}
                    </span>
                  </div>

                  {isUnavailable && (
                    <div className="flex gap-2 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-600 text-xs leading-relaxed">
                      <AlertCircle size={14} className="shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Course temporarily unavailable</p>
                        <p className="text-slate-550 mt-0.5 text-[10px]">The creator has unpublished this course.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-slate-100">
                {isUnavailable ? (
                  <Button disabled variant="secondary" className="w-full py-2 text-xs font-semibold">
                    Unavailable
                  </Button>
                ) : (
                  <Link to={`/classroom/${course._id}`} className="block">
                    <Button variant="success" className="w-full py-2 text-xs font-semibold flex items-center justify-center gap-1.5">
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
