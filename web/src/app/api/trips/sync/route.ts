import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { INITIAL_TRIPS, TripData } from "@/lib/tripsData";

const STORE_DIR = path.join(process.cwd(), ".server-store");
const STORE_FILE = path.join(STORE_DIR, "trips.json");

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS_HEADERS });
}

export function readServerTrips(): TripData[] {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const data = fs.readFileSync(STORE_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Failed to read server trips:", err);
  }
  return INITIAL_TRIPS;
}

export function writeServerTrips(trips: TripData[]): void {
  try {
    if (!fs.existsSync(STORE_DIR)) {
      fs.mkdirSync(STORE_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(trips, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write server trips:", err);
  }
}

// POST: Web frontend syncs all trips to server store
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const trips: TripData[] = body.trips;

    if (!Array.isArray(trips)) {
      return NextResponse.json(
        { success: false, error: "Invalid payload, expected trips array" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    writeServerTrips(trips);
    return NextResponse.json(
      { success: true, count: trips.length },
      { headers: CORS_HEADERS }
    );
  } catch (err) {
    console.error("Sync error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

// GET: Retrieve all server-stored trips
export async function GET() {
  const trips = readServerTrips();
  return NextResponse.json(
    { success: true, trips },
    { headers: CORS_HEADERS }
  );
}
