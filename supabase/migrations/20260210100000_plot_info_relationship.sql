-- Add plot_info to graves and relationship to grave_members
ALTER TABLE public.graves ADD COLUMN plot_info text;
ALTER TABLE public.grave_members ADD COLUMN relationship text;
