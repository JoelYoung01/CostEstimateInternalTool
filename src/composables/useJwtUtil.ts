interface UseJwtUtilComposable {
  /**
   * Signs a payload and returns a JWT token.
   * @param payload The data to sign.
   */
  toJwtToken: (payload: any) => Promise<string>;

  /**
   * Verifies a JWT token and returns the payload.
   * @param T The type of the payload.
   * @param token The token to verify.
   */
  fromJwtToken: <T = any>(token: string) => Promise<T>;
}

export default function useJwtUtil(): UseJwtUtilComposable {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const secret = import.meta.env.VITE_JWT_SECRET;

  const toJwtToken = async (payload: any) => {
    // Encode the payload and header
    const data = JSON.stringify(payload);
    const header = JSON.stringify({ alg: "HS256", typ: "JWT" });

    // Sign the token
    const key = await window.crypto.subtle.importKey("raw", encoder.encode(secret), "HMAC", true, ["sign"]);
    const signatureArrayBuffer = await window.crypto.subtle.sign("HMAC", key, encoder.encode(`${header}.${data}`));
    const signature = decoder.decode(new Uint8Array(signatureArrayBuffer));

    // Return the token
    return `${btoa(header)}.${btoa(data)}.${btoa(signature)}`;
  };

  const fromJwtToken = async <T = any>(token: string): Promise<T> => {
    // Split the token into its parts
    const [encodedHeader, encodedData, encodedSignature] = token.split(".");
    const header = atob(encodedHeader);
    const data = atob(encodedData);
    const signature = atob(encodedSignature);

    // Verify the signature
    const key = await window.crypto.subtle.importKey("raw", encoder.encode(secret), "HMAC", true, ["verify"]);
    const validToken = await window.crypto.subtle.verify(
      "HMAC",
      key,
      new Uint8Array(encoder.encode(signature)),
      encoder.encode(`${header}.${data}`)
    );

    // If the signature is invalid, throw an error
    if (!validToken) {
      throw new Error("Invalid signature");
    }

    // Return the payload
    return JSON.parse(data);
  };

  return {
    toJwtToken,
    fromJwtToken
  };
}
