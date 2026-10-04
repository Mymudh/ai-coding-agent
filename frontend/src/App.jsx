import { useEffect, useMemo, useState } from "react";
import "./index.css";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const features = [
  {
    id: "generate",
    icon: "âš¡",
    title: "Generate Code",
    text: "Describe what you want to build and let the AI create the solution.",
    action: "Generate"
  },
  {
    id: "analyze",
    icon: "âŒ•",
    title: "Analyze Code",
    text: "Review code for bugs, quality issues, performance and improvements.",
    action: "Analyze"
  },
  {
    id: "fix",
    icon: "âœ¦",
    title: "Fix Errors",
    text: "Paste an error or broken code and get an intelligent correction.",
    action: "Fix Code"
  },
  {
    id: "build",
    icon: "ðŸš€",
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
            â˜°
          </button>
        </div>
      </header>

      <main>
        <section id="home" className="hero">
          <div className="hero-content">
            <div className="hero-copy">
              <div className="eyebrow">
                <span className="spark">âœ¦</span>
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
                  <span>â†’</span>
                </button>

                <button
                  className="secondary-button"
                  onClick={() => scrollToSection("features")}
                >
                  Explore Features
                </button>
              </div>

              <div className="hero-meta">
                <span>âœ“ AI Code Generation</span>
                <span>âœ“ Code Analysis</span>
                <span>âœ“ Error Fixing</span>
              </div>
            </div>

            <div className="hero-visual">
              <div className="visual-glow" />

              <div className="floating-chip chip-one">
                <span>âœ¦</span>
                Code Generation
              </div>

              <div className="floating-chip chip-two">
                <span>âŒ•</span>
                AI Reasoning
              </div>

              <div className="floating-chip chip-three">
                <span>âœ“</span>
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
                  â†’
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

              <div className="architecture-arrow">â†’</div>

              <div className="architecture-card">
                <span>02</span>
                <strong>FastAPI</strong>
                <small>Backend</small>
              </div>

              <div className="architecture-arrow">â†’</div>

              <div className="architecture-card">
                <span>03</span>
                <strong>AI Agent</strong>
                <small>Reasoning</small>
              </div>

              <div className="architecture-arrow">â†’</div>

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
                <span className="professional-tab-icon">âš¡</span>
                <span>Generate</span>
              </button>

              <button
                className={`professional-tab ${
                  activeTab === "analyze" ? "active" : ""
                }`}
                onClick={() => setActiveTab("analyze")}
              >
                <span className="professional-tab-icon">âŒ•</span>
                <span>Analyze</span>
              </button>

              <button
                className={`professional-tab ${
                  activeTab === "fix" ? "active" : ""
                }`}
                onClick={() => setActiveTab("fix")}
              >
                <span className="professional-tab-icon">âœ¦</span>
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
                    <span>âœ¦</span>
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
                    <span>â†’</span>
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
            <span className="search-icon">âŒ•</span>

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
                Ã—
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
                  <div>âŒ•</div>

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
                        ? "âœ¦"
                        : result.type === "example"
                          ? "âŒ˜"
                          : "?"}
                    </span>

                    <span className="result-content">
                      <strong>{result.title}</strong>

                      <small>{result.text}</small>
                    </span>

                    <span className="result-arrow">
                      â†’
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
                Open Workspace â†’
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
                      {openFaq === index ? "âˆ’" : "+"}
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
            Â© 2026 AI Coding Agent
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
