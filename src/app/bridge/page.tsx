"use client";
import React, { useState, useEffect } from "react";
import { Circle, CircleEnvironments } from "@circle-fin/circle-sdk";
import { ethers } from "ethers";
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
import { useRouter } from "next/navigation";
import { useLedger } from "@/components/LedgerContext";

const circle = new Circle(
  process.env.NEXT_PUBLIC_CIRCLE_API_KEY!,
  CircleEnvironments.sandbox
);

type ChainConfig = {
  chainId: number;
  usdcAddress: string;
  rpcUrl: string;
};

const CHAIN_CONFIG: Record<string, ChainConfig> = {
  "ETH-SEPOLIA": {
    chainId: 11155111,
    usdcAddress: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    rpcUrl: "https://rpc.sepolia.org",
  },
  "BASE-SEPOLIA": {
    chainId: 84532,
    usdcAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    rpcUrl: "https://sepolia.base.org",
  },
};

const LedgerCircleBridge: React.FC = () => {
  const [selectedChain, setSelectedChain] = useState<string>("ETH-SEPOLIA");
  const [recipient, setRecipient] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [gasPrice, setGasPrice] = useState<string>("");
  const [gasLimit, setGasLimit] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { isConnected, address, getTransport } = useLedger();

  useEffect(() => {
    const fetchGasPrice = async () => {
      try {
        const provider = new ethers.JsonRpcProvider(
          CHAIN_CONFIG[selectedChain].rpcUrl
        );
        const feeData = await provider.getFeeData();
        setGasPrice(ethers.formatUnits(feeData.gasPrice || 0, "gwei"));
      } catch (error) {
        console.error("Error fetching gas price:", error);
        setError("Failed to fetch gas price.");
      }
    };

    if (isConnected) {
      fetchGasPrice();
    }
  }, [isConnected, selectedChain]);

  const handleSend = async () => {
    if (!isConnected) {
      setError("Please connect your Ledger first.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const transport = await getTransport();
      const eth = new (await import("@ledgerhq/hw-app-eth")).default(transport);

      // 1. Create a transfer request
      const transferResponse = await circle.transfers.createTransfer({
        source: {
          type: "wallet",
          id: address!,
        },
        destination: {
          type: "blockchain",
          address: recipient,
          chain: selectedChain === "ETH-SEPOLIA" ? "ETH" : "BASE",
        },
        amount: {
          amount: amount,
          currency: "USD",
        },
        idempotencyKey: `bridge-${Date.now()}`,
      });

      console.log("Transfer initiated:", transferResponse);

      // 2. Sign the transaction with Ledger
      const unsignedTx = {
        to: CHAIN_CONFIG[selectedChain].usdcAddress,
        value: ethers.parseEther(amount),
        gasPrice: ethers.parseUnits(gasPrice, "gwei"),
        gasLimit: ethers.parseUnits(gasLimit, "wei"),
        chainId: CHAIN_CONFIG[selectedChain].chainId,
      };

      const serializedTx =
        ethers.Transaction.from(unsignedTx).unsignedSerialized.slice(2);
      const signature = await eth.signTransaction(
        "44'/60'/0'/0/0",
        serializedTx
      );

      // 3. Construct the signed transaction
      const signedTx = ethers.Transaction.from({
        ...unsignedTx,
        signature: {
          r: `0x${signature.r}`,
          s: `0x${signature.s}`,
          v: parseInt(signature.v),
        },
      });

      // 4. Broadcast the signed transaction
      const provider = new ethers.JsonRpcProvider(
        CHAIN_CONFIG[selectedChain].rpcUrl
      );
      const txResponse = await provider.broadcastTransaction(
        signedTx.serialized
      );

      console.log("Transaction sent:", txResponse.hash);

      // 5. Wait for confirmation
      await txResponse.wait();

      console.log("Transaction confirmed");

      // 6. Check the transfer status
      console.log("Transfer initiated:", transferResponse);

      // Use type assertion to access the 'id' property
      const transferId = (transferResponse as any).data.id;

      if (!transferId) {
        throw new Error("Transfer ID not found in response");
      }
      // 6. Check the transfer status
      const transferStatus = await circle.transfers.getTransfer(transferId);
      console.log("Transfer status:", transferStatus);

      // Show success message or redirect
      router.push("/");
    } catch (error: any) {
      console.error("Error bridging USDC:", error);
      setError(`Failed to bridge USDC: ${error.message}`);
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
          <CardTitle>Bridge USDC with Ledger</CardTitle>
          <CardDescription>
            Bridge USDC between Ethereum Sepolia and Base Sepolia using your
            Ledger device
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="chain">Select Source Chain</Label>
              <Select value={selectedChain} onValueChange={setSelectedChain}>
                <SelectTrigger id="chain">
                  <SelectValue placeholder="Select chain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ETH-SEPOLIA">Ethereum Sepolia</SelectItem>
                  <SelectItem value="BASE-SEPOLIA">Base Sepolia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Address</Label>
              <Input
                id="recipient"
                placeholder="Address on destination chain"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USDC)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gasPrice">Gas Price (Gwei)</Label>
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
            disabled={isLoading || !isConnected || !recipient || !amount}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Bridging...
              </>
            ) : (
              "Bridge USDC"
            )}
          </Button>
        </CardFooter>
      </Card>
      {error && (
        <p className="text-sm text-red-500 mt-4 text-center">{error}</p>
      )}
      {isConnected && address && (
        <p className="text-sm text-gray-500 mt-4 text-center">
          Ledger connected: {address.slice(0, 6)}...{address.slice(-4)}
        </p>
      )}
    </div>
  );
};

export default LedgerCircleBridge;
