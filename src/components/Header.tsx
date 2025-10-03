import { Button } from "./ui/button";
import { Menu, User, Bell } from "lucide-react";

export function Header() {
  return (
    <header className="bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-primary font-medium">SmarteCampus</h1>
            </div>
          </div>
          
          <nav className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <a href="#" className="text-foreground hover:text-primary px-3 py-2 rounded-md">
                Home
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md">
                Academics
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md">
                Services
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md">
                Library
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md">
                Campus Life
              </a>
            </div>
          </nav>

          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
            <Button className="md:hidden" variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}