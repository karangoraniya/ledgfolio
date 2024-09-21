"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import Eth from "@ledgerhq/hw-app-eth";
import ledgerService from "@ledgerhq/hw-app-eth/lib/services/ledger";
import Link from "next/link";
import { useResolveAddress } from "@/app/hooks/useResolveAddress";
import { useLedger } from "@/components/LedgerContext";

// type ChainConfig = {
//   chainId: number;
//   rpcUrl: string;
//   explorer: string;
// };

const CHAIN_CONFIG = {
  ethereum: {
    chainId: 11155111,
    rpcUrl: "https://rpc.sepolia.org",
    explorer: "https://etherscan.io/tx/",
  },
  base: {
    chainId: 84532,
    rpcUrl: "https://sepolia.base.org",
    explorer: "https://base-sepolia.blockscout.com/tx/",
  },
  bitcoin: {
    rpcUrl: process.env.NEXT_PUBLIC_BITCOIN_RPC || "",
    explorer: "https://mempool.space/tx/",
    symbol: "BTC",
  },
} as const;

type ChainType = keyof typeof CHAIN_CONFIG;

export default function LedgerSend() {
  const [selectedChain, setSelectedChain] = useState<ChainType>("base");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [gasPrice, setGasPrice] = useState("");
  const [gasLimit, setGasLimit] = useState("21000");
  const router = useRouter();
  const { isConnected, address, getTransport } = useLedger();

  const { resolvedAddress, error: resolveError } = useResolveAddress(
    recipient,
    selectedChain
  );

  const provider = new ethers.JsonRpcProvider(
    CHAIN_CONFIG[selectedChain].rpcUrl
  );

  useEffect(() => {
    const fetchGasPrice = async () => {
      if (selectedChain === "bitcoin") return; // Bitcoin doesn't use gas

      try {
        const feeData = await provider.getFeeData();
        setGasPrice(ethers.formatUnits(feeData.gasPrice || 0, "wei"));
      } catch (error) {
        console.error("Error fetching gas price:", error);
        toast.error("Failed to fetch gas price.");
      }
    };

    if (isConnected && selectedChain !== "bitcoin") {
      fetchGasPrice();
    }
  }, [isConnected, selectedChain, provider]);

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleSend = async () => {
    if (!isConnected) {
      toast.error("Please connect your Ledger first.");
      return;
    }

    setIsLoading(true);
    try {
      const transport = await getTransport();

      if (selectedChain === "bitcoin") {
        // Bitcoin transaction logic
        // const btc = new Bitcoin(transport);
        // Implement Bitcoin transaction signing and broadcasting here
        // This is a placeholder and needs to be implemented based on your Bitcoin library choice
        toast.error("Bitcoin transactions are not yet implemented");
      } else {
        // Ethereum-based transaction logic
        const eth = new Eth(transport);
        const nonce = await provider.getTransactionCount(address, "latest");

        const transaction = {
          to: resolvedAddress,
          gasPrice: ethers.parseUnits(gasPrice, "wei").toString(),
          gasLimit: ethers.toBeHex(parseInt(gasLimit)),
          nonce: nonce,
          chainId: CHAIN_CONFIG[selectedChain].chainId,
          data: "0x",
          value: ethers.parseEther(amount).toString(),
        };

        const unsignedTx =
          ethers.Transaction.from(transaction).unsignedSerialized.substring(2);
        const resolution = await ledgerService.resolveTransaction(
          unsignedTx,
          {},
          {}
        );

        const signature = await eth.signTransaction(
          "44'/60'/0'/0/0",
          unsignedTx,
          resolution
        );

        const signedTx = ethers.Transaction.from({
          ...transaction,
          signature: {
            r: "0x" + signature.r,
            s: "0x" + signature.s,
            v: parseInt(signature.v),
          },
        }).serialized;

        const { hash } = await provider.broadcastTransaction(signedTx);

        const url = `${CHAIN_CONFIG[selectedChain].explorer}${hash}`;
        toast.success(
          <div>
            <Link href={url} target="_blank" rel="noopener noreferrer">
              View on Explorer
            </Link>
          </div>
        );
      }
    } catch (error: any) {
      console.error("Error sending transaction:", error);
      if (error.message.includes("intrinsic gas too low")) {
        toast.error(
          "Transaction failed: Gas limit is too low. Please increase the gas limit."
        );
      } else {
        toast.error("Failed to send transaction: " + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="theme-custom min-h-screen bg-background text-foreground p-4">
      <Button variant="ghost" className="mb-4" onClick={() => router.push("/")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Send with Ledger</CardTitle>
          <CardDescription>
            Send cryptocurrency using your Ledger device
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="chain">Select Chain</Label>
              <Select
                value={selectedChain}
                onValueChange={(value: ChainType) => setSelectedChain(value)}
              >
                <SelectTrigger id="chain">
                  <SelectValue placeholder="Select chain" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(CHAIN_CONFIG) as ChainType[]).map((chain) => (
                    <SelectItem key={chain} value={chain}>
                      {chain.charAt(0).toUpperCase() + chain.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Address</Label>
              <Input
                id="recipient"
                placeholder="Address or ENS name"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
              {resolvedAddress && (
                <p className="text-sm text-gray-500 mt-1">
                  Resolved: {shortenAddress(resolvedAddress)}
                </p>
              )}
              {resolveError && (
                <p className="text-sm text-red-500 mt-1">{resolveError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gasPrice">Gas Price (wei)</Label>
              <Input
                id="gasPrice"
                type="text"
                placeholder="Gas Price"
                value={gasPrice}
                onChange={(e) => setGasPrice(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gasLimit">Gas Limit</Label>
              <Input
                id="gasLimit"
                type="number"
                placeholder="Gas Limit"
                value={gasLimit}
                onChange={(e) => setGasLimit(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/")}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={isLoading || !resolvedAddress || !amount || !isConnected}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
