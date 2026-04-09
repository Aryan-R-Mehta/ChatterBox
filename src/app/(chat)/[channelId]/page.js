"use client";

import { useAuth } from "@/context/AuthContext";
import { getChannelData, messageSend } from "@/hooks/useAuth";
import { socket } from "@/lib/socket";
import { use, useEffect, useState } from "react";

export default function ChannelPage({params}) {
  const { user } = useAuth();
  const { channelId } = use(params);
  const [channelData, setChannelData] = useState(null);
  const [msgBody, setMsgBody] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getChannelData(channelId);
        setChannelData(data[0]);
      } catch (err) {
        console.error(err);
      }
    };
    if (channelId) fetchData();
  }, [channelId]);

  useEffect(() => {
    if (!channelId) return;

    socket.emit("join_channel", channelId);

    socket.on("receive_message", (newMsg) => {
      setChannelData((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          messages: [...prev.messages, newMsg],
        };
      });
    });

    return () => {
      socket.off("receive_message");
    };
  }, [channelId]);

  const handleKeyDown = async (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      const formData = {
        channelId,
        msgBody
      }
      await messageSend(formData);
      setMsgBody("");
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="pt-6 pb-4 px-6 border-b-4 border-indigo-500 shrink-0">
        {channelData ? channelData.name : "Loading..."}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {channelData?.messages.map((msg) => {
          const isMe = msg.senderId === user.id;
          return (
            <div key={msg.id} className="flex">
              <div
                className={`p-3 w-fit rounded-xl m-2 max-w-xs break-words text-white ${isMe ? "ml-auto bg-sky-800" : "bg-neutral-800"
                  }`}
              >
                <div>
                  {channelData.channelType !== "CHAT" && (
                    <div className="text-sm text-teal-400">
                      {msg.sender?.username}
                    </div>
                  )}
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 border-t border-[#2B3040] shrink-0">
        <textarea
          className="bg-[#222630] px-4 py-3 w-full outline-none text-white rounded-lg border-2 transition-colors duration-100 border-solid focus:border-[#596A95] border-[#2B3040] resize-none overflow-hidden"
          name="text"
          placeholder="Type a message..."
          value={msgBody}
          rows={1}
          onChange={(e) => {
            setMsgBody(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = e.target.scrollHeight + "px";
          }}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
}
