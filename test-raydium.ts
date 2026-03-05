import { Connection, PublicKey } from "@solana/web3.js";
import { Raydium } from "@raydium-io/raydium-sdk-v2";

async function test() {
    console.log("Starting with custom RPC...");
    const connection = new Connection("https://raydium2-raydium2-d4b9.devnet.rpcpool.com/", "confirmed");
    const raydium = await Raydium.load({
        connection,
        disableFeatureCheck: true,
        disableLoadToken: true,
    });
    console.log("Raydium loaded successfully!");

    // Find pool by mints
    const dUSDC = "USDCoctVLVnvTXBEuP9s8hntucdJokbo17RwHuNXemT";
    const dRAY = "DRay3aNHKdjZ4P4DoRnyxdKh6jBrf4HpjfDkQF7MFPpR";
    const WSOL = "So11111111111111111111111111111111111111112";

    try {
        console.log("Searching for SOL/dUSDC pool...");
        const dataUsdc = await raydium.api.fetchPoolByMints({ mint1: WSOL, mint2: dUSDC });
        console.log("SOL/dUSDC Pools found:", dataUsdc.data.length);
        dataUsdc.data.forEach((p: any) => console.log(`ID: ${p.id}, Type: ${p.type}, Name: ${p.programId}`));

        console.log("\nSearching for SOL/dRAY pool...");
        const dataRay = await raydium.api.fetchPoolByMints({ mint1: WSOL, mint2: dRAY });
        console.log("SOL/dRAY Pools found:", dataRay.data.length);
        dataRay.data.forEach((p: any) => console.log(`ID: ${p.id}, Type: ${p.type}, Name: ${p.programId}`));

    } catch (e) {
        console.error("Search Failed:", e);
    }
}
test();
