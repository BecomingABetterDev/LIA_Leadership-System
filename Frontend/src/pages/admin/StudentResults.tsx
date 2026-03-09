import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, Download, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { usePublicData } from "@/contexts/PublicDataContext";

function getLevelBadge(level: string) {
  switch (level) {
    case "Gold":
      return <Badge className="bg-gold text-foreground">Gold</Badge>;
    case "Silver":
      return <Badge className="bg-silver text-foreground">Silver</Badge>;
    case "Bronze":
      return <Badge className="bg-bronze text-foreground">Bronze</Badge>;
    default:
      return <Badge variant="secondary">{level}</Badge>;
  }
}

function getGradeBadge(grade: string) {
  if (grade.startsWith("A")) {
    return (
      <Badge className="bg-success text-success-foreground">{grade}</Badge>
    );
  } else if (grade.startsWith("B")) {
    return (
      <Badge className="bg-primary text-primary-foreground">{grade}</Badge>
    );
  } else if (grade.startsWith("C")) {
    return (
      <Badge className="bg-warning text-warning-foreground">{grade}</Badge>
    );
  } else {
    return <Badge variant="destructive">{grade}</Badge>;
  }
}

export default function StudentResults() {
  const { students, fetchStudents, isListingStudents } = useAuth(); // <--- Added this
  const { isTrimesterEnded } = usePublicData();
  const [searchQuery, setSearchQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"tokens" | "name">("tokens");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetchStudents(); // <--- Added this to load data
    console.log("results", students);
  }, []);

  // Map the API data to match your UI's expected 'tokens' and 'level' fields
  const data = students.map((s) => ({
    ...s,
    tokens: s.tokenBalance || 0, // Mapping DB field to your UI field
    level: s.gradeLetter || "Bronze",
    estimatedGrade: s.gradeLetter || "N/A",
  }));

  const filteredStudents = data
    .filter((student) => {
      const matchesSearch = student.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesGrade =
        gradeFilter === "all" || String(student.grade) === gradeFilter;
      const matchesSection =
        sectionFilter === "all" || student.section === sectionFilter;
      return matchesSearch && matchesGrade && matchesSection;
    })
    .sort((a, b) => {
      if (sortBy === "tokens") {
        return sortOrder === "desc" ? b.tokens - a.tokens : a.tokens - b.tokens;
      } else {
        return sortOrder === "desc"
          ? b.name.localeCompare(a.name)
          : a.name.localeCompare(b.name);
      }
    });

  const toggleSort = (field: "tokens" | "name") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const handleExportExcel = () => {
    const headers = [
      "#",
      "Name",
      "Grade Level",
      "Savannah",
      "Est. Grade",
      "Level",
    ];
    const rows = filteredStudents.map((student, index) => [
      index + 1,
      student.name,
      `${student.grade}th Grade`,
      student.tokens,
      student.estimatedGrade,
      student.level,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `student_results_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Results exported successfully!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">
          Student Results
        </h2>
        <p className="text-muted-foreground">
          View and manage all student Savannah balances and grades.
        </p>
      </div>

      {isTrimesterEnded && (
        <div className="p-4 rounded-lg border border-warning/50 bg-warning/10">
          <div className="flex items-center gap-2 text-warning">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <p className="font-semibold">Trimester Ended</p>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Student results are unavailable. All data has been archived. Start a
            new trimester to reset scores.
          </p>
        </div>
      )}

      {!isTrimesterEnded && (
        <>
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <SearchInput
                    placeholder="Search by student name..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                    containerClassName="flex-1"
                  />
                  <Button
                    onClick={handleExportExcel}
                    variant="outline"
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export Excel
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-muted-foreground block sm:inline sm:mr-2">
                      Grade Level:
                    </span>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {["all", "9", "10", "11", "12"].map((g) => (
                        <Button
                          key={g}
                          variant={gradeFilter === g ? "default" : "outline"}
                          size="sm"
                          className="text-xs sm:text-sm px-2 sm:px-3"
                          onClick={() => setGradeFilter(g)}
                        >
                          {g === "all" ? "All" : `${g}th`}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-muted-foreground block sm:inline sm:mr-2">
                      Section:
                    </span>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {["all", "A", "B", "C"].map((s) => (
                        <Button
                          key={s}
                          variant={sectionFilter === s ? "default" : "outline"}
                          size="sm"
                          className="text-xs sm:text-sm px-2 sm:px-3"
                          onClick={() => setSectionFilter(s)}
                        >
                          {s === "all" ? "All" : s}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {filteredStudents.length} Students
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              {/* Mobile Card View */}
              <div className="block sm:hidden space-y-3 p-4">
                {filteredStudents.map((student, index) => (
                  <div
                    key={student.id}
                    className="p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-medium">
                          #{index + 1}
                        </span>
                        <span className="font-medium text-sm">
                          {student.name}
                        </span>
                      </div>
                      {getLevelBadge(student.level)}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <span>
                          {student.grade}th â€¢ {student.section}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {student.tokens.toLocaleString()}
                        </span>
                        {getGradeBadge(student.estimatedGrade)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSort("name")}
                          className="-ml-3"
                        >
                          Name
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSort("tokens")}
                          className="-ml-3"
                        >
                          Savannah
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>Est. Grade</TableHead>
                      <TableHead>Level</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student, index) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium text-muted-foreground">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-medium">
                          {student.name}
                        </TableCell>
                        <TableCell>{student.grade}th</TableCell>
                        <TableCell>{student.section}</TableCell>
                        <TableCell className="font-semibold">
                          {student.tokens.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {getGradeBadge(student.estimatedGrade)}
                        </TableCell>
                        <TableCell>{getLevelBadge(student.level)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          <Card>
            {/* Added a simple conditional to show loader without changing layout */}
            {isListingStudents && (
              <div className="p-8 text-center text-muted-foreground">
                Loading students...
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
