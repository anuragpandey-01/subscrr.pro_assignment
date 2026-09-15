import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

import { connectDB } from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/auth";
import User from "@/models/User";
import Payment from "@/models/Payment";

export async function POST(request: NextRequest) {
  try {
    // 1. Make sure user is logged in
    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be logged in.",
        },
        { status: 401 }
      );
    }

    // 2. Read Razorpay response
    const body = await request.json();

    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = body;

    if (
      !razorpay_payment_id ||
      !razorpay_order_id ||
      !razorpay_signature
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing payment verification details.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // 3. Find the order belonging to this user
    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
      userId,
    });

    if (!payment) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment order not found.",
        },
        { status: 404 }
      );
    }

    // 4. Prevent duplicate processing
    if (payment.status === "paid") {
      return NextResponse.json({
        success: true,
        message: "Payment already verified.",
        plan: "pro",
      });
    }

    // 5. Make sure secret exists
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpaySecret) {
      throw new Error(
        "RAZORPAY_KEY_SECRET is not defined in .env.local"
      );
    }

    // 6. Generate expected Razorpay signature
    //
    // Razorpay requires:
    // HMAC_SHA256(order_id + "|" + payment_id, secret)
    //
    const generatedSignature = crypto
      .createHmac("sha256", razorpaySecret)
      .update(
        `${payment.razorpayOrderId}|${razorpay_payment_id}`
      )
      .digest("hex");

    // 7. Compare signatures
    if (generatedSignature !== razorpay_signature) {
      payment.status = "failed";
      await payment.save();

      return NextResponse.json(
        {
          success: false,
          message: "Payment verification failed.",
        },
        { status: 400 }
      );
    }

    // 8. Store successful payment
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.status = "paid";

    await payment.save();

    // 9. Upgrade user to Pro
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          plan: "pro",
        },
      },
      {
        new: true,
      }
    );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment verified but user could not be upgraded.",
        },
        { status: 500 }
      );
    }

    // 10. Success
    return NextResponse.json(
      {
        success: true,
        message: "Payment successful. You are now a Pro member!",
        plan: user.plan,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          plan: user.plan,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Razorpay verification error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to verify payment.",
      },
      { status: 500 }
    );
  }
}