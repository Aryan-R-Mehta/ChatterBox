"use client";

import { chatterColors } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import {
    createChannelConversation,
    fetchDirectoryContacts,
    fetchJoinedChannels,
} from "@/api/chatBackendClient";
import { showAppToast } from "@/components/AppToast/ToastNotification";
import ModalShell from "@/components/ui/ModalShell";
import { getApiErrorMessage } from "@/lib/http-error.util";
import { getSharedSocket } from "@/lib/socket";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ChatWorkspaceLayout({ children }) {
    const { user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const socket = getSharedSocket();
    const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
    const [directoryUsers, setDirectoryUsers] = useState([]);
    const [channels, setChannels] = useState([]);
    const directMessageChannels = channels.filter((ch) => ch.channelType === "CHAT");
    const groupChannels = channels.filter((ch) => ch.channelType === "GROUP");
    const [isBusy, setIsBusy] = useState(false);
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [modalError, setModalError] = useState("");
    const [channelSearchQuery, setChannelSearchQuery] = useState("");
    const [newChatUserSearchQuery, setNewChatUserSearchQuery] = useState("");
    const isChannelRoute = Boolean(pathname && pathname !== "/");

    useEffect(() => {
        const loadChannels = async () => {
            try {
                setIsBusy(true);
                const joined = await fetchJoinedChannels();
                if (!joined.length) return;
                setChannels(joined);
            } catch (err) {
                showAppToast("error", getApiErrorMessage(err, "Failed to load chats"));
            } finally {
                setIsBusy(false);
            }
        };
        loadChannels();
    }, [user]);

    useEffect(() => {
        if (!user) return;
        const onChannelCreated = (newChannel) => {
            if (!newChannel?.id || !Array.isArray(newChannel?.members)) return;
            const isUserInChannel = newChannel.members.some(
                (member) => member?.userId === user.id
            );
            if (!isUserInChannel) return;

            setChannels((prev) => {
                const exists = prev.some((ch) => ch.id === newChannel.id);
                if (exists) return prev;
                return [...prev, newChannel];
            });
        };

        const onChannelRenamed = (updatedChannel) => {
            setChannels((prev) =>
                prev.map((ch) =>
                    ch.id === updatedChannel.id
                        ? { ...ch, name: updatedChannel.name }
                        : ch
                )
            );
        };

        socket.on("channelCreated", onChannelCreated);
        socket.on("channelRenamed", onChannelRenamed);

        return () => {
            socket.off("channelCreated", onChannelCreated);
            socket.off("channelRenamed", onChannelRenamed);
        };
    }, [user, socket]);

    const navigateToChannel = (channelId) => {
        router.push(`/${channelId}`);
    };

    useEffect(() => {
        const loadDirectory = async () => {
            if (!isNewChatModalOpen) return;
            try {
                setIsBusy(true);
                const contacts = await fetchDirectoryContacts();
                setDirectoryUsers(contacts);
            } catch (err) {
                showAppToast("error", getApiErrorMessage(err, "Failed to load contacts"));
            } finally {
                setIsBusy(false);
            }
        };
        loadDirectory();
    }, [isNewChatModalOpen, user]);

    const filteredDirectoryUsers = directoryUsers.filter((u) =>
        u.account.username
            ?.toLowerCase()
            .includes(newChatUserSearchQuery.toLowerCase())
    );

    const toggleUserSelection = (userId) => {
        setSelectedUserIds((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    const handleStartConversation = async () => {
        setModalError("");
        if (selectedUserIds.length === 0) {
            setModalError("Please select at least one user");
            return;
        }
        setIsBusy(true);

        try {
            const selectedUsers = directoryUsers.filter((u) =>
                selectedUserIds.includes(u.id)
            );
            const channelType = selectedUsers.length > 1 ? "GROUP" : "CHAT";
            const channel = await createChannelConversation({
                memberIds: selectedUserIds,
                name: channelType === "GROUP" ? "New Group" : null,
                channelType,
            });
            setChannels((prev) => {
                const exists = prev.find((ch) => ch.id === channel.id);
                if (exists) return prev;
                return [...prev, channel];
            });
            setSelectedUserIds([]);
            setIsNewChatModalOpen(false);
            router.push(`/${channel.id}`);
        } catch (err) {
            const message = getApiErrorMessage(err, "Failed to create chat");
            setModalError(message);
            showAppToast("error", message);
        } finally {
            setIsBusy(false);
        }
    };

    const resolveChannelDisplayName = (channel) => {
        if (!channel?.members) return "Unknown";

        if (channel.channelType === "GROUP" && channel.name) {
            return channel.name;
        }

        const otherMembers = channel.members.filter(
            (m) => m.user.id !== user.id
        );

        return otherMembers.map((m) => m.user.account.username).join(", ");
    };

    const filteredDirectChannels = directMessageChannels.filter((ch) => {
        const label = resolveChannelDisplayName(ch)?.toLowerCase() || "";
        return label.includes(channelSearchQuery.toLowerCase());
    });

    const filteredGroupChannelList = groupChannels.filter((ch) => {
        const label = resolveChannelDisplayName(ch)?.toLowerCase() || "";
        return label.includes(channelSearchQuery.toLowerCase());
    });

    return (
        <div
            className={`flex h-[calc(100dvh-5rem)] min-h-0 min-w-0 flex-1 flex-col md:h-[calc(100vh-5rem)] md:flex-row ${chatterColors.page}`}
        >
            <aside
                className={`${isChannelRoute ? "hidden md:flex" : "flex h-full max-h-none"} w-full shrink-0 flex-col border-b md:max-h-none md:h-auto md:max-w-xs md:border-b-0 md:border-r ${chatterColors.sidebar}`}
            >
                <div className="flex min-h-0 flex-1 flex-col gap-4 pt-6 px-5 md:min-h-[calc(100vh-5rem)]">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-xl tracking-tight">Chats</h2>

                        <button
                            type="button"
                            onClick={() => setIsNewChatModalOpen(true)}
                            className="mv-btn mv-btn-primary flex items-center gap-1"
                        >
                            Create chat
                        </button>
                    </div>

                    {isNewChatModalOpen && (
                        <ModalShell
                            onClose={() => setIsNewChatModalOpen(false)}
                            panelClassName="mv-modal-surface w-full max-w-sm p-6 md:max-w-md"
                        >
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-white">
                                        Create Chat
                                    </h2>
                                    <button
                                        onClick={() => setIsNewChatModalOpen(false)}
                                        className="text-zinc-400 hover:text-white transition"
                                    >
                                        ✕
                                    </button>
                                </div>

                                {modalError && (
                                    <div className="mb-3 text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
                                        {modalError}
                                    </div>
                                )}

                                <div className="mb-3">
                                    <input
                                        placeholder="Search users..."
                                        className="mv-input"
                                        value={newChatUserSearchQuery}
                                        onChange={(e) =>
                                            setNewChatUserSearchQuery(e.target.value)
                                        }
                                        type="search"
                                    />
                                </div>

                                <div className="max-h-80 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                                    <ul className="space-y-3">
                                        {filteredDirectoryUsers.map((u) => (
                                            <li key={u.id}>
                                                <div
                                                    onClick={() => toggleUserSelection(u.id)}
                                                    className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer
                                                        transition-all duration-200 border
                                                        ${
                                                            selectedUserIds.includes(u.id)
                                                                ? "bg-sky-600/20 border-sky-500"
                                                                : "bg-zinc-800/60 border-transparent hover:bg-zinc-700/70 hover:border-zinc-600"
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center text-white text-sm font-semibold">
                                                            {u.account.username?.charAt(0).toUpperCase()}
                                                        </div>

                                                        <span className="font-medium text-sm text-zinc-200">
                                                            {u.account.username}
                                                        </span>
                                                    </div>

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleUserSelection(u.id);
                                                        }}
                                                        className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200
                                                            ${
                                                                selectedUserIds.includes(u.id)
                                                                    ? "bg-green-500/20 text-green-400"
                                                                    : "bg-zinc-700 text-zinc-300 hover:bg-sky-600 hover:text-white"
                                                            }`}
                                                    >
                                                        {selectedUserIds.includes(u.id) ? "✓" : "+"}
                                                    </button>
                                                </div>
                                            </li>
                                        ))}

                                        {directoryUsers.length === 0 && !isBusy && (
                                            <div className="text-center text-sm text-zinc-400 py-6">
                                                No users found
                                            </div>
                                        )}
                                    </ul>
                                </div>

                                <div className="flex justify-between items-center mt-5">
                                    <span className="text-xs text-zinc-400">
                                        {selectedUserIds.length} selected
                                    </span>

                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsNewChatModalOpen(false)}
                                            className="mv-btn mv-btn-secondary px-4 py-2 text-sm"
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="button"
                                            disabled={isBusy || selectedUserIds.length === 0}
                                            onClick={handleStartConversation}
                                            className="mv-btn mv-btn-primary px-4 py-2 text-sm disabled:opacity-40"
                                        >
                                            {isBusy ? "Creating…" : "Create"}
                                        </button>
                                    </div>
                                </div>
                        </ModalShell>
                    )}

                    <div className="shrink-0">
                        <input
                            placeholder="Search chats..."
                            className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition
  focus:ring-2 focus:ring-opacity-50 ${chatterColors.input}`}
                            type="search"
                            value={channelSearchQuery}
                            onChange={(e) => setChannelSearchQuery(e.target.value)}
                        />
                    </div>

                    <div
                        className={`min-h-0 flex-1 overflow-y-auto text-sm space-y-4 ${chatterColors.sidebarMuted}`}
                    >
                        {filteredDirectChannels.length !== 0 ? (
                            <div>
                                <h3 className="text-xs uppercase text-zinc-400 mb-2 px-1">
                                    Direct Messages
                                </h3>

                                {filteredDirectChannels.map((ch) => (
                                    <button
                                        key={ch.id}
                                        onClick={() => navigateToChannel(ch.id)}
                                        className="relative cursor-pointer w-full py-3 mt-2 text-center text-sm text-white rounded-lg border border-zinc-700 hover:bg-zinc-800 transition group"
                                    >
                                        <span className="relative z-20">
                                            {ch.channelType === "GROUP"
                                                ? ch.name
                                                : resolveChannelDisplayName(ch)}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            ""
                        )}

                        {filteredGroupChannelList.length !== 0 ? (
                            <div>
                                <h3 className="text-xs uppercase text-zinc-400 mb-2 px-1">
                                    Group Chats
                                </h3>

                                {filteredGroupChannelList.map((ch) => (
                                    <button
                                        key={ch.id}
                                        onClick={() => navigateToChannel(ch.id)}
                                        className="relative cursor-pointer w-full py-3 mt-2 text-center text-sm text-white rounded-lg border border-zinc-700 hover:bg-zinc-800 transition group"
                                    >
                                        <span className="relative z-20">
                                            {resolveChannelDisplayName(ch)}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            ""
                        )}
                    </div>
                </div>
            </aside>

            <div
                className={`${!isChannelRoute ? "hidden md:flex" : "flex"} min-h-0 min-w-0 flex-1 flex-col ${chatterColors.mainArea}`}
            >
                {children}
            </div>
        </div>
    );
}
