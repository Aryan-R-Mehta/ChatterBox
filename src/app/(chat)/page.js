"use client";

import ChatEmptyState from "@/components/ChatEmptyState/ChatEmptyState";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) return <div className="loader" />;

  return (
    <>
      <ChatEmptyState />
    </>
  );
}
