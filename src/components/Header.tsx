/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLedger } from "@/components/LedgerContext";

const chains = ["Ethereum", "Bitcoin", "Base"];

export default function Header() {
  const [selectedChain, setSelectedChain] = useState(chains[0]);
  const { isConnected, address, connect, disconnect, error } = useLedger();

  return (
    <header className="theme-custom bg-background shadow-md">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-foreground">LedgeFolio</h1>
        <div className="flex text-white items-center space-x-4">
          <Select value={selectedChain} onValueChange={setSelectedChain}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select chain" />
            </SelectTrigger>
            <SelectContent>
              {chains.map((chain) => (
                <SelectItem key={chain} value={chain}>
                  {chain}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isConnected ? (
            <Button onClick={disconnect}>Disconnect Ledger</Button>
          ) : (
            <Button onClick={connect}>Connect Ledger</Button>
          )}
        </div>
      </div>
      {address && (
        <div className="text-sm text-foreground mt-2">
          Connected Address: {address}
        </div>
      )}
      {error && <div className="text-sm text-red-500 mt-2">{error}</div>}
    </header>
  );
}
