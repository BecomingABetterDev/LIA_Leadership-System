import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, FileText, Image as ImageIcon } from "lucide-react";

export interface Requirement {
  id: string;
  label: string;
  maxWordCount: number;
  type: "text" | "image";
}

interface RequirementsBuilderProps {
  requirements: Requirement[];
  onChange: (requirements: Requirement[]) => void;
}

export function RequirementsBuilder({ requirements, onChange }: RequirementsBuilderProps) {
  const [newLabel, setNewLabel] = useState("");
  const [newWordCount, setNewWordCount] = useState<number>(50);
  const [newType, setNewType] = useState<"text" | "image">("text");

  const addRequirement = () => {
    if (!newLabel.trim()) return;
    
    const newRequirement: Requirement = {
      id: crypto.randomUUID(),
      label: newLabel.trim(),
      maxWordCount: newType === "image" ? 0 : newWordCount,
      type: newType,
    };
    
    onChange([...requirements, newRequirement]);
    setNewLabel("");
    setNewWordCount(50);
    setNewType("text");
  };

  const removeRequirement = (id: string) => {
    onChange(requirements.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-4">
      <Label className="flex items-center gap-2">
        <FileText className="h-4 w-4" />
        Application Requirements
      </Label>
      
      {/* Existing Requirements */}
      {requirements.length > 0 && (
        <div className="space-y-2">
          {requirements.map((req) => (
            <div
              key={req.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {req.type === "image" ? (
                    <ImageIcon className="h-4 w-4 text-primary" />
                  ) : (
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  )}
                  <p className="font-medium text-sm">{req.label}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {req.type === "image" 
                    ? "Image upload required" 
                    : `Max ${req.maxWordCount} words ${req.maxWordCount > 10 ? "(textarea)" : "(input)"}`
                  }
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => removeRequirement(req.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Requirement */}
      <div className="p-4 rounded-lg border-2 border-dashed border-muted-foreground/30 space-y-3">
        <p className="text-sm text-muted-foreground font-medium">Add New Requirement</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2 space-y-1">
            <Label className="text-xs text-muted-foreground">Requirement Label</Label>
            <Input
              placeholder="e.g., Why do you want to participate?"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Type</Label>
            <Select value={newType} onValueChange={(v) => setNewType(v as "text" | "image")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="image">Image Upload</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {newType === "text" && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Max Word Count</Label>
              <Input
                type="number"
                min={10}
                max={500}
                value={newWordCount}
                onChange={(e) => setNewWordCount(parseInt(e.target.value) || 50)}
              />
            </div>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addRequirement}
          disabled={!newLabel.trim()}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Requirement
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground">
        Text requirements with more than 10 words will display as a textarea field for applicants. Image requirements will show an upload input.
      </p>
    </div>
  );
}
