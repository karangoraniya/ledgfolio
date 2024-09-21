import { useState, useEffect } from "react";
import { useEnsAddress } from "wagmi";
import { normalize } from "viem/ens";
import { isAddress, hexToBytes } from "viem";
import { getCoderByCoinName } from "@ensdomains/address-encoder";

const COIN_TYPES = {
  BITCOIN: 0,
  ETHEREUM: 60,
  BASE: 2147492101,
};

export function useResolveAddress(input: string, selectedChain: string) {
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isEns = input.toLowerCase().endsWith(".eth");

  const { data: ensAddress, isError: isEnsError } = useEnsAddress({
    name: isEns ? normalize(input) : undefined,
    coinType:
      selectedChain === "ethereum"
        ? COIN_TYPES.ETHEREUM
        : selectedChain === "base"
        ? COIN_TYPES.BASE
        : selectedChain === "bitcoin"
        ? COIN_TYPES.BITCOIN
        : undefined,
  });

  useEffect(() => {
    const resolveAddress = async () => {
      setError(null);
      setResolvedAddress(null);

      if (!input) return;

      try {
        let address: string | null = null;

        if (isEns) {
          if (ensAddress) {
            if (selectedChain === "bitcoin") {
              const btcCoder = getCoderByCoinName("btc");
              const dataAsBytes = hexToBytes(ensAddress as `0x${string}`);
              address = btcCoder.encode(dataAsBytes);
            } else {
              address = ensAddress;
            }
          }
        } else if (selectedChain === "ethereum" || selectedChain === "base") {
          if (isAddress(input)) {
            address = input;
          }
        } else if (selectedChain === "bitcoin") {
          // Assuming the input is already a valid Bitcoin address
          address = input;
        }

        if (address) {
          setResolvedAddress(address);
        } else {
          setError("Invalid address format");
        }
      } catch (err) {
        console.error("Error resolving address:", err);
        setError("Error resolving address");
      }
    };

    resolveAddress();
  }, [input, selectedChain, ensAddress]);

  return { resolvedAddress, error };
}
