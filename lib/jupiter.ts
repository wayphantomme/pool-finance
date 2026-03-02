export interface QuoteResponse {
    inputMint: string;
    inAmount: string;
    outputMint: string;
    outAmount: string;
    otherAmountThreshold: string;
    swapMode: string;
    slippageBps: number;
    platformFee: null | any;
    priceImpactPct: string;
    routePlan: any[];
    contextSlot?: number;
    timeTaken?: number;
}

const JUPITER_QUOTE_API = "/api/jupiter/quote";
const JUPITER_SWAP_API = "/api/jupiter/swap";

export const SOL_MINT = "So11111111111111111111111111111111111111112";
export const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

export async function getQuote(
    inputMint: string,
    outputMint: string,
    amount: number | bigint,
    slippageBps: number = 50 // 0.5%
): Promise<QuoteResponse> {
    const amountStr = amount.toString();
    const url = `${JUPITER_QUOTE_API}?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amountStr}&slippageBps=${slippageBps}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Jupiter API error (${response.status}): ${errorText}`);
        }
        return response.json();
    } catch (err: any) {
        console.error("Jupiter quote fetch failed:", err);
        throw new Error(err.message || "Failed to fetch quote from Jupiter");
    }
}

export async function getSwapTransaction(
    quoteResponse: QuoteResponse,
    userPublicKey: string,
    wrapAndUnwrapSol: boolean = true
): Promise<string> {
    const response = await fetch(JUPITER_SWAP_API, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            quoteResponse,
            userPublicKey,
            wrapAndUnwrapSol,
            dynamicComputeUnitLimit: true,
            prioritizationFeeLamports: "auto",
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch swap transaction from Jupiter");
    }

    const { swapTransaction } = await response.json();
    return swapTransaction;
}
