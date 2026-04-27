import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const walletAddress = searchParams.get("walletAddress");
    if (!walletAddress) {
      return NextResponse.json(
        { error: "walletAddress query param is required" },
        { status: 400 },
      );
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("badges")
      .select("*")
      .eq("wallet_address", walletAddress)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, badges: data ?? [] });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to load badges.",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      walletAddress,
      missionTitle,
      imageUrl,
      prompt,
      metadataUri,
      minted = false,
      txHash = null,
    } = body ?? {};

    if (
      !walletAddress ||
      !missionTitle ||
      !imageUrl ||
      !prompt ||
      !metadataUri
    ) {
      return NextResponse.json(
        { error: "walletAddress, missionTitle, imageUrl, prompt and metadataUri are required." },
        { status: 400 },
      );
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("badges")
      .insert({
        wallet_address: walletAddress,
        mission_title: missionTitle,
        image_url: imageUrl,
        prompt,
        metadata_uri: metadataUri,
        minted,
        tx_hash: txHash,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, badge: data });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create badge.",
      },
      { status: 500 },
    );
  }
}
