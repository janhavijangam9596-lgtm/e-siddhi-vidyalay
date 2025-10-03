import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Calendar, ArrowRight } from "lucide-react";

const announcements = [
  {
    title: "Fall Semester Registration Now Open",
    date: "Dec 20, 2024",
    category: "Academic",
    summary: "Registration for Spring 2025 courses is now available. Students can access the course catalog and register through the student portal.",
    urgent: false
  },
  {
    title: "Campus Wi-Fi Maintenance Scheduled",
    date: "Dec 18, 2024",
    category: "Technology",
    summary: "Network maintenance will occur on December 22nd from 2:00 AM to 6:00 AM. Some services may be temporarily unavailable.",
    urgent: true
  },
  {
    title: "New Digital Library Resources Available",
    date: "Dec 15, 2024",
    category: "Library",
    summary: "We've added over 10,000 new digital books and research journals to our online collection. Access them through the library portal.",
    urgent: false
  },
  {
    title: "Student Health Center Holiday Hours",
    date: "Dec 12, 2024",
    category: "Health",
    summary: "The Student Health Center will have modified hours during the winter break. Emergency services remain available 24/7.",
    urgent: false
  }
];

export function Announcements() {
  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="mb-2">Latest Announcements</h2>
            <p className="text-muted-foreground">Stay updated with the latest campus news and information</p>
          </div>
          <Button variant="outline">
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {announcements.map((announcement, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant={announcement.urgent ? "destructive" : "secondary"}>
                    {announcement.category}
                  </Badge>
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{announcement.date}</span>
                  </div>
                </div>
                <CardTitle className="text-lg leading-tight">
                  {announcement.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{announcement.summary}</p>
                <Button variant="ghost" size="sm">
                  Read More
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}