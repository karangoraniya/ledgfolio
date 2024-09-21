"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPublicClient, createWalletClient, http, custom } from "viem";
import { mainnet } from "viem/chains";
import { addEnsContracts } from "@ensdomains/ensjs";
import { getPrice } from "@ensdomains/ensjs/public";
import { randomSecret } from "@ensdomains/ensjs/utils";
import { commitName, registerName } from "@ensdomains/ensjs/wallet";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useLedger } from "@/components/LedgerContext";
import { useENSResolver } from "@/app/hooks/useENS";

const mainnetWithEns = addEnsContracts(mainnet);

const EnsDomainPurchase: React.FC = () => {
  const router = useRouter();
  const [domainName, setDomainName] = useState<string>("");
  const [duration, setDuration] = useState<number>(31536000); // 1 year in seconds
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { isConnected, address, getTransport } = useLedger();
  const { resolvedAddress, error: resolveError } = useENSResolver(domainName);

  const client = createPublicClient({
    chain: mainnetWithEns,
    transport: http(),
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">
        Purchase ENS Domain
      </h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>ENS Domain Registration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="domainName">Domain Name</Label>
              <Input
                id="domainName"
                placeholder="example.eth"
                value={domainName}
                onChange={(e) => setDomainName(e.target.value)}
              />
              {resolvedAddress && (
                <p className="text-sm text-gray-500">
                  Resolved: {resolvedAddress}
                </p>
              )}
              {resolveError && (
                <p className="text-sm text-red-500">{resolveError}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Registration Duration (years)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={duration / 31536000}
                onChange={(e) =>
                  setDuration(parseInt(e.target.value) * 31536000)
                }
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Cancel
          </Button>
          <Button
            // onClick={handlePurchase}
            disabled={isLoading || !isConnected || !domainName}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Purchase Domain"
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

export default EnsDomainPurchase;
