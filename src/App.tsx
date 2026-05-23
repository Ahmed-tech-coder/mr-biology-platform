import { Suspense, lazy, useEffect } from "react";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Loading from "@/components/Loading";
import ProtectedRoute from "@/components/ProtectedRoute";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import { AuthProvider } from "@/context/AuthContext";
import { AdminAuthProvider } from "@/context/AdminAuthContext";

const queryClient = new QueryClient();

// ✅ Lazy Imports
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const AdminLogin = lazy(() => import("./pages/auth/AdminLogin"));

const DashboardLayout = lazy(() => import("./layouts/DashboardLayout"));
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));

// User Pages
const Dashboard = lazy(() => import("./pages/user/Dashboard"));
const MyCourses = lazy(() => import("./pages/user/MyCourses"));
const PaidCourses = lazy(() => import("./pages/user/PaidCourses"));
const FreeCourses = lazy(() => import("./pages/user/FreeCourses"));
const StudentExams = lazy(() => import("./pages/user/Exams"));
const ExamQuestionsStudents = lazy(() => import("./pages/user/ExamQuestions"));
const CourseLectures = lazy(() => import("./pages/user/CourseLectures"));
const LectureView = lazy(() => import("./pages/user/LectureView"));
const CourseDetails = lazy(() => import("./pages/user/CourseDetails"));
const Profile = lazy(() => import("./pages/user/Profile"));
const LiveClasses = lazy(() => import("./pages/user/LiveClasses"));
const Review = lazy(() => import("./pages/user/ReviewExam"));
const UserDuties = lazy(() => import("./pages/user/MyDuties"));
const MyDutiesSubmissions = lazy(() => import("./pages/user/MyDutiesSubmissions"));

// Admin Pages
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const Courses = lazy(() => import("./pages/admin/Courses/Courses"));
const SubscriptionsCount = lazy(() => import("./pages/admin/Courses/SubscriptionsCount"));
const CoursesDetails = lazy(() => import("./pages/admin/Courses/CourseDetails"));
const AdminCourseLectures = lazy(() => import("./pages/admin/Courses/CourseLectures"));
const AdminCourseLecturesView = lazy(() => import("./pages/admin/Courses/LectureView"));
const AddCourse = lazy(() => import("./pages/admin/Courses/AddCourse"));
const EditCourse = lazy(() => import("./pages/admin/Courses/EditCourse"));
const AddLecture = lazy(() => import("./pages/admin/Courses/AddLecture"));
const EditLecture = lazy(() => import("./pages/admin/Courses/EditLecture"));
const PurchaseOrders = lazy(() => import("./pages/admin/Purchases/PurchaseOrders"));
const Users = lazy(() => import("./pages/admin/Users/Users"));
const Administration = lazy(() => import("./pages/admin/Administration/Administration"));
const AddAdministration = lazy(() => import("./pages/admin/Administration/AddAdministration"));
const EditAdministration = lazy(() => import("./pages/admin/Administration/EditAdministration"));
const Exams = lazy(() => import("./pages/admin/Exams/Exams"));
const AddExam = lazy(() => import("./pages/admin/Exams/AddExam"));
const EditExam = lazy(() => import("./pages/admin/Exams/EditExam"));
const ExamQuestions = lazy(() => import("./pages/admin/Exams/ExamQuestions"));
const AddQuestion = lazy(() => import("./pages/admin/Exams/AddQuestion"));
const EditQuestion = lazy(() => import("./pages/admin/Exams/EditQuestion"));
const ExamDetails = lazy(() => import("./pages/admin/Exams/ExamDetails"));
const Payments = lazy(() => import("./pages/admin/Payments/Payments"));
const Requests = lazy(() => import("./pages/admin/Requests/Requests"));
const LiveLectures = lazy(() => import("./pages/admin/LiveLectures/LiveLectures"));
const AddClass = lazy(() => import("./pages/admin/LiveLectures/AddClass"));
const Groups = lazy(() => import("./pages/admin/Groups/Groups"));
const GroupDetails = lazy(() => import("./pages/admin/Groups/GroupDetails"));
const AddGroup = lazy(() => import("./pages/admin/Groups/AddGroup"));
const EditGroup = lazy(() => import("./pages/admin/Groups/EditGroup"));
const StudentData = lazy(() => import("./pages/admin/Users/StudentData"));
const Duties = lazy(() => import("./pages/admin/Duties/Duties"));
const AddDuty = lazy(() => import("./pages/admin/Duties/AddDuty"));
const EditDuty = lazy(() => import("./pages/admin/Duties/EditDuty"));
const DutiesSubmissions = lazy(() => import("./pages/admin/Duties/DutiesSubmissions"));

const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const lastPath = localStorage.getItem("lastPath");
    if (lastPath && location.pathname === "/") {
      navigate(lastPath, { replace: true });
    }
  }, [navigate, location]);

  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Index />} />

        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* User Protected */}
        <Route element={<ProtectedRoute allowedRole="student" />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/my-courses" element={<MyCourses />} />
            <Route path="/paid-courses" element={<PaidCourses />} />
            <Route path="/free-courses" element={<FreeCourses />} />
            <Route path="/exam" element={<StudentExams />} />
            <Route path="/exam/:exam_code/questions" element={<ExamQuestionsStudents />} />
            <Route path="/exam/:exam_code/review" element={<Review />} />
            <Route path="/my-courses/course/:courseId/lectures" element={<CourseLectures />} />
            <Route path="/my-courses/course/:courseId/lecture/:lectureId" element={<LectureView />} />
            <Route path="/my-courses/course/:courseCode" element={<CourseDetails />} />
            <Route path="/live-classes" element={<LiveClasses />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-duties" element={<UserDuties />} />
            <Route path="/my-duties/submission" element={<MyDutiesSubmissions />} />
          </Route>
        </Route>

        {/* Admin Protected */}
        <Route element={<ProtectedAdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/admin/courses/:course_code/subscriptions-count" element={<SubscriptionsCount />} />
            <Route path="/admin/courses/add-course" element={<AddCourse />} />
            <Route path="/courses/:id/course-details" element={<CoursesDetails />} />
            <Route path="/admin/courses/:course_code/edit-course" element={<EditCourse />} />
            <Route path="/admin/courses/:course_code/lectures" element={<AdminCourseLectures />} />
            <Route path="/admin/courses/:course_code/lectures/:lecture_code/lecture-view" element={<AdminCourseLecturesView />} />
            <Route path="/admin/courses/lectures/:course_code/edit-lecture/:lecture_code" element={<EditLecture />} />
            <Route path="/admin/courses/:course_code/add-lecture" element={<AddLecture />} />
            <Route path="/purchase-orders" element={<PurchaseOrders />} />
            <Route path="/users" element={<Users />} />
            <Route path="/administration" element={<Administration />} />
            <Route path="/administration/add-administration" element={<AddAdministration />} />
            <Route path="/administration/:admin_code/edit-administration" element={<EditAdministration />} />
            <Route path="/exams" element={<Exams />} />
            <Route path="/exams/:exam_code/exam-details" element={<ExamDetails />} />
            <Route path="/exams/add-exam" element={<AddExam />} />
            <Route path="/exams/:exam_code/edit-exam" element={<EditExam />} />
            <Route path="/exams/:exam_code/questions" element={<ExamQuestions />} />
            <Route path="/exams/:exam_code/questions/add-question" element={<AddQuestion />} />
            <Route path="/exams/:exam_code/questions/:question_code/edit-question" element={<EditQuestion />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/requests" element={<Requests />} />
            <Route path="/live-lectures" element={<LiveLectures />} />
            <Route path="/live-lectures/add-class" element={<AddClass />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/groups/:group_code/group-details" element={<GroupDetails />} />
            <Route path="/groups/add-group" element={<AddGroup />} />
            <Route path="/groups/:group_code/edit-group" element={<EditGroup />} />
            <Route path="/users/student-data" element={<StudentData />} />
            <Route path="/duties" element={<Duties />} />
            <Route path="/duties/add-duty" element={<AddDuty />} />
            <Route path="/duties/:duty_code/edit-duty" element={<EditDuty />} />
            <Route path="/duties/:duty_code/submissions" element={<DutiesSubmissions />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

const App = () => {
useEffect(() => {
  // 1️⃣ Unregister all service workers
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((reg) => reg.unregister());
    });
  }

  // 2️⃣ Clear all caches
  if ("caches" in window) {
    caches.keys().then((names) => names.forEach((name) => caches.delete(name)));
  }

  // 3️⃣ Version check to reload only if app_version changed
  const checkForUpdate = async () => {
    try {
      const response = await fetch(`/meta.json?nocache=${Date.now()}`);
      const data = await response.json();
      const currentVersion = localStorage.getItem("app_version");

      if (!currentVersion || currentVersion !== data.version) {
        localStorage.setItem("app_version", data.version);
        window.location.reload(); // reload once only
      }
    } catch (error) {
      console.error("Version check failed:", error);
    }
  };

  checkForUpdate();
}, []);


  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster position="top-right" richColors closeButton expand duration={4000} theme="light" />
        <BrowserRouter>
          <AuthProvider>
            <AdminAuthProvider>
              <AppContent />
            </AdminAuthProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
