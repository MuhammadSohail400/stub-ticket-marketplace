"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { TicketTransfer } from "@/types";

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  transfer: TicketTransfer | null;
  onConfirmReceipt?: () => Promise<void>;
  isBuyer?: boolean;
}

export default function TransferModal({
  isOpen,
  onClose,
  transfer,
  onConfirmReceipt,
  isBuyer = false,
}: TransferModalProps) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !transfer) return null;

  async function handleConfirm() {
    if (!onConfirmReceipt) return;
    setError("");
    setConfirming(true);
    try {
      await onConfirmReceipt();
      setSuccessMsg("Ticket received and confirmed! Escrow funds released to seller.");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to confirm ticket receipt.");
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white border border-line rounded-2xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-ink transition-colors p-1 rounded-full border border-line focus:outline-none"
          aria-label="Close modal"
        >
          ✕
        </button>

        <div className="text-center">
          <span className="text-[11px] font-stub uppercase tracking-widest text-stamp bg-stamp/10 border border-stamp/20 rounded-full px-3 py-1 inline-block mb-3">
            Digital Entry Pass
          </span>
          <h3 className="font-display font-bold text-2xl text-ink">Ticket Transfer QR</h3>
          <p className="text-xs text-muted mt-1">
            Scan this code at the event gate to gain entry.
          </p>
        </div>

        {/* QR Code Image Container */}
        <div className="my-6 flex flex-col items-center justify-center bg-paper-dim border border-line rounded-xl p-6">
          {transfer.qrCodeImage?.url ? (
            <div className="relative w-48 h-48 bg-white p-2 rounded-lg border border-line shadow-sm">
              <Image
                src={transfer.qrCodeImage.url}
                alt="Ticket Entry QR Code"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          ) : (
            <div className="w-48 h-48 bg-line/20 rounded-lg flex items-center justify-center text-xs text-muted">
              QR Code unavailable
            </div>
          )}

          <div className="mt-4 text-center">
            <p className="text-[10px] font-stub uppercase tracking-widest text-muted">Token ID</p>
            <p className="font-mono text-xs font-semibold text-ink bg-white border border-line rounded px-2 py-1 mt-1 break-all select-all">
              {transfer.token}
            </p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex justify-between items-center text-xs border-t border-b border-line py-3 mb-4">
          <span className="text-muted">Transfer Status:</span>
          <span className="font-semibold text-verified">
            {transfer.confirmedByBuyer ? "Confirmed & Completed" : "Transferred to Buyer"}
          </span>
        </div>

        <div className="flex justify-between items-center text-xs mb-6">
          <span className="text-muted">Gate Entry Status:</span>
          <span className={`font-semibold ${transfer.isUsed ? "text-danger" : "text-verified"}`}>
            {transfer.isUsed ? "Already Used" : "Valid for 1-Time Entry"}
          </span>
        </div>

        {error && (
          <div className="mb-4 text-xs bg-danger/10 border border-danger/30 text-danger p-3 rounded-lg">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 text-xs bg-verified/10 border border-verified/30 text-verified p-3 rounded-lg">
            {successMsg}
          </div>
        )}

        {/* Action Button for Buyer */}
        {isBuyer && !transfer.confirmedByBuyer && onConfirmReceipt && (
          <button
            onClick={handleConfirm}
            disabled={confirming}
            className="w-full font-semibold bg-verified text-paper rounded-lg px-4 py-3 hover:bg-emerald-600 transition-colors disabled:opacity-50 text-sm shadow-sm"
          >
            {confirming ? "Confirming..." : "Confirm Ticket Received (Release Escrow)"}
          </button>
        )}

        {(!isBuyer || transfer.confirmedByBuyer) && (
          <button
            onClick={onClose}
            className="w-full font-semibold bg-ink text-paper rounded-lg px-4 py-2.5 hover:bg-stamp hover:text-ink transition-colors text-sm"
          >
            Done
          </button>
        )}
      </div>
    </div>
  );
}
