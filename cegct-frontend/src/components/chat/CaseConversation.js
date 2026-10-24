import React, { useCallback, useEffect, useRef, useState } from "react";
import { apiRequest } from "../../services/api";
import { socket } from "../../services/socket";
import { formatDate } from "../../lib/utils";

const CaseConversation = ({ report }) => {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const endOfMessagesRef = useRef(null);

  const addMessage = useCallback((message) => {
    if (!message || String(message.report_id) !== String(report.id)) return;
    setMessages((current) => current.some((item) => item.id === message.id)
      ? current
      : [...current, message]);
  }, [report.id]);

  const loadConversation = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const result = await apiRequest(`/reports/${encodeURIComponent(report.id)}/messages`);
      setMessages((current) => {
        const combined = new Map((result.data || []).map((message) => [message.id, message]));
        current.forEach((message) => combined.set(message.id, message));
        return [...combined.values()].sort((left, right) => new Date(left.sent_at) - new Date(right.sent_at));
      });
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [report.id]);

  useEffect(() => {
    setMessages([]);
    setError("");
    loadConversation();

    const joinCaseRoom = () => socket.emit("join_report_room", report.id);
    const handleMessage = (message) => addMessage(message);
    socket.on("connect", joinCaseRoom);
    socket.on("chat:new_message", handleMessage);
    if (socket.connected) joinCaseRoom();

    return () => {
      socket.off("connect", joinCaseRoom);
      socket.off("chat:new_message", handleMessage);
      if (socket.connected) socket.emit("leave_report_room", report.id);
    };
  }, [report.id, addMessage, loadConversation]);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);

  const sendMessage = async (text = draft) => {
    const message = text.trim();
    if (!message || sending) return;
    setSending(true);
    setError("");
    try {
      const result = await apiRequest(`/reports/${encodeURIComponent(report.id)}/messages`, {
        method: "POST",
        body: JSON.stringify({ message }),
      });
      addMessage(result.data);
      if (text === draft) setDraft("");
    } catch {
      setError("Your reply could not be sent. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const caseNumberWasSent = messages.some((message) =>
    message.sender_role !== "CITIZEN" && message.message.includes(report.id),
  );
  const sendCaseNumber = () => sendMessage(
    `Your environmental report has been received. Your case number is ${report.id}. Please keep this number for reference. We will send you updates as the case is reviewed.`,
  );

  return (
    <section className="mb-7 overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 p-4 sm:p-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Citizen communication</p>
          <h2 className="mt-1 text-lg font-bold">Case conversation</h2>
          <p className="mt-1 text-sm text-gray-500">Reply to the reporter and share their case number: <b className="text-gray-800">{report.id}</b></p>
        </div>
        <button
          className="rounded-lg bg-[#185835] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#12452a] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={sending || caseNumberWasSent}
          onClick={sendCaseNumber}
          type="button"
        >
          {caseNumberWasSent ? "Case number sent" : "Send case number to citizen"}
        </button>
      </div>

      <div aria-live="polite" className="max-h-80 min-h-36 space-y-3 overflow-y-auto bg-gray-50 p-4 sm:p-5">
        {loading && <p className="text-sm text-gray-500">Loading conversation…</p>}
        {!loading && loadError && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" role="status">
            <span>Messages could not be loaded. Check your connection and try again.</span>
            <button className="font-semibold underline" onClick={loadConversation} type="button">Retry</button>
          </div>
        )}
        {!loading && messages.length === 0 && (
          <p className="rounded-lg border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-500">
            No messages yet. Use “Send case number to citizen” to acknowledge this report, or write a reply below.
          </p>
        )}
        {messages.map((message) => {
          const isCitizen = message.sender_role === "CITIZEN";
          return (
            <div className={`flex ${isCitizen ? "justify-start" : "justify-end"}`} key={message.id}>
              <article className={`max-w-[88%] rounded-xl px-4 py-3 shadow-sm sm:max-w-[75%] ${isCitizen ? "border border-gray-200 bg-white" : "bg-[#185835] text-white"}`}>
                <p className={`mb-1 text-xs font-bold ${isCitizen ? "text-gray-500" : "text-green-100"}`}>
                  {isCitizen ? message.sender_name || "Citizen" : `${message.sender_name || "Officer"} · Staff`}
                </p>
                <p className="whitespace-pre-wrap break-words text-sm">{message.message}</p>
                <time className={`mt-2 block text-right text-[11px] ${isCitizen ? "text-gray-400" : "text-green-100"}`}>
                  {formatDate(message.sent_at)}
                </time>
              </article>
            </div>
          );
        })}
        <div ref={endOfMessagesRef} />
      </div>

      <form
        className="border-t border-gray-200 p-4 sm:p-5"
        onSubmit={(event) => {
          event.preventDefault();
          sendMessage();
        }}
      >
        <label className="mb-2 block text-sm font-semibold" htmlFor="case-reply">Write a reply</label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <textarea
            className="min-h-20 flex-1 resize-y rounded-lg border border-gray-300 p-3 text-sm focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-100"
            id="case-reply"
            maxLength={4000}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Write a clear update for the citizen…"
            value={draft}
          />
          <button
            className="self-end rounded-lg bg-[#185835] px-5 py-3 text-sm font-semibold text-white hover:bg-[#12472a] disabled:cursor-not-allowed disabled:opacity-50 sm:self-stretch"
            disabled={!draft.trim() || sending}
            type="submit"
          >
            {sending ? "Sending…" : "Send reply"}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-700" role="alert">{error}</p>}
      </form>
    </section>
  );
};

export default CaseConversation;
