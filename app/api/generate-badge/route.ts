import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const DEFAULT_MODEL_POOL = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash-8b",
  "gemini-1.5-flash-latest",
  "gemini-1.5-pro-latest",
  "gemini-1.5-flash",
];

function localFallbackPrompt(achievementTitle: string, userAddress?: string) {
  const shortAddress = userAddress
    ? `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`
    : "anonymous scholar";
  return [
    `A premium cyberpunk achievement badge for "${achievementTitle}" awarded to ${shortAddress}.`,
    "The badge is a translucent crystal medallion floating in deep space, with Stellar network constellations, electric blue and violet light trails,",
    "metallic chrome engravings, dramatic rim lighting, cinematic contrast, ultra-detailed textures, heroic composition, collectible NFT style.",
  ].join(" ");
}

function getPreferredModelPool() {
  const fromEnv = process.env.GEMINI_MODEL_POOL
    ?.split(",")
    .map((model) => model.trim())
    .filter(Boolean);
  return fromEnv && fromEnv.length > 0 ? fromEnv : DEFAULT_MODEL_POOL;
}

export async function POST(req: Request) {
  try {
    const { achievementTitle, userAddress } = await req.json();
    const badgeId = `${achievementTitle.toLowerCase().replace(/\s+/g, "-")}-${Math.floor(
      Math.random() * 1_000_000
    )}`;

    if (!achievementTitle) {
      return NextResponse.json(
        { error: "Achievement title is required" },
        { status: 400 }
      );
    }

    // Step 1: Use Gemini to generate a creative prompt for the badge
    const prompt = `
      Create a highly detailed, artistic description for a digital badge/NFT achievement.
      Achievement: "${achievementTitle}"
      The user address is: ${userAddress}
      
      Style: Cyberpunk, high-fidelity, translucent glass, ethereal light, Stellar network theme.
      Describe the visual elements, colors, and the "heroic" feel of this achievement.
      Return ONLY the descriptive prompt in English, optimized for an image generation AI.
    `;

    let aiPrompt = "";
    let usedModel = "";
    let lastError: unknown = null;

    const modelCandidates = getPreferredModelPool();

    for (const modelName of modelCandidates) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        aiPrompt = result.response.text();
        if (aiPrompt.trim()) {
          usedModel = modelName;
          break;
        }
      } catch (error) {
        lastError = error;
      }
    }

    if (!aiPrompt.trim()) {
      console.error("Gemini Error:", lastError);
      aiPrompt = localFallbackPrompt(achievementTitle, userAddress);
      usedModel = "local-fallback";
    }

    // NOTE: In a real production environment with Imagen API access, 
    // we would call the image generation model here.
    // For this MVP/Demo, we will return the generated prompt and a high-quality 
    // pre-generated asset path that matches the theme, OR a placeholder that 
    // we will replace with a generated image using the model's internal tool 
    // to "wow" the user in the presentation.
    
    // Keep a short delay for UX without slowing retries.
    await new Promise((resolve) => setTimeout(resolve, 500));

    const imageKey = `badge_${Math.floor(Math.random() * 3) + 1}.png`;
    return NextResponse.json({
      success: true,
      badgeId,
      modelUsed: usedModel,
      imageKey,
      achievementPrompt: aiPrompt,
      // Convenience for immediate display.
      imageUrl: `/assets/badges/${imageKey}`,
    });
  } catch (error) {
    console.error("Gemini Error:", error);
    return NextResponse.json(
      { error: "Failed to generate badge art" },
      { status: 500 }
    );
  }
}
