import OpenAI from 'openai';
import { ParsedTravelIntent, UserInputPlanRequest } from '../../types/index';

const DEEPSEEK_API_KEY =
  process.env.DEEPSEEK_API_KEY || 'sk-0024cbe09b744f3b8265371a4b6d8e3e';

// Initialize OpenAI client configured for DeepSeek API
function getDeepSeekClient(): OpenAI {
  return new OpenAI({
    baseURL: 'https://api.deepseek.com/v1',
    apiKey: DEEPSEEK_API_KEY,
  });
}

const SYSTEM_PROMPT = `You are a Principal Travel Intelligence Agent and Natural Language Understanding (NLU) Engine for SmartTravel AI.
Your task is to parse travel prompts in ANY language (Arabic, English, etc.) and extract structured travel parameters.

STRICT INSTRUCTION: You MUST reply with ONLY a single raw JSON object. Do not include markdown ticks, no backticks, no explanations, no text before or after the JSON.
The JSON must follow this exact schema:
{
  "destination": string,
  "duration_days": number,
  "flight_budget": number,
  "daily_hotel_budget": number,
  "hotel_budget": number,
  "daily_activities_budget": number,
  "currency": string,
  "preferences": string[],
  "travel_style": string,
  "origin": string
}

Budget Logic Guidelines:
- "flight_budget": A TOTAL FIXED AMOUNT for the flight tickets (e.g. "ميزانيته الطيران 500" -> 500).
- "daily_hotel_budget": A DAILY NIGHTLY AMOUNT for hotels per night (e.g. "ميزانيته السكن 600" -> 600).
- "hotel_budget": Set to the same value as daily_hotel_budget (600).
- "daily_activities_budget": A DAILY amount for dining and activities. If not explicitly specified, use 150 for SAR/AED, 50 for USD, 45 for EUR.
- Duration: Extract duration in days (e.g., "6 ايام" -> 6).
- If origin is mentioned (e.g., "من جدة", "from London"), extract it. If not, infer from context (e.g. for Riyadh in Arabic, default to "JED", not "JFK").
- If currency is SAR or mentioned in Arabic (ريال), use SAR, otherwise USD.`;

/**
 * Extracts and sanitizes JSON from LLM output
 */
function cleanAndParseJSON<T>(rawText: string): T {
  let cleaned = rawText.trim();
  cleaned = cleaned.replace(/^```json\s*/i, '');
  cleaned = cleaned.replace(/^```\s*/i, '');
  cleaned = cleaned.replace(/\s*```$/i, '');
  cleaned = cleaned.trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]) as T;
    }
    throw new Error('Failed to extract JSON object from AI response');
  }
}

/**
 * Comprehensive Multilingual NLU Parser for Arabic & English travel queries.
 * Fully extracts: Destination, Duration (days), Flight budget, Hotel budget, Origin airport.
 */
export function advancedMultilingualParser(text: string): {
  destination?: string;
  duration_days?: number;
  flight_budget?: number;
  daily_hotel_budget?: number;
  hotel_budget?: number;
  daily_activities_budget?: number;
  origin?: string;
  currency?: string;
  travel_style?: string;
  preferences?: string[];
} {
  if (!text || !text.trim()) return {};

  // Normalize Arabic numbers: ٠١٢٣٤٥٦٧٨٩ -> 0123456789
  const normalized = text
    .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString())
    .trim();
  const lower = normalized.toLowerCase();

  let destination: string | undefined;
  let origin: string | undefined;
  let duration_days: number | undefined;
  let flight_budget: number | undefined;
  let hotel_budget: number | undefined;
  let daily_activities_budget: number | undefined;
  let currency: string | undefined;
  const preferences: string[] = [];

  // Known city definitions with default regional origins
  const CITY_LOOKUP: Record<
    string,
    { name: string; defaultOrigin: string; isMiddleEast?: boolean }
  > = {
    الرياض: { name: 'Riyadh', defaultOrigin: 'JED', isMiddleEast: true },
    رياض: { name: 'Riyadh', defaultOrigin: 'JED', isMiddleEast: true },
    للرياض: { name: 'Riyadh', defaultOrigin: 'JED', isMiddleEast: true },
    بالرياض: { name: 'Riyadh', defaultOrigin: 'JED', isMiddleEast: true },
    riyadh: { name: 'Riyadh', defaultOrigin: 'JED', isMiddleEast: true },
    جدة: { name: 'Jeddah', defaultOrigin: 'RUH', isMiddleEast: true },
    لجدة: { name: 'Jeddah', defaultOrigin: 'RUH', isMiddleEast: true },
    jeddah: { name: 'Jeddah', defaultOrigin: 'RUH', isMiddleEast: true },
    الدمام: { name: 'Dammam', defaultOrigin: 'RUH', isMiddleEast: true },
    dammam: { name: 'Dammam', defaultOrigin: 'RUH', isMiddleEast: true },
    دبي: { name: 'Dubai', defaultOrigin: 'RUH', isMiddleEast: true },
    لدبي: { name: 'Dubai', defaultOrigin: 'RUH', isMiddleEast: true },
    dubai: { name: 'Dubai', defaultOrigin: 'RUH', isMiddleEast: true },
    أبوظبي: { name: 'Abu Dhabi', defaultOrigin: 'RUH', isMiddleEast: true },
    ابوظبي: { name: 'Abu Dhabi', defaultOrigin: 'RUH', isMiddleEast: true },
    'abu dhabi': { name: 'Abu Dhabi', defaultOrigin: 'RUH', isMiddleEast: true },
    الدوحة: { name: 'Doha', defaultOrigin: 'RUH', isMiddleEast: true },
    doha: { name: 'Doha', defaultOrigin: 'RUH', isMiddleEast: true },
    القاهرة: { name: 'Cairo', defaultOrigin: 'RUH', isMiddleEast: true },
    cairo: { name: 'Cairo', defaultOrigin: 'RUH', isMiddleEast: true },
    باريس: { name: 'Paris', defaultOrigin: 'RUH' },
    لباريس: { name: 'Paris', defaultOrigin: 'RUH' },
    paris: { name: 'Paris', defaultOrigin: 'JFK' },
    طوكيو: { name: 'Tokyo', defaultOrigin: 'JFK' },
    لطوكيو: { name: 'Tokyo', defaultOrigin: 'JFK' },
    tokyo: { name: 'Tokyo', defaultOrigin: 'JFK' },
    لندن: { name: 'London', defaultOrigin: 'RUH' },
    london: { name: 'London', defaultOrigin: 'JFK' },
    روما: { name: 'Rome', defaultOrigin: 'RUH' },
    rome: { name: 'Rome', defaultOrigin: 'JFK' },
    إسطنبول: { name: 'Istanbul', defaultOrigin: 'RUH' },
    اسطنبول: { name: 'Istanbul', defaultOrigin: 'RUH' },
    istanbul: { name: 'Istanbul', defaultOrigin: 'JFK' },
    برشلونة: { name: 'Barcelona', defaultOrigin: 'RUH' },
    barcelona: { name: 'Barcelona', defaultOrigin: 'JFK' },
    'نيويورك': { name: 'New York', defaultOrigin: 'LHR' },
    'new york': { name: 'New York', defaultOrigin: 'LHR' },
    بانكوك: { name: 'Bangkok', defaultOrigin: 'DXB' },
    bangkok: { name: 'Bangkok', defaultOrigin: 'DXB' },
  };

  // 1. Detect explicit origin in prompt if mentioned (e.g. "من جدة", "من الرياض", "from London")
  const originMatch =
    normalized.match(/(?:من|من مدينة|انطلاقاً من|من مطار|from)\s+([^\s,،]+)/i);
  if (originMatch && originMatch[1]) {
    const rawOrigin = originMatch[1].toLowerCase();
    for (const [key, val] of Object.entries(CITY_LOOKUP)) {
      if (rawOrigin.includes(key)) {
        origin = val.name;
        break;
      }
    }
  }

  // 2. Detect destination
  for (const [key, val] of Object.entries(CITY_LOOKUP)) {
    if (lower.includes(key)) {
      destination = val.name;
      if (!origin) {
        origin = val.defaultOrigin;
      }
      break;
    }
  }

  // If destination not matched yet, try regex patterns
  if (!destination) {
    const destMatch =
      normalized.match(/(?:إلى|الى|لـ|ل|في|زيارة|رحلة إلى|رحلة الى|رحلة لـ|رحلة ل)\s*([^\s,،]+)/i) ||
      normalized.match(/(?:to|visit|trip to|in)\s+([a-zA-Z\s]+?)(?:\s+(?:for|with|under|budget|days|from)|$)/i);
    if (destMatch && destMatch[1]) {
      destination = destMatch[1].trim();
    }
  }

  // 3. Detect duration in days: e.g. "6 ايام", "6 أيام", "6 days", "6-day", "لمدة 6 ايام", "6 ليالي"
  const durationMatch =
    normalized.match(/(\d+)\s*(?:أيام|ايام|يوم|days?|nights?|ليال|ليالي)/i) ||
    normalized.match(/(?:لمدة|مدة|duration\s*(?:of|:)?)\s*(\d+)/i);
  if (durationMatch && durationMatch[1]) {
    duration_days = Math.min(14, Math.max(1, parseInt(durationMatch[1], 10)));
  }

  // 4. Flight budget extraction:
  // e.g. "ميزانيته الطيران 500", "ميزانية الطيران 500", "طيران 500", "تذاكر 500", "flight budget 500", "flight 500", "500 للطيران"
  const flightMatch =
    normalized.match(
      /(?:طيران|الطيران|تذاكر|تذكرة|flight|flights?|flight\s*budget)(?:\s+بـ|\s+ميزانيته|\s+ميزانية|\s+هو|\s+is|\s*:|\s+)?\s*(\d+)/i
    ) ||
    normalized.match(/(\d+)\s*(?:للطيران|للتذاكر|for\s*flight)/i) ||
    normalized.match(/flight(?:\s*budget)?\s*[:=]?\s*\$?(\d+)/i);
  if (flightMatch && flightMatch[1]) {
    flight_budget = parseInt(flightMatch[1], 10);
  }

  // 5. Hotel budget extraction (DAILY NIGHTLY AMOUNT):
  // e.g. "ميزانيته السكن 600", "ميزانية السكن 600", "سكن 600", "فندق 600", "hotel budget 600", "hotel 600", "600 للسكن"
  const hotelMatch =
    normalized.match(
      /(?:سكن|السكن|فندق|الفندق|إقامة|اقامة|hotel|hotels?|hotel\s*budget|stay)(?:\s+بـ|\s+ميزانيته|\s+ميزانية|\s+هو|\s+is|\s*:|\s+)?\s*(\d+)/i
    ) ||
    normalized.match(/(\d+)\s*(?:للسكن|للفندق|للاقامة|for\s*hotel)/i) ||
    normalized.match(/hotel(?:\s*budget)?\s*[:=]?\s*\$?(\d+)/i);
  if (hotelMatch && hotelMatch[1]) {
    hotel_budget = parseInt(hotelMatch[1], 10);
  }

  // 6. Activities / Dining budget extraction (DAILY AMOUNT):
  const activitiesMatch =
    normalized.match(
      /(?:أنشطة|انشطة|فعاليات|مصاريف|مطاعم|أكل|activities|dining|meals)(?:\s+بـ|\s+ميزانيته|\s+ميزانية|\s+هو|\s*:|\s+)?\s*(\d+)/i
    ) ||
    normalized.match(/(\d+)\s*(?:للأنشطة|للانشطة|للفعاليات|للمطاعم|for\s*activities)/i);
  if (activitiesMatch && activitiesMatch[1]) {
    daily_activities_budget = parseInt(activitiesMatch[1], 10);
  }

  // If numbers weren't bound to keywords, grab numeric tokens
  if (!flight_budget || !hotel_budget) {
    const rawNumbers = normalized.match(/\b\d{2,5}\b/g);
    if (rawNumbers && rawNumbers.length >= 2) {
      const candidates = rawNumbers
        .map((n) => parseInt(n, 10))
        .filter((n) => n !== duration_days && n >= 100);
      if (!flight_budget && candidates[0]) flight_budget = candidates[0];
      if (!hotel_budget && candidates[1]) hotel_budget = candidates[1];
    }
  }

  // 7. Detect currency
  if (
    normalized.includes('ريال') ||
    normalized.includes('ر.س') ||
    lower.includes('sar')
  ) {
    currency = 'SAR';
  } else if (
    normalized.includes('درهم') ||
    normalized.includes('د.إ') ||
    lower.includes('aed')
  ) {
    currency = 'AED';
  } else if (normalized.includes('€') || lower.includes('eur')) {
    currency = 'EUR';
  } else if (normalized.includes('£') || lower.includes('gbp')) {
    currency = 'GBP';
  }

  // 8. Detect preferences
  if (
    lower.includes('تاريخ') ||
    lower.includes('معالم') ||
    lower.includes('history') ||
    lower.includes('culture')
  ) {
    preferences.push('Culture & Heritage');
  }
  if (
    lower.includes('مطاعم') ||
    lower.includes('أكل') ||
    lower.includes('food') ||
    lower.includes('cuisine') ||
    lower.includes('dining')
  ) {
    preferences.push('Culinary & Dining');
  }
  if (
    lower.includes('طبيعة') ||
    lower.includes('حدائق') ||
    lower.includes('nature') ||
    lower.includes('parks')
  ) {
    preferences.push('Nature & Parks');
  }

  return {
    destination,
    duration_days,
    flight_budget,
    daily_hotel_budget: hotel_budget,
    hotel_budget,
    daily_activities_budget,
    origin,
    currency,
    preferences: preferences.length > 0 ? preferences : undefined,
  };
}

/**
 * Backward compatible fallback parser
 */
export function ruleBasedFallbackParser(
  input: UserInputPlanRequest
): ParsedTravelIntent {
  const parsed = advancedMultilingualParser(
    (input.prompt || '') + ' ' + (input.destination || '')
  );

  const destination = parsed.destination || input.destination || 'Riyadh';
  const duration_days = Math.min(14, Math.max(1, parsed.duration_days || input.durationDays || 4));
  const flight_budget = parsed.flight_budget || input.flightBudget || 500;
  const daily_hotel_budget = parsed.daily_hotel_budget || parsed.hotel_budget || input.dailyHotelBudget || input.hotelBudget || 600;
  const total_hotel_budget = daily_hotel_budget * duration_days;
  const currency = parsed.currency || input.currency || 'SAR';
  const defaultDailyActivities = currency === 'SAR' || currency === 'AED' ? 150 : 50;
  const daily_activities_budget = parsed.daily_activities_budget || input.dailyActivitiesBudget || defaultDailyActivities;
  const total_activities_budget = daily_activities_budget * duration_days;
  const total_trip_budget = flight_budget + total_hotel_budget + total_activities_budget;

  let origin = parsed.origin || input.originCity;
  if (!origin || origin === 'JFK') {
    if (destination.toLowerCase().includes('riyadh')) {
      origin = 'JED';
    } else {
      origin = input.originCity || 'JFK';
    }
  }

  return {
    destination,
    duration_days,
    flight_budget,
    daily_hotel_budget,
    hotel_budget: daily_hotel_budget,
    total_hotel_budget,
    daily_activities_budget,
    total_activities_budget,
    total_trip_budget,
    currency,
    travel_style: input.travelStyle || 'balanced',
    preferences: parsed.preferences || ['Cultural Sightseeing', 'Local Gastronomy'],
    origin,
    raw_prompt: input.prompt,
  };
}

/**
 * Parses user input using DeepSeek API with strict fallback to the Multilingual NLU Engine.
 * CRITICAL RULE: The text area content MUST override all UI controls and default states!
 */
export async function parseTravelIntentWithDeepSeek(
  input: UserInputPlanRequest
): Promise<ParsedTravelIntent> {
  const promptText = (input.prompt || '').trim();
  const hasUserPrompt = promptText.length > 0;

  // 1. First, parse the text area with our semantic multilingual parser
  const parsedFromPrompt = hasUserPrompt
    ? advancedMultilingualParser(promptText)
    : {};

  // Try DeepSeek NLU model
  let deepSeekParsed: Partial<ParsedTravelIntent> | null = null;
  if (hasUserPrompt) {
    try {
      const client = getDeepSeekClient();
      const completion = await client.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Analyze this travel request and return strict JSON:\n"${promptText}"`,
          },
        ],
        temperature: 0.1,
        max_tokens: 600,
      });

      const reply = completion.choices[0]?.message?.content;
      if (reply) {
        const json = cleanAndParseJSON<ParsedTravelIntent>(reply);
        if (json.destination) {
          deepSeekParsed = json;
        }
      }
    } catch (err: any) {
      console.warn('DeepSeek API request notice (handled seamlessly):', err?.message || err);
    }
  }

  // RESOLUTION ORDER:
  // If user provided a prompt in the textarea, prompt-extracted fields OVERRIDE all UI defaults!
  let destination =
    deepSeekParsed?.destination ||
    parsedFromPrompt.destination ||
    input.destination ||
    'Riyadh';

  let duration_days =
    deepSeekParsed?.duration_days ||
    parsedFromPrompt.duration_days ||
    input.durationDays ||
    4;

  let flight_budget =
    deepSeekParsed?.flight_budget ||
    parsedFromPrompt.flight_budget ||
    input.flightBudget ||
    500;

  // Hotel budget is DAILY NIGHTLY amount
  let daily_hotel_budget =
    deepSeekParsed?.daily_hotel_budget ||
    deepSeekParsed?.hotel_budget ||
    parsedFromPrompt.daily_hotel_budget ||
    parsedFromPrompt.hotel_budget ||
    input.dailyHotelBudget ||
    input.hotelBudget ||
    600;

  let currency =
    deepSeekParsed?.currency ||
    parsedFromPrompt.currency ||
    input.currency ||
    (destination.toLowerCase().includes('riyadh') || destination.includes('الرياض') ? 'SAR' : 'USD');

  const defaultDailyAct = currency === 'SAR' || currency === 'AED' ? 150 : 50;
  let daily_activities_budget =
    deepSeekParsed?.daily_activities_budget ||
    parsedFromPrompt.daily_activities_budget ||
    input.dailyActivitiesBudget ||
    defaultDailyAct;

  const total_hotel_budget = daily_hotel_budget * duration_days;
  const total_activities_budget = daily_activities_budget * duration_days;
  const total_trip_budget = flight_budget + total_hotel_budget + total_activities_budget;

  // Automatically infer departure airport based on destination and language context
  let origin =
    deepSeekParsed?.origin ||
    parsedFromPrompt.origin;

  if (!origin) {
    const destLower = destination.toLowerCase();
    if (
      destLower.includes('riyadh') ||
      destLower.includes('الرياض') ||
      destLower.includes('jeddah') ||
      destLower.includes('جدة')
    ) {
      // For Saudi destinations, default origin should be a regional hub like JED, NOT JFK!
      origin = destLower.includes('jeddah') ? 'RUH' : 'JED';
    } else {
      origin = input.originCity && input.originCity !== 'JFK' ? input.originCity : 'JFK';
    }
  }

  const travel_style =
    deepSeekParsed?.travel_style ||
    input.travelStyle ||
    'balanced';

  const preferences =
    deepSeekParsed?.preferences ||
    parsedFromPrompt.preferences ||
    (input.preferences && input.preferences.length > 0
      ? input.preferences
      : ['Attractions', 'Culinary & Dining', 'Culture & Heritage']);

  const finalIntent: ParsedTravelIntent = {
    destination,
    origin,
    duration_days: Math.min(14, Math.max(1, duration_days)),
    flight_budget,
    daily_hotel_budget,
    hotel_budget: daily_hotel_budget,
    total_hotel_budget,
    daily_activities_budget,
    total_activities_budget,
    total_trip_budget,
    currency,
    travel_style,
    preferences,
    raw_prompt: input.prompt,
  };

  return finalIntent;
}
