import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../services/api/apiClient";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { ShieldCheck, CreditCard, Loader2, CheckCircle2, AlertTriangle, ChevronLeft, GraduationCap } from "lucide-react";
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-checkout-script")) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-checkout-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const CheckoutPage = ({ currentProfile }) => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pollIntervalRef = useRef(null);

  // States: 'idle', 'initiating', 'paying', 'processing', 'success', 'timeout', 'error'
  const [paymentState, setPaymentState] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch Course details
  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ["course-checkout", courseId],
    queryFn: async () => {
      const res = await makeRequest(`/course/${courseId}`);
      if (res.success) {
        return res.data.course;
      }
      throw new Error(res.data?.error || "Failed to fetch course details");
    },
    enabled: !!courseId,
  });

  // Fetch current enrollment status (to prevent double checkout)
  const { data: isEnrolled, isLoading: enrollmentLoading } = useQuery({
    queryKey: ["enrollment-check", courseId],
    queryFn: async () => {
      const res = await makeRequest(`/course/${courseId}/enrollment`);
      return res.success;
    },
    enabled: !!courseId,
  });

  // Clear polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // Poll for enrollment update after successful payment
  const startEnrollmentPolling = () => {
    setPaymentState("processing");
    let attempts = 0;
    const maxAttempts = 15; // 15 attempts * 2s = 30 seconds

    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    pollIntervalRef.current = setInterval(async () => {
      attempts++;
      try {
        const res = await makeRequest(`/course/${courseId}/enrollment`);
        if (res.success) {
          clearInterval(pollIntervalRef.current);
          queryClient.invalidateQueries({ queryKey: ["enrollment", courseId] });
          queryClient.invalidateQueries({ queryKey: ["enrollment-check", courseId] });
          queryClient.invalidateQueries({ queryKey: ["enrollments"] });
          queryClient.invalidateQueries({ queryKey: ["sections", courseId] });
          queryClient.invalidateQueries({ queryKey: ["lessons"] });
          setPaymentState("success");
          return;
        }
      } catch (err) {
        console.error("Error checking enrollment status:", err);
      }

      if (attempts >= maxAttempts) {
        clearInterval(pollIntervalRef.current);
        setPaymentState("timeout");
      }
    }, 2000);
  };

  const handlePayment = async () => {
    setPaymentState("initiating");
    setErrorMessage("");

    try {
      // 1. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load Razorpay payment gateway. Please check your internet connection.");
      }

      // 2. Create Order on Backend
      const orderRes = await makeRequest("/payment/order", {
        method: "POST",
        body: { courseId },
      });

      if (!orderRes.success) {
        throw new Error(orderRes.data?.error || "Failed to initiate transaction. Please try again.");
      }

      const { key, amount, currency, orderId } = orderRes.data;

      // 3. Configure Checkout Options
      const options = {
        key,
        amount,
        currency,
        name: "veoLMS",
        description: `Purchase: ${course.title}`,
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop",
        order_id: orderId,
        handler: async function (response) {
          // Razorpay payment succeeded. Razorpay Webhooks will process enrollment.
          // Transition to processing (polling) state.
          startEnrollmentPolling();
        },
        prefill: {
          name: currentProfile?.username || "",
          email: currentProfile?.email || "",
        },
        theme: {
          color: "#0ea5e9", // Sky-500
        },
        modal: {
          ondismiss: function () {
            setPaymentState("idle");
          },
        },
      };

      setPaymentState("paying");
      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error("[handlePayment] Checkout error:", err);
      setErrorMessage(err.message || "An unexpected error occurred during payment setup.");
      setPaymentState("error");
    }
  };

  if (courseLoading || enrollmentLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="w-10 h-10 border-t-sky-500 animate-spin text-sky-400 mb-4" />
        <p className="font-mono text-[10px] uppercase font-bold tracking-widest text-sky-400">Securing checkout session...</p>
      </div>
    );
  }

  if (isEnrolled || paymentState === "success") {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <div className="bg-slate-950/40 border border-emerald-500/30 rounded-2xl p-8 text-center backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500/20 via-emerald-400 to-emerald-500/20" />
          <div className="mx-auto w-16 h-16 bg-emerald-950/30 border border-emerald-500/30 rounded-full flex items-center justify-center mb-6 text-emerald-400">
            <CheckCircle2 size={36} className="animate-pulse" />
          </div>
          
          <h2 className="text-xl font-bold text-slate-100 font-outfit mb-3">Tuition Payment Received!</h2>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-8">
            You are enrolled in **{course?.title}**. Classroom access has been unlocked.
          </p>

          <Link to={`/classroom/${course?._id}`} className="block">
            <Button variant="success" className="w-full py-3 text-xs font-bold font-outfit uppercase tracking-wider flex items-center justify-center gap-2">
              <GraduationCap size={16} />
              Open Classroom
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (paymentState === "processing") {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <div className="bg-slate-950/40 border border-sky-500/20 rounded-2xl p-8 text-center backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-sky-500/20 via-sky-400 to-sky-500/20" />
          <div className="mx-auto w-16 h-16 bg-sky-950/30 border border-sky-500/30 rounded-full flex items-center justify-center mb-6 text-sky-400">
            <Loader2 size={36} className="animate-spin" />
          </div>
          
          <h2 className="text-xl font-bold text-slate-100 font-outfit mb-3">Processing Transaction</h2>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
            We are confirming your payment with Razorpay. This will take just a few seconds. Do not refresh or close this window.
          </p>
        </div>
      </div>
    );
  }

  if (paymentState === "timeout") {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <div className="bg-slate-950/40 border border-amber-500/30 rounded-2xl p-8 text-center backdrop-blur-xl shadow-2xl">
          <div className="mx-auto w-16 h-16 bg-amber-950/30 border border-amber-500/30 rounded-full flex items-center justify-center mb-6 text-amber-400">
            <AlertTriangle size={36} />
          </div>
          
          <h2 className="text-xl font-bold text-slate-100 font-outfit mb-3">Enrollment Pending</h2>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-8">
            Your payment was successful, but the confirmation is taking longer than expected. Please wait a moment or go back to your dashboard to check classroom access.
          </p>

          <div className="flex flex-col gap-2">
            <Button onClick={() => setPaymentState("processing")} variant="primary" className="py-2.5 text-xs font-bold font-outfit uppercase">
              Retry Checking Status
            </Button>
            <Link to="/courses" className="block">
              <Button variant="secondary" className="w-full py-2.5 text-xs font-bold font-outfit uppercase">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 px-4">
      {/* Back Link */}
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-1 text-slate-500 hover:text-slate-350 text-xs font-bold uppercase tracking-wider font-outfit transition-all"
      >
        <ChevronLeft size={16} /> Back to details
      </button>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Left Column: Summary (3 cols) */}
        <div className="md:col-span-3 space-y-4">
          <Card title="Order Details" subtitle="Review your selected classroom seat">
            <div className="flex gap-4 items-start pb-4 border-b border-slate-900/80">
              <img 
                src={course?.thumbnailUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300"} 
                alt={course?.title} 
                className="w-20 h-16 object-cover rounded-lg border border-slate-900 bg-slate-950 shrink-0"
              />
              <div className="min-w-0">
                <h3 className="font-bold text-slate-200 text-sm truncate leading-tight">{course?.title}</h3>
                <p className="text-xs text-slate-500 mt-1 font-outfit">Level: {course?.level} | Category: {course?.category}</p>
                <p className="text-[10px] text-slate-650 mt-0.5">Instructor: {course?.creator?.username || "Tutor"}</p>
              </div>
            </div>

            <div className="pt-4 flex items-start gap-3 bg-slate-900/10 p-3.5 rounded-xl border border-slate-900/80 text-slate-400 text-xs leading-relaxed">
              <ShieldCheck className="text-emerald-500 shrink-0 mt-0.5" size={16} />
              <div>
                <p className="font-bold text-slate-300">Secure Course Purchase</p>
                <p className="text-[10px] mt-0.5">VeoLMS does not store your card details. Payment processing is handled end-to-end via Razorpay's bank-grade secure layers.</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Pricing & Checkout Button (2 cols) */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between gap-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-sky-500/10 via-sky-400/20 to-sky-500/10" />
            
            <div className="space-y-4">
              <span className="text-slate-500 text-[10px] font-bold block uppercase tracking-wider font-outfit">Checkout Summary</span>
              
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-bold">${course?.price?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Taxes & Fees</span>
                  <span className="font-bold">$0.00</span>
                </div>
                <div className="border-t border-slate-900 my-2 pt-2 flex justify-between items-baseline">
                  <span className="text-slate-300 font-bold">Total (USD)</span>
                  <span className="text-xl font-black text-slate-200 font-outfit">${course?.price?.toFixed(2)}</span>
                </div>
                {course?.price && (
                  <div className="text-[10px] text-slate-500 text-right font-medium">
                    (Processed in INR at checkout)
                  </div>
                )}
              </div>
            </div>

            {paymentState === "error" && (
              <div className="p-3 bg-rose-950/20 border border-rose-900/50 rounded-lg text-rose-400 text-xs font-medium">
                {errorMessage}
              </div>
            )}

            <Button
              onClick={handlePayment}
              variant="primary"
              isLoading={paymentState === "initiating" || paymentState === "paying"}
              className="w-full py-3 text-xs font-bold font-outfit uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <CreditCard size={14} />
              Pay with Razorpay
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
