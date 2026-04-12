"use client";

import { chatterColors } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { createChannel, getAllUserNames, getUserChannels } from "@/hooks/useAuth";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ChatterShell({ children }) {
    const { user } = useAuth();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [users, setUsers] = useState([]);
    const [channels, setChannels] = useState([]);
    const chatChannels = channels.filter((ch) => ch.channelType === "CHAT");
    const groupChannels = channels.filter((ch) => ch.channelType === "GROUP");
    const [loading, setLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [errorMsg, setErrorMsg] = useState("");
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchChannels = async () => {
            try {
                setLoading(true);
                const allChannels = await getUserChannels();
                if (!allChannels.length) return;
                setChannels(allChannels);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchChannels();
    }, [user]);

    const openChannel = (id) => {
        router.push(`/${id}`);
    };

    useEffect(() => {
        const fetchUsers = async () => {
            if (!open) return;
            try {
                setLoading(true);
                const allUserNames = await getAllUserNames();
                setUsers(allUserNames);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [open, user]);

    const filteredUsers = users.filter((u) =>
        u.account.username
            ?.toLowerCase()
            .includes(search.toLowerCase())
    );

    const toggle = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id)
                ? prev.filter((i) => i !== id)
                : [...prev, id]
        );
    };

    const handleCreate = async () => {
        setErrorMsg("");
        if (selectedIds.length === 0) {
            setErrorMsg("Please select at least one user");
            return;
        }
        setLoading(true);

        try {
            const selectedUsers = users.filter((u) =>
                selectedIds.includes(u.id)
            );
            const channelType = selectedUsers.length > 1 ? "GROUP" : "CHAT";
            const generatedName =
                selectedUsers
                    .map((u) => u.account.username || "User")
                    .slice(0, 3)
                    .join(", ") +
                (selectedUsers.length > 3 ? "..." : ", " + user.username);
            const channel = await createChannel({
                memberIds: selectedIds,
                name: generatedName,
                channelType,
            });
            console.log(channel);
            setSelectedIds([]);
            setOpen(false);
            router.push(`/${channel.id}`);
        } catch (err) {
            console.error(err);
            setErrorMsg("Failed to create chat");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`flex min-h-[calc(100vh-5rem)] min-w-0 flex-1 flex-col md:flex-row ${chatterColors.page}`} >
            <aside className={`flex max-h-[40vh] w-full shrink-0 flex-col border-b md:max-h-none md:h-auto md:max-w-xs md:border-b-0 md:border-r ${chatterColors.sidebar}`} >
                <div className="flex min-h-0 flex-1 flex-col gap-4 pt-6 px-5 md:min-h-[calc(100vh-5rem)]">

                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-xl tracking-tight">
                            Chats
                        </h2>

                        <button
                            type="button"
                            onClick={() => setOpen(true)}
                            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition
              hover:scale-[1.03] active:scale-[0.97] bg-[#2f6feb]"
                        >
                            Create chat
                        </button>
                    </div>

                    {/* Modal */}
                    {open && (
                        <div
                            className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50"
                            onClick={() => setOpen(false)}
                        >
                            <div
                                className="bg-zinc-900/90 backdrop-blur-xl p-6 rounded-2xl w-full max-w-sm md:max-w-md shadow-2xl border border-zinc-700/50"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-white">
                                        Create Chat
                                    </h2>
                                    <button
                                        onClick={() => setOpen(false)}
                                        className="text-zinc-400 hover:text-white transition"
                                    >
                                        ✕
                                    </button>
                                </div>

                                {/* Error */}
                                {errorMsg && (
                                    <div className="mb-3 text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
                                        {errorMsg}
                                    </div>
                                )}

                                {/* Search */}
                                <div className="mb-3">
                                    <input
                                        placeholder="Search users..."
                                        className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-2.5 text-sm text-white placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-sky-500 transition"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        type="search"
                                    />
                                </div>

                                {/* Users List */}
                                <div className="max-h-80 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                                    <ul className="space-y-3">
                                        {filteredUsers.map((u) => (
                                            <li key={u.id}>
                                                <div
                                                    onClick={() => toggle(u.id)}
                                                    className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer
                                                        transition-all duration-200 border
                                                        ${selectedIds.includes(u.id)
                                                            ? "bg-sky-600/20 border-sky-500"
                                                            : "bg-zinc-800/60 border-transparent hover:bg-zinc-700/70 hover:border-zinc-600"
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {/* Avatar */}
                                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center text-white text-sm font-semibold">
                                                            {u.account.username?.charAt(0).toUpperCase()}
                                                        </div>

                                                        {/* Username */}
                                                        <span className="font-medium text-sm text-zinc-200">
                                                            {u.account.username}
                                                        </span>
                                                    </div>

                                                    {/* Add Button */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggle(u.id);
                                                        }}
                                                        className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200
                                                            ${selectedIds.includes(u.id)
                                                                ? "bg-green-500/20 text-green-400"
                                                                : "bg-zinc-700 text-zinc-300 hover:bg-sky-600 hover:text-white"
                                                            }`}
                                                    >
                                                        {selectedIds.includes(u.id) ? "✓" : "+"}
                                                    </button>
                                                </div>
                                            </li>
                                        ))}

                                        {users.length === 0 && !loading && (
                                            <div className="text-center text-sm text-zinc-400 py-6">
                                                No users found
                                            </div>
                                        )}
                                    </ul>
                                </div>

                                {/* Footer */}
                                <div className="flex justify-between items-center mt-5">
                                    {/* Selected count */}
                                    <span className="text-xs text-zinc-400">
                                        {selectedIds.length} selected
                                    </span>

                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setOpen(false)}
                                            className="px-4 py-2 text-sm bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition"
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="button"
                                            disabled={loading || selectedIds.length === 0}
                                            onClick={handleCreate}
                                            className="px-4 py-2 text-sm bg-sky-600 hover:bg-sky-500 text-white rounded-lg disabled:opacity-40 transition"
                                        >
                                            {loading ? "Creating…" : "Create"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Search */}
                    <div className="shrink-0">
                        <input
                            placeholder="Search chats..."
                            className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition
              focus:ring-2 focus:ring-opacity-50 ${chatterColors.input}`}
                            type="search"
                        />
                    </div>

                    {/* Chat List */}
                    <div className={`min-h-0 flex-1 overflow-y-auto text-sm space-y-4 ${chatterColors.sidebarMuted}`}>
                        {chatChannels.length !== 0 ?
                            <div>
                                <h3 className="text-xs uppercase text-zinc-400 mb-2 px-1">
                                    Direct Messages
                                </h3>

                                {
                                    chatChannels.map((ch) => (
                                        <button
                                            key={ch.id}
                                            onClick={() => openChannel(ch.id)}
                                            className="relative cursor-pointer w-full py-3 mt-2 text-center text-sm text-white rounded-lg border border-zinc-700 hover:bg-zinc-800 transition group"
                                        >
                                            <span className="relative z-20">{ch.name}</span>
                                        </button>
                                    ))
                                }
                            </div>
                            : ""
                        }

                        {groupChannels.length !== 0 ?
                            <div>
                                <h3 className="text-xs uppercase text-zinc-400 mb-2 px-1">
                                    Group Chats
                                </h3>

                                {
                                    groupChannels.map((ch) => (
                                        <button
                                            key={ch.id}
                                            onClick={() => openChannel(ch.id)}
                                            className="relative cursor-pointer w-full py-3 mt-2 text-center text-sm text-white rounded-lg border border-zinc-700 hover:bg-zinc-800 transition group"
                                        >
                                            <span className="relative z-20">{ch.name}</span>
                                        </button>
                                    ))
                                }
                            </div>
                            : ""
                        }
                    </div>
                </div>
            </aside>

            {/* Main Area */}
            <div
                className={`flex min-h-0 min-w-0 flex-1 flex-col ${chatterColors.mainArea}`}
            >
                {children}
            </div>
        </div>
    );
}
