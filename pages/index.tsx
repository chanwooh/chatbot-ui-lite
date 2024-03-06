import { Chat } from "@/components/Chat/Chat";
import { Footer } from "@/components/Layout/Footer";
import { Navbar } from "@/components/Layout/Navbar";
import { AlertBanner } from "@/components/Layout/AlertBanner";
import { Message } from "@/types";
import { SyncState } from "@/types";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [syncState, setSyncState] = useState<SyncState>(SyncState.NotStarted);
  const [canSend, setCanSend] = useState<boolean>(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (message: Message) => {
    const updatedMessages = [...messages, message];

    setMessages(updatedMessages);
    setLoading(true);

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: updatedMessages
      })
    });

    if (!response.ok) {
      setLoading(false);
      throw new Error(response.statusText);
    }

    const data = response.body;

    if (!data) {
      return;
    }

    setLoading(false);

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let isFirst = true;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);

      if (isFirst) {
        isFirst = false;
        setMessages((messages) => [
          ...messages,
          {
            role: "assistant",
            content: chunkValue
          }
        ]);
      } else {
        setMessages((messages) => {
          const lastMessage = messages[messages.length - 1];
          const updatedMessage = {
            ...lastMessage,
            content: lastMessage.content + chunkValue
          };
          return [...messages.slice(0, -1), updatedMessage];
        });
      }
    }
  };

  const handleReset = () => {
    setMessages([
      {
        role: "assistant",
        content: `Hi there! I'm Kalibot, an AI assistant. I can help you with things like answering questions, providing information, and helping with tasks. How can I help you?`
      }
    ]);
  };

  const handleSync = async () => {

    setCanSend(false);
    setSyncState(SyncState.Started);

    const response = await fetch("/api/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      setSyncState(SyncState.Failed);
      throw new Error(response.statusText);
    } else
    {
      // Poll for job to finish
      await response.text().then(async (id) => {
        let jobDone = false;
        while (!jobDone) {
          const pollResponse = await fetch(`/api/poll?id=${id}`, {
            method: "GET"
          });

          if (!pollResponse.ok) {
            setSyncState(SyncState.Failed);
            jobDone = true;
            throw new Error(pollResponse.statusText);
          } else {
            await pollResponse.text().then(async (status) => {
              if (status == "Task complete") {
                jobDone = true;
                setSyncState(SyncState.Successful);
              } else if (status == "No task with that id") {
                // Job not done yet wait a bit to poll again
                await sleep(15000);
              } else {
                // Job failed
                jobDone = true;
                console.error(status)
                setSyncState(SyncState.Failed);
              }
            });
          }
        }
      });
    }

    setCanSend(true);
  };

  const handleBannerClose = () => {
    setSyncState(SyncState.NotStarted);
  };

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content: `Hi there! I'm Kalibot, an AI assistant. I can help you with things like answering questions, providing information, and helping with tasks. How can I help you?`
      }
    ]);
  }, []);

  return (
    <>
      <Head>
        <title>Kalibot</title>
        <meta
          name="description"
          content="Chatbot for Kali"
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <link
          rel="icon"
          href="/favicon.ico"
        />
      </Head>

      <div className="flex flex-col h-screen">
        <Navbar />
        {syncState != SyncState.NotStarted && <AlertBanner 
          syncState={syncState}
          onBannerClose={handleBannerClose}/>}
        <div className="flex-1 overflow-auto sm:px-10 pb-4 sm:pb-10">
          <div className="max-w-[800px] mx-auto mt-4 sm:mt-12">
            <Chat
              messages={messages}
              loading={loading}
              onSend={handleSend}
              onReset={handleReset}
              onSync={handleSync}
              canSend={canSend}
            />
            <div ref={messagesEndRef} />
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
