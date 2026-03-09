import { Card, CardContent } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";
import { Bell } from "lucide-react";
import { useState } from "react";
import { usePublicData } from "@/contexts/PublicDataContext";

// 🔹 Sample announcements (fallback)
const sampleAnnouncements = [
  {
    _id: "1",
    title: "Token Distribution Update for Q1 2026",
    message:
      "All tokens from January events have been distributed. Check your profile for updated balances. If you notice any discrepancies, please contact the Leadership Center immediately.",
    createdAt: "2026-01-22T00:00:00Z",
    author: "Leadership Center",
  },
  {
    _id: "2",
    title: "New Leadership Opportunity: Student Council Elections",
    message:
      "Nominations are now open for student council positions including President, Vice President, Secretary, and Treasurer. Applications close Feb 1st. Interested students should submit their candidacy forms to the Leadership Center.",
    createdAt: "2026-01-20T00:00:00Z",
    author: "Student Affairs",
  },
  // ... keep the rest of your previous sample items
];

export default function Announcements() {
  const { announcements } = usePublicData();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAnnouncements = announcements.filter(
    (announcement) =>
      announcement?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement?.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-hero py-16">
        <div className="container text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-foreground/20">
              <Bell className="h-7 w-7 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-2">
            Announcements
          </h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto">
            Stay updated with the latest news and updates
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container py-8">
        {/* Search */}
        <div className="flex justify-center mb-8">
          <SearchInput
            placeholder="Search announcements..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            containerClassName="w-full max-w-md"
          />
        </div>

        {/* Announcements List */}
        <div className="space-y-4">
          {filteredAnnouncements.map((announcement, index) => {
            // 🔹 Compute if "New" based on 3 days
            const created = new Date(announcement.createdAt);
            const isNew =
              (new Date().getTime() - created.getTime()) /
                (1000 * 60 * 60 * 24) <=
              3;

            return (
              <Card
                key={announcement._id}
                className="group hover:shadow-card-hover transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {isNew && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-accent text-accent-foreground">
                            New
                          </span>
                        )}
                        <span className="text-sm text-muted-foreground">
                          {created.toDateString()}
                        </span>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm font-medium text-primary">
                          {announcement.postedBy}
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors mb-3">
                        {announcement.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {announcement.content}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredAnnouncements.length === 0 && (
          <div className="text-center py-16">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <Bell className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No Announcements Found
            </h3>
            {searchQuery !== "" && (
              <p className="text-muted-foreground max-w-md mx-auto">
                We couldn't find any announcements matching your search. Try
                different keywords.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
