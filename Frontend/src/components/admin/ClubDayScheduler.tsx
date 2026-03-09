import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Calendar, Save } from "lucide-react";

interface ClubDaySchedulerProps {
  schedule: Record<string, boolean>;
  onScheduleChange: (schedule: Record<string, boolean>) => void;
}

const DAYS_OF_WEEK = [
  { key: "monday", label: "Monday", shortLabel: "Mon" },
  { key: "tuesday", label: "Tuesday", shortLabel: "Tue" },
  { key: "wednesday", label: "Wednesday", shortLabel: "Wed" },
  { key: "thursday", label: "Thursday", shortLabel: "Thu" },
  { key: "friday", label: "Friday", shortLabel: "Fri" },
  { key: "saturday", label: "Saturday", shortLabel: "Sat" },
  { key: "sunday", label: "Sunday", shortLabel: "Sun" },
];

export default function ClubDayScheduler({ schedule, onScheduleChange }: ClubDaySchedulerProps) {
  const [localSchedule, setLocalSchedule] = useState<Record<string, boolean>>(schedule);
  const [hasChanges, setHasChanges] = useState(false);

  const handleToggleDay = (day: string) => {
    const newSchedule = { ...localSchedule, [day]: !localSchedule[day] };
    setLocalSchedule(newSchedule);
    setHasChanges(true);
  };

  const handleSaveSchedule = () => {
    onScheduleChange(localSchedule);
    setHasChanges(false);
    toast.success("Club day schedule updated successfully");
  };

  const activeDaysCount = Object.values(localSchedule).filter(Boolean).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Club Day Schedule
            </CardTitle>
            <CardDescription className="mt-1.5">
              Configure which days clubs are required to submit attendance
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {activeDaysCount} day{activeDaysCount !== 1 ? 's' : ''} active
            </span>
            {hasChanges && (
              <Button size="sm" onClick={handleSaveSchedule} className="ml-auto">
                <Save className="h-4 w-4 mr-1" />
                Save Changes
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day.key}
              className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                localSchedule[day.key]
                  ? "bg-primary/10 border-primary/30"
                  : "bg-secondary/30 border-transparent"
              }`}
            >
              <Label
                htmlFor={`day-${day.key}`}
                className="font-medium cursor-pointer flex-1"
              >
                <span className="hidden sm:inline">{day.label}</span>
                <span className="sm:hidden">{day.shortLabel}</span>
              </Label>
              <Switch
                id={`day-${day.key}`}
                checked={localSchedule[day.key] || false}
                onCheckedChange={() => handleToggleDay(day.key)}
              />
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
          <p>
            Clubs will only be required to submit attendance on the selected days. 
            The submission tracker below will show club status only for scheduled days.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
