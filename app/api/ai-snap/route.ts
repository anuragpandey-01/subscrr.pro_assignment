import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getUserIdFromRequest } from "@/lib/auth";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MAX_RETRIES = 3;

// Small retry helper for temporary Gemini failures
async function generateWithRetry(
  contents: Parameters<
    typeof ai.models.generateContent
  >[0]["contents"],
  model: string
) {
  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await ai.models.generateContent({
        model,
        contents,
      });
    } catch (error: unknown) {
      lastError = error;

      const errorObject = error as {
        status?: number;
        error?: {
          code?: number;
          status?: string;
          message?: string;
        };
        message?: string;
      };

      const status =
        errorObject?.status ??
        errorObject?.error?.code;

      const errorStatus =
        errorObject?.error?.status;

      const isRetryable =
        status === 429 ||
        status === 500 ||
        status === 502 ||
        status === 503 ||
        status === 504 ||
        errorStatus === "UNAVAILABLE" ||
        errorStatus === "RESOURCE_EXHAUSTED";

      // Don't retry errors that are not temporary
      if (!isRetryable) {
        throw error;
      }

      console.warn(
        `Gemini temporary error (${status ?? errorStatus}). Retry ${
          attempt + 1
        }/${MAX_RETRIES}`
      );

      // Don't wait after the final attempt
      if (attempt === MAX_RETRIES - 1) {
        break;
      }

      // Exponential backoff:
      // 1s → 2s
      const delay = 1000 * Math.pow(2, attempt);

      await new Promise((resolve) =>
        setTimeout(resolve, delay)
      );
    }
  }

  throw lastError;
}

export async function POST(request: NextRequest) {
  try {
    // -----------------------------------------
    // 1. Authentication
    // -----------------------------------------

    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Please log in to use AI Snap.",
        },
        { status: 401 }
      );
    }

    // -----------------------------------------
    // 2. Get uploaded image
    // -----------------------------------------

    const formData = await request.formData();
    const file = formData.get("receipt");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please upload a receipt image.",
        },
        { status: 400 }
      );
    }

    // -----------------------------------------
    // 3. Validate file
    // -----------------------------------------

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/heic",
      "image/heif",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unsupported image type. Please use JPG, PNG, WEBP, HEIC or HEIF.",
        },
        { status: 400 }
      );
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024;

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: "Image must be smaller than 10MB.",
        },
        { status: 400 }
      );
    }

    // -----------------------------------------
    // 4. Convert image to base64
    // -----------------------------------------

    const bytes = await file.arrayBuffer();

    const base64Image =
      Buffer.from(bytes).toString("base64");

    // -----------------------------------------
    // 5. Ask Gemini to analyze receipt
    // -----------------------------------------

    const prompt = `
You are an AI receipt scanner for Subscrr.

Analyze the provided receipt or subscription invoice.

Extract ONLY information that is clearly visible or strongly supported
by the image.

Return ONLY valid JSON.

Use exactly this structure:

{
  "name": string | null,
  "price": number | null,
  "currency": string | null,
  "billingCycle": "monthly" | "yearly" | null,
  "nextBillingDate": "YYYY-MM-DD" | null,
  "category": string | null
}

Rules:

1. Do not invent information.
2. If the subscription/service name cannot be identified, return null.
3. If the price cannot be identified, return null.
4. Detect the currency from the receipt.
5. Determine monthly/yearly only when the billing period is clear.
6. If the next billing date is not visible, return null.
7. Use a simple category such as:
   Entertainment, Software, Education, Fitness, Music,
   Cloud Storage, Productivity, Gaming, News, Other.
8. Return price as a number without currency symbols.
9. Return currency as a three-letter ISO-style code such as INR, USD, EUR or GBP.
10. Do not include markdown.
11. Do not include explanations outside the JSON.
`;

    const contents = [
      {
        role: "user" as const,
        parts: [
          {
            inlineData: {
              mimeType: file.type,
              data: base64Image,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    ];

    const response = await generateWithRetry(
      contents,
      "gemini-3.6-flash"
    );

    const rawText = response.text?.trim();

    if (!rawText) {
      return NextResponse.json(
        {
          success: false,
          message: "AI could not analyze this receipt.",
        },
        { status: 502 }
      );
    }

    // -----------------------------------------
    // 6. Clean possible markdown JSON
    // -----------------------------------------

    const cleanedText = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let extractedData;

    try {
      extractedData = JSON.parse(cleanedText);
    } catch {
      console.error("Invalid AI JSON:", rawText);

      return NextResponse.json(
        {
          success: false,
          message:
            "AI returned an invalid result. Please try another receipt.",
        },
        { status: 502 }
      );
    }

    // -----------------------------------------
    // 7. Basic response validation
    // -----------------------------------------

    const validBillingCycles = [
      "monthly",
      "yearly",
    ];

    if (
      extractedData.billingCycle !== null &&
      !validBillingCycles.includes(
        extractedData.billingCycle
      )
    ) {
      extractedData.billingCycle = null;
    }

    if (
      extractedData.price !== null &&
      (typeof extractedData.price !== "number" ||
        !Number.isFinite(extractedData.price) ||
        extractedData.price < 0)
    ) {
      extractedData.price = null;
    }

    if (
      typeof extractedData.currency === "string"
    ) {
      extractedData.currency =
        extractedData.currency
          .toUpperCase()
          .slice(0, 3);
    }

    // -----------------------------------------
    // 8. Return extracted information
    // -----------------------------------------

    return NextResponse.json({
      success: true,
      extracted: {
        name:
          typeof extractedData.name === "string"
            ? extractedData.name.trim()
            : null,

        price:
          typeof extractedData.price === "number"
            ? extractedData.price
            : null,

        currency:
          typeof extractedData.currency === "string"
            ? extractedData.currency
            : null,

        billingCycle:
          extractedData.billingCycle ?? null,

        nextBillingDate:
          typeof extractedData.nextBillingDate ===
          "string"
            ? extractedData.nextBillingDate
            : null,

        category:
          typeof extractedData.category === "string"
            ? extractedData.category
            : null,
      },
    });
  } catch (error: unknown) {
    console.error("AI Snap error:", error);

    // -----------------------------------------
    // 9. Detect temporary Gemini availability
    // -----------------------------------------

    const errorObject = error as {
      status?: number;
      error?: {
        code?: number;
        status?: string;
        message?: string;
      };
      message?: string;
    };

    const status =
      errorObject?.status ??
      errorObject?.error?.code;

    const errorStatus =
      errorObject?.error?.status;

    const temporaryFailure =
      status === 429 ||
      status === 500 ||
      status === 502 ||
      status === 503 ||
      status === 504 ||
      errorStatus === "UNAVAILABLE" ||
      errorStatus === "RESOURCE_EXHAUSTED";

    if (temporaryFailure) {
      return NextResponse.json(
        {
          success: false,
          message:
            "AI Snap is temporarily busy. Please try again in a few seconds.",
        },
        { status: 503 }
      );
    }

    // -----------------------------------------
    // 10. Generic server error
    // -----------------------------------------

    return NextResponse.json(
      {
        success: false,
        message:
          "AI Snap is temporarily unavailable. Please try again.",
      },
      { status: 500 }
    );
  }
}