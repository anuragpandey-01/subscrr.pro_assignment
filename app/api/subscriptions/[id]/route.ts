import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/auth";
import { subscriptionUpdateSchema } from "@/lib/validation";
import Subscription from "@/models/Subscription";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/subscriptions/:id
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
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

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid subscription ID",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const subscription = await Subscription.findOne({
      _id: id,
      userId,
    }).lean();

    if (!subscription) {
      return NextResponse.json(
        {
          success: false,
          message: "Subscription not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        subscription,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get subscription error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Something went wrong while retrieving the subscription",
      },
      { status: 500 }
    );
  }
}

// PUT /api/subscriptions/:id
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
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

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid subscription ID",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const validationResult =
      subscriptionUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors:
            validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No fields provided for update",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const subscription =
      await Subscription.findOneAndUpdate(
        {
          _id: id,
          userId,
        },
        {
          $set: updateData,
        },
        {
          new: true,
          runValidators: true,
        }
      ).lean();

    if (!subscription) {
      return NextResponse.json(
        {
          success: false,
          message: "Subscription not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Subscription updated successfully",
        subscription,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update subscription error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Something went wrong while updating the subscription",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/subscriptions/:id
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
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

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid subscription ID",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const subscription =
      await Subscription.findOneAndDelete({
        _id: id,
        userId,
      });

    if (!subscription) {
      return NextResponse.json(
        {
          success: false,
          message: "Subscription not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Subscription deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete subscription error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Something went wrong while deleting the subscription",
      },
      { status: 500 }
    );
  }
}