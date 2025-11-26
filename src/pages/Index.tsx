import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import AddBirthdayDialog from "@/components/AddBirthdayDialog";
import { format, differenceInDays, addYears, isBefore } from "date-fns";

interface Birthday {
  id: string;
  name: string;
  date_of_birth: string;
}

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication status
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchBirthdays = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("birthdays")
        .select("*")
        .order("date_of_birth", { ascending: true });

      if (error) throw error;

      // Sort by upcoming birthdays
      const today = new Date();
      const sortedBirthdays = (data || []).sort((a, b) => {
        const dateA = new Date(a.date_of_birth);
        const dateB = new Date(b.date_of_birth);
        
        let nextA = new Date(today.getFullYear(), dateA.getMonth(), dateA.getDate());
        let nextB = new Date(today.getFullYear(), dateB.getMonth(), dateB.getDate());
        
        if (isBefore(nextA, today)) nextA = addYears(nextA, 1);
        if (isBefore(nextB, today)) nextB = addYears(nextB, 1);
        
        return differenceInDays(nextA, today) - differenceInDays(nextB, today);
      });

      setBirthdays(sortedBirthdays);
    } catch (error: any) {
      toast.error(error.message || "Failed to load birthdays");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBirthdays();
    }
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Upcoming Birthdays</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        {/* Add Birthday Button */}
        <AddBirthdayDialog onBirthdayAdded={fetchBirthdays} />

        {/* Birthdays List */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : birthdays.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No birthdays yet. Add your first birthday above!
          </p>
        ) : (
          <ul className="space-y-3">
            {birthdays.map((birthday) => (
              <li
                key={birthday.id}
                className="flex justify-between items-center p-4 border rounded-lg bg-card"
              >
                <span className="font-medium">{birthday.name}</span>
                <span className="text-muted-foreground">
                  {format(new Date(birthday.date_of_birth), "MMMM d, yyyy")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Index;
