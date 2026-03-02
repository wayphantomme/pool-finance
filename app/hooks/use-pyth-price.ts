import { useState, useEffect } from "react";

export interface PythPriceData {
    price: number;
    conf: number;
    expo: number;
    publishTime: number;
}

/**
 * Hook to fetch real-time SOL/USDC price from Pyth Network using Hermes API.
 * Price ID for SOL/USDC: ef0d8b6fda2ceba41da15d4095d1da99fbb58c9d1a73633b40f44a392d2d2367
 */
export function usePythPrice() {
    const [price, setPrice] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const SOL_PRICE_ID = "ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d";
    const HERMES_URL = "https://hermes.pyth.network/v2/updates/price/latest";

    useEffect(() => {
        let isMounted = true;

        async function fetchPrice() {
            try {
                const response = await fetch(`${HERMES_URL}?ids[]=${SOL_PRICE_ID}`);
                if (!response.ok) throw new Error("Failed to fetch Pyth price");

                const data = await response.json();
                const priceUpdate = data.parsed?.[0]?.price;

                if (priceUpdate && isMounted) {
                    // Calculate normalized price: price * 10^expo
                    const normalizedPrice = Number(priceUpdate.price) * Math.pow(10, priceUpdate.expo);
                    setPrice(normalizedPrice);
                    setLoading(false);
                    setError(null);
                }
            } catch (err) {
                if (isMounted) {
                    console.error("Pyth Fetch Error:", err);
                    setError("Oracle unavailable");
                    setLoading(false);
                }
            }
        }

        fetchPrice();
        const interval = setInterval(fetchPrice, 5000); // Update every 5 seconds

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    return { price, loading, error };
}
