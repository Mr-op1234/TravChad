import { NextRequest, NextResponse } from "next/server";
import { readServerTrips } from "../sync/route";
import { INITIAL_TRIPS, TripData } from "@/lib/tripsData";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS_HEADERS });
}

function formatDatePretty(str: string): string {
  if (!str) return "";
  try {
    if (/^\d{2}-\d{2}-\d{4}$/.test(str)) {
      const [d, m, y] = str.split("-");
      return new Date(`${y}-${m}-${d}T00:00:00`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  } catch {}
  return str;
}

function matchTrip(trips: TripData[], inputCode: string): TripData | null {
  const norm = inputCode.trim().toUpperCase();
  if (!norm) return null;

  // 1. Exact match on tripCode
  let found = trips.find((t) => t.tripCode && t.tripCode.trim().toUpperCase() === norm);
  if (found) return found;

  // 2. Check without "TC-" prefix if user typed just the body
  if (norm.startsWith("TC-")) {
    const raw = norm.replace(/^TC-/, "");
    found = trips.find(
      (t) =>
        t.tripCode &&
        t.tripCode.trim().toUpperCase().replace(/^TC-/, "") === raw
    );
    if (found) return found;
  } else {
    // If user typed "JAPAN", match "TC-JAPAN"
    found = trips.find(
      (t) =>
        t.tripCode &&
        t.tripCode.trim().toUpperCase().replace(/^TC-/, "") === norm
    );
    if (found) return found;
  }

  // 3. Match trip id
  found = trips.find((t) => t.id && t.id.trim().toUpperCase() === norm);
  if (found) return found;

  // 4. Match trip name
  found = trips.find(
    (t) =>
      t.name &&
      t.name.trim().toUpperCase().replace(/[^A-Z0-9]/g, "") ===
        norm.replace(/[^A-Z0-9]/g, "")
  );
  if (found) return found;

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const code = body.code || "";
    return handleVerification(code);
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON request" },
      { status: 400, headers: CORS_HEADERS }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code") || "";
  return handleVerification(code);
}

function handleVerification(inputCode: string) {
  if (!inputCode || !inputCode.trim()) {
    return NextResponse.json(
      { success: false, error: "Trip code is required" },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  // Check server stored trips first, fallback to initial trips
  const serverTrips = readServerTrips();
  const allTrips = [...serverTrips];
  INITIAL_TRIPS.forEach((init) => {
    if (!allTrips.some((t) => t.id === init.id)) {
      allTrips.push(init);
    }
  });

  const matched = matchTrip(allTrips, inputCode);

  if (!matched) {
    return NextResponse.json(
      {
        success: false,
        error: `No trip found matching code "${inputCode.trim()}". Please check your web dashboard.`,
      },
      { status: 404, headers: CORS_HEADERS }
    );
  }

  // Extract clean locations string from events
  const locSet = new Set<string>();
  (matched.events || []).forEach((e) => {
    if (e.location) {
      // Split if comma separated
      const parts = e.location.split(",").map((s) => s.trim());
      parts.forEach((p) => {
        if (p.length > 1 && locSet.size < 4) locSet.add(p);
      });
    }
  });
  const locationsStr =
    locSet.size > 0 ? Array.from(locSet).join(", ") : matched.name;

  const startFormatted = formatDatePretty(matched.startDate);
  const endFormatted = formatDatePretty(matched.endDate);
  const dateRange =
    startFormatted && endFormatted
      ? `${startFormatted}  →  ${endFormatted}`
      : "Dates flexible";

  const exportedTrip = {
    id: matched.id,
    tripCode: matched.tripCode || `TC-${matched.name.toUpperCase().slice(0, 4)}`,
    name: matched.name,
    status: matched.status || "upcoming",
    startDate: matched.startDate,
    endDate: matched.endDate,
    dateRange,
    days: matched.days || (matched.events?.length ? matched.events.length : 7),
    locations: locationsStr,
    description:
      matched.description ||
      "An unforgettable journey exploring local culture and scenic wonders.",
    image:
      matched.heroImage ||
      matched.image ||
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
    isSaved: false,
    events: matched.events || [],
    documents: matched.documents || [],
  };

  return NextResponse.json(
    {
      success: true,
      message: `Trip "${matched.name}" verified successfully!`,
      trip: exportedTrip,
    },
    { headers: CORS_HEADERS }
  );
}
