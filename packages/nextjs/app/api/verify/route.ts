import { NextResponse } from "next/server";
import { SelfBackendVerifier, AllIds, DefaultConfigStore } from "@selfxyz/core";

// Create a single verifier instance
const verifier = new SelfBackendVerifier(
  "self-playground",
  "https://playground.self.xyz/api/verify",
  false, // mockPassport: true = staging, false = mainnet
  AllIds,
  new DefaultConfigStore({
    minimumAge: 18,
    excludedCountries: ["IRN", "PRK", "RUS", "SYR"],
    ofac: true,
  }),
  "uuid" // userIdentifierType
);

export async function POST(req: Request) {
  try {
    const { attestationId, proof, publicSignals, userContextData } = await req.json();

    if (!attestationId || !proof || !publicSignals || !userContextData) {
      return NextResponse.json({ status: "error", message: "Missing verification data" });
    }

    const result = await verifier.verify(attestationId, proof, publicSignals, userContextData);

    if (result.isValidDetails.isValid) {
      return NextResponse.json({ status: "success", result: true, data: result.discloseOutput });
    } else {
      return NextResponse.json({ status: "error", result: false, reason: "Verification failed", details: result.isValidDetails });
    }

  } catch (error) {
    return NextResponse.json({ status: "error", message: error instanceof Error ? error.message : "Unknown error" });
  }
}
