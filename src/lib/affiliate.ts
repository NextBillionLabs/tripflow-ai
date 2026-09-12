/**
 * TripFlow AI — Affiliate Configuration
 *
 * Fill in your affiliate IDs here once approved.
 * All booking links across the app use these automatically.
 *
 * Sign up at:
 * - ConfirmTkt: confirmtkt.com/affiliate
 * - RedBus:     partners.redbus.in
 * - OYO:        oyorooms.com/affiliate
 * - Savaari:    savaari.com/affiliate
 * - MakeMyTrip: vcommission.com (search MMT)
 */
export const AFFILIATE_IDS = {
  confirmtkt: process.env.NEXT_PUBLIC_AFF_CONFIRMTKT || "",
  redbus: process.env.NEXT_PUBLIC_AFF_REDBUS || "",
  abhibus: process.env.NEXT_PUBLIC_AFF_ABHIBUS || "",
  oyo: process.env.NEXT_PUBLIC_AFF_OYO || "",
  savaari: process.env.NEXT_PUBLIC_AFF_SAVAARI || "",
  makemytrip: process.env.NEXT_PUBLIC_AFF_MMT || "",
  booking: process.env.NEXT_PUBLIC_AFF_BOOKING || "",
};

// ─── Train Links ─────────────────────────────────────────────────────────────

export function getTrainCheckUrl(trainName: string): string {
  const trainNo = trainName.match(/\d{4,5}/)?.[0] || "";
  const base = trainNo
    ? `https://www.confirmtkt.com/train-details/${trainNo}`
    : "https://www.confirmtkt.com";
  return AFFILIATE_IDS.confirmtkt
    ? `${base}?ref=${AFFILIATE_IDS.confirmtkt}`
    : base;
}

export function getTrainStatusUrl(trainName: string): string {
  const trainNo = trainName.match(/\d{4,5}/)?.[0] || "";
  const base = trainNo
    ? `https://www.confirmtkt.com/train-running-status/${trainNo}`
    : "https://www.confirmtkt.com";
  return AFFILIATE_IDS.confirmtkt
    ? `${base}?ref=${AFFILIATE_IDS.confirmtkt}`
    : base;
}

export function getTrainSearchUrl(from: string, to: string): string {
  const f = encodeURIComponent(from.toUpperCase().replace(/\s+/g, "_"));
  const t = encodeURIComponent(to.toUpperCase().replace(/\s+/g, "_"));
  const base = `https://www.confirmtkt.com/rbooking/from-${f}/to-${t}`;
  return AFFILIATE_IDS.confirmtkt
    ? `${base}?ref=${AFFILIATE_IDS.confirmtkt}`
    : base;
}

export function getIrctcUrl(): string {
  return "https://www.irctc.co.in/nget/train-search";
}

// ─── Bus Links ───────────────────────────────────────────────────────────────

export function getBusUrl(from: string, to: string, date?: string): string {
  const f = from.toLowerCase().replace(/\s+/g, "-");
  const t = to.toLowerCase().replace(/\s+/g, "-");
  const base = `https://www.redbus.in/bus-tickets/${f}-to-${t}`;
  const params = new URLSearchParams();
  if (date) params.set("doj", date);
  if (AFFILIATE_IDS.redbus) params.set("utm_source", AFFILIATE_IDS.redbus);
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

export function getAbhiBusUrl(from: string, to: string): string {
  const f = encodeURIComponent(from);
  const t = encodeURIComponent(to);
  const base = `https://www.abhibus.com/bus-tickets/${f}-to-${t}`;
  return AFFILIATE_IDS.abhibus
    ? `${base}?affiliate_id=${AFFILIATE_IDS.abhibus}`
    : base;
}

// ─── Hotel Links ─────────────────────────────────────────────────────────────

export function getOyoUrl(city: string, checkIn?: string, checkOut?: string): string {
  const params = new URLSearchParams();
  params.set("location", city);
  if (checkIn) params.set("checkin", checkIn);
  if (checkOut) params.set("checkout", checkOut);
  if (AFFILIATE_IDS.oyo) params.set("ref", AFFILIATE_IDS.oyo);
  return `https://www.oyorooms.com/search/?${params.toString()}`;
}

export function getMakeMyTripHotelUrl(city: string, checkIn?: string, checkOut?: string): string {
  const params = new URLSearchParams();
  params.set("checkin", checkIn || "");
  params.set("checkout", checkOut || "");
  params.set("city", city);
  if (AFFILIATE_IDS.makemytrip) params.set("utm_source", AFFILIATE_IDS.makemytrip);
  return `https://www.makemytrip.com/hotels/hotel-listing/?${params.toString()}`;
}

export function getBookingUrl(city: string, checkIn?: string, checkOut?: string): string {
  const params = new URLSearchParams();
  params.set("ss", city);
  if (checkIn) params.set("checkin", checkIn);
  if (checkOut) params.set("checkout", checkOut);
  params.set("aid", AFFILIATE_IDS.booking || "2311236"); // default tracking
  return `https://www.booking.com/searchresults.html?${params.toString()}`;
}

// ─── Cab Links ───────────────────────────────────────────────────────────────

export function getSavaariUrl(from: string, to: string): string {
  const f = from.toLowerCase().replace(/\s+/g, "-");
  const t = to.toLowerCase().replace(/\s+/g, "-");
  const base = `https://www.savaari.com/cabs/${f}-to-${t}`;
  return AFFILIATE_IDS.savaari
    ? `${base}?aff=${AFFILIATE_IDS.savaari}`
    : base;
}

export function getUberUrl(): string {
  return "https://www.uber.com/in/en/ride/";
}

export function getOlaUrl(from: string, to: string): string {
  return `https://www.olacabs.com/?drop=${encodeURIComponent(to)}`;
}
