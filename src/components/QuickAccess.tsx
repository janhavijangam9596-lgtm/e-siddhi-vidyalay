import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import {
  GraduationCap,
  Calendar,
  BookOpen,
  CreditCard,
  MapPin,
  Users,
  FileText,
  Coffee,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useNavigation } from "../hooks/useNavigation";
import { api } from "../utils/api";
import { useState } from "react";
import { toast } from "sonner";

const quickAccessItems = [
  {
    title: "Course Registration",
    description: "Register for courses and view your academic schedule",
    icon: GraduationCap,
    color: "text-blue-600",
    route: "my-courses" as const,
    action: "checkEnrollment"
  },
  {
    title: "Academic Calendar",
    description: "View important dates and academic events",
    icon: Calendar,
    color: "text-green-600",
    route: "calendar" as const,
    action: "checkEvents"
  },
  {
    title: "Digital Library",
    description: "Access books, journals, and research materials",
    icon: BookOpen,
    color: "text-purple-600",
    route: "my-library" as const,
    action: "checkLibrary"
  },
  {
    title: "Fee Payment",
    description: "Pay tuition fees and view payment history",
    icon: CreditCard,
    color: "text-orange-600",
    route: "my-fees" as const,
    action: "checkFees"
  },
  {
    title: "Campus Map",
    description: "Navigate campus buildings and facilities",
    icon: MapPin,
    color: "text-red-600",
    route: "transport" as const,
    action: "checkTransport"
  },
  {
    title: "Student Groups",
    description: "Join clubs and student organizations",
    icon: Users,
    color: "text-indigo-600",
    route: "communication" as const,
    action: "checkAnnouncements"
  },
  {
    title: "Grade Reports",
    description: "View grades and academic transcripts",
    icon: FileText,
    color: "text-teal-600",
    route: "my-grades" as const,
    action: "checkResults"
  },
  {
    title: "Dining Services",
    description: "Check meal plans and cafeteria menus",
    icon: Coffee,
    color: "text-amber-600",
    route: "hostel" as const,
    action: "checkMeals"
  }
];

export function QuickAccess() {
  const { navigate } = useNavigation();
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [statusData, setStatusData] = useState<Record<string, any>>({});

  const performDatabaseAction = async (action: string, route: string) => {
    const loadingKey = `${action}-${route}`;
    setLoadingStates(prev => ({ ...prev, [loadingKey]: true }));

    try {
      let result: any;
      switch (action) {
        case 'checkEnrollment':
          result = await api.getSubjects(); // Check available subjects/courses
          setStatusData(prev => ({
            ...prev,
            [loadingKey]: { status: 'success', message: `${result.length} courses available` }
          }));
          break;

        case 'checkEvents':
          result = await api.getAnnouncements(); // Check upcoming events
          const upcomingEvents = result.filter((announcement: any) =>
            new Date(announcement.expiryDate) > new Date()
          );
          setStatusData(prev => ({
            ...prev,
            [loadingKey]: { status: 'success', message: `${upcomingEvents.length} upcoming events` }
          }));
          break;

        case 'checkLibrary':
          result = await api.getLibraryStats(); // Check library status
          setStatusData(prev => ({
            ...prev,
            [loadingKey]: {
              status: 'success',
              message: `${result.totalBooks} books, ${result.availableBooks || result.totalBooks - result.booksIssued} available`
            }
          }));
          break;

        case 'checkFees':
          result = await api.getDashboardStats(); // Check fee status from dashboard
          setStatusData(prev => ({
            ...prev,
            [loadingKey]: {
              status: result.totalFees > 0 ? 'warning' : 'success',
              message: result.totalFees > 0 ? `₹${result.totalFees.toLocaleString()} collected` : 'All fees paid'
            }
          }));
          break;

        case 'checkTransport':
          result = await api.getTransportStats(); // Check transport availability
          setStatusData(prev => ({
            ...prev,
            [loadingKey]: { status: 'success', message: `${result.totalBuses} buses, ${result.activeBuses} active` }
          }));
          break;

        case 'checkAnnouncements':
          result = await api.getAnnouncements(); // Check announcements
          const activeAnnouncements = result.filter((announcement: any) =>
            announcement.status === 'published'
          );
          setStatusData(prev => ({
            ...prev,
            [loadingKey]: { status: 'success', message: `${activeAnnouncements.length} active announcements` }
          }));
          break;

        case 'checkResults':
          result = await api.getExamResults(); // Check exam results
          const passedResults = result.filter((res: any) => res.status === 'pass');
          setStatusData(prev => ({
            ...prev,
            [loadingKey]: { status: 'success', message: `${passedResults.length}/${result.length} exams passed` }
          }));
          break;

        case 'checkMeals':
          result = await api.getHostelStats(); // Check dining/hostel services
          setStatusData(prev => ({
            ...prev,
            [loadingKey]: { status: 'success', message: `${result.occupancyRate}% occupancy, services active` }
          }));
          break;

        default:
          setStatusData(prev => ({
            ...prev,
            [loadingKey]: { status: 'success', message: 'Service available' }
          }));
      }

      toast.success(`Checked ${action.replace('check', '').toLowerCase()} status`);
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      setStatusData(prev => ({
        ...prev,
        [loadingKey]: { status: 'error', message: 'Service temporarily unavailable' }
      }));
      toast.error(`Failed to check ${action.replace('check', '').toLowerCase()} status`);
    } finally {
      setLoadingStates(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  const handleQuickAccess = async (route: string, action: string) => {
    // First perform database action
    await performDatabaseAction(action, route);

    // Then navigate to the page
    navigate(route as any);
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="mb-4">Quick Access</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get instant access to the most commonly used campus services and resources with real-time status updates
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickAccessItems.map((item, index) => {
            const Icon = item.icon;
            const loadingKey = `${item.action}-${item.route}`;
            const isLoading = loadingStates[loadingKey];
            const status = statusData[loadingKey];

            return (
              <Card
                key={index}
                className="group hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleQuickAccess(item.route, item.action)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-secondary rounded-lg">
                        <Icon className={`h-6 w-6 ${item.color}`} />
                      </div>
                      {status && getStatusIcon(status.status)}
                    </div>
                    {isLoading && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    )}
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-2">{item.description}</p>
                  {status && (
                    <p className={`text-xs mb-3 ${
                      status.status === 'success' ? 'text-green-600' :
                      status.status === 'warning' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {status.message}
                    </p>
                  )}
                  <Button
                    variant="ghost"
                    className="w-full group-hover:bg-accent"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Checking...' : 'Access Now'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}