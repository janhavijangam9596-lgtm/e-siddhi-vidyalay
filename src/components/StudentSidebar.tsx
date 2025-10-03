import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Route } from "../utils/enhanced-router";
import { useNavigation } from "../hooks/useNavigation";
import { useAuth } from "../utils/auth";
import {
  Home,
  BookOpen,
  GraduationCap,
  ClipboardList,
  Calendar,
  CheckCircle,
  CreditCard,
  Library,
  FileText,
  Trophy,
  Settings,
  LogOut,
  ChevronUp,
  User,
  Bell,
  Award,
  Clock,
} from "lucide-react";

const studentMenuItems: { icon: any; label: string; route: Route; badge?: string }[] = [
  { icon: Home, label: "Dashboard", route: "dashboard" },
  { icon: BookOpen, label: "My Courses", route: "my-courses", badge: "5" },
  { icon: Award, label: "My Grades", route: "my-grades" },
  { icon: ClipboardList, label: "Assignments", route: "my-assignments", badge: "3" },
  { icon: Calendar, label: "Class Schedule", route: "my-schedule" },
  { icon: CheckCircle, label: "Attendance", route: "my-attendance" },
  { icon: FileText, label: "Exams", route: "my-exams", badge: "2" },
  { icon: Trophy, label: "Results", route: "my-results" },
  { icon: CreditCard, label: "Fee Status", route: "my-fees" },
  { icon: Library, label: "Library", route: "my-library" },
];

export function StudentSidebar() {
  const { currentRoute, navigate } = useNavigation();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Calculate attendance percentage (mock data)
  const attendancePercentage = 85;
  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 75) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Student info (mock data - in real app, this would come from API)
  const studentInfo = {
    class: "10th A",
    rollNumber: "2024/101",
    session: "2024-25",
    attendancePercentage: 85,
    pendingAssignments: 3,
    upcomingExams: 2,
  };

  return (
    <div className="h-full w-full bg-white dark:bg-gray-900 border-r-2 border-gray-200 dark:border-gray-700 shadow-2xl flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="border-b-2 border-gray-200 dark:border-gray-700 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white p-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/25 backdrop-blur-md shadow-xl border border-white/30">
            <GraduationCap className="h-7 w-7 text-white drop-shadow-lg" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight drop-shadow-lg">Student Portal</span>
            <span className="text-xs text-white/90 font-medium">eSiddhiविद्यालय</span>
          </div>
        </div>
      </div>

      {/* Student Info Card */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border-b">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-blue-500">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'S'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{user?.name || 'Student'}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {studentInfo.class} | Roll: {studentInfo.rollNumber}
              </p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-2">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-gray-500" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Attendance</span>
              </div>
              <p className={`text-lg font-bold ${getAttendanceColor(attendancePercentage)}`}>
                {attendancePercentage}%
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-2">
              <div className="flex items-center gap-2">
                <Bell className="h-3 w-3 text-gray-500" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Pending</span>
              </div>
              <p className="text-lg font-bold text-orange-600">
                {studentInfo.pendingAssignments + studentInfo.upcomingExams}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-4">
        <div className="space-y-1 px-2">
          {studentMenuItems.map((item, index) => {
            const isActive = currentRoute === item.route;
            const Icon = item.icon;
            
            return (
              <button
                key={index}
                onClick={() => navigate(item.route)}
                className={`
                  w-full flex items-center justify-between relative group transition-all duration-300 rounded-lg px-3 py-2.5
                  ${isActive ? 
                    'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg font-bold' : 
                    'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${isActive ? 'text-white drop-shadow' : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-500'} transition-colors`} />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                
                {/* Badge for notifications */}
                {item.badge && (
                  <Badge 
                    variant={isActive ? "secondary" : "destructive"} 
                    className={`h-5 min-w-[20px] flex items-center justify-center ${
                      isActive ? 'bg-white/20 text-white' : ''
                    }`}
                  >
                    {item.badge}
                  </Badge>
                )}
                
                {/* Active indicator */}
                {isActive && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-lg animate-pulse"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* Additional Options */}
        <div className="mt-6 px-2">
          <div className="px-4 py-2 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
            Support
          </div>
          <div className="space-y-1">
            <button
              onClick={() => navigate('calendar')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all"
            >
              <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium">Academic Calendar</span>
            </button>
            
            <button
              onClick={() => navigate('communication')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all"
            >
              <Bell className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium">Notifications</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 flex-shrink-0">
        <div className="flex flex-col gap-3">
          {/* Session Info */}
          <div className="text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Academic Session: {studentInfo.session}
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex w-full gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-1 h-7 text-xs"
              onClick={() => navigate('profile')}
            >
              <User className="h-3 w-3 mr-1" />
              Profile
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-1 h-7 text-xs"
              onClick={() => navigate('settings')}
            >
              <Settings className="h-3 w-3 mr-1" />
              Settings
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-1 h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleSignOut}
            >
              <LogOut className="h-3 w-3 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}