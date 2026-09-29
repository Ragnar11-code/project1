// VoltPath – Stations & App Data

const STATIONS = [
  {
    id: 1, name: "TATA Power – Koramangala",
    network: "TATA Power", city: "Bengaluru",
    address: "Koramangala 5th Block, Bengaluru",
    lat: 12.9352, lng: 77.6245,
    pricePerKwh: 14, fastPrice: 18,
    connectors: ["CCS2", "CHAdeMO", "Type 2 AC"],
    maxPower: 150, totalSlots: 6, available: 3,
    rating: 4.5, reviews: 128,
    status: "available", waitMin: 5,
    amenities: ["Café", "WiFi", "Restrooms"],
    offPeakHours: "11 PM – 6 AM"
  },
  {
    id: 2, name: "Ather Grid – Indiranagar",
    network: "Ather", city: "Bengaluru",
    address: "100 Feet Road, Indiranagar, Bengaluru",
    lat: 12.9784, lng: 77.6408,
    pricePerKwh: 12, fastPrice: 16,
    connectors: ["Ather Proprietary", "Type 2 AC"],
    maxPower: 7.2, totalSlots: 4, available: 1,
    rating: 4.2, reviews: 89,
    status: "busy", waitMin: 25,
    amenities: ["Parking", "WiFi"],
    offPeakHours: "10 PM – 7 AM"
  },
  {
    id: 3, name: "BPCL EV – MG Road",
    network: "BPCL", city: "Bengaluru",
    address: "MG Road Fuel Station, Bengaluru",
    lat: 12.9753, lng: 77.6099,
    pricePerKwh: 13, fastPrice: 17,
    connectors: ["CCS2", "Bharat DC-001"],
    maxPower: 60, totalSlots: 4, available: 4,
    rating: 4.0, reviews: 56,
    status: "available", waitMin: 0,
    amenities: ["Petrol Station", "Convenience Store"],
    offPeakHours: "12 AM – 5 AM"
  },
  {
    id: 4, name: "Zeon Charging – Whitefield",
    network: "Zeon", city: "Bengaluru",
    address: "Whitefield Tech Park, Bengaluru",
    lat: 12.9698, lng: 77.7499,
    pricePerKwh: 15, fastPrice: 20,
    connectors: ["CCS2", "CHAdeMO", "Type 2 AC"],
    maxPower: 120, totalSlots: 8, available: 5,
    rating: 4.7, reviews: 215,
    status: "available", waitMin: 0,
    amenities: ["Food Court", "WiFi", "Lounge"],
    offPeakHours: "11 PM – 7 AM"
  },
  {
    id: 5, name: "EESL – Electronic City",
    network: "EESL", city: "Bengaluru",
    address: "Electronic City Phase 1, Bengaluru",
    lat: 12.8452, lng: 77.6602,
    pricePerKwh: 10, fastPrice: 14,
    connectors: ["Bharat DC-001", "Type 2 AC"],
    maxPower: 15, totalSlots: 3, available: 0,
    rating: 3.8, reviews: 41,
    status: "offline", waitMin: 60,
    amenities: ["Parking"],
    offPeakHours: "10 PM – 6 AM"
  },
  {
    id: 6, name: "Jio-BP – Hebbal",
    network: "Jio-BP", city: "Bengaluru",
    address: "Hebbal Flyover Junction, Bengaluru",
    lat: 13.0358, lng: 77.5970,
    pricePerKwh: 16, fastPrice: 22,
    connectors: ["CCS2", "Type 2 AC"],
    maxPower: 100, totalSlots: 5, available: 2,
    rating: 4.4, reviews: 73,
    status: "available", waitMin: 15,
    amenities: ["Café", "Restrooms", "EV Accessories Shop"],
    offPeakHours: "11 PM – 6 AM"
  }
];

const HISTORY_DATA = [
  { date: "12 Apr 2026", station: "TATA Power – Koramangala", duration: "1h 20m", kwh: 22.4, cost: 403, rating: 5 },
  { date: "08 Apr 2026", station: "Zeon – Whitefield", duration: "45m", kwh: 12.0, cost: 180, rating: 4 },
  { date: "02 Apr 2026", station: "BPCL EV – MG Road", duration: "2h 10m", kwh: 30.5, cost: 397, rating: 4 },
  { date: "28 Mar 2026", station: "Jio-BP – Hebbal", duration: "55m", kwh: 18.0, cost: 288, rating: 3 },
  { date: "20 Mar 2026", station: "Ather Grid – Indiranagar", duration: "30m", kwh: 5.5, cost: 66, rating: 5 },
  { date: "14 Mar 2026", station: "EESL – Electronic City", duration: "1h 40m", kwh: 20.0, cost: 200, rating: 3 },
];

const BOOKINGS = [
  { date: "2026-04-14", time: "10:00 AM", station: "TATA Power – Koramangala", connector: "CCS2", status: "upcoming" },
  { date: "2026-04-18", time: "06:00 PM", station: "Zeon – Whitefield", connector: "Type 2 AC", status: "upcoming" },
  { date: "2026-04-22", time: "08:00 AM", station: "Jio-BP – Hebbal", connector: "CCS2", status: "upcoming" },
];

const ALERTS = [
  { icon: "✅", text: "Zeon – Whitefield: Connector just freed up!", time: "2 min ago", type: "success" },
  { icon: "📅", text: "Reminder: Booking tomorrow at TATA Power 10 AM", time: "1 hour ago", type: "info" },
  { icon: "💸", text: "Off-peak pricing active at BPCL EV now (₹10/kWh)", time: "3 hours ago", type: "deal" },
];

const HOME_GUIDE = [
  { title: "AC Wallbox Charger", icon: "🏠", power: "7.2 kW", cost: "₹25,000–₹45,000", time: "4–8 hrs", note: "Best for overnight charging. Compatible with most EVs." },
  { title: "Portable Charger", icon: "🔌", power: "3.3 kW", cost: "₹8,000–₹15,000", time: "8–14 hrs", note: "Plug into regular 15A socket. No installation needed." },
  { title: "Fast DC Home Charger", icon: "⚡", power: "22 kW", cost: "₹60,000–₹1,20,000", time: "1–2 hrs", note: "For premium EVs. Requires professional installation." },
];

const INSTALLERS = [
  { name: "Exicom India", area: "Pan India", rating: "4.6 ⭐", contact: "1800-XXX-XXXX" },
  { name: "Delta Electronics", area: "Metro Cities", rating: "4.4 ⭐", contact: "1800-YYY-YYYY" },
  { name: "Okaya EV", area: "North India", rating: "4.3 ⭐", contact: "1800-ZZZ-ZZZZ" },
];
