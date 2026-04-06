"use client";

import { chatterColors } from "@/constants/colors";
import { useState } from "react";

export default function ChatterShell({ children }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreate = (e) => {
    
  }

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

            {open && (
              <div
                className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
                onClick={() => setOpen(false)}
                role="presentation"
              >
                <div
                  className="bg-zinc-900 p-6 rounded-xl w-full max-w-md shadow-lg"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h2 className="text-lg font-semibold mb-4">Create Chat</h2>

                  <input
                    type="text"
                    name="chatName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Group name (optional for 1:1)…"
                    className="w-full px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 mb-4"
                  />

                  {/* <div>
                    {list.map((u) => (
                      <div key={u.id} className="mt-2 w-90 hover:bg-zinc-800 ">
                        <label
                          className="relative flex items-center justify-between cursor-pointer text-[#008080] py-2"
                          htmlFor={`tick-${u.id}`}
                        >
                          <p className="text-[1em] font-bold [user-select:none] ps-2">
                            {u.user_metadata?.username ?? u.email ?? u.id}
                          </p>

                          <input
                            className="peer appearance-none"
                            id={`tick-${u.id}`}
                            type="checkbox"
                            checked={selectedIds.includes(u.id)}
                            onChange={() => toggle(u.id)}
                          />

                          <span className="absolute right-0 top-1/2 h-[2em] w-[2em] translate-x-full -translate-y-1/2 rounded-[0.25em] border-[2px] border-[#008080]"></span>

                          <svg
                            viewBox="0 0 69 89"
                            className="absolute right-0 top-1/2 h-[2em] w-[2em] translate-x-full -translate-y-1/2 duration-500 ease-out [stroke-dasharray:100] [stroke-dashoffset:100] peer-checked:[stroke-dashoffset:0]"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M.93 63.984c3.436.556 7.168.347 10.147 2.45 4.521 3.19 10.198 8.458 13.647 12.596 1.374 1.65 4.181 5.922 5.598 8.048.267.4-1.31.823-1.4.35-5.744-30.636 9.258-59.906 29.743-81.18C62.29 2.486 63.104 1 68.113 1"
                              strokeWidth="6px"
                              stroke="#008080"
                              pathLength={100}
                            />
                          </svg>
                        </label>
                      </div>
                    ))}
                  </div> */}

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
          </div>

          {/* Search */}
          <div className="shrink-0">
            <input
              placeholder="Search chats..."
              className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition
              focus:ring-2 focus:ring-opacity-50 ${chatterColors.input}`}
              name="search"
              type="search"
              aria-label="Search chats"
            />
          </div>

          {/* Chat List */}
          <div
            className={`min-h-0 flex-1 overflow-y-auto text-sm space-y-2 ${chatterColors.sidebarMuted}`}
          >
            <div className="rounded-lg px-3 py-3 text-center opacity-70">
              No chats yet — create one to get started.
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