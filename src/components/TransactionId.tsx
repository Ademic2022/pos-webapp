"use client";

import { useEffect, useState } from "react";

export default function TransactionId() {
  const [transactionId, setTransactionId] = useState<string>("");

  useEffect(() => {
    // Generate only on client
    const id = `#SE${Date.now().toString().slice(-6)}`;
    setTransactionId(id);
  }, []);

  return (
    <div className="text-sm text-gray-600">Transaction ID: {transactionId}</div>
  );
}
