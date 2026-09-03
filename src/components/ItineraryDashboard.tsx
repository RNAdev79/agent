import React, { useState } from 'react';
import { TravelPlanResponse, FlightOption, HotelOption } from '../../types/index';
import { SummaryHeader } from './SummaryHeader';
import { FlightCard } from './FlightCard';
import { HotelCard } from './HotelCard';
import { DayAccordion } from './DayAccordion';
import { Language } from '../lib/i18n';

interface ItineraryDashboardProps {
  plan: TravelPlanResponse;
  language: Language;
}

export const ItineraryDashboard: React.FC<ItineraryDashboardProps> = ({
  plan: initialPlan,
  language,
}) => {
  const [currentPlan, setCurrentPlan] = useState<TravelPlanResponse>(initialPlan);

  const handleSelectFlight = (newFlight: FlightOption) => {
    setCurrentPlan((prev) => {
      const flightCostDiff = newFlight.price - prev.flight.price;
      const newTotalSpent = prev.budgetSummary.totalSpent + flightCostDiff;
      const newRemaining = prev.budgetSummary.totalBudget - newTotalSpent;

      return {
        ...prev,
        flight: newFlight,
        budgetSummary: {
          ...prev.budgetSummary,
          flightCost: newFlight.price,
          totalSpent: newTotalSpent,
          remainingBudget: newRemaining,
          isWithinBudget: newTotalSpent <= prev.budgetSummary.totalBudget * 1.1,
        },
      };
    });
  };

  const handleSelectHotel = (newHotel: HotelOption) => {
    setCurrentPlan((prev) => {
      const hotelCostDiff = newHotel.totalPrice - prev.hotel.totalPrice;
      const newTotalSpent = prev.budgetSummary.totalSpent + hotelCostDiff;
      const newRemaining = prev.budgetSummary.totalBudget - newTotalSpent;

      return {
        ...prev,
        hotel: newHotel,
        budgetSummary: {
          ...prev.budgetSummary,
          hotelCost: newHotel.totalPrice,
          totalSpent: newTotalSpent,
          remainingBudget: newRemaining,
          isWithinBudget: newTotalSpent <= prev.budgetSummary.totalBudget * 1.1,
        },
      };
    });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fadeIn">
      {/* 1. Summary Header (Destination, Days, Budget usage) */}
      <SummaryHeader plan={currentPlan} language={language} />

      {/* 2. Side-by-side Flight & Hotel Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Flight Card */}
        <FlightCard
          flight={currentPlan.flight}
          alternatives={currentPlan.alternativeFlights}
          onSelectFlight={handleSelectFlight}
          language={language}
        />

        {/* Hotel Card */}
        <HotelCard
          hotel={currentPlan.hotel}
          durationDays={currentPlan.durationDays}
          alternatives={currentPlan.alternativeHotels}
          onSelectHotel={handleSelectHotel}
          language={language}
          hotelStatus={currentPlan.hotelStatus}
          hotelMaxBudget={currentPlan.hotelMaxBudget || currentPlan.budgetSummary?.dailyHotelBudget}
        />
      </div>

      {/* 3. Location Cards & Daily Route Links via Day-by-Day Accordion Schedule */}
      <DayAccordion days={currentPlan.days} language={language} />
    </div>
  );
};
