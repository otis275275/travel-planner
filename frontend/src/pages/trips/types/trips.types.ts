export type TripTab = "upcoming" | "draft" | "past";

export interface TripCardProps {
  image: string;
  status: string;
  title: string;
  meta: string;
  people: string;
  budget: string;
  onView: () => void;
  draft?: boolean;
  authorName?: string;
}
