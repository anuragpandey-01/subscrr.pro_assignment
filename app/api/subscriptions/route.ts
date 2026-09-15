import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/auth";
import { subscriptionSchema } from "@/lib/validation";
import Subscription from "@/models/Subscription";

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const subscriptions = await Subscription.find({
      userId,
    })
      .sort({ nextBillingDate: 1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        subscriptions,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get subscriptions error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while retrieving subscriptions",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const validationResult = subscriptionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    await connectDB();

    const subscription = await Subscription.create({
      ...validationResult.data,
      userId,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Subscription created successfully",
        subscription,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create subscription error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while creating the subscription",
      },
      { status: 500 }
    );
  }
}