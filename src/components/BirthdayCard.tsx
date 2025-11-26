import { Card, CardContent } from "@/components/ui/card";
import { Cake, Calendar } from "lucide-react";
import { format, differenceInDays, addYears, isBefore } from "date-fns";

interface BirthdayCardProps {
  name: string;
  dateOfBirth: string;
}

const BirthdayCard = ({ name, dateOfBirth }: BirthdayCardProps) => {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  
  // Calculate next birthday
  let nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
  if (isBefore(nextBirthday, today)) {
    nextBirthday = addYears(nextBirthday, 1);
  }
  
  const daysUntil = differenceInDays(nextBirthday, today);
  const age = today.getFullYear() - birthDate.getFullYear();
  const nextAge = nextBirthday.getFullYear() - birthDate.getFullYear();
  
  const isToday = daysUntil === 0;
  const isSoon = daysUntil > 0 && daysUntil <= 7;

  return (
    <Card className={`transition-all hover:shadow-lg hover:-translate-y-1 border-2 ${
      isToday 
        ? "border-primary bg-gradient-to-br from-primary/5 to-secondary/5 shadow-celebration" 
        : isSoon 
        ? "border-accent/50 bg-accent/5" 
        : "border-border hover:border-primary/30"
    }`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Cake className={`w-5 h-5 ${isToday ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
              <h3 className="text-lg font-display font-semibold text-foreground">
                {name}
              </h3>
            </div>
            
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{format(birthDate, "MMMM d, yyyy")}</span>
              </div>
              <p className="text-xs">
                Turning {nextAge} years old
              </p>
            </div>
          </div>
          
          <div className="text-right">
            {isToday ? (
              <div className="bg-gradient-to-br from-primary to-secondary text-white px-3 py-2 rounded-full font-semibold text-sm shadow-lg animate-pulse">
                🎉 Today!
              </div>
            ) : (
              <div className={`${
                isSoon ? "text-accent font-semibold" : "text-muted-foreground"
              }`}>
                <div className="text-2xl font-display font-bold">
                  {daysUntil}
                </div>
                <div className="text-xs">
                  {daysUntil === 1 ? "day" : "days"}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BirthdayCard;
