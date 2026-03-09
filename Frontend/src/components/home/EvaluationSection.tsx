import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Award, BookOpen } from "lucide-react";
import { useGsapTextReveal, useGsapSlideIn } from "@/hooks/useGsapAnimations";
import { usePublicData } from "@/contexts/PublicDataContext";

export function EvaluationSection() {
  const { events, evaluationGrades } = usePublicData();

  // Top 5 token values based on tokenValue
  const tokenValues = events
    .filter((e) => e.isFixed && e.tokenValue && e.tokenValue > 0) // only fixed events
    .sort((a, b) => b.tokenValue - a.tokenValue) // highest tokens first
    .slice(0, 5)
    .map((e) => ({
      event: e.title,
      tokens: e.tokenValue,
    }));

  // Top 9 grade mappings
  const gradeMapping = evaluationGrades.slice(0, 9).map((grade) => ({
    grade: grade.gradeLetter,
    range: `${grade.minimumValue} - ${grade.maximumValue} Savannah`,
    color: grade.gradeLetter.startsWith("A")
      ? "text-success"
      : grade.gradeLetter.startsWith("B")
      ? "text-primary"
      : "text-warning",
  }));

  const titleRef = useGsapTextReveal<HTMLDivElement>();
  const leftCardRef = useGsapSlideIn<HTMLDivElement>("left");
  const rightCardRef = useGsapSlideIn<HTMLDivElement>("right");

  return (
    <section className="py-20 bg-secondary/30 overflow-hidden">
      <div className="container">
        <div className="text-center mb-12" ref={titleRef}>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Evaluation Criteria
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Understand how Savannah points are earned and converted to grades.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Token Values */}
          <div ref={leftCardRef}>
            <Card className="shadow-card h-full">
              <CardHeader className="flex flex-row items-center gap-3 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-hero">
                  <Award className="h-5 w-5 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">Event Savannah Values</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tokenValues.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <span className="text-foreground font-medium">
                        {item.event}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold">
                        +{item.tokens}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Grade Mapping */}
          <div ref={rightCardRef}>
            <Card className="shadow-card h-full">
              <CardHeader className="flex flex-row items-center gap-3 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-hero">
                  <BookOpen className="h-5 w-5 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">Grade Mapping</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {gradeMapping.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <span className={`text-2xl font-bold ${item.color}`}>
                        {item.grade}
                      </span>
                      <span className="text-muted-foreground">
                        {item.range}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="text-center mt-8">
          <Button asChild>
            <Link to="/evaluation">
              View Complete Evaluation Guide
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
