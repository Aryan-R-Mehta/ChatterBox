"use client";

import { useAuth } from "@/context/AuthContext";
import { getChannelData, messageDelete, messageEdit, messageSend } from "@/hooks/useAuth";
import { socket } from "@/lib/socket";
import { CopyIcon, Trash2, PencilIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

export default function ChannelPage({ params }) {
    const router = useRouter();
    const { user } = useAuth();
    const { channelId } = use(params);

    const [channelData, setChannelData] = useState(null);
    const [msgBody, setMsgBody] = useState("");

    const [modalState, setModalState] = useState({
        type: null, // "edit" | "delete"
        message: null,
    });

    const [editText, setEditText] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getChannelData(channelId);
                console.log(data);
                setChannelData(data);
            } catch (err) {
                router.push("/");
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

        socket.on("edited_message", (editedMsg) => {
            setChannelData((prev) => {
                if (!prev) return prev;

                return {
                    ...prev,
                    messages: prev.messages.map((msg) =>
                        msg.id === editedMsg.id
                            ? { ...msg, content: editedMsg.content }
                            : msg
                    ),
                };
            });
        });

        socket.on("delete_message", (deletedMsg) => {
            setChannelData((prev) => {
                if (!prev) return prev;
                console.log(deletedMsg);
                return {
                    ...prev,
                    messages: prev.messages.map((msg) =>
                        msg.id === deletedMsg.id
                            ? { ...msg, ...deletedMsg }
                            : msg
                    ),
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
            if (!msgBody.trim()) return;

            await messageSend({
                channelId,
                msgBody: msgBody.trim(),
            });

            setMsgBody("");
        }
    };

    // ================= ACTION HANDLERS =================
    const openEditModal = (msg) => {
        setEditText(msg.content);
        setModalState({ type: "edit", message: msg });
    };

    const openDeleteModal = (msg) => {
        setModalState({ type: "delete", message: msg });
    };

    const closeModal = () => {
        setModalState({ type: null, message: null });
    };

    const handleUpdateMessage = async () => {
        const res = await messageEdit({
            channelId,
            messageId: modalState.message.id,
            messageBody: editText.trim(),
        });
        console.log(res);
        closeModal();
    };

    const handleDeleteMessage = async () => {
        const res = await messageDelete({
            channelId,
            messageId: modalState.message.id,
        })
        console.log(res);
        closeModal();
    };

    const getChannelName = (channel) => {
        if (channel.channelType === "GROUP" && channel.name) {
            return channel.name;
        }

        const otherMembers = channel.members.filter(
            (m) => m.user.id !== user.id
        );

        return otherMembers
            .map((m) => m.user.account.username)
            .join(", ");
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">

            <div className="pt-6 pb-4 px-6 border-b-4 border-indigo-500 shrink-0">
                {channelData ? getChannelName(channelData) : "Loading..."}
            </div>

            {/* MESSAGES */}
            <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3">
                {channelData?.messages.map((msg) => {
                    const isMe = msg.senderId === user.id;

                    return (
                        <div
                            key={msg.id}
                            className={`flex ${isMe ? "justify-end" : "justify-start"} group`}
                        >
                            <div className="flex items-center gap-2 max-w-xs md:max-w-md">

                                {/* Avatar */}
                                {!isMe && (
                                    <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-white text-xs font-semibold">
                                        {msg.sender?.account?.username?.charAt(0).toUpperCase()}
                                    </div>
                                )}

                                {/* Actions */}
                                {isMe && !msg.isDeleted && (
                                    <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition">
                                        <Trash2
                                            size={15}
                                            className="cursor-pointer"
                                            onClick={() => openDeleteModal(msg)}
                                        />
                                        <CopyIcon size={15} className="cursor-pointer" onClick={() => navigator.clipboard.writeText(msg.content)} />
                                        <PencilIcon
                                            size={15}
                                            className="cursor-pointer"
                                            onClick={() => openEditModal(msg)}
                                        />
                                    </div>
                                )}

                                {/* Message bubble */}
                                <div
                                    className={`flex items-end gap-2 px-3 py-2 rounded-2xl text-sm shadow-sm
                                    ${isMe
                                            ? "bg-indigo-500 text-white rounded-br-sm"
                                            : "bg-zinc-800 text-zinc-200 rounded-bl-sm"
                                        }`}
                                >
                                    <div className="flex flex-col">

                                        {/* Username */}
                                        {channelData.channelType !== "CHAT" && !isMe && (
                                            <span className="text-[11px] text-sky-400 mb-[2px]">
                                                {msg.sender?.account?.username}
                                            </span>
                                        )}

                                        {/* Content */}
                                        <div className="flex items-end gap-3">
                                            <span className="break-words">
                                                {msg.content}
                                            </span>

                                            <span className="text-[8px] text-white/80 whitespace-nowrap">
                                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* INPUT */}
            <div className="p-3 border-t border-[#2B3040] shrink-0">
                <textarea
                    className="bg-[#222630] px-4 py-3 w-full text-white rounded-lg border-2 focus:border-[#596A95] border-[#2B3040] resize-none overflow-hidden"
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

            {/* ================= MODAL ================= */}
            {modalState.type && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                    onClick={closeModal}
                >
                    <div
                        className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-3xl shadow-xl space-y-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* EDIT */}
                        {modalState.type === "edit" && (
                            <>
                                <h2 className="text-white font-semibold">Edit Message</h2>

                                <textarea
                                    className="bg-[#222630] px-4 py-3 w-full text-white rounded-lg border-2 focus:border-[#596A95] border-[#2B3040] resize-none overflow-hidden"
                                    value={editText}
                                    rows={1}
                                    onChange={(e) => setEditText(e.target.value)}
                                />

                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={closeModal}
                                        className="px-3 py-1 bg-gray-600 rounded"
                                    >
                                        Discard
                                    </button>

                                    <button
                                        onClick={handleUpdateMessage}
                                        className="px-3 py-1 bg-indigo-500 rounded"
                                    >
                                        Edit
                                    </button>
                                </div>
                            </>
                        )}

                        {/* DELETE */}
                        {modalState.type === "delete" && (
                            <>
                                <h2 className="text-white font-semibold">
                                    Delete Message?
                                </h2>

                                <p className="text-sm text-gray-400">
                                    This action cannot be undone.
                                </p>

                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={closeModal}
                                        className="px-3 py-1 bg-gray-600 rounded"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        onClick={handleDeleteMessage}
                                        className="px-3 py-1 bg-red-500 rounded"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
