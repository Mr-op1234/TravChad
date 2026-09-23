import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { startTime, endTime } = await req.json();

    if (!startTime || !endTime) {
      return NextResponse.json(
        { error: "startTime and endTime are required" },
        { status: 400 }
      );
    }

    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);

    if (
      isNaN(startH) ||
      isNaN(startM) ||
      isNaN(endH) ||
      isNaN(endM)
    ) {
      return NextResponse.json(
        { error: "Invalid time format. Expected HH:mm" },
        { status: 400 }
      );
    }

    let diffMinutes = endH * 60 + endM - (startH * 60 + startM);

    // If overnight event
    if (diffMinutes < 0) {
      diffMinutes += 24 * 60;
    }

    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    let duration = "";
    if (hours > 0 && minutes > 0) {
      duration = `~ ${hours} hrs ${minutes} mins`;
    } else if (hours > 0) {
      duration = `~ ${hours} hrs`;
    } else {
      duration = `~ ${minutes} mins`;
    }

    return NextResponse.json({
      duration,
      hours,
      minutes,
      totalMinutes: diffMinutes,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to calculate duration" },
      { status: 500 }
    );
  }
}
