/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import {
  Alchemy,
  Network,
  Utils,
  BigNumber as AlchemyBigNumber,
} from "alchemy-sdk";
import { Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";
import Image from "next/image";
import { ethers } from "ethers";
import { useLedger } from "@/components/LedgerContext";

const CHAIN_CONFIG = {
  "ETH-SEPOLIA": {
    network: Network.ETH_SEPOLIA,
    nativeCurrency: "ETH",
    explorer: "https://sepolia.etherscan.io",
    color: "white",
    isEVM: true,
  },
  BASE: {
    network: Network.BASE_MAINNET,
    nativeCurrency: "ETH",
    explorer: "https://base-sepolia.blockscout.com/",
    color: "white",
    isEVM: true,
  },
  // BITCOIN: {
  //   network: "BITCOIN",
  //   nativeCurrency: "BTC",
  //   explorer: "https://www.blockchain.com/explorer",
  //   color: "orange",

  // },
};

interface Token {
  name: string;
  symbol: string;
  balance: string;
  logo?: string;
}

export default function LedgerWalletHome() {
  const [selectedChain, setSelectedChain] =
    useState<keyof typeof CHAIN_CONFIG>("ETH-SEPOLIA");
  // const [address, setAddress] = useState<string>("");
  const [balance, setBalance] = useState<string>("");
  const [tokens, setTokens] = useState<Token[]>([]);
  const [copied, setCopied] = useState(false);
  const [alchemy, setAlchemy] = useState<Alchemy | null>(null);
  const { isConnected, address } = useLedger();

  useEffect(() => {
    const initAlchemy = () => {
      const settings = {
        apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
        network: CHAIN_CONFIG[selectedChain].network,
      };
      setAlchemy(new Alchemy(settings));
    };

    initAlchemy();
  }, [selectedChain]);

  useEffect(() => {
    const fetchWalletData = async () => {
      if (!alchemy || !isConnected || !address) return;

      const loadingToast = toast.loading("Fetching wallet data...");

      try {
        // Fetch native currency balance
        const balanceWei: AlchemyBigNumber = await alchemy.core.getBalance(
          address
        );
        console.log(balanceWei, "wei");

        const balanceEth = ethers.formatEther(balanceWei.toString());
        setBalance(parseFloat(balanceEth).toFixed(4));
        console.log(balanceEth, "eth");

        toast.success("Wallet data fetched successfully!", {
          id: loadingToast,
        });
      } catch (error) {
        console.error("Error fetching wallet data:", error);
        toast.error("Failed to fetch wallet data.", { id: loadingToast });
      }
    };

    if (alchemy && isConnected && address) {
      fetchWalletData();
    }
  }, [alchemy, isConnected, address]);

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    toast.success("Address copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">
          Please connect your Ledger wallet
        </h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">
          Ledger Wallet Dashboard
        </h1>
        <Select
          value={selectedChain}
          onValueChange={(value: keyof typeof CHAIN_CONFIG) =>
            setSelectedChain(value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select chain" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(CHAIN_CONFIG).map(([key, value]) => (
              <SelectItem key={key} value={key}>
                <span style={{ color: value.color }}>{key}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Your Address
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={copyAddress}>
                    {copied ? "Copied!" : <Copy className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy address</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm font-mono">{address}</p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            {CHAIN_CONFIG[selectedChain].nativeCurrency} Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {balance} {CHAIN_CONFIG[selectedChain].nativeCurrency}
          </p>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-bold mb-4">Token List</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tokens.map((token, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center">
                {token.logo && (
                  <Image
                    src={token.logo}
                    alt={token.name}
                    width={24}
                    height={24}
                    className="mr-2"
                  />
                )}
                {token.name} ({token.symbol})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">
                {parseFloat(token.balance).toFixed(4)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <Button asChild>
          <a
            href={`${CHAIN_CONFIG[selectedChain].explorer}/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Explorer
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}
