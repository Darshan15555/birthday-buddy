import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface Birthday {
  id: string;
  name: string;
  date_of_birth: string;
}

interface EditBirthdayDialogProps {
  birthday: Birthday;
  onBirthdayUpdated: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditBirthdayDialog = ({ birthday, onBirthdayUpdated, open, onOpenChange }: EditBirthdayDialogProps) => {
  const [name, setName] = useState("");
  const [year, setYear] = useState<number>();
  const [month, setMonth] = useState<number>();
  const [day, setDay] = useState<number>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (birthday) {
      setName(birthday.name);
      const date = new Date(birthday.date_of_birth);
      setYear(date.getFullYear());
      setMonth(date.getMonth() + 1);
      setDay(date.getDate());
    }
  }, [birthday]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !year || !month || !day) {
      toast.error("Please fill in all fields");
      return;
    }

    const date = new Date(year, month - 1, day);

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("birthdays")
        .update({
          name: name.trim(),
          date_of_birth: format(date, "yyyy-MM-dd"),
        })
        .eq("id", birthday.id);

      if (error) throw error;

      toast.success(`🎉 ${name}'s birthday has been updated!`);
      onOpenChange(false);
      onBirthdayUpdated();
    } catch (error: any) {
      toast.error(error.message || "Failed to update birthday");
    } finally {
      setIsLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1970 + 1 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">Edit Birthday</DialogTitle>
          <DialogDescription>
            Update the details for this special day.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g., John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
            />
          </div>
          <div>
            <Label>Date of Birth</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div className="space-y-2">
                <Label htmlFor="year" className="sr-only">Year</Label>
                <Select value={String(year)} onValueChange={(value) => setYear(Number(value))}>
                  <SelectTrigger id="year">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(y => (
                      <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="month" className="sr-only">Month</Label>
                <Select value={String(month)} onValueChange={(value) => setMonth(Number(value))}>
                  <SelectTrigger id="month">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map(m => (
                      <SelectItem key={m} value={String(m)}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="day" className="sr-only">Day</Label>
                <Select value={String(day)} onValueChange={(value) => setDay(Number(value))}>
                  <SelectTrigger id="day">
                    <SelectValue placeholder="Day" />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map(d => (
                      <SelectItem key={d} value={String(d)}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full font-semibold"
            disabled={isLoading}
          >
            {isLoading ? "Updating..." : "Update Birthday"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditBirthdayDialog;
