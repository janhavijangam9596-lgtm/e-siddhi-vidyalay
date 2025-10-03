import { Card, CardContent } from "./ui/card";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { 
  Smartphone, 
  Shield, 
  Globe, 
  Clock,
  Award,
  Zap
} from "lucide-react";

const features = [
  {
    title: "Mobile Friendly",
    description: "Access all campus services on any device, anywhere on campus",
    icon: Smartphone
  },
  {
    title: "Secure Platform",
    description: "Your data is protected with enterprise-grade security",
    icon: Shield
  },
  {
    title: "24/7 Access",
    description: "Campus services available around the clock",
    icon: Clock
  },
  {
    title: "Global Network",
    description: "Connect with students and faculty worldwide",
    icon: Globe
  },
  {
    title: "Academic Excellence",
    description: "Tools designed to support your academic success",
    icon: Award
  },
  {
    title: "Fast & Reliable",
    description: "Lightning-fast performance with 99.9% uptime",
    icon: Zap
  }
];

export function Features() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="mb-6">
              Empowering Campus Life with Technology
            </h2>
            <p className="text-muted-foreground mb-8">
              Our smart campus platform integrates all aspects of university life, 
              from academics to social activities, providing students and faculty 
              with a seamless digital experience.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="mb-1">{feature.title}</h4>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="relative">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1701967341617-14499d8bf8c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50cyUyMHN0dWR5aW5nJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NTg3MTI3ODB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Students using technology"
                  className="w-full h-96 object-cover"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}