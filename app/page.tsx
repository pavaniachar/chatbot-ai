import { ChatWindow } from '@/components/chat/ChatWindow';

export default function Home() {
  return (
    <main className="flex min-h-dvh justify-center bg-stone-50 sm:items-center sm:p-6">
      <ChatWindow />
    </main>
  );
}
