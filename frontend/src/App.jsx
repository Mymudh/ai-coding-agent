import { useEffect, useMemo, useState } from "react";
import "./index.css";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const features = [
  {
    id: "generate",
    icon: "⚡",
    title: "Generate Code",
    text: "Describe what you want to build and let the AI create the solution.",
    action: "Generate"
  },
  {
    id: "analyze",
    icon: "⌕",
    title: "Analyze Code",
    text: "Review code for bugs, quality issues, performance and improvements.",
    action: "Analyze"
  },
  {
    id: "fix",
    icon: "✦",
    title: "Fix Errors",
    text: "Paste an error or broken code and get an intelligent correction.",
    action: "Fix Code"
  },
  {
    id: "build",
    icon: "🚀",
    title: "Build Faster",
    text: "Turn ideas into working applications with an AI coding workflow.",
    action: "Generate"
  }
];

const examples = [
  "Build a FastAPI REST API with authentication",
  "Build a React dashboard with a sidebar",
  "Fix this Python code and explain the error",
  "Create a machine learning prediction API",
  "Build a RAG chatbot using FastAPI",
  "Create a PostgreSQL CRUD API"
];

const faqs = [
  {
    question: "What is AI Coding Agent?",
    answer:
      "AI Coding Agent is an intelligent development workspace designed to help you generate, analyze, debug and improve software using AI."
  },
  {
    question: "Can I generate complete code?",
    answer:
      "Yes. Describe the application or feature you want to build and the coding workspace can send the request to your AI backend."
  },
  {
    question: "Can I analyze existing code?",
    answer:
      "Yes. Select Analyze and provide the code or problem you want the AI to inspect."
  },
  {
    question: "Can the agent fix errors?",
    answer:
      "Yes. Select Fix Code, provide the broken code or error message, and the AI can return an explanation and corrected solution."
  },
  {
    question: "Does the frontend connect to FastAPI?",
    answer:
      "Yes. The frontend is configured to communicate with the FastAPI backend running on port 8000 during local development."
  },
  {
    question: "Can this project be deployed?",
    answer:
      "Yes. The React frontend can be deployed separately from the FastAPI backend."
  }
];

function App() {
  const [activeTab, setActiveTab] = useState("generate");
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    checkBackend();

    let scrollTimer;

    const handleScroll = () => {
      document.documentElement.classList.add("is-scrolling");

      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => {
        document.documentElement.classList.remove("is-scrolling");
      }, 120);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    const handleKey = (event) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        setSearchOpen(true);

        setTimeout(() => {
          document.getElementById("global-search")?.focus();
        }, 50);
      }

      if (event.key === "Escape") {
        setSearchOpen(false);
        setSearch("");
      }
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("scroll", handleScroll);
      window.clearTimeout(scrollTimer);
      document.documentElement.classList.remove("is-scrolling");
    };
  }, []);

  const filteredResults = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return [
        ...features.map((item) => ({
          type: "feature",
          title: item.title,
          text: item.text,
          id: item.id
        })),
        {
          type: "section",
          title: "AI Workspace",
          text: "Open the coding workspace"
        },
        {
          type: "section",
          title: "Frequently Asked Questions",
          text: "Open documentation and FAQ"
        }
      ];
    }

    return [
      ...features
        .filter(
          (item) =>
            item.title.toLowerCase().includes(query) ||
            item.text.toLowerCase().includes(query)
        )
        .map((item) => ({
          type: "feature",
          title: item.title,
          text: item.text,
          id: item.id
        })),
      ...examples
        .filter((item) => item.toLowerCase().includes(query))
        .map((item) => ({
          type: "example",
          title: item,
          text: "Example coding request"
        })),
      ...faqs
        .filter(
          (item) =>
            item.question.toLowerCase().includes(query) ||
            item.answer.toLowerCase().includes(query)
        )
        .map((item) => ({
          type: "faq",
          title: item.question,
          text: item.answer
        }))
    ];
  }, [search]);

  async function checkBackend() {
    try {
      const controller = new AbortController();

      const timeout = setTimeout(() => {
        controller.abort();
      }, 4000);

      const result = await fetch(`${API_URL}/health`, {
        method: "GET",
        signal: controller.signal
      });

      clearTimeout(timeout);
      setBackendOnline(result.ok);
    } catch {
      setBackendOnline(false);
    }
  }

  function scrollToSection(id) {
    const element = document.getElementById(id);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }

    setMobileMenu(false);
  }

  function openWorkspace(tab = "generate") {
    setActiveTab(tab);
    scrollToSection("workspace");
  }

  function selectSearchResult(result) {
    setSearchOpen(false);

    if (result.type === "feature") {
      openWorkspace(result.id);
      return;
    }

    if (result.type === "example") {
      setPrompt(result.title);
      setActiveTab("generate");
      scrollToSection("workspace");
      return;
    }

    if (result.type === "faq") {
      scrollToSection("faq");
      return;
    }

    if (result.type === "section") {
      if (result.title === "AI Workspace") {
        scrollToSection("workspace");
      } else {
        scrollToSection("faq");
      }
    }
  }

  function chooseExample(example) {
    setPrompt(example);
    setActiveTab("generate");
    scrollToSection("workspace");
  }

  function clearWorkspace() {
    setPrompt("");
    setResponse("");
  }

  async function runAgent() {
    if (!prompt.trim()) {
      setResponse("Please describe what you want the AI coding agent to do.");
      return;
    }

    setLoading(true);
    setResponse("");

    const endpoint =
      activeTab === "generate"
        ? "/generate"
        : activeTab === "analyze"
          ? "/analyze"
          : "/fix";

    try {
      const result = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: prompt.trim()
        })
      });

      if (!result.ok) {
        throw new Error(`Backend returned ${result.status}`);
      }

      const data = await result.json();

      const output =
        data.response ||
        data.result ||
        data.answer ||
        data.output ||
        data.message;

      setResponse(
        output
          ? String(output)
          : JSON.stringify(data, null, 2)
      );

      setBackendOnline(true);
    } catch (error) {
      setBackendOnline(false);

      setResponse(
        `Backend connection is not available for this operation.

Your frontend is working correctly.

Backend:
${API_URL}

Requested operation:
${activeTab}

Error:
${error.message}

Make sure your FastAPI backend is running and that the corresponding endpoint exists.`
      );
    } finally {
      setLoading(false);
    }
  }

  function handlePromptKey(event) {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      runAgent();
    }
  }

  return (
    <div className="app">
      <style>{`
        html,
        body,
        #root {
          scroll-behavior: auto !important;
          overscroll-behavior-y: auto;
        }

        html.is-scrolling .professional-workspace-card {
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
        }

        html.is-scrolling .professional-workspace-card::after,
        html.is-scrolling .toolbar-live,
        html.is-scrolling .workspace-loading-orb,
        html.is-scrolling .workspace-loading-orb::before,
        html.is-scrolling .workspace-loading-orb::after {
          animation-play-state: paused !important;
        }

        html.is-scrolling .professional-workspace-card,
        html.is-scrolling .search-wrapper {
          transition: none !important;
        }

        .workspace-section.enhanced-workspace {
          position: relative;
          overflow: hidden;
        }

        .workspace-section.enhanced-workspace::before {
          content: "";
          position: absolute;
          width: 520px;
          height: 520px;
          right: -240px;
          top: 100px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(91, 92, 255, 0.16),
            transparent 68%
          );
          pointer-events: none;
        }

        .workspace-section.enhanced-workspace::after {
          content: "";
          position: absolute;
          width: 420px;
          height: 420px;
          left: -240px;
          bottom: 80px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(49, 130, 246, 0.10),
            transparent 70%
          );
          pointer-events: none;
        }

        .enhanced-workspace .workspace-top {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 30px;
          margin-bottom: 28px;
        }

        .enhanced-workspace .workspace-top h2 {
          font-size: clamp(38px, 5vw, 64px);
          line-height: 1.02;
          letter-spacing: -0.045em;
          margin: 10px 0 14px;
        }

        .enhanced-workspace .workspace-top p {
          max-width: 720px;
          font-size: 17px;
          line-height: 1.7;
        }

        .workspace-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .workspace-status-pill {
          display: flex;
          align-items: center;
          gap: 9px;
          min-height: 40px;
          padding: 0 14px;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 999px;
          background: rgba(8, 12, 25, 0.72);
          color: #8e9bb8;
          font-size: 12px;
          font-weight: 600;
        }

        .workspace-status-pill .status-indicator {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #f04f67;
          box-shadow: 0 0 12px rgba(240,79,103,.65);
        }

        .workspace-status-pill.online .status-indicator {
          background: #34d399;
          box-shadow: 0 0 14px rgba(52,211,153,.7);
        }

        .workspace-clear {
          min-height: 40px;
          padding: 0 15px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(8, 12, 25, 0.8);
          color: #aeb8cd;
          cursor: pointer;
          transition: .2s ease;
        }

        .workspace-clear:hover {
          color: white;
          border-color: rgba(105,126,255,.5);
          transform: translateY(-1px);
        }

        .professional-workspace-card {
          position: relative;
          z-index: 3;
          display: grid;
          grid-template-columns: 220px minmax(0, 1fr);
          min-height: 720px;
          overflow: hidden;
          border: 1px solid rgba(120,140,190,.18);
          border-radius: 24px;
          background:
            linear-gradient(
              145deg,
              rgba(13,19,36,.98),
              rgba(5,9,20,.98)
            );
          box-shadow:
            0 35px 100px rgba(0,0,0,.38),
            inset 0 1px 0 rgba(255,255,255,.035);
          backdrop-filter: blur(22px);
        }

        .professional-sidebar {
          padding: 22px 15px;
          border-right: 1px solid rgba(255,255,255,.07);
          background: rgba(6,10,22,.72);
        }

        .professional-sidebar-label {
          padding: 4px 12px 13px;
          color: #61708d;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .18em;
        }

        .professional-tab {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          min-height: 48px;
          margin-bottom: 7px;
          padding: 0 13px;
          border: 1px solid transparent;
          border-radius: 12px;
          background: transparent;
          color: #8e9bb5;
          text-align: left;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: .22s ease;
        }

        .professional-tab:hover {
          color: #e8edff;
          background: rgba(91,92,255,.08);
        }

        .professional-tab.active {
          color: white;
          border-color: rgba(101,115,255,.22);
          background:
            linear-gradient(
              135deg,
              rgba(88,92,255,.20),
              rgba(69,117,255,.08)
            );
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,.04),
            0 8px 25px rgba(49,72,190,.12);
        }

        .professional-tab-icon {
          width: 30px;
          height: 30px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          background: rgba(255,255,255,.045);
          font-size: 14px;
        }

        .professional-tab.active .professional-tab-icon {
          background: linear-gradient(135deg,#6675ff,#8b5cf6);
          box-shadow: 0 7px 20px rgba(91,92,255,.28);
        }

        .professional-divider {
          height: 1px;
          margin: 20px 10px;
          background: rgba(255,255,255,.07);
        }

        .professional-example {
          width: 100%;
          padding: 9px 12px;
          border: 0;
          border-radius: 9px;
          background: transparent;
          color: #66738e;
          text-align: left;
          font-size: 11px;
          line-height: 1.5;
          cursor: pointer;
          transition: .2s ease;
        }

        .professional-example:hover {
          color: #c9d2e9;
          background: rgba(255,255,255,.035);
        }

        .professional-main {
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        .professional-toolbar {
          min-height: 66px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 0 22px;
          border-bottom: 1px solid rgba(255,255,255,.07);
          background: rgba(7,11,24,.72);
        }

        .toolbar-left,
        .toolbar-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .toolbar-title {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #e9edff;
          font-size: 14px;
          font-weight: 700;
        }

        .toolbar-live {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #60a5fa;
          box-shadow: 0 0 12px rgba(96,165,250,.75);
          animation: workspacePulse 2s infinite;
        }

        .toolbar-chip {
          padding: 6px 9px;
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 7px;
          background: rgba(255,255,255,.035);
          color: #71809d;
          font-size: 10px;
          font-weight: 700;
        }

        .toolbar-model {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 7px 11px;
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 8px;
          background: #0b1122;
          color: #aab6cf;
          font-size: 11px;
        }

        .workspace-editor {
          padding: 24px;
          border-bottom: 1px solid rgba(255,255,255,.07);
        }

        .editor-topline {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 13px;
        }

        .editor-label {
          color: #7181a2;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .17em;
        }

        .editor-hint {
          color: #56637d;
          font-size: 10px;
        }

        .professional-textarea {
          width: 100%;
          min-height: 245px;
          resize: vertical;
          padding: 22px;
          border: 1px solid rgba(112,131,177,.18);
          border-radius: 15px;
          outline: none;
          background:
            linear-gradient(
              180deg,
              rgba(4,8,18,.95),
              rgba(7,11,23,.9)
            );
          color: #eaf0ff;
          font-family: "JetBrains Mono", "Cascadia Code", Consolas, monospace;
          font-size: 14px;
          line-height: 1.8;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,.025),
            0 10px 35px rgba(0,0,0,.16);
          transition: .2s ease;
        }

        .professional-textarea::placeholder {
          color: #46536d;
        }

        .professional-textarea:focus {
          border-color: rgba(99,111,255,.58);
          box-shadow:
            0 0 0 3px rgba(91,92,255,.08),
            inset 0 1px 0 rgba(255,255,255,.025);
        }

        .editor-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 12px;
        }

        .editor-info {
          display: flex;
          align-items: center;
          gap: 15px;
          color: #53617c;
          font-size: 11px;
        }

        .run-agent-button {
          min-width: 145px;
          min-height: 45px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          padding: 0 18px;
          border: 0;
          border-radius: 11px;
          background: linear-gradient(135deg,#5d73ff,#7958ed);
          color: white;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          box-shadow:
            0 12px 30px rgba(79,83,220,.28),
            inset 0 1px 0 rgba(255,255,255,.2);
          transition: .22s ease;
        }

        .run-agent-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow:
            0 17px 35px rgba(79,83,220,.36),
            inset 0 1px 0 rgba(255,255,255,.2);
        }

        .run-agent-button:disabled {
          opacity: .65;
          cursor: wait;
        }

        .response-panel {
          flex: 1;
          min-height: 320px;
          display: flex;
          flex-direction: column;
          padding: 20px 24px 24px;
        }

        .response-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .response-label {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #7282a3;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .16em;
        }

        .response-live {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #a78bfa;
          box-shadow: 0 0 12px rgba(167,139,250,.7);
        }

        .response-copy {
          padding: 7px 11px;
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 8px;
          background: rgba(255,255,255,.025);
          color: #687590;
          font-size: 10px;
          cursor: pointer;
        }

        .response-copy:hover {
          color: white;
          border-color: rgba(112,128,255,.35);
        }

        .professional-response-box {
          flex: 1;
          min-height: 250px;
          overflow: auto;
          padding: 22px;
          border: 1px solid rgba(112,131,177,.14);
          border-radius: 15px;
          background: #050913;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.02);
        }

        .professional-response-box pre {
          margin: 0;
          white-space: pre-wrap;
          word-break: break-word;
          color: #cbd5e1;
          font-family: "JetBrains Mono", "Cascadia Code", Consolas, monospace;
          font-size: 13px;
          line-height: 1.75;
        }

        .workspace-empty {
          height: 100%;
          min-height: 245px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          text-align: center;
          gap: 10px;
          color: #55627c;
        }

        .workspace-empty-orb {
          width: 55px;
          height: 55px;
          display: grid;
          place-items: center;
          margin-bottom: 5px;
          border: 1px solid rgba(112,128,255,.22);
          border-radius: 17px;
          background:
            radial-gradient(
              circle at 30% 25%,
              rgba(130,143,255,.4),
              rgba(76,65,185,.16)
            );
          color: #b9c1ff;
          font-weight: 900;
          box-shadow: 0 0 40px rgba(84,88,255,.12);
        }

        .workspace-empty strong {
          color: #b8c2d8;
          font-size: 13px;
        }

        .workspace-empty span {
          max-width: 420px;
          color: #53617b;
          font-size: 11px;
          line-height: 1.6;
        }

        .workspace-loading {
          height: 100%;
          min-height: 245px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 17px;
        }

        .workspace-loading-orb {
          width: 52px;
          height: 52px;
          position: relative;
          display: grid;
          place-items: center;
          border-radius: 16px;
          background: linear-gradient(135deg,#6275ff,#7958ec);
          color: white;
          font-weight: 900;
          box-shadow: 0 0 35px rgba(99,102,241,.3);
          animation: workspaceFloat 1.7s ease-in-out infinite;
        }

        .workspace-loading-orb::before,
        .workspace-loading-orb::after {
          content: "";
          position: absolute;
          inset: -7px;
          border: 1px solid rgba(104,115,255,.28);
          border-radius: 19px;
          animation: workspaceRing 1.7s linear infinite;
        }

        .workspace-loading-orb::after {
          inset: -14px;
          opacity: .5;
          animation-delay: .35s;
        }

        .workspace-loading-copy strong {
          display: block;
          color: #dce4fa;
          font-size: 13px;
          margin-bottom: 5px;
        }

        .workspace-loading-copy span {
          color: #5d6a84;
          font-size: 11px;
        }

        .workspace-template-row {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding: 1px 0 2px;
          margin-top: 13px;
        }

        .workspace-template {
          flex-shrink: 0;
          padding: 8px 11px;
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 8px;
          background: rgba(255,255,255,.025);
          color: #67748e;
          font-size: 10px;
          cursor: pointer;
          transition: .2s ease;
        }

        .workspace-template:hover {
          color: #c8d1e6;
          border-color: rgba(101,116,255,.3);
          background: rgba(101,116,255,.06);
        }

        @keyframes workspacePulse {
          0%,100% {
            opacity: .55;
            transform: scale(.85);
          }
          50% {
            opacity: 1;
            transform: scale(1.15);
          }
        }

        @keyframes workspaceFloat {
          0%,100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }

        @keyframes workspaceRing {
          0% {
            transform: scale(.8);
            opacity: .7;
          }
          100% {
            transform: scale(1.15);
            opacity: 0;
          }
        }

        @media (max-width: 900px) {
          .professional-workspace-card {
            grid-template-columns: 1fr;
          }

          .professional-sidebar {
            border-right: 0;
            border-bottom: 1px solid rgba(255,255,255,.07);
          }

          .professional-sidebar .professional-example {
            display: none;
          }

          .professional-sidebar-label {
            display: none;
          }

          .professional-sidebar {
            display: flex;
            gap: 7px;
            padding: 12px;
          }

          .professional-tab {
            margin: 0;
            justify-content: center;
          }

          .professional-tab span:last-child {
            display: none;
          }

          .professional-divider {
            display: none;
          }

          .enhanced-workspace .workspace-top {
            align-items: flex-start;
            flex-direction: column;
          }
        }

        @media (max-width: 620px) {
          .professional-toolbar {
            padding: 0 14px;
          }

          .toolbar-chip {
            display: none;
          }

          .toolbar-model {
            font-size: 10px;
          }

          .workspace-editor,
          .response-panel {
            padding-left: 14px;
            padding-right: 14px;
          }

          .editor-footer {
            align-items: flex-start;
            flex-direction: column;
          }

          .run-agent-button {
            width: 100%;
          }

          .workspace-actions {
            width: 100%;
          }

          .workspace-status-pill {
            flex: 1;
          }

          .workspace-clear {
            flex-shrink: 0;
          }
        }


        /* Requested workspace-only visual enhancements */
        .enhanced-workspace .workspace-top h2 {
          font-size: clamp(48px, 6vw, 78px) !important;
          line-height: .98 !important;
          letter-spacing: -0.055em !important;
          font-weight: 900 !important;
          text-wrap: balance;
          text-shadow: 0 12px 45px rgba(0,0,0,.28);
        }

        .enhanced-workspace .workspace-top p {
          font-size: 18px !important;
          color: #8796b5 !important;
        }

        .professional-workspace-card {
          isolation: isolate;
          transform: perspective(1800px) rotateX(.35deg);
          transform-style: preserve-3d;
          border-color: rgba(117,139,255,.22) !important;
          box-shadow:
            0 42px 120px rgba(0,0,0,.45),
            0 0 0 1px rgba(100,124,255,.05),
            inset 0 1px 0 rgba(255,255,255,.05) !important;
        }

        .professional-workspace-card::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          opacity: .52;
          background-image:
            linear-gradient(rgba(91,126,255,.055) 1px, transparent 1px),
            linear-gradient(90deg, rgba(91,126,255,.055) 1px, transparent 1px);
          background-size: 42px 42px;
          transform: perspective(900px) rotateX(58deg) translateY(22%);
          transform-origin: bottom center;
          mask-image: linear-gradient(to top, rgba(0,0,0,.9), transparent 72%);
        }

        .professional-workspace-card::after {
          content: "";
          position: absolute;
          left: 8%;
          right: 8%;
          top: 0;
          height: 2px;
          z-index: 8;
          pointer-events: none;
          background: linear-gradient(90deg, transparent, rgba(95,144,255,.9), rgba(164,111,255,.9), transparent);
          box-shadow: 0 0 22px rgba(91,124,255,.42);
          animation: workspaceScanLine 5s ease-in-out infinite;
        }

        .professional-main,
        .professional-sidebar {
          position: relative;
          z-index: 2;
        }

        .professional-tab,
        .professional-example,
        .workspace-template,
        .run-agent-button,
        .workspace-clear,
        .response-copy {
          -webkit-tap-highlight-color: transparent;
        }

        .professional-tab:hover {
          transform: translateX(4px);
        }

        .professional-textarea {
          min-height: 255px !important;
          background:
            linear-gradient(rgba(91,126,255,.028) 1px, transparent 1px),
            linear-gradient(90deg, rgba(91,126,255,.028) 1px, transparent 1px),
            linear-gradient(180deg, rgba(4,8,18,.97), rgba(7,11,23,.94)) !important;
          background-size: 28px 28px, 28px 28px, auto !important;
        }

        .search-section {
          padding: 46px 9% 72px !important;
          position: relative;
          z-index: 20;
        }

        .search-heading {
          max-width: 680px;
          margin: 0 auto 18px;
          text-align: center;
        }

        .search-heading h2 {
          margin: 8px 0 0 !important;
          font-size: clamp(28px, 3vw, 42px) !important;
          line-height: 1.05 !important;
          font-weight: 850 !important;
          letter-spacing: -.035em !important;
        }

        .search-wrapper {
          width: min(620px, 100%);
          height: 52px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 10px 0 14px;
          position: relative;
          border: 1px solid rgba(117,139,255,.22);
          border-radius: 14px;
          background: linear-gradient(145deg, rgba(13,19,36,.94), rgba(6,10,21,.96));
          box-shadow:
            0 18px 55px rgba(0,0,0,.28),
            0 0 0 1px rgba(255,255,255,.025) inset,
            0 8px 0 rgba(19,29,58,.38);
          transform: perspective(900px) rotateX(1.5deg);
          transition: border-color .22s ease, box-shadow .22s ease, transform .22s ease;
        }

        .search-wrapper::before {
          content: "";
          position: absolute;
          left: 12%;
          right: 12%;
          bottom: -9px;
          height: 12px;
          border-radius: 50%;
          background: radial-gradient(ellipse, rgba(88,111,255,.22), transparent 70%);
          filter: blur(6px);
          pointer-events: none;
          z-index: -1;
        }

        .search-wrapper:focus-within {
          border-color: rgba(111,137,255,.62);
          transform: perspective(900px) rotateX(0deg) translateY(-2px);
          box-shadow:
            0 24px 65px rgba(0,0,0,.35),
            0 0 0 3px rgba(91,92,255,.08),
            inset 0 1px 0 rgba(255,255,255,.05);
        }

        .search-icon {
          width: 28px;
          height: 28px;
          display: grid;
          place-items: center;
          flex: 0 0 28px;
          border: 1px solid rgba(103,135,255,.18);
          border-radius: 8px;
          background: rgba(84,111,221,.10);
          color: #79a0ff;
          font-size: 17px !important;
        }

        .search-wrapper input {
          min-width: 0;
          flex: 1;
          height: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          color: #eaf0ff;
          font-size: 13px;
          font-weight: 550;
        }

        .search-wrapper input::placeholder {
          color: #5e6d8a;
        }

        .search-shortcut {
          padding: 5px 8px !important;
          border: 1px solid rgba(255,255,255,.08) !important;
          border-radius: 7px !important;
          background: rgba(255,255,255,.025) !important;
          color: #697791 !important;
          font-size: 9px !important;
          white-space: nowrap;
        }

        .search-clear {
          width: 26px;
          height: 26px;
          display: grid;
          place-items: center;
          border: 0;
          border-radius: 7px;
          background: transparent;
          color: #71809b;
          cursor: pointer;
          font-size: 17px;
        }

        .search-clear:hover {
          color: white;
          background: rgba(255,255,255,.05);
        }

        .search-results {
          width: min(620px, 100%);
          max-height: 360px;
          overflow: auto;
          margin: 10px auto 0;
          padding: 8px;
          border: 1px solid rgba(117,139,255,.18);
          border-radius: 14px;
          background: rgba(6,10,21,.97);
          box-shadow: 0 25px 80px rgba(0,0,0,.42);
          backdrop-filter: blur(20px);
        }

        .search-results-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 7px 9px 9px;
          color: #61708d;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: .12em;
          font-weight: 800;
        }

        .search-results-top button {
          border: 0;
          background: transparent;
          color: #6f7d98;
          font-size: 10px;
          cursor: pointer;
        }

        .search-result {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          border: 1px solid transparent;
          border-radius: 10px;
          background: transparent;
          color: white;
          text-align: left;
          cursor: pointer;
          transition: .18s ease;
        }

        .search-result:hover {
          border-color: rgba(102,125,255,.16);
          background: rgba(91,110,255,.08);
          transform: translateX(2px);
        }

        .result-icon {
          width: 28px;
          height: 28px;
          display: grid;
          place-items: center;
          flex: 0 0 28px;
          border-radius: 8px;
          background: rgba(88,108,219,.12);
          color: #7d9fff;
          font-size: 12px;
        }

        .result-content {
          min-width: 0;
          flex: 1;
        }

        .result-content strong,
        .result-content small {
          display: block;
        }

        .result-content strong {
          overflow: hidden;
          color: #dce5fb;
          font-size: 12px;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .result-content small {
          overflow: hidden;
          margin-top: 3px;
          color: #61708d;
          font-size: 10px;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .result-arrow {
          color: #6f91ff;
          font-size: 14px;
        }

        .no-results {
          padding: 34px 16px;
          text-align: center;
          color: #63708a;
        }

        .no-results > div {
          width: 34px;
          height: 34px;
          margin: 0 auto 10px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          background: rgba(88,108,219,.10);
          color: #7193ff;
        }

        .no-results strong,
        .no-results span {
          display: block;
        }

        .no-results strong {
          color: #aab6cf;
          font-size: 12px;
        }

        .no-results span {
          margin-top: 5px;
          font-size: 10px;
        }

        @keyframes workspaceScanLine {
          0%, 100% { transform: translateX(-10%); opacity: .25; }
          50% { transform: translateX(10%); opacity: 1; }
        }

        @media (max-width: 900px) {
          .enhanced-workspace .workspace-top h2 {
            font-size: clamp(42px, 8vw, 62px) !important;
          }

          .professional-workspace-card {
            transform: none;
          }
        }

        @media (max-width: 620px) {
          .enhanced-workspace .workspace-top h2 {
            font-size: 42px !important;
          }

          .search-section {
            padding-left: 5% !important;
            padding-right: 5% !important;
          }

          .search-wrapper {
            height: 50px;
          }

          .search-shortcut {
            display: none;
          }
        }

        /* Reference-inspired search + workspace polish */
        .search-section {
          padding-top: 58px !important;
          padding-bottom: 86px !important;
        }

        .search-heading {
          margin-bottom: 24px !important;
        }

        .search-heading .eyebrow {
          letter-spacing: .18em !important;
          font-size: 9px !important;
          color: #6f8fff !important;
        }

        .search-heading h2 {
          font-size: clamp(30px, 3.6vw, 46px) !important;
          letter-spacing: -.045em !important;
          margin-top: 10px !important;
        }

        .search-wrapper {
          width: min(820px, 100%) !important;
          min-height: 64px !important;
          height: 64px !important;
          padding: 0 14px 0 16px !important;
          gap: 12px !important;
          border-radius: 18px !important;
          border-color: rgba(103, 132, 255, .30) !important;
          background:
            linear-gradient(135deg, rgba(13,20,39,.98), rgba(5,9,20,.98)) !important;
          box-shadow:
            0 24px 70px rgba(0,0,0,.32),
            0 0 0 1px rgba(255,255,255,.025) inset,
            0 0 45px rgba(72,93,255,.07) !important;
          transform: none !important;
        }

        .search-wrapper::before {
          left: 10% !important;
          right: 10% !important;
          bottom: -14px !important;
          height: 18px !important;
          opacity: .8 !important;
        }

        .search-wrapper:focus-within {
          border-color: rgba(111,137,255,.68) !important;
          transform: translateY(-1px) !important;
          box-shadow:
            0 28px 80px rgba(0,0,0,.38),
            0 0 0 3px rgba(91,92,255,.09),
            0 0 45px rgba(72,93,255,.10),
            inset 0 1px 0 rgba(255,255,255,.05) !important;
        }

        .search-icon {
          width: 34px !important;
          height: 34px !important;
          flex-basis: 34px !important;
          border-radius: 10px !important;
          font-size: 18px !important;
          background: rgba(79,105,220,.12) !important;
          color: #86a5ff !important;
        }

        .search-wrapper input {
          font-size: 15px !important;
          font-weight: 600 !important;
          letter-spacing: -.01em !important;
        }

        .search-wrapper input::placeholder {
          color: #6b7894 !important;
        }

        .search-shortcut {
          min-width: 52px !important;
          text-align: center !important;
          padding: 7px 9px !important;
          border-radius: 8px !important;
          color: #73819d !important;
        }

        .search-clear {
          width: 30px !important;
          height: 30px !important;
        }

        .search-results {
          width: min(820px, 100%) !important;
          max-height: 390px !important;
          margin-top: 12px !important;
          padding: 10px !important;
          border: 1px solid rgba(103,132,255,.20) !important;
          border-radius: 18px !important;
          background: rgba(5,9,20,.985) !important;
          box-shadow:
            0 30px 90px rgba(0,0,0,.48),
            0 0 45px rgba(72,93,255,.08) !important;
        }

        .search-result {
          min-height: 58px !important;
          border-radius: 12px !important;
        }

        /* Make the AI workspace feel like a premium AI query console. */
        .enhanced-workspace .workspace-top {
          align-items: center !important;
          margin-bottom: 30px !important;
        }

        .enhanced-workspace .workspace-top h2 {
          font-size: clamp(50px, 6.2vw, 82px) !important;
          line-height: .94 !important;
          letter-spacing: -.06em !important;
          font-weight: 900 !important;
          max-width: 900px !important;
        }

        .enhanced-workspace .workspace-top p {
          max-width: 760px !important;
          font-size: 17px !important;
          color: #8291b0 !important;
        }

        .professional-workspace-card {
          min-height: 690px !important;
          border-radius: 26px !important;
          border-color: rgba(108,132,220,.24) !important;
          background:
            linear-gradient(145deg, rgba(10,16,31,.99), rgba(4,8,18,.99)) !important;
          box-shadow:
            0 35px 110px rgba(0,0,0,.42),
            0 0 70px rgba(67,85,210,.06) !important;
        }

        .professional-toolbar {
          min-height: 62px !important;
          padding: 0 20px !important;
          border-bottom-color: rgba(108,132,220,.13) !important;
        }

        .toolbar-title {
          font-size: 14px !important;
          font-weight: 800 !important;
        }

        .toolbar-chip,
        .toolbar-model {
          border-radius: 9px !important;
        }

        .workspace-editor {
          background:
            linear-gradient(rgba(8,14,29,.72), rgba(5,9,20,.84)) !important;
        }

        .editor-topline {
          padding-top: 22px !important;
        }

        .editor-label {
          letter-spacing: .17em !important;
          font-size: 10px !important;
          font-weight: 900 !important;
          color: #7695ff !important;
        }

        .editor-hint {
          color: #687796 !important;
        }

        .professional-textarea {
          min-height: 220px !important;
          border-radius: 18px !important;
          border-color: rgba(104,132,230,.28) !important;
          background:
            linear-gradient(rgba(5,9,20,.95), rgba(4,8,18,.97)) !important;
          box-shadow:
            0 0 0 1px rgba(255,255,255,.015) inset,
            0 20px 55px rgba(0,0,0,.20) !important;
          font-size: 15px !important;
          line-height: 1.7 !important;
        }

        .professional-textarea:focus {
          border-color: rgba(110,137,255,.62) !important;
          box-shadow:
            0 0 0 3px rgba(91,92,255,.08),
            0 20px 65px rgba(0,0,0,.28) !important;
        }

        .workspace-template {
          border-radius: 999px !important;
          padding: 8px 14px !important;
        }

        .editor-footer {
          padding-bottom: 22px !important;
        }

        .run-agent-button {
          min-width: 150px !important;
          min-height: 48px !important;
          border-radius: 13px !important;
          font-size: 14px !important;
          font-weight: 800 !important;
          box-shadow: 0 16px 35px rgba(86,79,255,.20) !important;
        }

        .response-panel {
          border-top-color: rgba(108,132,220,.13) !important;
        }

        .professional-response-box {
          border-radius: 18px !important;
          border-color: rgba(104,132,230,.20) !important;
        }

        @media (max-width: 900px) {
          .enhanced-workspace .workspace-top h2 {
            font-size: clamp(44px, 8vw, 64px) !important;
          }

          .search-wrapper {
            width: 100% !important;
          }
        }

        @media (max-width: 620px) {
          .enhanced-workspace .workspace-top h2 {
            font-size: 42px !important;
          }

          .search-wrapper {
            min-height: 58px !important;
            height: 58px !important;
            border-radius: 15px !important;
          }

          .search-wrapper input {
            font-size: 13px !important;
          }

          .search-shortcut {
            display: none !important;
          }
        }

      `}</style>

      <div className="background-grid" />
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="ambient ambient-three" />

      <header className="navbar">
        <div className="nav-inner">
          <button
            className="brand"
            onClick={() => scrollToSection("home")}
            aria-label="Go to home"
          >
            <span className="brand-logo">
              <span>AI</span>
            </span>

            <span className="brand-copy">
              <strong>AI Coding Agent</strong>
              <small>Intelligent coding workspace</small>
            </span>
          </button>

          <nav className={`nav-links ${mobileMenu ? "mobile-open" : ""}`}>
            <button
              className={activeTab === "generate" ? "nav-active" : ""}
              onClick={() => openWorkspace("generate")}
            >
              Generate
            </button>

            <button
              className={activeTab === "analyze" ? "nav-active" : ""}
              onClick={() => openWorkspace("analyze")}
            >
              Analyze
            </button>

            <button
              className={activeTab === "fix" ? "nav-active" : ""}
              onClick={() => openWorkspace("fix")}
            >
              Fix Code
            </button>

            <button onClick={() => scrollToSection("faq")}>
              Docs
            </button>
          </nav>

          <div className="nav-status">
            <span
              className={`status-dot ${
                backendOnline ? "online" : "offline"
              }`}
            />

            <span>
              {backendOnline ? "AI Ready" : "Backend Offline"}
            </span>
          </div>

          <button
            className="mobile-menu-button"
            onClick={() => setMobileMenu((value) => !value)}
          >
            ☰
          </button>
        </div>
      </header>

      <main>
        <section id="home" className="hero">
          <div className="hero-content">
            <div className="hero-copy">
              <div className="eyebrow">
                <span className="spark">✦</span>
                AI-POWERED DEVELOPMENT
              </div>

              <h1>
                Build software
                <span> with intelligence.</span>
              </h1>

              <p>
                Generate, analyze, debug and improve code with an intelligent
                AI coding workspace designed for modern developers.
              </p>

              <div className="hero-actions">
                <button
                  className="primary-button"
                  onClick={() => openWorkspace("generate")}
                >
                  Start Coding
                  <span>→</span>
                </button>

                <button
                  className="secondary-button"
                  onClick={() => scrollToSection("features")}
                >
                  Explore Features
                </button>
              </div>

              <div className="hero-meta">
                <span>✓ AI Code Generation</span>
                <span>✓ Code Analysis</span>
                <span>✓ Error Fixing</span>
              </div>
            </div>

            <div className="hero-visual">
              <div className="visual-glow" />

              <div className="floating-chip chip-one">
                <span>✦</span>
                Code Generation
              </div>

              <div className="floating-chip chip-two">
                <span>⌕</span>
                AI Reasoning
              </div>

              <div className="floating-chip chip-three">
                <span>✓</span>
                Error Detection
              </div>

              <div className="code-orbit orbit-one" />
              <div className="code-orbit orbit-two" />

              <div className="agent-scene">
                <div className="agent-platform">
                  <div className="platform-line line-one" />
                  <div className="platform-line line-two" />
                  <div className="platform-line line-three" />
                  <div className="platform-line line-four" />
                </div>

                <div className="agent-card">
                  <div className="window-bar">
                    <span />
                    <span />
                    <span />
                  </div>

                  <div className="code-line long" />
                  <div className="code-line medium" />
                  <div className="code-line short" />
                  <div className="code-line long second" />
                  <div className="code-line medium second" />
                  <div className="code-line short second" />

                  <div className="agent-pulse">
                    <div className="pulse-core">AI</div>
                    <div className="pulse-ring ring-one" />
                    <div className="pulse-ring ring-two" />
                    <div className="pulse-ring ring-three" />
                  </div>
                </div>

                <div className="floating-code-card">
                  <span className="mini-dot red" />
                  <span className="mini-dot yellow" />
                  <span className="mini-dot green" />

                  <div className="mini-code one" />
                  <div className="mini-code two" />
                  <div className="mini-code three" />
                  <div className="mini-code four" />
                </div>
              </div>
            </div>
          </div>

          <div className="hero-scroll">
            <span>SCROLL TO EXPLORE</span>
            <div className="scroll-line" />
          </div>
        </section>

        <section id="features" className="section features-section">
          <div className="section-heading">
            <div className="eyebrow">CAPABILITIES</div>

            <h2>
              Everything you need to
              <span> code smarter.</span>
            </h2>

            <p>
              One intelligent workspace for your complete development
              workflow.
            </p>
          </div>

          <div className="feature-grid">
            {features.map((feature, index) => (
              <button
                className="feature-card"
                key={feature.id}
                onClick={() => openWorkspace(feature.id)}
                style={{ "--delay": `${index * 80}ms` }}
              >
                <div className="feature-icon">{feature.icon}</div>

                <div className="feature-number">
                  0{index + 1}
                </div>

                <h3>{feature.title}</h3>

                <p>{feature.text}</p>

                <div className="feature-arrow">
                  →
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="section engine-section">
          <div className="engine-content">
            <div className="section-heading left">
              <div className="eyebrow">AI ENGINE</div>

              <h2>
                Designed for modern
                <span> AI development.</span>
              </h2>

              <p>
                The frontend connects to your FastAPI backend, where your
                coding agent can process requests and communicate with your
                selected language model.
              </p>
            </div>

            <div className="architecture">
              <div className="architecture-card">
                <span>01</span>
                <strong>React</strong>
                <small>Frontend</small>
              </div>

              <div className="architecture-arrow">→</div>

              <div className="architecture-card">
                <span>02</span>
                <strong>FastAPI</strong>
                <small>Backend</small>
              </div>

              <div className="architecture-arrow">→</div>

              <div className="architecture-card">
                <span>03</span>
                <strong>AI Agent</strong>
                <small>Reasoning</small>
              </div>

              <div className="architecture-arrow">→</div>

              <div className="architecture-card">
                <span>04</span>
                <strong>LLM</strong>
                <small>Generation</small>
              </div>
            </div>
          </div>
        </section>

        <section
          id="workspace"
          className="section workspace-section enhanced-workspace"
        >
          <div className="workspace-top">
            <div>
              <div className="eyebrow">AI WORKSPACE</div>

              <h2>What do you want to build?</h2>

              <p>
                Describe your coding task and the AI agent will help you
                design, debug and implement it.
              </p>
            </div>

            <div className="workspace-actions">
              <div
                className={`workspace-status-pill ${
                  backendOnline ? "online" : ""
                }`}
              >
                <span className="status-indicator" />

                {backendOnline
                  ? "Backend Connected"
                  : "Backend Offline"}
              </div>

              <button
                className="workspace-clear"
                onClick={clearWorkspace}
              >
                Clear
              </button>
            </div>
          </div>

          <div className="professional-workspace-card">
            <aside className="professional-sidebar">
              <div className="professional-sidebar-label">
                WORKSPACE
              </div>

              <button
                className={`professional-tab ${
                  activeTab === "generate" ? "active" : ""
                }`}
                onClick={() => setActiveTab("generate")}
              >
                <span className="professional-tab-icon">⚡</span>
                <span>Generate</span>
              </button>

              <button
                className={`professional-tab ${
                  activeTab === "analyze" ? "active" : ""
                }`}
                onClick={() => setActiveTab("analyze")}
              >
                <span className="professional-tab-icon">⌕</span>
                <span>Analyze</span>
              </button>

              <button
                className={`professional-tab ${
                  activeTab === "fix" ? "active" : ""
                }`}
                onClick={() => setActiveTab("fix")}
              >
                <span className="professional-tab-icon">✦</span>
                <span>Fix Code</span>
              </button>

              <div className="professional-divider" />

              <div className="professional-sidebar-label">
                QUICK START
              </div>

              {examples.map((example) => (
                <button
                  className="professional-example"
                  key={example}
                  onClick={() => chooseExample(example)}
                >
                  {example}
                </button>
              ))}
            </aside>

            <div className="professional-main">
              <div className="professional-toolbar">
                <div className="toolbar-left">
                  <div className="toolbar-title">
                    <span className="toolbar-live" />

                    {activeTab === "generate"
                      ? "Code Generation"
                      : activeTab === "analyze"
                        ? "Code Analysis"
                        : "Code Repair"}
                  </div>

                  <span className="toolbar-chip">
                    AI AGENT
                  </span>
                </div>

                <div className="toolbar-right">
                  <span className="toolbar-chip">
                    Python
                  </span>

                  <div className="toolbar-model">
                    <span>✦</span>
                    Gemini AI
                  </div>
                </div>
              </div>

              <div className="workspace-editor reference-query-console">
                <div className="editor-topline">
                  <span className="editor-label">
                    NATURAL LANGUAGE REQUEST
                  </span>

                  <span className="editor-hint">
                    Ctrl + Enter to run
                  </span>
                </div>

                <textarea
                  className="professional-textarea"
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  onKeyDown={handlePromptKey}
                  placeholder={
                    activeTab === "generate"
                      ? "Describe the application or feature you want to build..."
                      : activeTab === "analyze"
                        ? "Paste your code and explain what you want analyzed..."
                        : "Paste your code or error and explain what needs to be fixed..."
                  }
                />

                <div className="workspace-template-row">
                  {activeTab === "generate" && (
                    <>
                      <button
                        className="workspace-template"
                        onClick={() =>
                          setPrompt(
                            "Build a FastAPI REST API with JWT authentication"
                          )
                        }
                      >
                        FastAPI API
                      </button>

                      <button
                        className="workspace-template"
                        onClick={() =>
                          setPrompt(
                            "Build a machine learning prediction API using Python"
                          )
                        }
                      >
                        ML API
                      </button>

                      <button
                        className="workspace-template"
                        onClick={() =>
                          setPrompt(
                            "Build a RAG chatbot with FastAPI and a vector database"
                          )
                        }
                      >
                        RAG App
                      </button>
                    </>
                  )}

                  {activeTab === "analyze" && (
                    <>
                      <button
                        className="workspace-template"
                        onClick={() =>
                          setPrompt(
                            "Analyze this code for bugs, performance issues and code quality improvements."
                          )
                        }
                      >
                        Code Review
                      </button>

                      <button
                        className="workspace-template"
                        onClick={() =>
                          setPrompt(
                            "Analyze this Python code and explain how to improve its performance."
                          )
                        }
                      >
                        Performance
                      </button>
                    </>
                  )}

                  {activeTab === "fix" && (
                    <>
                      <button
                        className="workspace-template"
                        onClick={() =>
                          setPrompt(
                            "Fix this Python error and explain the root cause."
                          )
                        }
                      >
                        Python Error
                      </button>

                      <button
                        className="workspace-template"
                        onClick={() =>
                          setPrompt(
                            "Debug this API and provide the corrected implementation."
                          )
                        }
                      >
                        API Debug
                      </button>
                    </>
                  )}
                </div>

                <div className="editor-footer">
                  <div className="editor-info">
                    <span>{prompt.length} characters</span>
                    <span>AI Agent</span>
                    <span>FastAPI</span>
                  </div>

                  <button
                    className="run-agent-button"
                    onClick={runAgent}
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Run Agent"}
                    <span>→</span>
                  </button>
                </div>
              </div>

              <div className="response-panel">
                <div className="response-panel-header">
                  <div className="response-label">
                    <span className="response-live" />
                    AI RESPONSE
                  </div>

                  <button
                    className="response-copy"
                    onClick={() => {
                      if (response) {
                        navigator.clipboard?.writeText(response);
                      }
                    }}
                  >
                    Copy
                  </button>
                </div>

                <div className="professional-response-box">
                  {loading ? (
                    <div className="workspace-loading">
                      <div className="workspace-loading-orb">
                        AI
                      </div>

                      <div className="workspace-loading-copy">
                        <strong>
                          AI agent is thinking...
                        </strong>

                        <span>
                          Analyzing your request and preparing the solution
                        </span>
                      </div>
                    </div>
                  ) : response ? (
                    <pre>{response}</pre>
                  ) : (
                    <div className="workspace-empty">
                      <div className="workspace-empty-orb">
                        AI
                      </div>

                      <strong>
                        Your coding response will appear here.
                      </strong>

                      <span>
                        Describe what you want to build above and
                        click Run Agent.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="search-section">
          <div className="search-heading">
            <div className="eyebrow">QUICK SEARCH</div>

            <h2>Find anything in your workspace.</h2>
          </div>

          <div className="search-wrapper reference-search-bar">
            <span className="search-icon">⌕</span>

            <input
              id="global-search"
              value={search}
              onFocus={() => setSearchOpen(true)}
              onChange={(event) => {
                setSearch(event.target.value);
                setSearchOpen(true);
              }}
              placeholder="Search features, tools, examples..."
            />

            {search && (
              <button
                className="search-clear"
                onClick={() => setSearch("")}
              >
                ×
              </button>
            )}

            <span className="search-shortcut">
              Ctrl K
            </span>
          </div>

          {searchOpen && (
            <div className="search-results">
              <div className="search-results-top">
                <span>
                  {search
                    ? `${filteredResults.length} results`
                    : "Quick access"}
                </span>

                <button
                  onClick={() => {
                    setSearchOpen(false);
                    setSearch("");
                  }}
                >
                  Close
                </button>
              </div>

              {filteredResults.length === 0 ? (
                <div className="no-results">
                  <div>⌕</div>

                  <strong>
                    No matching features found.
                  </strong>

                  <span>
                    Try searching for generate, analyze, fix,
                    RAG, FastAPI or examples.
                  </span>
                </div>
              ) : (
                filteredResults.slice(0, 8).map((result, index) => (
                  <button
                    className="search-result"
                    key={`${result.title}-${index}`}
                    onClick={() => selectSearchResult(result)}
                  >
                    <span className="result-icon">
                      {result.type === "feature"
                        ? "✦"
                        : result.type === "example"
                          ? "⌘"
                          : "?"}
                    </span>

                    <span className="result-content">
                      <strong>{result.title}</strong>

                      <small>{result.text}</small>
                    </span>

                    <span className="result-arrow">
                      →
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </section>

        <section id="faq" className="section faq-section">
          <div className="faq-grid">
            <div className="faq-intro">
              <div className="eyebrow">
                DOCUMENTATION
              </div>

              <h2>
                Frequently asked
                <span> questions.</span>
              </h2>

              <p>
                Everything you need to understand the AI coding
                workspace and development workflow.
              </p>

              <button
                className="secondary-button"
                onClick={() => openWorkspace("generate")}
              >
                Open Workspace →
              </button>
            </div>

            <div className="faq-list">
              {faqs.map((faq, index) => (
                <div
                  className={`faq-item ${
                    openFaq === index ? "open" : ""
                  }`}
                  key={faq.question}
                >
                  <button
                    className="faq-question"
                    onClick={() =>
                      setOpenFaq(
                        openFaq === index ? null : index
                      )
                    }
                  >
                    <span>{faq.question}</span>

                    <span className="faq-plus">
                      {openFaq === index ? "−" : "+"}
                    </span>
                  </button>

                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <div>
            <strong>AI Coding Agent</strong>

            <span>
              Intelligent development workspace
            </span>
          </div>

          <div className="footer-links">
            <button onClick={() => scrollToSection("home")}>
              Home
            </button>

            <button onClick={() => scrollToSection("features")}>
              Features
            </button>

            <button onClick={() => scrollToSection("workspace")}>
              Workspace
            </button>

            <button onClick={() => scrollToSection("faq")}>
              Docs
            </button>
          </div>

          <span className="copyright">
            © 2026 AI Coding Agent
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;