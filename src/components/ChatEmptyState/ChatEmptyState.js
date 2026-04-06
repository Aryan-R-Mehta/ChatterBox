import { chatterColors } from "@/constants/colors";

export default function ChatEmptyState() {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center p-8 text-center">
      <p className={`text-lg font-medium ${chatterColors.emptyTitle}`}>
        Select a chat
      </p>
      <p className={`mt-2 max-w-md text-sm ${chatterColors.emptySubtitle}`}>
        Choose a channel on the left or create a new chat.
      </p>
    </div>
  );
}
