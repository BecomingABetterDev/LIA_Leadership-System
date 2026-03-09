import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";

interface Event {
  id: number;
  name: string;
  tokens: number;
}

interface EventTokenValuesCardProps {
  events: Event[];
}

export default function EventTokenValuesCard({
  events,
}: EventTokenValuesCardProps) {
  const [search, setSearch] = useState("");

  const filtered = events.filter((e) =>
    e?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Event Token Values</CardTitle>
        <CardDescription>Reference guide for token amounts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SearchInput
          placeholder="Search events..."
          value={search}
          onValueChange={setSearch}
        />
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No events found.
            </p>
          ) : (
            filtered.map((event) => (
              <div
                key={event._id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
              >
                <span className="font-medium">{event.title}</span>
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-bold">
                  +{event.tokenValue}
                </span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
