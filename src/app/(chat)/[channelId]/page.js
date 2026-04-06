export default async function ChannelPage({ params }) {
  const { channelId } = await params;

  return (
    <div className="flex min-h-0 flex-1 flex-col p-4 md:p-6">
      <p className="text-sm text-zinc-500">Channel</p>
      <p className="mt-1 font-mono text-sm text-zinc-200">{channelId}</p>
      <p className="mt-6 text-zinc-400">Chat client goes here.</p>
    </div>
  );
}
