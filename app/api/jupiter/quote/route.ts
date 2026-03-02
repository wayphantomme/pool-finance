import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const inputMint = searchParams.get("inputMint");
    const outputMint = searchParams.get("outputMint");
    const amount = searchParams.get("amount");
    const slippageBps = searchParams.get("slippageBps");

    if (!inputMint || !outputMint || !amount) {
        return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const jupiterUrl = `https://lite-api.jup.ag/swap/v1/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps || 50}`;

    try {
        const response = await fetch(jupiterUrl);
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error: any) {
        console.error("Jupiter Proxy Error:", error);
        return NextResponse.json({ error: error.message || "Failed to fetch quote from Jupiter via proxy" }, { status: 500 });
    }
}
