import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, Cake, Sparkles } from "lucide-react";
import { toast } from "sonner";
import BirthdayCard from "@/components/BirthdayCard";
import AddBirthdayDialog from "@/components/AddBirthdayDialog";
import { differenceInDays, addYears, isBefore } from "date-fns";

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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(350_85%_62%/0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(45_100%_70%/0.08),transparent_50%)]" />
      
      <div className="relative max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
              <Cake className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Birthday Reminder
              </h1>
              <p className="text-sm text-muted-foreground">Never miss a special day</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </header>

        {/* Add Birthday Button */}
        <div className="flex justify-center">
          <AddBirthdayDialog onBirthdayAdded={fetchBirthdays} />
        </div>

        {/* Birthdays List */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Loading birthdays...</p>
            </div>
          ) : birthdays.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
                <Sparkles className="w-10 h-10 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-display font-semibold mb-2">No birthdays yet</h3>
                <p className="text-muted-foreground">
                  Start adding birthdays to never miss a special day!
                </p>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-display font-semibold mb-4 flex items-center gap-2">
                <Cake className="w-5 h-5 text-primary" />
                Upcoming Birthdays
              </h2>
              <div className="grid gap-4">
                {birthdays.map((birthday) => (
                  <BirthdayCard
                    key={birthday.id}
                    name={birthday.name}
                    dateOfBirth={birthday.date_of_birth}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
