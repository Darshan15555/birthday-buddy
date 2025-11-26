-- Create birthdays table
CREATE TABLE public.birthdays (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.birthdays ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own birthdays" 
ON public.birthdays 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own birthdays" 
ON public.birthdays 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own birthdays" 
ON public.birthdays 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own birthdays" 
ON public.birthdays 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_birthdays_updated_at
BEFORE UPDATE ON public.birthdays
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();