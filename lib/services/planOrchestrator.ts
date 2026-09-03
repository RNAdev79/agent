import {
  UserInputPlanRequest,
  TravelPlanResponse,
  BudgetBreakdown,
} from '../../types/index';
import { parseTravelIntentWithDeepSeek } from '../ai/agent';
import { searchFlights } from './flightService';
import { searchHotels } from './hotelService';
import { searchPlaces } from './placesService';
import { buildClusteredItinerary } from '../algorithms/clustering';

export async function orchestrateTravelPlan(
  userInput: UserInputPlanRequest
): Promise<TravelPlanResponse> {
  console.log('[Orchestrator] Step 1: Parsing user travel intent with DeepSeek NLU...');
  const intent = await parseTravelIntentWithDeepSeek(userInput);
  console.log('[Orchestrator] Intent parsed successfully:', intent);

  console.log(
    '[Orchestrator] Step 2: Executing parallel searches for Flights, Hotels, and Places...'
  );

  // Parallel execution using Promise.all
  const [flightResult, hotelResult, placesResult] = await Promise.all([
    searchFlights(intent).catch((err) => {
      console.error('[Orchestrator] Flight search error, fallback:', err);
      return searchFlights(intent);
    }),
    searchHotels(intent).catch((err) => {
      console.error('[Orchestrator] Hotel search error, fallback:', err);
      return searchHotels(intent);
    }),
    searchPlaces(intent.destination, Math.max(30, intent.duration_days * 8)).catch(
      (err) => {
        console.error('[Orchestrator] Places search error, fallback:', err);
        return searchPlaces(intent.destination, 30);
      }
    ),
  ]);

  console.log(
    `[Orchestrator] Retrieved ${placesResult.length} places. Running K-Means Spatial Clustering (K=${intent.duration_days})...`
  );

  // Step 3: Spatial Clustering with K-Means & Day sequencing
  const clusteredDays = buildClusteredItinerary(
    placesResult,
    intent.duration_days,
    intent.destination
  );

  // Step 4: Budget computation (Daily Hotel & Daily Activities)
  const durationDays = intent.duration_days;
  const flightBudget = intent.flight_budget;
  const dailyHotelBudget = intent.daily_hotel_budget || intent.hotel_budget || 600;
  const totalHotelBudget = intent.total_hotel_budget || dailyHotelBudget * durationDays;

  const defaultDailyAct = intent.currency === 'SAR' || intent.currency === 'AED' ? 150 : 50;
  const dailyActivitiesBudget = intent.daily_activities_budget || defaultDailyAct;
  const totalActivitiesBudget = intent.total_activities_budget || dailyActivitiesBudget * durationDays;

  const totalTripBudget = intent.total_trip_budget || (flightBudget + totalHotelBudget + totalActivitiesBudget);

  const flightCost = flightResult.flight.price;
  const hotelCost = hotelResult.hotel ? hotelResult.hotel.totalPrice : 0; // already nightlyRate * durationDays if found
  const estimatedActivitiesCost = totalActivitiesBudget;
  const totalSpent = flightCost + hotelCost + estimatedActivitiesCost;
  const remainingBudget = totalTripBudget - totalSpent;

  const budgetSummary: BudgetBreakdown = {
    totalBudget: totalTripBudget,
    flightCost,
    hotelCost,
    estimatedActivitiesCost,
    totalSpent,
    remainingBudget,
    isWithinBudget: totalSpent <= totalTripBudget * 1.1, // 10% allowance margin
    dailyHotelBudget,
    totalHotelBudget,
    dailyActivitiesBudget,
    totalActivitiesBudget,
    flightBudget,
    currency: intent.currency || 'USD',
  };

  const aiNotes = `Trip optimized by DeepSeek AI for ${intent.duration_days} days in ${
    intent.destination
  }. K-Means spatial clustering grouped ${
    placesResult.length
  } places into ${
    intent.duration_days
  } distinct geographic zones to prevent backtracking. Route navigation links are pre-computed for Google Maps.`;

  return {
    id: `plan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    destination: intent.destination,
    origin: flightResult.flight.departureAirport || intent.origin || 'JED',
    durationDays: intent.duration_days,
    currency: intent.currency || 'USD',
    budgetSummary,
    flight: flightResult.flight,
    alternativeFlights: flightResult.alternativeFlights,
    hotel: hotelResult.hotel,
    alternativeHotels: hotelResult.alternativeHotels || [],
    hotelStatus: hotelResult.status || 'ok',
    hotelMaxBudget: dailyHotelBudget,
    days: clusteredDays,
    preferences: intent.preferences,
    travelStyle: intent.travel_style || 'balanced',
    generatedAt: new Date().toISOString(),
    aiNotes,
  };
}
