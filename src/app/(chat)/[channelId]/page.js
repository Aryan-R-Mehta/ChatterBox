"use client";

import { showAppToast } from "@/components/AppToast/ToastNotification";
import { useAuth } from "@/context/AuthContext";
import {
    editChannelMessage,
    fetchChannelDetail,
    fetchDirectoryContacts,
    inviteUsersIntoChannel,
    removeChannelMembership,
    renameChannelTitle,
    sendChannelMessage,
    softDeleteChannelMessage,
} from "@/api/chatBackendClient";
import { getApiErrorMessage } from "@/lib/http-error.util";
import { getSharedSocket } from "@/lib/socket";
import {
    CopyIcon,
    PencilIcon,
    SquarePenIcon,
    Trash2,
    UsersIcon,
    X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useRef, useState } from "react";
import ModalShell from "@/components/ui/ModalShell";

export default function ChannelConversationPage({ params }) {
    const router = useRouter();
    const { user } = useAuth();
    const { channelId } = use(params);

    const [isMembersMenuOpen, setIsMembersMenuOpen] = useState(false);
    const membersMenuRef = useRef(null);

    const [isInviteMembersModalOpen, setIsInviteMembersModalOpen] = useState(false);
    const [directoryUsers, setDirectoryUsers] = useState([]);
    const [inviteModalError, setInviteModalError] = useState("");
    const [inviteUserSearchQuery, setInviteUserSearchQuery] = useState("");
    const [inviteSelectedUserIds, setInviteSelectedUserIds] = useState([]);
    const [channelRecord, setChannelRecord] = useState(null);
    const [messageComposerText, setMessageComposerText] = useState("");
    const [isActionInFlight, setIsActionInFlight] = useState(false);

    const [confirmationDialog, setConfirmationDialog] = useState({
        type: null,
        message: null,
        member: null,
    });

    const [dialogDraftText, setDialogDraftText] = useState("");

    useEffect(() => {
        const loadDirectoryForInvite = async () => {
            if (!isInviteMembersModalOpen) return;
            try {
                setIsActionInFlight(true);
                const contacts = await fetchDirectoryContacts();
                setDirectoryUsers(contacts);
            } catch (err) {
                showAppToast(
                    "error",
                    getApiErrorMessage(err, "Failed to load contacts")
                );
            } finally {
                setIsActionInFlight(false);
            }
        };
        loadDirectoryForInvite();
    }, [isInviteMembersModalOpen, user]);

    const existingMemberUserIds = new Set(
        channelRecord?.members.map((m) => m.userId)
    );

    const inviteCandidateUsers = directoryUsers.filter((u) => {
        const matchesSearch = u.account.username
            ?.toLowerCase()
            .includes(inviteUserSearchQuery.toLowerCase());

        return matchesSearch && !existingMemberUserIds.has(u.id);
    });

    const toggleInviteUserSelection = (userId) => {
        setInviteSelectedUserIds((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    const submitInviteMembers = async () => {
        setInviteModalError("");
        if (inviteSelectedUserIds.length === 0) {
            setInviteModalError("Please select at least one user");
            return;
        }
        setIsActionInFlight(true);
        try {
            await inviteUsersIntoChannel({
                channelId,
                memberIds: inviteSelectedUserIds,
            });
            showAppToast("success", "User Added");
            setInviteSelectedUserIds([]);
            setIsInviteMembersModalOpen(false);
        } catch (err) {
            const message = getApiErrorMessage(err, "Failed to add members");
            setInviteModalError(message);
            showAppToast("error", message);
        } finally {
            setIsActionInFlight(false);
        }
    };

    useEffect(() => {
        const loadChannel = async () => {
            try {
                const data = await fetchChannelDetail(channelId);
                setChannelRecord(data);
            } catch {
                router.push("/");
            }
        };
        if (channelId) loadChannel();
    }, [channelId, router]);

    useEffect(() => {
        if (!channelId) return;

        const socket = getSharedSocket();

        socket.emit("joinChannelRoom", channelId);

        const onChannelRenamed = (updatedChannel) => {
            if (updatedChannel?.id !== channelId) return;
            setChannelRecord((prev) =>
                prev ? { ...prev, name: updatedChannel.name } : prev
            );
        };

        const onIncomingMessage = (newMsg) => {
            if (newMsg?.channelId !== channelId) return;
            setChannelRecord((prev) => {
                if (!prev) return prev;
                const alreadyExists = prev.messages.some((msg) => msg.id === newMsg.id);
                if (alreadyExists) return prev;
                return { ...prev, messages: [...prev.messages, newMsg] };
            });
        };

        const onMessageUpdated = (editedMsg) => {
            if (editedMsg?.channelId !== channelId) return;
            setChannelRecord((prev) => {
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
        };

        const onMessageRemoved = (deletedMsg) => {
            if (deletedMsg?.channelId !== channelId) return;
            setChannelRecord((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    messages: prev.messages.map((msg) =>
                        msg.id === deletedMsg.id
                            ? { ...msg, ...deletedMsg }
                            : msg
                    ),
                };
            });
        };

        const onChannelMembersAdded = async ({ channelId: id }) => {
            if (id !== channelId) return;
            try {
                const data = await fetchChannelDetail(channelId);
                setChannelRecord(data);
            } catch (e) {
                showAppToast(
                    "error",
                    getApiErrorMessage(e, "Failed to refresh channel members")
                );
            }
        };

        const onChannelMemberRemoved = ({ channelId: cid, membershipId }) => {
            if (cid !== channelId) return;
            setChannelRecord((prev) =>
                prev
                    ? {
                          ...prev,
                          members: prev.members.filter((m) => m.id !== membershipId),
                      }
                    : prev
            );
        };

        socket.on("channelRenamed", onChannelRenamed);
        socket.on("incomingMessage", onIncomingMessage);
        socket.on("messageUpdated", onMessageUpdated);
        socket.on("messageRemoved", onMessageRemoved);
        socket.on("channelMembersAdded", onChannelMembersAdded);
        socket.on("channelMemberRemoved", onChannelMemberRemoved);

        return () => {
            socket.emit("leaveChannelRoom", channelId);
            socket.off("channelRenamed", onChannelRenamed);
            socket.off("incomingMessage", onIncomingMessage);
            socket.off("messageUpdated", onMessageUpdated);
            socket.off("messageRemoved", onMessageRemoved);
            socket.off("channelMembersAdded", onChannelMembersAdded);
            socket.off("channelMemberRemoved", onChannelMemberRemoved);
        };
    }, [channelId]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                membersMenuRef.current &&
                !membersMenuRef.current.contains(e.target)
            ) {
                setIsMembersMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleComposerKeyDown = async (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (!messageComposerText.trim()) return;

            try {
                await sendChannelMessage({
                    channelId,
                    content: messageComposerText.trim(),
                });
                setMessageComposerText("");
            } catch (err) {
                showAppToast("error", getApiErrorMessage(err, "Failed to send message"));
            }
        }
    };

    const openRemoveMemberDialog = (member) => {
        setConfirmationDialog({ type: "removeMember", member, message: null });
    };

    const openRenameChannelDialog = (channelTitle) => {
        setDialogDraftText(channelTitle);
        setConfirmationDialog({
            type: "renameChannel",
            message: channelTitle,
            member: null,
        });
    };

    const openEditMessageDialog = (msg) => {
        setDialogDraftText(msg.content);
        setConfirmationDialog({ type: "editMessage", message: msg, member: null });
    };

    const openDeleteMessageDialog = (msg) => {
        setConfirmationDialog({ type: "deleteMessage", message: msg, member: null });
    };

    const closeConfirmationDialog = () => {
        setConfirmationDialog({ type: null, message: null, member: null });
    };

    const confirmRemoveMember = async () => {
        try {
            await removeChannelMembership(confirmationDialog.member.id);
            closeConfirmationDialog();
        } catch (err) {
            showAppToast("error", getApiErrorMessage(err, "Failed to remove member"));
        }
    };

    const confirmRenameChannel = async () => {
        try {
            await renameChannelTitle({
                channelId,
                name: dialogDraftText.trim(),
            });
            closeConfirmationDialog();
        } catch (err) {
            showAppToast("error", getApiErrorMessage(err, "Failed to rename channel"));
        }
    };

    const confirmEditMessage = async () => {
        try {
            await editChannelMessage({
                channelId,
                messageId: confirmationDialog.message.id,
                content: dialogDraftText.trim(),
            });
            closeConfirmationDialog();
        } catch (err) {
            showAppToast("error", getApiErrorMessage(err, "Failed to edit message"));
        }
    };

    const confirmDeleteMessage = async () => {
        try {
            await softDeleteChannelMessage({
                channelId,
                messageId: confirmationDialog.message.id,
            });
            closeConfirmationDialog();
        } catch (err) {
            showAppToast("error", getApiErrorMessage(err, "Failed to delete message"));
        }
    };

    const resolveChannelTitle = (channel) => {
        if (channel.channelType === "GROUP" && channel.name) {
            return channel.name;
        }
        const otherMembers = channel.members.filter(
            (m) => m.user.id !== user.id
        );
        return otherMembers.map((m) => m.user.account.username).join(", ");
    };

    const currentUserMembership = channelRecord?.members.find(
        (m) => m.userId === user.id
    );
    const isCurrentUserChannelAdmin = currentUserMembership?.role === "ADMIN";

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex justify-between items-center mt-1 h-15 px-6 border-b-4 border-indigo-500 shrink-0">
                <div className="flex items-center gap-3">
                    {channelRecord ? resolveChannelTitle(channelRecord) : "Loading..."}
                    {channelRecord?.channelType === "GROUP" && (
                        <button
                            className="cursor-pointer"
                            onClick={() =>
                                openRenameChannelDialog(
                                    resolveChannelTitle(channelRecord)
                                )
                            }
                        >
                            <SquarePenIcon size={20} />
                        </button>
                    )}
                </div>
                <div className="relative" ref={membersMenuRef}>
                    <button
                        className="p-2 rounded-lg hover:bg-indigo-800"
                        onClick={() => setIsMembersMenuOpen((prev) => !prev)}
                    >
                        <UsersIcon size={22} />
                    </button>

                    {isMembersMenuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-75 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50 animate-fadeIn">
                            <div className="px-4 text-center py-2 text-sm text-gray-400 border-b border-slate-700">
                                Members List
                            </div>
                            <div className="w-full flex items-center justify-center my-2">
                                <button
                                    className="w-full mx-4 cursor-pointer rounded-lg px-3 py-2 text-sm font-medium transition hover:scale-[1.03] active:scale-[0.97] bg-[#2f6feb]"
                                    onClick={() => setIsInviteMembersModalOpen(true)}
                                >
                                    + Add Member
                                </button>
                                {isInviteMembersModalOpen && (
                                    <ModalShell
                                        onClose={() => setIsInviteMembersModalOpen(false)}
                                        panelClassName="bg-zinc-900/90 backdrop-blur-xl p-6 rounded-2xl w-full max-w-sm md:max-w-md shadow-2xl border border-zinc-700/50"
                                    >
                                            <div className="flex items-center justify-between mb-4">
                                                <h2 className="text-lg font-semibold text-white">
                                                    Create Chat
                                                </h2>
                                                <button
                                                    onClick={() =>
                                                        setIsInviteMembersModalOpen(false)
                                                    }
                                                    className="text-zinc-400 hover:text-white transition"
                                                >
                                                    ✕
                                                </button>
                                            </div>

                                            {inviteModalError && (
                                                <div className="mb-3 text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
                                                    {inviteModalError}
                                                </div>
                                            )}

                                            <div className="mb-3">
                                                <input
                                                    placeholder="Search users..."
                                                    className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-2.5 text-sm text-white placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-sky-500 transition"
                                                    value={inviteUserSearchQuery}
                                                    onChange={(e) =>
                                                        setInviteUserSearchQuery(e.target.value)
                                                    }
                                                    type="search"
                                                />
                                            </div>

                                            <div className="max-h-80 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                                                <ul className="space-y-3">
                                                    {inviteCandidateUsers.map((u) => (
                                                        <li key={u.id}>
                                                            <div
                                                                onClick={() =>
                                                                    toggleInviteUserSelection(u.id)
                                                                }
                                                                className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer
                                                        transition-all duration-200 border
                                                        ${
                                                            inviteSelectedUserIds.includes(u.id)
                                                                ? "bg-sky-600/20 border-sky-500"
                                                                : "bg-zinc-800/60 border-transparent hover:bg-zinc-700/70 hover:border-zinc-600"
                                                        }`}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center text-white text-sm font-semibold">
                                                                        {u.account.username
                                                                            ?.charAt(0)
                                                                            .toUpperCase()}
                                                                    </div>

                                                                    <span className="font-medium text-sm text-zinc-200">
                                                                        {u.account.username}
                                                                    </span>
                                                                </div>

                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        toggleInviteUserSelection(u.id);
                                                                    }}
                                                                    className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200
                                                            ${
                                                                inviteSelectedUserIds.includes(
                                                                    u.id
                                                                )
                                                                    ? "bg-green-500/20 text-green-400"
                                                                    : "bg-zinc-700 text-zinc-300 hover:bg-sky-600 hover:text-white"
                                                            }`}
                                                                >
                                                                    {inviteSelectedUserIds.includes(
                                                                        u.id
                                                                    )
                                                                        ? "✓"
                                                                        : "+"}
                                                                </button>
                                                            </div>
                                                        </li>
                                                    ))}

                                                    {directoryUsers.length === 0 &&
                                                        !isActionInFlight && (
                                                            <div className="text-center text-sm text-zinc-400 py-6">
                                                                No users found
                                                            </div>
                                                        )}
                                                </ul>
                                            </div>

                                            <div className="flex justify-between items-center mt-5">
                                                <span className="text-xs text-zinc-400">
                                                    {inviteSelectedUserIds.length} selected
                                                </span>

                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setIsInviteMembersModalOpen(false)
                                                        }
                                                        className="px-4 py-2 text-sm bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition"
                                                    >
                                                        Cancel
                                                    </button>

                                                    <button
                                                        type="button"
                                                        disabled={
                                                            isActionInFlight ||
                                                            inviteSelectedUserIds.length === 0
                                                        }
                                                        onClick={submitInviteMembers}
                                                        className="px-4 py-2 text-sm bg-sky-600 hover:bg-sky-500 text-white rounded-lg disabled:opacity-40 transition"
                                                    >
                                                        {isActionInFlight ? "Creating…" : "Create"}
                                                    </button>
                                                </div>
                                            </div>
                                    </ModalShell>
                                )}
                            </div>
                            <div className="max-h-60 overflow-y-auto">
                                {channelRecord?.members.map((member) => {
                                    const isOwnMembershipRow = member.userId === user.id;
                                    const canShowRemoveMember =
                                        isOwnMembershipRow || isCurrentUserChannelAdmin;

                                    return (
                                        <div
                                            key={member.id}
                                            className="px-4 py-2 hover:bg-slate-800 text-sm text-white flex justify-between items-center"
                                        >
                                            <div className="flex gap-2">
                                                <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-xs">
                                                    {member.user.account.username
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>
                                                {member.user.account.username}
                                            </div>
                                            {canShowRemoveMember && (
                                                <button
                                                    type="button"
                                                    className="cursor-pointer text-slate-300 hover:text-white"
                                                    onClick={() =>
                                                        openRemoveMemberDialog(member)
                                                    }
                                                    aria-label={
                                                        isOwnMembershipRow
                                                            ? "Leave channel"
                                                            : "Remove member"
                                                    }
                                                >
                                                    <X size={18} />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3">
                {channelRecord?.messages.map((msg) => {
                    const isOwnMessage = msg.senderId === user.id;

                    return (
                        <div
                            key={msg.id}
                            className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} group`}
                        >
                            <div className="flex items-center gap-2 max-w-xs md:max-w-md">
                                {!isOwnMessage && (
                                    <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-white text-xs font-semibold">
                                        {msg.sender?.account?.username
                                            ?.charAt(0)
                                            .toUpperCase()}
                                    </div>
                                )}

                                {isOwnMessage && !msg.isDeleted && (
                                    <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition">
                                        <Trash2
                                            size={15}
                                            className="cursor-pointer"
                                            onClick={() => openDeleteMessageDialog(msg)}
                                        />
                                        <CopyIcon
                                            size={15}
                                            className="cursor-pointer"
                                            onClick={() =>
                                                navigator.clipboard.writeText(msg.content)
                                            }
                                        />
                                        <PencilIcon
                                            size={15}
                                            className="cursor-pointer"
                                            onClick={() => openEditMessageDialog(msg)}
                                        />
                                    </div>
                                )}

                                <div
                                    className={`flex items-end gap-2 px-3 py-2 rounded-2xl text-sm shadow-sm
                                    ${
                                        isOwnMessage
                                            ? "bg-indigo-500 text-white rounded-br-sm"
                                            : "bg-zinc-800 text-zinc-200 rounded-bl-sm"
                                    }`}
                                >
                                    <div className="flex flex-col">
                                        {channelRecord.channelType !== "CHAT" &&
                                            !isOwnMessage && (
                                                <span className="text-[11px] text-sky-400 mb-[2px]">
                                                    {msg.sender?.account?.username}
                                                </span>
                                            )}

                                        <div className="flex items-end gap-3">
                                            <span className="break-words">{msg.content}</span>

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

            <div className="p-3 border-t border-[#2B3040] shrink-0">
                <textarea
                    className="bg-[#222630] px-4 py-3 w-full text-white rounded-lg border-2 focus:border-[#596A95] border-[#2B3040] resize-none overflow-hidden"
                    placeholder="Type a message..."
                    value={messageComposerText}
                    rows={1}
                    onChange={(e) => {
                        setMessageComposerText(e.target.value);
                        e.target.style.height = "auto";
                        e.target.style.height = e.target.scrollHeight + "px";
                    }}
                    onKeyDown={handleComposerKeyDown}
                />
            </div>

            {confirmationDialog.type && (
                <ModalShell
                    onClose={closeConfirmationDialog}
                    panelClassName="bg-slate-900 border border-slate-700 rounded-xl p-6 w-3xl shadow-xl space-y-4"
                    overlayClassName="bg-black/50"
                >
                        {confirmationDialog.type === "removeMember" && (
                            <>
                                <h2 className="text-white font-semibold">
                                    Do you want to remove{" "}
                                    <b>
                                        {confirmationDialog.member?.user?.account?.username}
                                    </b>{" "}
                                    from{" "}
                                    <b>{resolveChannelTitle(channelRecord)}</b>?
                                </h2>

                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={closeConfirmationDialog}
                                        className="px-3 py-1 bg-gray-600 rounded"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        className="px-3 py-1 bg-red-500 rounded"
                                        onClick={confirmRemoveMember}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </>
                        )}

                        {confirmationDialog.type === "renameChannel" && (
                            <>
                                <h2 className="text-white font-semibold">Rename Channel</h2>

                                <textarea
                                    className="bg-[#222630] px-4 py-3 w-full text-white rounded-lg border-2 focus:border-[#596A95] border-[#2B3040] resize-none overflow-hidden"
                                    value={dialogDraftText}
                                    rows={1}
                                    onChange={(e) => setDialogDraftText(e.target.value)}
                                />

                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={closeConfirmationDialog}
                                        className="px-3 py-1 bg-gray-600 rounded"
                                    >
                                        Discard
                                    </button>

                                    <button
                                        onClick={confirmRenameChannel}
                                        className="px-3 py-1 bg-indigo-500 rounded"
                                    >
                                        Rename Channel
                                    </button>
                                </div>
                            </>
                        )}

                        {confirmationDialog.type === "editMessage" && (
                            <>
                                <h2 className="text-white font-semibold">Edit Message</h2>

                                <textarea
                                    className="bg-[#222630] px-4 py-3 w-full text-white rounded-lg border-2 focus:border-[#596A95] border-[#2B3040] resize-none overflow-hidden"
                                    value={dialogDraftText}
                                    rows={1}
                                    onChange={(e) => setDialogDraftText(e.target.value)}
                                />

                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={closeConfirmationDialog}
                                        className="px-3 py-1 bg-gray-600 rounded"
                                    >
                                        Discard
                                    </button>

                                    <button
                                        onClick={confirmEditMessage}
                                        className="px-3 py-1 bg-indigo-500 rounded"
                                    >
                                        Edit
                                    </button>
                                </div>
                            </>
                        )}

                        {confirmationDialog.type === "deleteMessage" && (
                            <>
                                <h2 className="text-white font-semibold">Delete Message?</h2>

                                <p className="text-sm text-gray-400">
                                    This action cannot be undone.
                                </p>

                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={closeConfirmationDialog}
                                        className="px-3 py-1 bg-gray-600 rounded"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        onClick={confirmDeleteMessage}
                                        className="px-3 py-1 bg-red-500 rounded"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </>
                        )}
                </ModalShell>
            )}
        </div>
    );
}
