import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const response = await fetch("https://lite-api.jup.ag/swap/v1/swap", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error: any) {
        console.error("Jupiter Swap Proxy Error:", error);
        return NextResponse.json({ error: error.message || "Failed to fetch swap transaction from Jupiter via proxy" }, { status: 500 });
    }
}
