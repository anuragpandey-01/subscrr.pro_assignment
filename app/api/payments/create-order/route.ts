import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/auth";
import Razorpay from "razorpay";
import User from "@/models/User";
import Payment from "@/models/Payment";

const configuredPrice = Number(process.env.RAZORPAY_PRO_PRICE);

const PRO_PRICE =
  Number.isFinite(configuredPrice) && configuredPrice > 0
    ? configuredPrice
    : 499;

const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

if (!razorpayKeyId) {
  throw new Error("RAZORPAY_KEY_ID is not defined in .env.local");
}

if (!razorpayKeySecret) {
  throw new Error("RAZORPAY_KEY_SECRET is not defined in .env.local");
}

const razorpay = new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpayKeySecret,
});

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be logged in to upgrade.",
        },
        { status: 401 }
      );
    }

    await connectDB();

    // 2. Get current user
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 }
      );
    }

    // 3. Prevent duplicate upgrade
    if (user.plan === "pro") {
      return NextResponse.json(
        {
          success: false,
          message: "You are already a Pro member.",
        },
        { status: 400 }
      );
    }

    // 4. Convert rupees to paise
    const amount = Math.round(PRO_PRICE * 100);

    // 5. Create Razorpay order
    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `pro_${userId}_${Date.now()}`,
      notes: {
        userId: userId,
        plan: "pro",
      },
    });

    // 6. Save payment attempt
    await Payment.create({
      userId,
      razorpayOrderId: order.id,
      amount,
      currency: "INR",
      status: "created",
      plan: "pro",
    });

    // 7. Return only what the frontend needs
    return NextResponse.json(
      {
        success: true,
        orderId: order.id,
        amount,
        currency: "INR",
        keyId: process.env.RAZORPAY_KEY_ID,
        plan: "pro",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Create Razorpay order error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create payment order.",
      },
      { status: 500 }
    );
  }
}