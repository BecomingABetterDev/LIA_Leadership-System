import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Users, Building2 } from "lucide-react";

interface Club {
  id: string;
  name: string;
  password: string;
  memberCount: number;
}

interface ClubCrudCardProps {
  clubs: Club[];
  onAddClub: (club: Omit<Club, 'id' | 'memberCount'>) => void;
  onUpdateClub: (id: string, data: Partial<Club>) => void;
  onDeleteClub: (id: string) => void;
}

export default function ClubCrudCard({ clubs, onAddClub, onUpdateClub, onDeleteClub }: ClubCrudCardProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [newClubName, setNewClubName] = useState("");
  const [newClubPassword, setNewClubPassword] = useState("");
  const [editClubName, setEditClubName] = useState("");

  const handleAddClub = () => {
    if (!newClubName.trim()) {
      toast.error("Please enter a club name");
      return;
    }
    if (!newClubPassword.trim() || newClubPassword.length < 3) {
      toast.error("Password must be at least 3 characters");
      return;
    }
    onAddClub({ name: newClubName.trim(), password: newClubPassword });
    toast.success(`${newClubName} has been added`);
    setAddDialogOpen(false);
    setNewClubName("");
    setNewClubPassword("");
  };

  const handleUpdateClub = () => {
    if (!editClubName.trim()) {
      toast.error("Please enter a club name");
      return;
    }
    if (selectedClub) {
      onUpdateClub(selectedClub.id, { name: editClubName.trim() });
      toast.success(`Club updated successfully`);
      setEditDialogOpen(false);
    }
  };

  const handleDeleteClub = () => {
    if (selectedClub) {
      onDeleteClub(selectedClub.id);
      toast.success(`${selectedClub.name} has been deleted`);
      setDeleteDialogOpen(false);
    }
  };

  const openEditDialog = (club: Club) => {
    setSelectedClub(club);
    setEditClubName(club.name);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (club: Club) => {
    setSelectedClub(club);
    setDeleteDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Manage Clubs
            </CardTitle>
            <CardDescription className="mt-1.5">
              Add, update, or remove clubs from the system
            </CardDescription>
          </div>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-1" />
                Add New Club
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Club</DialogTitle>
                <DialogDescription>
                  Create a new club with an initial password
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="club-name">Club Name</Label>
                  <Input
                    id="club-name"
                    placeholder="Enter club name"
                    value={newClubName}
                    onChange={(e) => setNewClubName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="club-password">Initial Password</Label>
                  <Input
                    id="club-password"
                    type="password"
                    placeholder="Set initial password"
                    value={newClubPassword}
                    onChange={(e) => setNewClubPassword(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => setAddDialogOpen(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button onClick={handleAddClub} className="w-full sm:w-auto">
                  Add Club
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Club Name</TableHead>
                <TableHead>Members</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clubs.map((club) => (
                <TableRow key={club.id}>
                  <TableCell className="font-medium">{club.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="gap-1">
                      <Users className="h-3 w-3" />
                      {club.memberCount}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(club)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only sm:not-sr-only sm:ml-1">Edit</span>
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => openDeleteDialog(club)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only sm:not-sr-only sm:ml-1">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Club</DialogTitle>
              <DialogDescription>
                Update the club's name
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-club-name">Club Name</Label>
                <Input
                  id="edit-club-name"
                  placeholder="Enter club name"
                  value={editClubName}
                  onChange={(e) => setEditClubName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button onClick={handleUpdateClub} className="w-full sm:w-auto">
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Club</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {selectedClub?.name}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteClub} className="w-full sm:w-auto">
                Delete Club
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
