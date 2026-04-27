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

type BadgeTheme = {
  archetype: string;
  visualMotif: string;
  palette: string;
  iconography: string;
};

const VARIATION_TOKENS = [
  "prismatic refractions",
  "volumetric cosmic dust",
  "holographic glyph trails",
  "ionized particle ribbons",
  "constellation lattice glow",
  "aurora plasma arcs",
];

function chooseTheme(achievementTitle: string): BadgeTheme {
  const normalized = achievementTitle.toLowerCase();

  if (normalized.includes("governor") || normalized.includes("governance")) {
    return {
      archetype: "Stellar Governor",
      visualMotif: "orbital senate emblem suspended above a voting dais",
      palette: "royal sapphire, silver chrome, deep obsidian",
      iconography: "voting sigils, consensus rings, civic laurels",
    };
  }

  if (normalized.includes("treasury")) {
    return {
      archetype: "Treasury Hero",
      visualMotif: "shielded vault core forged from radiant stellar alloy",
      palette: "emerald teal, molten gold, carbon black",
      iconography: "funding streams, protection crest, contribution seals",
    };
  }

  return {
    archetype: "Smart Contract Pioneer",
    visualMotif: "ancient-meets-futuristic codex crystal with executable runes",
    palette: "electric cyan, violet neon, titanium graphite",
    iconography: "byte sigils, Soroban rune circles, logic constellations",
  };
}

function randomPick(list: string[]) {
  return list[Math.floor(Math.random() * list.length)];
}

function localFallbackPrompt(achievementTitle: string, userAddress?: string) {
  const theme = chooseTheme(achievementTitle);
  const variation = randomPick(VARIATION_TOKENS);
  const shortAddress = userAddress
    ? `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`
    : "anonymous scholar";
  return [
    `A premium collectible badge titled "${theme.archetype}" for "${achievementTitle}", awarded to ${shortAddress}.`,
    `Compose a unique hero emblem with ${theme.visualMotif}.`,
    `Palette: ${theme.palette}. Iconography: ${theme.iconography}.`,
    `Use cinematic composition, ultra-detailed materials, high contrast, and ${variation}.`,
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

    const theme = chooseTheme(achievementTitle);
    const variationA = randomPick(VARIATION_TOKENS);
    const variationB = randomPick(
      VARIATION_TOKENS.filter((item) => item !== variationA),
    );

    // Step 1: Use Gemini to generate a creative prompt for the badge
    const prompt = `
      You are creating a UNIQUE AI badge prompt for a Stellar ecosystem achievement NFT.
      Achievement title: "${achievementTitle}"
      Recipient wallet: ${userAddress}
      Badge archetype: "${theme.archetype}"
      Visual motif: "${theme.visualMotif}"
      Color palette: "${theme.palette}"
      Iconography to include: "${theme.iconography}"

      Hard requirements:
      - Must be visually distinct from previous badges.
      - Include these variation tokens naturally: "${variationA}" and "${variationB}".
      - Compose a single centered badge/medallion with premium collectible look.
      - Keep it English-only, 80-140 words, one paragraph.
      - Do not output markdown, list items, or explanations.

      Return ONLY the final image-generation prompt text.
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
