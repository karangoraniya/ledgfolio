"use client";
import React, { useState, useEffect } from "react";
import { Alchemy, Network } from "alchemy-sdk";
import { Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { useLedger } from "@/components/LedgerContext";
import { toast } from "react-hot-toast";

const settings = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || "your_default_api_key",
  network: Network.ETH_MAINNET,
};

const DEFAULT_IMAGE = "/images/placeholder.png";

const alchemy = new Alchemy(settings);

interface NFT {
  id: string;
  image: string;
  description: string;
  name: string;
  tokenId: string;
  contractAddress: string;
}

export default function NFTGallery() {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const { isConnected, address } = useLedger();

  useEffect(() => {
    if (isConnected && address) {
      fetchNFTs();
    }
  }, [isConnected, address]);

  const fetchNFTs = async () => {
    if (!isConnected || !address) {
      toast.error("Please connect your Ledger first.");
      return;
    }

    setLoading(true);
    try {
      const nftsForOwner = await alchemy.nft.getNftsForOwner(address);

      const fetchedNFTs = await Promise.all(
        nftsForOwner.ownedNfts.map(async (nft) => {
          const metadata = await alchemy.nft.getNftMetadata(
            nft.contract.address,
            nft.tokenId
          );
          return {
            id: `${nft.contract.address}-${nft.tokenId}`,
            image: DEFAULT_IMAGE,
            // metadata.rawMetadata?.image || DEFAULT_IMAGE,
            description: metadata.description || "No description available",
            name: "NFT",
            // metadata.title || "Unnamed NFT",
            tokenId: nft.tokenId,
            contractAddress: nft.contract.address,
          };
        })
      );

      setNfts(fetchedNFTs);
    } catch (error) {
      console.error("Error fetching NFTs:", error);
      toast.error("Failed to fetch NFTs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="theme-custom bg-background text-foreground container mx-auto px-4">
      <h2 className="text-2xl font-bold mb-6">NFT Gallery</h2>
      <Button
        onClick={fetchNFTs}
        disabled={loading || !isConnected}
        className="mb-4"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : (
          "Fetch NFTs"
        )}
      </Button>
      {!isConnected && (
        <p className="text-muted-foreground mb-4">
          Please connect your Ledger to view your NFTs.
        </p>
      )}
      {isConnected && nfts.length === 0 && !loading && (
        <p className="text-muted-foreground mb-4">
          No NFTs found for this address. Try fetching again or check another
          address.
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {nfts.map((nft) => (
          <Card key={nft.id}>
            <div className="relative w-full h-48">
              <Image
                src={nft.image}
                alt={nft.name}
                layout="fill"
                objectFit="cover"
                unoptimized
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = DEFAULT_IMAGE;
                }}
              />
            </div>
            <CardHeader>
              <CardTitle>{nft.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {nft.description}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Token ID:</span> {nft.tokenId}
              </p>
              <div className="flex items-center mt-2">
                <span className="text-sm font-semibold mr-2">Contract:</span>
                <span className="text-sm text-muted-foreground truncate flex-grow">
                  {nft.contractAddress}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(nft.contractAddress)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
