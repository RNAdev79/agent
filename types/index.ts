export interface UserInputPlanRequest {
  prompt?: string;
  destination?: string;
  durationDays?: number;
  flightBudget?: number;
  hotelBudget?: number;
  dailyHotelBudget?: number;
  dailyActivitiesBudget?: number;
  currency?: string;
  travelStyle?: 'luxury' | 'budget' | 'adventure' | 'cultural' | 'family' | 'romantic' | 'relaxed';
  originCity?: string;
  preferences?: string[];
}

export interface ParsedTravelIntent {
  destination: string;
  duration_days: number;
  flight_budget: number; // Total fixed flight amount
  daily_hotel_budget: number; // Daily hotel budget per night
  hotel_budget: number; // Alias for daily_hotel_budget for backward compatibility
  total_hotel_budget: number; // (daily_hotel_budget) * (duration_days)
  daily_activities_budget: number; // Daily dining & activities budget
  total_activities_budget: number; // (daily_activities_budget) * (duration_days)
  total_trip_budget: number; // flight_budget + total_hotel_budget + total_activities_budget
  currency: string;
  preferences: string[];
  travel_style?: string;
  origin?: string;
  raw_prompt?: string;
}

export interface FlightOption {
  id: string;
  airline: string;
  airlineLogo?: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  price: number;
  currency: string;
  bookingUrl: string;
  cabinClass?: string;
}

export interface HotelOption {
  id: string;
  name: string;
  rating: number;
  reviewsCount?: number;
  stars: number;
  pricePerNight: number;
  totalPrice: number;
  currency: string;
  address: string;
  photoUrl: string;
  bookingUrl: string;
  amenities: string[];
  roomType?: string;
}

export interface HotelSearchResult {
  status: 'ok' | 'no_hotels_within_budget';
  max_budget: number;
  hotel: HotelOption | null;
  alternativeHotels: HotelOption[];
  message?: string;
}

export type PlaceCategory = 'breakfast' | 'activity' | 'lunch' | 'attraction' | 'dinner';

export interface PlaceItem {
  id: string;
  name: string;
  category: PlaceCategory;
  timeSlot?: string;
  rating: number;
  reviewsCount: number;
  address: string;
  latitude: number;
  longitude: number;
  photoUrl?: string;
  mapsUrl: string;
  priceLevel?: string;
  description?: string;
  clusterId?: number;
}

export interface DayPlan {
  dayNumber: number;
  title: string;
  clusterAreaName: string;
  places: PlaceItem[];
  totalDistanceKm: number;
  mapsRouteUrl: string;
  summary: string;
}

export interface BudgetBreakdown {
  totalBudget: number; // Flight Budget + (Daily Hotel * Days) + (Daily Activities * Days)
  flightCost: number; // Fixed total flight cost
  dailyHotelCost?: number; // Nightly hotel rate
  hotelCost: number; // Total hotel cost = dailyHotelCost * durationDays
  dailyActivitiesCost?: number; // Daily activities & dining estimate
  estimatedActivitiesCost: number; // Total activities = dailyActivitiesCost * durationDays
  totalSpent: number; // flightCost + hotelCost + estimatedActivitiesCost
  remainingBudget: number; // totalBudget - totalSpent
  isWithinBudget: boolean;
  currency?: string;
  dailyHotelBudget?: number;
  totalHotelBudget?: number;
  dailyActivitiesBudget?: number;
  totalActivitiesBudget?: number;
  flightBudget?: number;
}

export interface TravelPlanResponse {
  id: string;
  destination: string;
  origin: string;
  durationDays: number;
  currency: string;
  budgetSummary: BudgetBreakdown;
  flight: FlightOption;
  alternativeFlights: FlightOption[];
  hotel: HotelOption | null;
  alternativeHotels: HotelOption[];
  hotelStatus?: 'ok' | 'no_hotels_within_budget';
  hotelMaxBudget?: number;
  days: DayPlan[];
  preferences: string[];
  travelStyle: string;
  generatedAt: string;
  aiNotes?: string;
}

export interface AgentExecutionStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  timestamp?: string;
}
