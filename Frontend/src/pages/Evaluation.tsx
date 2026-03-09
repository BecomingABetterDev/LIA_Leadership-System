import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, BookOpen, TrendingUp, Info } from "lucide-react";
import { usePublicData } from "@/contexts/PublicDataContext";

// Define types for your backend data
interface EventType {
  _id: string;
  title: string;
  description: string;
  tokenValue: number;
  isFixed: boolean;
}

interface GradeType {
  gradeLetter: string;
  minimumValue: number;
  maximumValue: number;
}

interface MappedGrade {
  grade: string;
  range: string;
  color: string;
}

export default function Evaluation() {
  const { events, evaluationGrades } = usePublicData();

  // ✅ only fixed token events
  const tokenValues: EventType[] = events.filter((event) => event.isFixed);

  // ✅ transform backend grades → frontend UI format with color mapping
  const gradeMapping: MappedGrade[] = evaluationGrades
    .sort((a: GradeType, b: GradeType) => b.minimumValue - a.minimumValue)
    .map((g: GradeType) => {
      let color = "bg-muted text-muted-foreground";

      if (g.gradeLetter === "A+") color = "bg-success text-success-foreground";
      else if (g.gradeLetter === "A")
        color = "bg-success/80 text-success-foreground";
      else if (g.gradeLetter === "A-")
        color = "bg-success/60 text-success-foreground";
      else if (g.gradeLetter === "B+")
        color = "bg-primary text-primary-foreground";
      else if (g.gradeLetter === "B")
        color = "bg-primary/80 text-primary-foreground";
      else if (g.gradeLetter === "B-")
        color = "bg-primary/60 text-primary-foreground";
      else if (g.gradeLetter === "C+")
        color = "bg-warning text-warning-foreground";
      else if (g.gradeLetter === "C")
        color = "bg-warning/80 text-warning-foreground";
      else if (g.gradeLetter === "C-")
        color = "bg-warning/60 text-warning-foreground";
      else if (g.gradeLetter === "D+") color = "bg-muted text-muted-foreground";
      else if (g.gradeLetter === "D")
        color = "bg-muted/80 text-muted-foreground";
      else if (g.gradeLetter === "F")
        color = "bg-destructive text-destructive-foreground";

      return {
        grade: g.gradeLetter,
        range:
          g.maximumValue >= 9999
            ? `${g.minimumValue}+ Savannah`
            : `${g.minimumValue} - ${g.maximumValue} Savannah`,
        color,
      };
    });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-hero py-16">
        <div className="container text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-foreground/20">
              <TrendingUp className="h-7 w-7 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-2">
            Evaluation Criteria
          </h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto">
            Understand how Savannah points are earned and converted to grades
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container py-12">
        {/* Info Box */}
        <Card className="mb-8 border-accent bg-accent/5">
          <CardContent className="flex items-start gap-4 p-6">
            <Info className="h-6 w-6 text-accent flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                How the Savannah Point System Works
              </h3>
              <p className="text-muted-foreground">
                Savannah points are earned through participation in school
                events, community service, and leadership activities. Your
                accumulated points are converted to a grade at the end of each
                trimester based on the grade mapping below.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Token Values */}
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center gap-3 pb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg gradient-hero">
                <Award className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-xl">Event Savannah Values</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Points awarded per activity
                </p>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                {tokenValues.map((event) => (
                  <div
                    key={event._id}
                    className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-foreground">
                        {event.title}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-bold">
                        +{event.tokenValue}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {event.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Grade Mapping */}
          <div className="space-y-8">
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center gap-3 pb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg gradient-hero">
                  <BookOpen className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-xl">Grade Mapping</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Savannah thresholds for each grade
                  </p>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {gradeMapping.map((grade, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg text-center ${grade.color}`}
                    >
                      <span className="text-2xl font-bold block">
                        {grade.grade}
                      </span>
                      <span className="text-xs opacity-90">{grade.range}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Important Notes (Frontend Only) */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Important Notes</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {[
                  "Savannah points are cumulative throughout the trimester. Your final grade is determined by your total points at trimester end.",
                  "Bonus points may be awarded for exceptional performance or leadership demonstrated during events.",
                  "Point deductions may be applied for club attendance absences, late arrivals, and unsatisfactory performance evaluations.",
                  "Students can track their Savannah balance and estimated grade in their profile dashboard.",
                  "The grading scale and Savannah values may be adjusted during the trimester. Follow announcements for updates.",
                ].map((note, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success/20 text-success flex-shrink-0">
                      {i + 1}
                    </div>
                    <p className="text-sm text-muted-foreground">{note}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
