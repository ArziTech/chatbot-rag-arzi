"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Command, Paperclip, Send, X } from "lucide-react";
import {
  type ChangeEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useChat } from "@/features/chat";
import { useUserPreferences } from "@/providers/user-preferences-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AVAILABLE_MODELS, PROVIDERS } from "@/features/settings/types";

interface CommandItem {
  label: string;
  value: string;
  icon?: string;
}

const COMMANDS: CommandItem[] = [
  { label: "Clone UI", value: "/clone " },
  { label: "Write code", value: "/code " },
  { label: "Debug", value: "/debug " },
  { label: "Explain", value: "/explain " },
];

function TypingDots() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block h-1.5 w-1.5 rounded-full bg-muted-foreground"
          animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1, 0.8] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
}

export function AnimatedAIChat() {
  const [value, setValue] = useState("");
  const [showCommands, setShowCommands] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [attachments, setAttachments] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const commandsRef = useRef<HTMLDivElement>(null);

  const { preferences } = useUserPreferences();
  const [selectedProvider, setSelectedProvider] = useState(
    preferences?.defaultProvider || "openai",
  );
  const [selectedModel, setSelectedModel] = useState(
    preferences?.defaultModel || "gpt-4o",
  );

  // Update selected model when preferences load
  useEffect(() => {
    if (preferences) {
      setSelectedProvider(preferences.defaultProvider || "openai");
      setSelectedModel(preferences.defaultModel || "gpt-4o");
    }
  }, [preferences]);

  const modelsForProvider = AVAILABLE_MODELS.filter(
    (m) => m.provider === selectedProvider,
  );

  const { sendMessage, isTyping, conversationId, setConversationId } = useChat({
    conversationId: null,
  });

  // Persist conversationId to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("currentConversationId");
      if (stored) {
        setConversationId(stored);
      }
    }
  }, [setConversationId]);

  useEffect(() => {
    if (typeof window !== "undefined" && conversationId) {
      localStorage.setItem("currentConversationId", conversationId);
    }
  }, [conversationId]);

  const adjustHeight = (reset = false) => {
    const textarea = textareaRef.current;
    if (textarea) {
      if (reset) {
        textarea.style.height = "auto";
      }
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        commandsRef.current &&
        !commandsRef.current.contains(e.target as Node)
      ) {
        setShowCommands(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    if (newValue.startsWith("/") && newValue.length > 1) {
      setShowCommands(true);
      setSelectedIndex(0);
    } else if (newValue === "/") {
      setShowCommands(true);
      setSelectedIndex(0);
    } else {
      setShowCommands(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (showCommands) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < COMMANDS.length - 1 ? prev + 1 : prev,
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === "Tab" || e.key === "Enter") {
        e.preventDefault();
        const command = COMMANDS[selectedIndex];
        if (command) {
          setValue(command.value);
          setShowCommands(false);
          textareaRef.current?.focus();
        }
      } else if (e.key === "Escape") {
        setShowCommands(false);
      }
    }
  };

  const handleSend = async () => {
    if (!value.trim()) return;

    const messageContent = value;
    setValue("");
    adjustHeight(true);

    await sendMessage(messageContent, selectedModel, selectedProvider);
  };

  const handleAttachFile = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.txt,.docx";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        // Get presigned URL
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
          }),
        });

        if (!res.ok) throw new Error("Failed to get upload URL");

        const { documentId } = await res.json();

        // Upload to R2 via presigned URL (response contains presignedUrl)
        const data = await res.json();

        // Get presigned URL again for actual upload
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
          }),
        });

        if (!uploadRes.ok) throw new Error("Failed to get upload URL");

        const { presignedUrl } = await uploadRes.json();

        // Upload to R2
        await fetch(presignedUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });

        setAttachments((prev) => [
          ...prev,
          { id: documentId, name: file.name },
        ]);
      } catch (error) {
        console.error("Upload failed:", error);
      }
    };
    input.click();
  };

  // Alias for compatibility
  const handleAttachment = handleAttachFile;

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const filteredCommands = COMMANDS.filter((cmd) =>
    cmd.label.toLowerCase().includes(value.slice(1).toLowerCase()),
  );

  return (
    <div className="lab-bg relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-100 via-white to-zinc-200 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-950">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 h-1/2 w-1/2 rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-transparent blur-3xl" />
        <div className="absolute -bottom-1/4 -right-1/4 h-1/2 w-1/2 rounded-full bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 flex w-full max-w-2xl flex-col gap-6 px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="bg-gradient-to-b from-zinc-900 to-zinc-600 bg-clip-text text-3xl font-bold tracking-tight text-transparent dark:from-zinc-100 dark:to-zinc-400">
            How can I help today?
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Ask me anything about your documents
          </p>
        </motion.div>

        {/* Command suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2"
        >
          {["Analyze code", "Write tests", "Debug error", "Review PR"].map(
            (cmd) => (
              <button
                key={cmd}
                onClick={() => setValue(cmd)}
                className="rounded-full border border-zinc-200 bg-white/80 px-4 py-1.5 text-sm font-medium text-zinc-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-300 dark:hover:bg-zinc-900"
              >
                {cmd}
              </button>
            ),
          )}
        </motion.div>

        {/* Chat input area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative"
        >
          <div className="relative rounded-2xl border border-zinc-200 bg-white/90 shadow-xl backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/90">
            {/* Attachments */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 border-b border-zinc-200 p-3 dark:border-zinc-800">
                {attachments.map((attachment) => (
                  <span
                    key={attachment.id}
                    className="flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                  >
                    <Paperclip className="h-3 w-3" />
                    {attachment.name}
                    <button
                      onClick={() => removeAttachment(attachment.id)}
                      className="ml-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Command palette */}
            <AnimatePresence>
              {showCommands && filteredCommands.length > 0 && (
                <motion.div
                  ref={commandsRef}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute bottom-full left-0 right-0 mb-2 max-h-64 overflow-auto rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
                >
                  {filteredCommands.map((command, index) => (
                    <button
                      key={command.value}
                      onClick={() => {
                        setValue(command.value);
                        setShowCommands(false);
                        textareaRef.current?.focus();
                      }}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                        index === selectedIndex
                          ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                          : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800/50"
                      }`}
                    >
                      <Command className="h-4 w-4" />
                      {command.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-end gap-2 p-3">
              {/* Provider selector */}
              <Select
                value={selectedProvider}
                onValueChange={(v) => {
                  setSelectedProvider(v);
                  const first = AVAILABLE_MODELS.find((m) => m.provider === v);
                  if (first) setSelectedModel(first.id);
                }}
              >
                <SelectTrigger className="w-[140px] h-[44px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDERS.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Model selector */}
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-[160px] h-[44px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {modelsForProvider.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleAttachment}
                  className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                >
                  <Paperclip className="h-5 w-5" />
                </button>
              </div>

              <div className="relative flex-1">
                <textarea
                  ref={textareaRef}
                  value={value}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask zap a question..."
                  rows={1}
                  className="max-h-[200px] min-h-[44px] w-full resize-none rounded-lg border-0 bg-transparent px-3 py-2.5 pr-10 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-0 focus:ring-zinc-200 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:ring-zinc-800"
                  style={{ fieldSizing: "content" } as React.CSSProperties}
                />
              </div>

              <button
                onClick={handleSend}
                disabled={!value.trim() || isTyping}
                className="rounded-lg bg-zinc-900 p-2.5 text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>

            {/* Typing indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 border-t border-zinc-200 px-4 py-3 dark:border-zinc-800"
                >
                  <TypingDots />
                  <span className="text-sm text-muted-foreground">
                    Thinking...
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p className="mt-2 text-center text-xs text-muted-foreground">
            Press{" "}
            <kbd className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              /
            </kbd>{" "}
            for commands,{" "}
            <kbd className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              Tab
            </kbd>{" "}
            to select
          </p>
        </motion.div>
      </div>
    </div>
  );
}
