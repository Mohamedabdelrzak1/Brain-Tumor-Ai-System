import { Router } from "express";
import { authMiddleware } from "../lib/auth";

const router = Router();

type ChatMessage = {
  id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

type ChatSession = {
  id: string;
  userId: number;
  title: string;
  createdAt: string;
};

// Simple in-memory mock store (replace later with DB + service layer).
const sessions = new Map<string, ChatSession>();
const messagesBySession = new Map<string, ChatMessage[]>();

function makeId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1e9)}`;
}

router.post("/session", authMiddleware, async (req, res) => {
  const userId = (req as any).user.userId as number;
  const title = (req.body?.title as string) || "New chat";

  const id = makeId("sess");
  const session: ChatSession = {
    id,
    userId,
    title,
    createdAt: new Date().toISOString(),
  };

  sessions.set(id, session);
  messagesBySession.set(id, []);

  res.status(201).json({ session });
});

router.post("/message", authMiddleware, async (req, res) => {
  const userId = (req as any).user.userId as number;
  const sessionId = req.body?.sessionId as string | undefined;
  const content = req.body?.content as string | undefined;

  if (!sessionId || !content) {
    res.status(400).json({ message: "sessionId and content are required" });
    return;
  }

  const session = sessions.get(sessionId);
  if (!session || session.userId !== userId) {
    res.status(404).json({ message: "Session not found" });
    return;
  }

  const userMsg: ChatMessage = {
    id: makeId("msg"),
    sessionId,
    role: "user",
    content,
    createdAt: new Date().toISOString(),
  };

  const assistantMsg: ChatMessage = {
    id: makeId("msg"),
    sessionId,
    role: "assistant",
    content:
      "Mock assistant reply: I can help interpret your scan results and explain the next steps. (This endpoint is currently mocked.)",
    createdAt: new Date().toISOString(),
  };

  const arr = messagesBySession.get(sessionId) || [];
  arr.push(userMsg, assistantMsg);
  messagesBySession.set(sessionId, arr);

  res.json({ messages: [userMsg, assistantMsg] });
});

router.get("/:sessionId", authMiddleware, async (req, res) => {
  const userId = (req as any).user.userId as number;
  const sessionId = req.params.sessionId;
  const session = sessions.get(sessionId);

  if (!session || session.userId !== userId) {
    res.status(404).json({ message: "Session not found" });
    return;
  }

  const messages = messagesBySession.get(sessionId) || [];
  res.json({ session, messages });
});

export default router;

