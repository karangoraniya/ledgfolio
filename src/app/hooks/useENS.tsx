import { useState, useEffect } from "react";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import { addEnsContracts } from "@ensdomains/ensjs";

const mainnetWithEns = addEnsContracts(mainnet);

export function useENSResolver(name: string) {
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resolveENS = async () => {
      if (!name) {
        setResolvedAddress(null);
        setError(null);
        return;
      }

      try {
        const client = createPublicClient({
          chain: mainnetWithEns,
          transport: http(),
        });

        const address = await client.getEnsAddress({ name });
        setResolvedAddress(address);
        setError(null);
      } catch (err) {
        console.error("Error resolving ENS name:", err);
        setResolvedAddress(null);
        setError("Failed to resolve ENS name");
      }
    };

    resolveENS();
  }, [name]);

  return { resolvedAddress, error };
}
