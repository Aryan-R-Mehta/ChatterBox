"use client";

import { getChannelData } from "@/hooks/useAuth";
import { use, useEffect, useState } from "react";

export default function ChannelPage({ params }) {
  const { channelId } = use(params);
  const [channelData, setChannelData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getChannelData(channelId);
        console.log(data);
        setChannelData(data);
      } catch (err) {
        console.error(err);
      }
    };

    if (channelId) fetchData();
  }, [channelId]);


  return (
    <div className="flex min-h-0 flex-1 flex-col p-4 md:p-6">
      <p className="text-sm text-zinc-500">Channel</p>
      {channelData ? JSON.stringify(channelData) : "Loading..."}
      <p className="mt-6 text-zinc-400">Chat client goes here.</p>
    </div>
  );
}
