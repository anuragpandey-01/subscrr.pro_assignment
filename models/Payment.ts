import mongoose, { Document, Model, Schema } from "mongoose";

export type PaymentStatus =
  | "created"
  | "paid"
  | "failed";

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  plan: "pro";
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    razorpayPaymentId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    currency: {
      type: String,
      required: true,
      uppercase: true,
      default: "INR",
    },

    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
      required: true,
    },

    plan: {
      type: String,
      enum: ["pro"],
      required: true,
      default: "pro",
    },
  },
  {
    timestamps: true,
  }
);

const Payment: Model<IPayment> =
  mongoose.models.Payment ||
  mongoose.model<IPayment>("Payment", paymentSchema);

export default Payment;