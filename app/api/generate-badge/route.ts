import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { achievementTitle, userAddress } = await req.json();

    if (!achievementTitle) {
      return NextResponse.json(
        { error: "Achievement title is required" },
        { status: 400 }
      );
    }

    // Step 1: Use Gemini to generate a creative prompt for the badge
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
      Create a highly detailed, artistic description for a digital badge/NFT achievement.
      Achievement: "${achievementTitle}"
      The user address is: ${userAddress}
      
      Style: Cyberpunk, high-fidelity, translucent glass, ethereal light, Stellar network theme.
      Describe the visual elements, colors, and the "heroic" feel of this achievement.
      Return ONLY the descriptive prompt in English, optimized for an image generation AI.
    `;

    const result = await model.generateContent(prompt);
    const aiPrompt = result.response.text();

    // NOTE: In a real production environment with Imagen API access, 
    // we would call the image generation model here.
    // For this MVP/Demo, we will return the generated prompt and a high-quality 
    // pre-generated asset path that matches the theme, OR a placeholder that 
    // we will replace with a generated image using the model's internal tool 
    // to "wow" the user in the presentation.
    
    // We'll simulate a 2-second delay for the "processing" feel
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return NextResponse.json({
      success: true,
      achievementPrompt: aiPrompt,
      // We'll use a dynamic-looking path. In the frontend, we'll show the "result".
      imageUrl: `/assets/badges/badge_${Math.floor(Math.random() * 3) + 1}.png`
    });
  } catch (error) {
    console.error("Gemini Error:", error);
    return NextResponse.json(
      { error: "Failed to generate badge art" },
      { status: 500 }
    );
  }
}
