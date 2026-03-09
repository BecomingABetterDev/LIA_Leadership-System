import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Bell, ArrowRight, ChevronRight } from "lucide-react";
import { useGsapFadeIn, useGsapStagger } from "@/hooks/useGsapAnimations";
import { usePublicData } from "@/contexts/PublicDataContext";

export function AnnouncementsSection() {
  const { announcements } = usePublicData();
  const topAnnouncements = announcements.slice(0, 4); // top 4

  const headerRef = useGsapFadeIn<HTMLDivElement>();
  const listRef = useGsapStagger<HTMLDivElement>(":scope > div", 0.1);

  // Helper to format date as "Jan 22, 2026"
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Helper to check if announcement is new (created within last 3 days)
  const isNew = (dateStr: string) => {
    const createdDate = new Date(dateStr);
    const now = new Date();
    const diffTime = now.getTime() - createdDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays < 3;
  };

  return (
    <section className="py-20 bg-background">
      <div className="container">
        <div
          ref={headerRef}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-hero">
              <Bell className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                Announcements
              </h2>
              <p className="text-muted-foreground">
                Stay updated with the latest news
              </p>
            </div>
          </div>
          <Button asChild variant="outline">
            <Link to="/announcements">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div ref={listRef} className="space-y-4">
          {topAnnouncements.map((announcement) => (
            <Card
              key={announcement._id}
              className="group hover:shadow-card-hover transition-all duration-300"
            >
              <CardContent className="p-4 md:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {isNew(announcement.createdAt) && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-accent text-accent-foreground">
                          New
                        </span>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {formatDate(announcement.createdAt)}
                      </span>
                    </div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                      {announcement.title}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {announcement.content}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
