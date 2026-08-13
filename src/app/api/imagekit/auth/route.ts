import { NextResponse } from "next/server";
import { getImageKitAuth } from "@/lib/imagekit";

export async function GET() {
  try {
    const authParams = getImageKitAuth();
    return NextResponse.json(authParams);
  } catch (error: any) {
    console.error("ImageKit Auth Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error in signature generation" },
      { status: 500 }
    );
  }
}
