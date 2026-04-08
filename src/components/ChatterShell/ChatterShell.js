"use client";

import { chatterColors } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { createChannel, getAllUserData, getCurrentUserChannels } from "@/hooks/useAuth";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ChatterShell({ children }) {
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      if (!open) return;
      try {
        setLoading(true);
        const allUser = await getAllUserData();
        const filtered = allUser.filter((u) => u.id !== user?.id);
        setUsers(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchChannels = async () => {
      try {
        setLoading(true);
        const allChannels = await getCurrentUserChannels();
        setChannels(allChannels);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
    fetchUsers();
  }, [open, user]);

  const toggle = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
  };

  const openChannel = (id) => {
    router.push(`/${id}`);
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
        (selectedUsers.length > 3 ? "..." : "");
      const res = await createChannel({
        memberIds: selectedIds,
        name: generatedName,
        channelType,
      });
      setSelectedIds([]);
      setOpen(false);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to create chat");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`flex min-h-[calc(100vh-5rem)] min-w-0 flex-1 flex-col md:flex-row ${chatterColors.page}`}
    >
      {/* Sidebar */}
      <aside
        className={`flex max-h-[40vh] w-full shrink-0 flex-col border-b md:max-h-none md:h-auto md:max-w-xs md:border-b-0 md:border-r ${chatterColors.sidebar}`}
      >
        <div className="flex min-h-0 flex-1 flex-col gap-4 pt-6 px-5 md:min-h-[calc(100vh-5rem)]">

          {/* Header */}
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
              className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
              onClick={() => setOpen(false)}
            >
              <div
                className="bg-zinc-900 p-6 rounded-xl w-full max-w-md shadow-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-lg font-semibold mb-4">
                  Create Chat
                </h2>

                {/* Error */}
                {errorMsg && (
                  <div className="mb-3 text-red-400 text-sm">
                    {errorMsg}
                  </div>
                )}

                {/* Users */}
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {users.map((u) => (
                    <label
                      key={u.id}
                      className="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer hover:bg-zinc-700 transition"
                    >
                      <span className="font-medium text-sm">
                        {u.account.username || "User"}
                      </span>

                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-sky-600 cursor-pointer"
                        checked={selectedIds.includes(u.id)}
                        onChange={() => toggle(u.id)}
                      />
                    </label>
                  ))}

                  {users.length === 0 && !loading && (
                    <div className="text-center text-sm opacity-60">
                      No users found
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="px-4 py-2 bg-zinc-700 rounded-lg"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleCreate}
                    className="px-4 py-2 bg-sky-700 rounded-lg disabled:opacity-50"
                  >
                    {loading ? "Creating…" : "Create"}
                  </button>
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
          <div
            className={`min-h-0 flex-1 overflow-y-auto text-sm space-y-2 ${chatterColors.sidebarMuted}`}
          >
            <div className="rounded-lg text-center opacity-70">
              {
                channels.map((ch) => (
                  <button onClick={() => openChannel(ch.id)} key={ch.id} className="relative w-full cursor-pointer py-3 mt-4 text-center font-barlow inline-flex justify-center text-base uppercase text-white rounded-lg border-solid transition-transform duration-300 ease-in-out group outline-offset-4 focus:outline focus:outline-2 focus:outline-white focus:outline-offset-4 overflow-hidden">
                    <span className="relative z-20">{ch.name}</span>
                    <span className="absolute left-[-75%] top-0 h-full w-[50%] bg-white/20 rotate-12 z-10 blur-lg group-hover:left-[125%] transition-all duration-1000 ease-in-out" />
                    <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#D4EDF9] absolute h-[20%] rounded-tl-lg border-l-2 border-t-2 top-0 left-0" />
                    <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#D4EDF9] absolute group-hover:h-[90%] h-[60%] rounded-tr-lg border-r-2 border-t-2 top-0 right-0" />
                    <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#D4EDF9] absolute h-[60%] group-hover:h-[90%] rounded-bl-lg border-l-2 border-b-2 left-0 bottom-0" />
                    <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#D4EDF9] absolute h-[20%] rounded-br-lg border-r-2 border-b-2 right-0 bottom-0" />
                  </button>
                ))
              }
            </div>
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
