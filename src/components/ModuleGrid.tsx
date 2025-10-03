import { Card, CardContent } from "./ui/card";
import { useRouter } from "../utils/enhanced-router";
import {
  GraduationCap,
  UserCheck,
  CreditCard,
  ClipboardCheck,
  DollarSign,
  Receipt,
  Package,
  Library,
  Users,
  Cake,
  Bus,
  Car,
  Trophy,
  Calendar,
  Award,
  BookOpen,
  FileText,
  Shield,
  Database,
  MessageSquare,
  Heart,
  Building,
  Clipboard,
  BarChart3,
  ShoppingCart,
  CalendarDays,
  UserCog,
  FileSpreadsheet,
} from "lucide-react";

const modules = [
  {
    title: "PRE ADMISSION",
    icon: GraduationCap,
    color: "bg-teal-500",
    textColor: "text-white"
  },
  {
    title: "ADMISSION",
    icon: UserCheck,
    color: "bg-blue-500",
    textColor: "text-white"
  },
  {
    title: "FEES",
    icon: CreditCard,
    color: "bg-orange-500",
    textColor: "text-white"
  },
  {
    title: "EXAM",
    icon: ClipboardCheck,
    color: "bg-indigo-500",
    textColor: "text-white"
  },
  {
    title: "ACCOUNTS",
    icon: DollarSign,
    color: "bg-green-500",
    textColor: "text-white"
  },
  {
    title: "INVOICE",
    icon: Receipt,
    color: "bg-emerald-500",
    textColor: "text-white"
  },
  {
    title: "INVENTORY",
    icon: Package,
    color: "bg-pink-500",
    textColor: "text-white"
  },
  {
    title: "LIBRARY",
    icon: Library,
    color: "bg-purple-500",
    textColor: "text-white"
  },
  {
    title: "ALUMNI",
    icon: Users,
    color: "bg-rose-500",
    textColor: "text-white"
  },
  {
    title: "BIRTHDAY",
    icon: Cake,
    color: "bg-cyan-500",
    textColor: "text-white"
  },
  {
    title: "TRANSPORT",
    icon: Bus,
    color: "bg-violet-500",
    textColor: "text-white"
  },
  {
    title: "CONVEYANCE",
    icon: Car,
    color: "bg-amber-500",
    textColor: "text-white"
  },
  {
    title: "SPORTS",
    icon: Trophy,
    color: "bg-orange-400",
    textColor: "text-white"
  },
  {
    title: "COE",
    icon: Calendar,
    color: "bg-blue-400",
    textColor: "text-white"
  },
  {
    title: "SCHOLARSHIP",
    icon: Award,
    color: "bg-green-400",
    textColor: "text-white"
  },
  {
    title: "KIOSK",
    icon: FileText,
    color: "bg-pink-400",
    textColor: "text-white"
  },
  {
    title: "TOOLS",
    icon: FileText,
    color: "bg-lime-500",
    textColor: "text-white"
  },
  {
    title: "ACCOUNTS",
    icon: DollarSign,
    color: "bg-green-600",
    textColor: "text-white"
  },
  {
    title: "ADMINISTRATOR",
    icon: Shield,
    color: "bg-teal-400",
    textColor: "text-white"
  },
  {
    title: "ASSET",
    icon: Database,
    color: "bg-yellow-600",
    textColor: "text-white"
  },
  {
    title: "FRONT OFFICE",
    icon: MessageSquare,
    color: "bg-emerald-400",
    textColor: "text-white"
  },
  {
    title: "HEALTH MANAGEMENT",
    icon: Heart,
    color: "bg-orange-400",
    textColor: "text-white"
  },
  {
    title: "HOSTEL MANAGEMENT",
    icon: Building,
    color: "bg-gray-500",
    textColor: "text-white"
  },
  {
    title: "LESSON PLANNER",
    icon: Clipboard,
    color: "bg-slate-500",
    textColor: "text-white"
  },
  {
    title: "LMS",
    icon: BarChart3,
    color: "bg-blue-600",
    textColor: "text-white"
  },
  {
    title: "FDA",
    icon: FileSpreadsheet,
    color: "bg-yellow-500",
    textColor: "text-white"
  },
  {
    title: "PURCHASE",
    icon: ShoppingCart,
    color: "bg-pink-600",
    textColor: "text-white"
  },
  {
    title: "TIME TABLE",
    icon: CalendarDays,
    color: "bg-green-600",
    textColor: "text-white"
  },
  {
    title: "VISITOR MANAGEMENT",
    icon: UserCog,
    color: "bg-blue-300",
    textColor: "text-white"
  },
  {
    title: "YEARLY PROGRAM",
    icon: Calendar,
    color: "bg-teal-600",
    textColor: "text-white"
  }
];

export function ModuleGrid() {
  const { navigate } = useRouter();

  const handleModuleClick = (moduleTitle: string) => {
    switch (moduleTitle) {
      case 'PRE ADMISSION':
      case 'ADMISSION':
        navigate('admission');
        break;
      case 'FEES':
        navigate('fees');
        break;
      case 'EXAM':
        navigate('exam');
        break;
      case 'LIBRARY':
        navigate('library');
        break;
      case 'ACCOUNTS':
        navigate('accounts');
        break;
      case 'TRANSPORT':
      case 'CONVEYANCE':
        navigate('transport');
        break;
      case 'SPORTS':
        navigate('sports');
        break;
      case 'ALUMNI':
        navigate('alumni');
        break;
      case 'BIRTHDAY':
        navigate('birthday');
        break;
      case 'INVENTORY':
      case 'ASSET':
        navigate('inventory');
        break;
      default:
        navigate('dashboard');
    }
  };

  return (
    <div className="p-responsive">
      {/* Section Header */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
          Quick Access Modules
        </h2>
        <p className="text-gray-600">Navigate to any module with a single click</p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4 lg:gap-5">
        {modules.map((module, index) => {
          const Icon = module.icon;
          return (
            <div
              key={index}
              className="group relative"
              onClick={() => handleModuleClick(module.title)}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur-lg opacity-0 group-hover:opacity-75 transition-all duration-300 animate-blob"></div>
              <Card className={`
                relative ${module.color} ${module.textColor} 
                cursor-pointer border-0 rounded-xl overflow-hidden
                transform transition-all duration-300
                hover:scale-110 hover:rotate-1 hover:shadow-2xl
                active:scale-95
              `}>
                <CardContent className="relative flex flex-col items-center justify-center p-3 sm:p-4 h-24 sm:h-28">
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  {/* Icon with animation */}
                  <div className="relative z-10 transform transition-transform group-hover:scale-110 group-hover:rotate-12">
                    <Icon className="h-7 w-7 sm:h-9 sm:w-9 mb-2 filter drop-shadow-lg" />
                  </div>
                  
                  {/* Title */}
                  <span className="relative z-10 text-[11px] sm:text-xs font-semibold text-center leading-tight line-clamp-2 px-1">
                    {module.title}
                  </span>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}