import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Route } from "../utils/enhanced-router";
import { useNavigation } from "../hooks/useNavigation";
import { useAuth } from "../utils/auth";
import { usePermissions } from "../utils/permissions";
import {
  Home,
  BarChart3,
  Users,
  User,
  GraduationCap,
  UserCheck,
  CreditCard,
  ClipboardCheck,
  Library,
  Trophy,
  Cake,
  Settings,
  Bus,
  Package,
  DollarSign,
  Calendar,
  Clock,
  Building,
  MessageSquare,
  FileText,
  Award,
  UserPlus,
  Heart,
  LogOut,
  ChevronUp,
  Shield,
} from "lucide-react";

const academicItems: { icon: any; label: string; route: Route }[] = [
  { icon: Home, label: "Dashboard", route: "dashboard" },
  { icon: Users, label: "Students", route: "students" },
  { icon: UserPlus, label: "Staff", route: "staff" },
  { icon: UserCheck, label: "Admission", route: "admission" },
  { icon: GraduationCap, label: "Classes", route: "classes" },
  { icon: Calendar, label: "Timetable", route: "timetable" },
  { icon: Clock, label: "Attendance", route: "attendance" },
  { icon: ClipboardCheck, label: "Exam", route: "exam" },
  { icon: Library, label: "Library", route: "library" },
  { icon: Heart, label: "Health", route: "health" },
];

const managementItems: { icon: any; label: string; route: Route }[] = [
  { icon: BarChart3, label: "Management Hub", route: "management" },
  { icon: CreditCard, label: "Fees", route: "fees" },
  { icon: DollarSign, label: "Accounts", route: "accounts" },
  { icon: Bus, label: "Transport", route: "transport" },
  { icon: Building, label: "Hostel", route: "hostel" },
  { icon: MessageSquare, label: "Communication", route: "communication" },
  { icon: FileText, label: "Reports", route: "reports" },
  { icon: Award, label: "Certificates", route: "certificates" },
];

const otherItems: { icon: any; label: string; route: Route }[] = [
   { icon: Trophy, label: "Sports", route: "sports" },
   { icon: Users, label: "Alumni", route: "alumni" },
   { icon: Cake, label: "Birthday", route: "birthday" },
   { icon: Package, label: "Inventory", route: "inventory" },
   { icon: Shield, label: "Admin", route: "admin" },
 ];

const settingsItems: { icon: any; label: string; route: Route }[] = [
   { icon: User, label: "Profile Settings", route: "profile" },
   { icon: Settings, label: "System Settings", route: "settings" },
 ];

export function SimpleSidebar() {
  const { currentRoute, navigate } = useNavigation();
  const { user, signOut } = useAuth();
  const permissions = usePermissions(user?.role as any);

  // Filter items based on user permissions
  const getFilteredItems = (items: typeof academicItems) => {
    return items.filter(item => {
      const permission = item.route as any;
      return permissions.hasPermission(permission);
    });
  };

  const filteredAcademicItems = getFilteredItems(academicItems);
  const filteredManagementItems = getFilteredItems(managementItems);
  const filteredOtherItems = getFilteredItems(otherItems);
  const filteredSettingsItems = getFilteredItems(settingsItems);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'principal': return 'bg-purple-100 text-purple-800';
      case 'teacher': return 'bg-blue-100 text-blue-800';
      case 'student': return 'bg-green-100 text-green-800';
      case 'accountant': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="h-full w-full bg-white dark:bg-gray-900 border-r-2 border-gray-200 dark:border-gray-700 shadow-2xl flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="border-b-2 border-gray-200 dark:border-gray-700 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white p-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/25 backdrop-blur-md shadow-xl border border-white/30">
            <GraduationCap className="h-7 w-7 text-white drop-shadow-lg" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight drop-shadow-lg">eSiddhiविद्यालय</span>
            <span className="text-xs text-white/90 font-medium">Smart Campus System</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-4">
        {filteredAcademicItems.length > 0 && (
          <div className="mb-6">
            <div className="px-4 py-2 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">ACADEMIC</div>
            <div className="space-y-1 px-2">
              {filteredAcademicItems.map((item, index) => {
                const isActive = currentRoute === item.route;
                return (
                  <button
                    key={index}
                    onClick={() => navigate(item.route)}
                    className={`
                      w-full flex items-center relative group transition-all duration-300 rounded-lg px-3 py-2.5
                      ${isActive ? 
                        'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg font-bold' : 
                        'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }
                    `}
                  >
                    <item.icon className={`h-5 w-5 ${isActive ? 'text-white drop-shadow' : 'text-gray-500 dark:text-gray-400 group-hover:text-indigo-500'} transition-colors`} />
                    <span className="ml-3 text-sm font-medium">{item.label}</span>
                    {isActive && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-lg animate-pulse"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {filteredManagementItems.length > 0 && (
          <div className="mb-6">
            <div className="px-4 py-2 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">MANAGEMENT</div>
            <div className="space-y-1 px-2">
              {filteredManagementItems.map((item, index) => {
                const isActive = currentRoute === item.route;
                return (
                  <button
                    key={index}
                    onClick={() => navigate(item.route)}
                    className={`
                      w-full flex items-center relative group transition-all duration-300 rounded-lg px-3 py-2.5
                      ${isActive ? 
                        'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg font-bold' : 
                        'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }
                    `}
                  >
                    <item.icon className={`h-5 w-5 ${isActive ? 'text-white drop-shadow' : 'text-gray-500 dark:text-gray-400 group-hover:text-indigo-500'} transition-colors`} />
                    <span className="ml-3 text-sm font-medium">{item.label}</span>
                    {isActive && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-lg animate-pulse"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {filteredOtherItems.length > 0 && (
           <div className="mb-6">
             <div className="px-4 py-2 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">OTHERS</div>
             <div className="space-y-1 px-2">
               {filteredOtherItems.map((item, index) => {
                 const isActive = currentRoute === item.route;
                 return (
                   <button
                     key={index}
                     onClick={() => navigate(item.route)}
                     className={`
                       w-full flex items-center relative group transition-all duration-300 rounded-lg px-3 py-2.5
                       ${isActive ?
                         'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg font-bold' :
                         'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                       }
                     `}
                   >
                     <item.icon className={`h-5 w-5 ${isActive ? 'text-white drop-shadow' : 'text-gray-500 dark:text-gray-400 group-hover:text-indigo-500'} transition-colors`} />
                     <span className="ml-3 text-sm font-medium">{item.label}</span>
                     {isActive && (
                       <span className="absolute right-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-lg animate-pulse"></span>
                     )}
                   </button>
                 );
               })}
             </div>
           </div>
         )}

         {filteredSettingsItems.length > 0 && (
           <div className="mb-6">
             <div className="px-4 py-2 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">SETTINGS</div>
             <div className="space-y-1 px-2">
               {filteredSettingsItems.map((item, index) => {
                 const isActive = currentRoute === item.route;
                 return (
                   <button
                     key={index}
                     onClick={() => navigate(item.route)}
                     className={`
                       w-full flex items-center relative group transition-all duration-300 rounded-lg px-3 py-2.5
                       ${isActive ?
                         'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg font-bold' :
                         'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                       }
                     `}
                   >
                     <item.icon className={`h-5 w-5 ${isActive ? 'text-white drop-shadow' : 'text-gray-500 dark:text-gray-400 group-hover:text-indigo-500'} transition-colors`} />
                     <span className="ml-3 text-sm font-medium">{item.label}</span>
                     {isActive && (
                       <span className="absolute right-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-lg animate-pulse"></span>
                     )}
                   </button>
                 );
               })}
             </div>
           </div>
         )}
      </div>

      {/* Footer */}
      <div className="border-t-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 flex-shrink-0">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 w-full">
            <Avatar className="h-10 w-10 border-2 border-indigo-500 shadow-lg">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold">
                {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col flex-1 text-left">
              <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {user?.name || 'Guest User'}
              </span>
              <div className="flex items-center gap-2">
                <Badge 
                  variant="secondary" 
                  className={`text-xs px-2 py-0.5 font-bold ${getRoleColor(user?.role)}`}
                >
                  {user?.role?.toUpperCase() || 'GUEST'}
                </Badge>
              </div>
            </div>
            <ChevronUp className="h-4 w-4 text-gray-500" />
          </div>
          
          <div className="flex w-full gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-1 h-7 text-xs"
              onClick={() => navigate('profile')}
            >
              Profile
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