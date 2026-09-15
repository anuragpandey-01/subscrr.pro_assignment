import mongoose, { Document, Model, Schema } from "mongoose";

export type BillingCycle = "monthly" | "yearly";

export type SubscriptionStatus = "active" | "paused" | "cancelled";

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  nextBillingDate: Date;
  category: string;
  icon: string;
  color: string;
  reminderEnabled: boolean;
  reminderDaysBefore: number;
  status: SubscriptionStatus;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },

    name: {
      type: String,
      required: [true, "Subscription name is required"],
      trim: true,
      minlength: [2, "Subscription name must be at least 2 characters"],
      maxlength: [100, "Subscription name cannot exceed 100 characters"],
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    currency: {
      type: String,
      required: true,
      default: "USD",
      uppercase: true,
      trim: true,
      minlength: 3,
      maxlength: 3,
    },

    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"],
      required: true,
      default: "monthly",
    },

    nextBillingDate: {
      type: Date,
      required: [true, "Next billing date is required"],
    },

    category: {
      type: String,
      required: true,
      trim: true,
      default: "Other",
      maxlength: 50,
    },

    icon: {
      type: String,
      default: "credit-card",
      trim: true,
      maxlength: 50,
    },

    color: {
      type: String,
      default: "#FF2500",
      trim: true,
      maxlength: 20,
    },

    reminderEnabled: {
      type: Boolean,
      default: true,
    },

    reminderDaysBefore: {
      type: Number,
      default: 3,
      min: [0, "Reminder days cannot be negative"],
      max: [30, "Reminder cannot be more than 30 days before"],
    },

    status: {
      type: String,
      enum: ["active", "paused", "cancelled"],
      default: "active",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

subscriptionSchema.index({
  userId: 1,
  nextBillingDate: 1,
});

subscriptionSchema.index({
  userId: 1,
  status: 1,
});

const Subscription: Model<ISubscription> =
  mongoose.models.Subscription ||
  mongoose.model<ISubscription>("Subscription", subscriptionSchema);

export default Subscription;