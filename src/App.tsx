import React, { useEffect, useMemo, useState, useCallback } from "react";
import logo from "./logo.svg";
import "./App.css";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3 from "web3";
const abi = require("./erc20ABI.json");

const WBTC_ADDRESS_TESTNET = "0x8Cc301A58c03FF01b83116FCa618560414eC2A97";
const WBTC_ADDRESS_MAINNET = "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599";

function App() {
  const provider = useMemo(() => {
    const instance = new WalletConnectProvider({
      infuraId: process.env.REACT_APP_INFURA_ID,
    });

    return instance;
  }, []);

  const [chain, setChain] = useState({ id: 1, name: "mainnet" });

  useEffect(() => {
    provider.on("accountsChanged", (accounts: any) => {
      console.log("account change", accounts);
    });

    provider.on("chainChanged", (chain: any) => {
      setChain({ id: chain, name: chain === 1 ? "mainnet" : "kovan" });
      console.log("chain change", chain);
    });

    provider.on("close", (accounts: any) => {
      console.log("close", accounts);
    });
  }, [provider]);

  useEffect(() => {
    if (provider.isConnecting) return;
    provider.enable().catch((e) => console.error(e));
  }, [provider]);

  const approveERC20 = useCallback(async () => {
    if (!provider) {
      throw new Error(`provider hasn't been created yet`);
    }
    const web3 = new Web3(provider as any);
    const erc20 = new web3.eth.Contract(
      abi,
      chain.id === 1 ? WBTC_ADDRESS_MAINNET : WBTC_ADDRESS_TESTNET
    );

    try {
      const ptxId = erc20.methods
        .approve(provider.accounts[0], 1000000)
        .send({
          from: provider.accounts[0],
        })
        .catch(console.error);
      console.log(ptxId);
      const txId = await ptxId;
      console.log(txId);
      alert("Approved: " + txId);
    } catch (e) {
      console.error(e);
    }
  }, [provider, chain]);

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={approveERC20}>Approve</button>
      </header>
    </div>
  );
}

export default App;
