import { Suspense, lazy } from "react";
import { SimpleSidebar } from "./components/SimpleSidebar";
import { StudentSidebar } from "./components/StudentSidebar";
import { DashboardHeader } from "./components/DashboardHeader";
import { DashboardFooter } from "./components/DashboardFooter";
import { PageLoading } from "./utils/loading";

// Lazy load all route components for better performance
const DashboardHome = lazy(() => import("./components/DashboardHome").then(module => ({ default: module.DashboardHome })));
const ManagementDashboard = lazy(() => import("./components/modules/ManagementDashboard").then(module => ({ default: module.ManagementDashboard })));
const StudentManagement = lazy(() => import("./components/modules/StudentManagement").then(module => ({ default: module.StudentManagement })));
const AdmissionManagement = lazy(() => import("./components/modules/AdmissionManagement").then(module => ({ default: module.AdmissionManagement })));
const FeesManagement = lazy(() => import("./components/modules/FeesManagement").then(module => ({ default: module.FeesManagement })));
const ClassManagement = lazy(() => import("./components/modules/ClassManagement").then(module => ({ default: module.ClassManagement })));
const LibraryManagement = lazy(() => import("./components/modules/LibraryManagement").then(module => ({ default: module.LibraryManagement })));
const ExamManagement = lazy(() => import("./components/modules/ExamManagement").then(module => ({ default: module.ExamManagement })));
const TransportManagement = lazy(() => import("./components/modules/TransportManagement").then(module => ({ default: module.TransportManagement })));
const StaffManagement = lazy(() => import("./components/modules/StaffManagement").then(module => ({ default: module.StaffManagement })));
const AttendanceManagement = lazy(() => import("./components/modules/AttendanceManagement").then(module => ({ default: module.AttendanceManagement })));
const TimetableManagement = lazy(() => import("./components/modules/TimetableManagement").then(module => ({ default: module.TimetableManagement })));
const HealthRecords = lazy(() => import("./components/modules/HealthRecords").then(module => ({ default: module.HealthRecords })));
const HostelManagement = lazy(() => import("./components/modules/HostelManagement").then(module => ({ default: module.HostelManagement })));
const CommunicationCenter = lazy(() => import("./components/modules/CommunicationCenter").then(module => ({ default: module.CommunicationCenter })));
const ReportsAnalytics = lazy(() => import("./components/modules/ReportsAnalytics").then(module => ({ default: module.ReportsAnalytics })));
const CertificateManagement = lazy(() => import("./components/modules/CertificateManagement").then(module => ({ default: module.CertificateManagement })));
const AccountsManagement = lazy(() => import("./components/modules/AccountsManagement").then(module => ({ default: module.AccountsManagement })));
const SportsManagement = lazy(() => import("./components/modules/SportsManagement").then(module => ({ default: module.SportsManagement })));
const AlumniManagement = lazy(() => import("./components/modules/AlumniManagement").then(module => ({ default: module.AlumniManagement })));
const BirthdayManagement = lazy(() => import("./components/modules/BirthdayManagement").then(module => ({ default: module.BirthdayManagement })));
const InventoryManagement = lazy(() => import("./components/modules/InventoryManagement").then(module => ({ default: module.InventoryManagement })));
const SystemSettings = lazy(() => import("./components/modules/SystemSettings").then(module => ({ default: module.SystemSettings })));
const AdminManagement = lazy(() => import("./components/modules/AdminManagement").then(module => ({ default: module.AdminManagement })));
const CalendarManagement = lazy(() => import("./components/modules/CalendarManagement").then(module => ({ default: module.CalendarManagement })));
const ProfileSettings = lazy(() => import("./components/modules/ProfileSettings").then(module => ({ default: module.ProfileSettings })));
const NotificationsModule = lazy(() => import("./components/modules/NotificationsModule").then(module => ({ default: module.NotificationsModule })));
const StudentDashboard = lazy(() => import("./components/student/StudentDashboard").then(module => ({ default: module.StudentDashboard })));
const MyAssignments = lazy(() => import("./components/student/MyAssignments").then(module => ({ default: module.MyAssignments })));
const MyCourses = lazy(() => import("./components/student/MyCourses").then(module => ({ default: module.MyCourses })));
const MyGrades = lazy(() => import("./components/student/MyGrades").then(module => ({ default: module.MyGrades })));
const MySchedule = lazy(() => import("./components/student/MySchedule").then(module => ({ default: module.MySchedule })));
const MyAttendance = lazy(() => import("./components/student/MyAttendance").then(module => ({ default: module.MyAttendance })));
const MyFees = lazy(() => import("./components/student/MyFees").then(module => ({ default: module.MyFees })));
const MyLibrary = lazy(() => import("./components/student/MyLibrary").then(module => ({ default: module.MyLibrary })));
const MyExams = lazy(() => import("./components/student/MyExams").then(module => ({ default: module.MyExams })));
const MyResults = lazy(() => import("./components/student/MyResults").then(module => ({ default: module.MyResults })));
const NotFound = lazy(() => import("./components/NotFound").then(module => ({ default: module.default })));
import { Route } from "./utils/enhanced-router";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider, useAuth } from "./utils/auth";
import { LoginPage } from "./components/LoginPage";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { useNavigation } from "./hooks/useNavigation";

function AppContent() {
  const { currentRoute, isNavigating } = useNavigation();
  const { isAuthenticated, loading, user } = useAuth();

  const renderContent = () => {
    const routeComponents: Record<Route, JSX.Element> = {
      'dashboard': (
        <Suspense fallback={<PageLoading text="Loading dashboard..." />}>
          {user?.role === 'student' ? <StudentDashboard /> : <DashboardHome />}
        </Suspense>
      ),
      'management': (
        <Suspense fallback={<PageLoading text="Loading management..." />}>
          <ManagementDashboard />
        </Suspense>
      ),
      'students': (
        <Suspense fallback={<PageLoading text="Loading students..." />}>
          <StudentManagement />
        </Suspense>
      ),
      'staff': (
        <Suspense fallback={<PageLoading text="Loading staff..." />}>
          <StaffManagement />
        </Suspense>
      ),
      'admission': (
        <Suspense fallback={<PageLoading text="Loading admissions..." />}>
          <AdmissionManagement />
        </Suspense>
      ),
      'fees': (
        <Suspense fallback={<PageLoading text="Loading fees..." />}>
          <FeesManagement />
        </Suspense>
      ),
      'exam': (
        <Suspense fallback={<PageLoading text="Loading exams..." />}>
          <ExamManagement />
        </Suspense>
      ),
      'library': (
        <Suspense fallback={<PageLoading text="Loading library..." />}>
          <LibraryManagement />
        </Suspense>
      ),
      'classes': (
        <Suspense fallback={<PageLoading text="Loading classes..." />}>
          <ClassManagement />
        </Suspense>
      ),
      'timetable': (
        <Suspense fallback={<PageLoading text="Loading timetable..." />}>
          <TimetableManagement />
        </Suspense>
      ),
      'attendance': (
        <Suspense fallback={<PageLoading text="Loading attendance..." />}>
          <AttendanceManagement />
        </Suspense>
      ),
      'health': (
        <Suspense fallback={<PageLoading text="Loading health records..." />}>
          <HealthRecords />
        </Suspense>
      ),
      'accounts': (
        <Suspense fallback={<PageLoading text="Loading accounts..." />}>
          <AccountsManagement />
        </Suspense>
      ),
      'transport': (
        <Suspense fallback={<PageLoading text="Loading transport..." />}>
          <TransportManagement />
        </Suspense>
      ),
      'hostel': (
        <Suspense fallback={<PageLoading text="Loading hostel..." />}>
          <HostelManagement />
        </Suspense>
      ),
      'communication': (
        <Suspense fallback={<PageLoading text="Loading communication..." />}>
          <CommunicationCenter />
        </Suspense>
      ),
      'reports': (
        <Suspense fallback={<PageLoading text="Loading reports..." />}>
          <ReportsAnalytics />
        </Suspense>
      ),
      'certificates': (
        <Suspense fallback={<PageLoading text="Loading certificates..." />}>
          <CertificateManagement />
        </Suspense>
      ),
      'sports': (
        <Suspense fallback={<PageLoading text="Loading sports..." />}>
          <SportsManagement />
        </Suspense>
      ),
      'alumni': (
        <Suspense fallback={<PageLoading text="Loading alumni..." />}>
          <AlumniManagement />
        </Suspense>
      ),
      'birthday': (
        <Suspense fallback={<PageLoading text="Loading birthday..." />}>
          <BirthdayManagement />
        </Suspense>
      ),
      'inventory': (
        <Suspense fallback={<PageLoading text="Loading inventory..." />}>
          <InventoryManagement />
        </Suspense>
      ),
      'settings': (
        <Suspense fallback={<PageLoading text="Loading settings..." />}>
          <SystemSettings />
        </Suspense>
      ),
      'admin': (
        <Suspense fallback={<PageLoading text="Loading admin..." />}>
          <AdminManagement />
        </Suspense>
      ),
      'calendar': (
        <Suspense fallback={<PageLoading text="Loading calendar..." />}>
          <CalendarManagement />
        </Suspense>
      ),
      'profile': (
        <Suspense fallback={<PageLoading text="Loading profile..." />}>
          <ProfileSettings />
        </Suspense>
      ),
      'notifications': (
        <Suspense fallback={<PageLoading text="Loading notifications..." />}>
          <NotificationsModule />
        </Suspense>
      ),
      'student-dashboard': (
        <Suspense fallback={<PageLoading text="Loading student dashboard..." />}>
          <StudentDashboard />
        </Suspense>
      ),
      'my-courses': (
        <Suspense fallback={<PageLoading text="Loading courses..." />}>
          <MyCourses />
        </Suspense>
      ),
      'my-grades': (
        <Suspense fallback={<PageLoading text="Loading grades..." />}>
          <MyGrades />
        </Suspense>
      ),
      'my-assignments': (
        <Suspense fallback={<PageLoading text="Loading assignments..." />}>
          <MyAssignments />
        </Suspense>
      ),
      'my-schedule': (
        <Suspense fallback={<PageLoading text="Loading schedule..." />}>
          <MySchedule />
        </Suspense>
      ),
      'my-attendance': (
        <Suspense fallback={<PageLoading text="Loading attendance..." />}>
          <MyAttendance />
        </Suspense>
      ),
      'my-fees': (
        <Suspense fallback={<PageLoading text="Loading fees..." />}>
          <MyFees />
        </Suspense>
      ),
      'my-library': (
        <Suspense fallback={<PageLoading text="Loading library..." />}>
          <MyLibrary />
        </Suspense>
      ),
      'my-exams': (
        <Suspense fallback={<PageLoading text="Loading exams..." />}>
          <MyExams />
        </Suspense>
      ),
      'my-results': (
        <Suspense fallback={<PageLoading text="Loading results..." />}>
          <MyResults />
        </Suspense>
      ),
      '404': (
        <Suspense fallback={<PageLoading text="Loading..." />}>
          <NotFound />
        </Suspense>
      )
    };

    return routeComponents[currentRoute] || (
      <Suspense fallback={<PageLoading text="Loading..." />}>
        <NotFound />
      </Suspense>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
        {/* Fixed Sidebar - Hidden on mobile */}
        <div className="hidden md:flex md:w-64 md:flex-shrink-0">
          {user?.role === 'student' ? <StudentSidebar /> : <SimpleSidebar />}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 relative">
            {/* Loading overlay for navigation */}
            {isNavigating && (
              <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 z-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            )}
            <div key={currentRoute} className="w-full h-full animate-fade-in">
              {renderContent()}
            </div>
          </main>
          <DashboardFooter />
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden">
          <MobileBottomNav />
        </div>
      </div>

      <Toaster position="top-right" richColors closeButton />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}
