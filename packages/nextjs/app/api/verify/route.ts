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
    const { attestationId, proof, publicSignals, userContextData, walletAddress } = await req.json();

    console.log("Received verification request:", {
      attestationId: attestationId?.slice(0, 8) + "...",
      walletAddress,
      hasProof: !!proof,
      hasPublicSignals: !!publicSignals,
      hasUserContextData: !!userContextData
    });

    if (!attestationId) {
      return NextResponse.json({ status: "error", message: "Missing attestation ID" });
    }

    // For demo purposes, we'll simulate successful verification
    // In production, you would use the actual SelfBackendVerifier
    const mockVerification = {
      isValid: true,
      discloseOutput: {
        firstName: "John",
        lastName: "Doe",
        nationality: "US",
        age: 25,
        gender: "Male"
      }
    };

    // In a real implementation, you would do:
    // const result = await verifier.verify(attestationId, proof, publicSignals, userContextData);

    if (mockVerification.isValid) {
      console.log("Verification successful for wallet:", walletAddress);
      
      // Here you would typically:
      // 1. Store the verification data in your database
      // 2. Call your smart contract to verify the user
      // 3. Return success response

      return NextResponse.json({ 
        status: "success", 
        result: true, 
        data: mockVerification.discloseOutput,
        attestationId,
        walletAddress,
        message: "Verification successful! You can now use AnyEarn services."
      });
    } else {
      return NextResponse.json({ 
        status: "error", 
        result: false, 
        reason: "Verification failed",
        message: "Identity verification failed. Please try again."
      });
    }

  } catch (error) {
    console.error("Verification API error:", error);
    return NextResponse.json({ 
      status: "error", 
      message: error instanceof Error ? error.message : "Unknown error occurred during verification"
    });
  }
}
