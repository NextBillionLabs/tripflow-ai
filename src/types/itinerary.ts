export interface TripData {
  trip: TripMeta;
  days: DayPlan[];
  budget: BudgetBreakdown;
  weatherAlert?: string;
}

export interface TripMeta {
  title: string;
  from: string;
  to: string;
  duration: string;
  totalBudget: number;
  travelers: number;
  dates: string;
}

export interface DayPlan {
  day: number;
  date: string;
  segments: Segment[];
}

export interface Segment {
  type: "departure" | "transfer" | "stay" | "activity" | "food" | "return";
  time: string;
  title: string;
  description?: string;
  transport?: TransportOption;
  alternatives?: TransportAlternative[];
  bufferMinutes?: number;
  hotel?: HotelInfo;
  foodOptions?: FoodOption[];
  milestones?: Milestone[];
}

export interface TransportOption {
  mode: string;
  name: string;
  departure: string;
  arrival: string;
  duration: string;
  price: number;
  details?: string;
  status?: string;
}

export interface TransportAlternative {
  mode: string;
  name: string;
  price: number;
  duration: string;
}

export interface HotelInfo {
  name: string;
  price: number;
  rating?: number;
  type: string;
  distance?: string;
}

export interface FoodOption {
  name: string;
  cuisine: string;
  price: number;
  rating: number;
}

export interface Milestone {
  time: string;
  title: string;
  detail: string;
}

export interface BudgetBreakdown {
  accommodation: number;
  transport: number;
  food: number;
  activities: number;
  contingency: number;
  total: number;
}
