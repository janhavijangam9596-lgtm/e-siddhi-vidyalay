import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin 
} from "lucide-react";

const footerLinks = {
  academics: [
    "Course Catalog",
    "Academic Calendar",
    "Degree Programs",
    "Online Learning",
    "Academic Support"
  ],
  services: [
    "Student Portal",
    "Library Services",
    "IT Support",
    "Campus Safety",
    "Health Services"
  ],
  campus: [
    "Campus Map",
    "Parking",
    "Dining",
    "Housing",
    "Recreation"
  ],
  about: [
    "About Us",
    "Administration",
    "Faculty Directory",
    "News & Events",
    "Contact"
  ]
};

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Logo and Contact */}
          <div className="lg:col-span-2">
            <h3 className="mb-4">SmarteCampus</h3>
            <p className="text-primary-foreground/80 mb-6">
              Empowering education through innovative technology and 
              comprehensive campus management solutions.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4" />
                <span className="text-primary-foreground/80">123 University Ave, Campus City, CC 12345</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4" />
                <span className="text-primary-foreground/80">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4" />
                <span className="text-primary-foreground/80">info@smartecampus.edu</span>
              </div>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="mb-4">Academics</h4>
            <ul className="space-y-2">
              {footerLinks.academics.map((link, index) => (
                <li key={index}>
                  <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="mb-4">Services</h4>
            <ul className="space-y-2">
              {footerLinks.services.map((link, index) => (
                <li key={index}>
                  <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="mb-4">Campus Life</h4>
            <ul className="space-y-2">
              {footerLinks.campus.map((link, index) => (
                <li key={index}>
                  <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="mb-4">About</h4>
            <ul className="space-y-2">
              {footerLinks.about.map((link, index) => (
                <li key={index}>
                  <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <Separator className="my-8 bg-primary-foreground/20" />
        
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <p className="text-primary-foreground/80 mb-4 sm:mb-0">
            © 2024 SmarteCampus. All rights reserved.
          </p>
          
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10">
              <Facebook className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10">
              <Twitter className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10">
              <Instagram className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10">
              <Linkedin className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}