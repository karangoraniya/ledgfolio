"use client";
import React, { createContext, useState, useContext, useEffect } from "react";
import TransportWebHID from "@ledgerhq/hw-transport-webhid";
import Eth from "@ledgerhq/hw-app-eth";
import Transport from "@ledgerhq/hw-transport";

interface LedgerContextType {
  isConnected: boolean;
  address: string;
  connect: () => Promise<void>;
  disconnect: () => void;
  getTransport: () => Promise<Transport>;
  error: string | null;
}

const LedgerContext = createContext<LedgerContextType | undefined>(undefined);

export const LedgerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [transport, setTransport] = useState<Transport | null>(null);

  useEffect(() => {
    const storedAddress = localStorage.getItem("ledgerAddress");
    if (storedAddress) {
      setAddress(storedAddress);
      setIsConnected(true);
    }
  }, []);

  const connect = async () => {
    setError(null);
    try {
      const newTransport = await TransportWebHID.create();
      setTransport(newTransport);
      const eth = new Eth(newTransport);
      const { address: ethAddress } = await eth.getAddress(
        "44'/60'/0'/0/0",
        false
      );
      setAddress(ethAddress);
      setIsConnected(true);
      localStorage.setItem("ledgerAddress", ethAddress);
    } catch (error: any) {
      console.error("Failed to connect to Ledger:", error);
      setError(`Failed to connect to Ledger: ${error.message}`);
      setIsConnected(false);
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    setAddress("");
    localStorage.removeItem("ledgerAddress");
    if (transport) {
      transport.close();
      setTransport(null);
    }
  };

  const getTransport = async () => {
    if (!transport) {
      throw new Error("Ledger not connected");
    }
    return transport;
  };

  return (
    <LedgerContext.Provider
      value={{ isConnected, address, connect, disconnect, getTransport, error }}
    >
      {children}
    </LedgerContext.Provider>
  );
};

export const useLedger = () => {
  const context = useContext(LedgerContext);
  if (context === undefined) {
    throw new Error("useLedger must be used within a LedgerProvider");
  }
  return context;
};
