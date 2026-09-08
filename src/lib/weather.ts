const API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5";

export interface WeatherData {
  city: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  description: string;
  icon: string;
  windSpeed: number;
  rainChance: number;
  visibility: number;
  clouds: number;
}

export interface ForecastItem {
  time: string;
  temp: number;
  description: string;
  icon: string;
  rainChance: number;
  windSpeed: number;
}

/**
 * Get current weather for a city.
 */
export async function getCurrentWeather(city: string): Promise<WeatherData> {
  const res = await fetch(
    `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
  );

  if (!res.ok) {
    throw new Error(`Weather API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  return {
    city: data.name,
    temp: Math.round(data.main.temp),
    feelsLike: Math.round(data.main.feels_like),
    humidity: data.main.humidity,
    description: data.weather[0]?.description ?? "",
    icon: data.weather[0]?.icon ?? "",
    windSpeed: Math.round(data.wind.speed * 3.6), // m/s to km/h
    rainChance: data.clouds?.all ?? 0,
    visibility: Math.round((data.visibility ?? 10000) / 1000), // meters to km
    clouds: data.clouds?.all ?? 0,
  };
}

/**
 * Get 5-day forecast for a city.
 */
export async function getForecast(city: string): Promise<ForecastItem[]> {
  const res = await fetch(
    `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&cnt=16`
  );

  if (!res.ok) {
    throw new Error(`Forecast API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  return data.list.map((item: Record<string, unknown>) => ({
    time: item.dt_txt as string,
    temp: Math.round((item.main as Record<string, number>).temp),
    description: ((item.weather as Record<string, string>[])[0])?.description ?? "",
    icon: ((item.weather as Record<string, string>[])[0])?.icon ?? "",
    rainChance: (item.clouds as Record<string, number>)?.all ?? 0,
    windSpeed: Math.round(((item.wind as Record<string, number>)?.speed ?? 0) * 3.6),
  }));
}

/**
 * Check if weather conditions could cause a disruption.
 */
export function checkDisruption(weather: WeatherData): {
  hasDisruption: boolean;
  severity: "low" | "medium" | "high";
  reason: string;
} {
  // Heavy rain
  if (weather.humidity > 85 && weather.clouds > 80) {
    return {
      hasDisruption: true,
      severity: "high",
      reason: `Heavy rainfall expected — ${weather.description}, ${weather.humidity}% humidity`,
    };
  }

  // Low visibility (fog)
  if (weather.visibility < 2) {
    return {
      hasDisruption: true,
      severity: "high",
      reason: `Dense fog — visibility only ${weather.visibility} km`,
    };
  }

  // Moderate conditions
  if (weather.clouds > 70 || weather.windSpeed > 40) {
    return {
      hasDisruption: true,
      severity: "medium",
      reason: `${weather.description}, wind ${weather.windSpeed} km/h`,
    };
  }

  return { hasDisruption: false, severity: "low", reason: "Clear conditions" };
}
