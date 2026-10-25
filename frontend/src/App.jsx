import { useEffect, useState } from "react";
import {
  Bot,
  LogOut,
  Menu,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
  User,
  X,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [token, setToken] = useState(
    localStorage.getItem("access_token")
  );

  const [authMode, setAuthMode] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const [conversationId, setConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);

  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    if (token) {
      localStorage.setItem(
        "access_token",
        token
      );
    }
  }, [token]);

  
  useEffect(() => {
    if (token) {
      loadConversations();
    } else {
      setConversations([]);
    }
  }, [token]);


  
  async function loadConversations() {
    if (!token) return;

    try {
      const response = await fetch(
        `${API_URL}/chat/conversations`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Unable to load chat history");
      }

      const data = await response.json();

      setConversations(data.conversations || []);
    } catch (err) {
      console.error("History loading error:", err);
    }
  }

  
  async function openConversation(id) {
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/chat/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to open conversation"
        );
      }

      setConversationId(data.conversation_id);

      setMessages(
        (data.messages || []).map((msg) => ({
          role: msg.role,
          content: msg.content,
        }))
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }



  async function handleAuth(e) {
    e.preventDefault();

    setError("");
    setAuthLoading(true);

    try {
      const endpoint =
        authMode === "login"
          ? "/auth/login"
          : "/auth/register";

      const body =
        authMode === "login"
          ? {
              email,
              password,
            }
          : {
              email,
              password,
              full_name: fullName,
            };

      const response = await fetch(
        `${API_URL}${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();
     
      
      if (!response.ok) {
        const detail = data.detail;

        const errorType =
          typeof detail === "object" && detail !== null
            ? detail.error_type
            : data.error_type;

        const errorMessage =
          typeof detail === "object" && detail !== null
            ? detail.message
            : typeof detail === "string"
              ? detail
              : data.error || data.message;

        if (errorType === "user_not_found") {
          throw new Error(
            "User not found. Please register first."
          );
        }

        if (errorType === "invalid_password") {
          throw new Error(
            "Invalid email or password."
          );
        }

        throw new Error(
          errorMessage || "Something went wrong"
        );
      }



      if (authMode === "register") {
        setAuthMode("login");
        setError(
          "Account created successfully. Please login."
        );
      } else {
        setToken(data.access_token);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setAuthLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem(
      "access_token"
    );

    setToken(null);
    setMessages([]);
    setConversationId(null);
  }

  function newChat() {
    setMessages([]);
    setConversationId(null);
    setError("");
  }

  async function sendMessage(e) {
    e.preventDefault();

    if (!message.trim() || loading) {
      return;
    }

    const userMessage = message.trim();

    setMessage("");
    setError("");

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
      },
    ]);

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/chat/`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: userMessage,
            conversation_id:
              conversationId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
          "Unable to get response"
        );
      }

      if (!conversationId) {
        setConversationId(data.conversation_id);
      }

      await loadConversations();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
        },
      ]);
    } catch (err) {
      setError(err.message);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, something went wrong. Please try again.",
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <AuthScreen
        authMode={authMode}
        setAuthMode={setAuthMode}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        fullName={fullName}
        setFullName={setFullName}
        handleAuth={handleAuth}
        loading={authLoading}
        error={error}
      />
    );
  }

  return (
    <div className="h-screen bg-[#050604] text-white flex overflow-hidden">

      {/* SIDEBAR */}

      <aside
        className={`
          ${sidebarOpen ? "w-[280px]" : "w-0"}
          transition-all duration-300
          overflow-hidden
          border-r border-white/[0.07]
          bg-[#080b07]
          flex flex-col
        `}
      >
        <div className="p-5">

          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl
              bg-gradient-to-br
              from-lime-400
              to-green-500
              flex items-center justify-center
              shadow-lg shadow-lime-400/20">

              <Sparkles size={19} />
            </div>

            <div>
              <h1 className="font-bold text-lg">
                Margot
              </h1>

              <p className="text-[11px] text-zinc-500">
                Your AI companion
              </p>
            </div>
          </div>

          <button
            onClick={newChat}
            className="
              w-full
              flex items-center justify-center gap-2
              py-3
              rounded-xl
              bg-white/[0.06]
              border border-white/[0.08]
              hover:bg-white/[0.1]
              transition
              text-sm font-medium
            "
          >
            <Plus size={17} />
            New conversation
          </button>
        </div>

        <div className="px-4 flex-1 overflow-y-auto">

          <p className="
            px-2 mb-3
            text-[11px]
            uppercase
            tracking-widest
            text-zinc-600
          ">
            Conversations
          </p>

          
        {conversations.length === 0 ? (
          <p className="px-3 py-4 text-xs text-zinc-600">
            No chat history yet
          </p>
        ) : (
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => openConversation(conversation.id)}
                className={`
                  w-full
                  text-left
                  px-3 py-3
                  rounded-xl
                  border
                  flex gap-3
                  items-center
                  transition
                  ${
                    conversation.id === conversationId
                      ? "bg-emerald-500/10 border-emerald-500/20"
                      : "bg-transparent border-transparent hover:bg-white/[0.05]"
                  }
                `}
              >
                <MessageSquare
                  size={16}
                  className="text-emerald-400 shrink-0"
                />

                <span className="text-sm text-zinc-300 truncate">
                  {conversation.title || "New conversation"}
                </span>
              </button>
            ))}
          </div>
        )}


        </div>

        <div className="p-4 border-t border-white/[0.07]">

          <div className="
            flex items-center gap-3
            px-3 py-3
            rounded-xl
            bg-white/[0.03]
          ">

            <div className="
              w-9 h-9 rounded-full
              bg-gradient-to-br
              from-lime-400/30
              to-green-400/20
              flex items-center justify-center
            ">
              <User size={17} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">
                Your account
              </p>

              <p className="text-[11px] text-zinc-600">
                Authenticated
              </p>
            </div>

            <button
              onClick={logout}
              className="
                text-zinc-600
                hover:text-red-400
                transition
              "
            >
              <LogOut size={17} />
            </button>

          </div>

        </div>
      </aside>


      {/* MAIN */}

      <main className="flex-1 flex flex-col min-w-0">

        {/* HEADER */}

        <header className="
          h-16
          border-b border-white/[0.07]
          flex items-center
          px-5
          bg-[#080b07]/90
          backdrop-blur-xl
        ">

          <button
            onClick={() =>
              setSidebarOpen(!sidebarOpen)
            }
            className="
              p-2
              rounded-lg
              hover:bg-white/[0.06]
              text-zinc-500
              hover:text-white
              transition
            "
          >
            {sidebarOpen
              ? <X size={19} />
              : <Menu size={19} />}
          </button>

          <div className="ml-3">

            <h2 className="text-sm font-semibold">
              Margot • AI Assistant
            </h2>

            <div className="
              flex items-center gap-2
              text-[11px] text-zinc-600
            ">
              <span className="
                w-1.5 h-1.5
                rounded-full
                bg-lime-300
                shadow shadow-lime-300
              "/>

              AI assistant ready
            </div>

          </div>

        </header>


        {/* CHAT AREA */}

        <div className="
          flex-1
          overflow-y-auto
          relative
        ">

          {messages.length === 0 ? (
            <WelcomeScreen
              setMessage={setMessage}
            />
          ) : (
            <div className="
              max-w-4xl
              mx-auto
              px-5
              py-10
              space-y-8
            ">

              {messages.map(
                (msg, index) => (
                  <Message
                    key={index}
                    message={msg}
                  />
                )
              )}

              {loading && (
                <div className="
                  flex gap-4
                  items-start
                ">

                  <div className="
                    w-9 h-9
                    rounded-xl
                    bg-gradient-to-br
                    from-lime-400
                    to-green-500
                    flex items-center justify-center
                    shrink-0
                  ">
                    <Bot size={17} />
                  </div>

                  <div className="
                    px-5 py-4
                    rounded-2xl
                    bg-white/[0.04]
                    border border-white/[0.07]
                  ">

                    <div className="flex gap-1">
                      <span className="
                        w-1.5 h-1.5
                        rounded-full
                        bg-lime-300
                        animate-bounce
                      "/>

                      <span className="
                        w-1.5 h-1.5
                        rounded-full
                        bg-lime-300
                        animate-bounce
                        [animation-delay:150ms]
                      "/>

                      <span className="
                        w-1.5 h-1.5
                        rounded-full
                        bg-lime-300
                        animate-bounce
                        [animation-delay:300ms]
                      "/>
                    </div>

                  </div>

                </div>
              )}

            </div>
          )}

        </div>


        {/* INPUT */}

        <div className="
          p-5
          border-t border-white/[0.07]
          bg-[#080b07]
        ">

          {error && (
            <div className="
              max-w-4xl mx-auto
              mb-3
              text-xs
              text-red-400
            ">
              {error}
            </div>
          )}

          <form
            onSubmit={sendMessage}
            className="
              max-w-4xl
              mx-auto
              relative
            "
          >

            <textarea
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey
                ) {
                  e.preventDefault();
                  sendMessage(e);
                }
              }}
              placeholder="Message Margot... Ask anything"
              rows="1"
              className="
                w-full
                resize-none
                rounded-2xl
                bg-white/[0.045]
                border border-white/[0.09]
                focus:border-lime-400/40
                focus:ring-2
                focus:ring-lime-400/10
                outline-none
                px-5 py-4
                pr-14
                text-sm
                text-zinc-200
                placeholder:text-zinc-600
                transition
              "
            />

            <button
              type="submit"
              disabled={!message.trim() || loading}
              className="
                absolute
                right-2
                bottom-2
                w-10 h-10
                rounded-xl
                bg-gradient-to-br
                from-lime-500
                to-green-500
                flex items-center justify-center
                disabled:opacity-30
                disabled:cursor-not-allowed
                hover:scale-105
                transition
                shadow-lg
                shadow-lime-900/20
              "
            >
              <Send size={17} />
            </button>

          </form>

          <p className="
            text-center
            text-[10px]
            text-zinc-700
            mt-3
          ">
            Margot can make mistakes. Check important information.
          </p>

        </div>

      </main>

    </div>
  );
}


function Message({ message }) {

  const isUser =
    message.role === "user";

  return (
    <div className={`
      flex gap-4
      items-start
      ${isUser ? "justify-end" : ""}
    `}>

      {!isUser && (
        <div className="
          w-9 h-9
          rounded-xl
          bg-gradient-to-br
          from-lime-400
          to-green-500
          flex items-center justify-center
          shrink-0
        ">
          <Bot size={17} />
        </div>
      )}

      <div className={`
        max-w-[78%]
        px-5 py-4
        rounded-2xl
        text-sm
        leading-7
        whitespace-pre-wrap
        ${
          isUser
            ? `
              bg-gradient-to-br
              from-lime-500/90
              to-lime-500/80
              rounded-tr-md
            `
            : `
              bg-white/[0.035]
              border border-white/[0.07]
              text-zinc-300
              rounded-tl-md
            `
        }
      `}>
        {message.content}
      </div>

      {isUser && (
        <div className="
          w-9 h-9
          rounded-xl
          bg-white/[0.08]
          border border-white/[0.08]
          flex items-center justify-center
          shrink-0
        ">
          <User size={17} />
        </div>
      )}

    </div>
  );
}


function WelcomeScreen({ setMessage }) {

  const suggestions = [
    "Explain a difficult concept simply",
    "Help me brainstorm an idea",
    "Summarize a topic for me",
    "Answer from my knowledge base"
  ];

  return (
    <div className="
      h-full
      flex items-center justify-center
      px-5
    ">

      <div className="
        max-w-3xl
        w-full
        text-center
      ">

        <div className="
          mx-auto
          mb-6
          w-16 h-16
          rounded-2xl
          bg-gradient-to-br
          from-lime-400
          via-lime-500
          to-green-500
          flex items-center justify-center
          shadow-2xl
          shadow-lime-900/30
        ">
          <Sparkles size={28} />
        </div>

        <h1 className="
          text-4xl
          md:text-5xl
          font-bold
          tracking-tight
        ">
          Think clearly,
          <span className="
            block
            bg-gradient-to-r
            from-lime-300
            via-green-300
            to-lime-300
            bg-clip-text
            text-transparent
          ">
            create with Margot.
          </span>
        </h1>

        <p className="
          mt-5
          text-zinc-500
          max-w-xl
          mx-auto
          leading-7
          text-sm
        ">
          Your AI companion for ideas, learning, problem-solving, and questions about your knowledge base.
        </p>

        <div className="
          grid
          sm:grid-cols-2
          gap-3
          mt-10
          text-left
        ">

          {suggestions.map(
            (suggestion) => (
              <button
                key={suggestion}
                onClick={() =>
                  setMessage(suggestion)
                }
                className="
                  p-4
                  rounded-2xl
                  bg-white/[0.03]
                  border border-white/[0.07]
                  hover:border-lime-400/30
                  hover:bg-lime-400/[0.04]
                  text-sm
                  text-zinc-400
                  hover:text-zinc-200
                  transition
                "
              >
                {suggestion}
              </button>
            )
          )}

        </div>

      </div>

    </div>
  );
}


function AuthScreen({
  authMode,
  setAuthMode,
  email,
  setEmail,
  password,
  setPassword,
  fullName,
  setFullName,
  handleAuth,
  loading,
  error,
}) {

  const isLogin =
    authMode === "login";

  return (
    <div className="
      min-h-screen
      bg-[#050604]
      text-white
      flex items-center
      justify-center
      p-5
      relative
      overflow-hidden
    ">

      {/* Ambient glow */}

      <div className="
        absolute
        w-[500px]
        h-[500px]
        rounded-full
        bg-lime-500/10
        blur-[120px]
        -top-40
        -left-40
      "/>

      <div className="
        absolute
        w-[500px]
        h-[500px]
        rounded-full
        bg-green-700/10
        blur-[120px]
        -bottom-40
        -right-40
      "/>


      <div className="
        relative
        w-full
        max-w-md
      ">

        <div className="
          text-center
          mb-8
        ">

          <div className="
            mx-auto
            w-14 h-14
            rounded-2xl
            bg-gradient-to-br
            from-lime-400
            to-green-500
            flex items-center justify-center
            shadow-xl
            shadow-lime-900/30
            mb-5
          ">
            <Sparkles size={25} />
          </div>

          <h1 className="
            text-3xl
            font-bold
          ">
            Welcome to Margot
          </h1>

          <p className="
            mt-2
            text-sm
            text-zinc-600
          ">
            Your AI companion for thinking and creating
          </p>

        </div>


        <div className="
          rounded-3xl
          bg-white/[0.035]
          border border-white/[0.08]
          backdrop-blur-xl
          p-7
          shadow-2xl
          shadow-black/30
        ">

          <div className="
            flex
            bg-black/30
            rounded-xl
            p-1
            mb-7
          ">

            <button
              onClick={() =>
                setAuthMode("login")
              }
              className={`
                flex-1
                py-2.5
                rounded-lg
                text-sm
                transition
                ${
                  isLogin
                    ? "bg-white/[0.08] text-white"
                    : "text-zinc-600"
                }
              `}
            >
              Login
            </button>

            <button
              onClick={() =>
                setAuthMode("register")
              }
              className={`
                flex-1
                py-2.5
                rounded-lg
                text-sm
                transition
                ${
                  !isLogin
                    ? "bg-white/[0.08] text-white"
                    : "text-zinc-600"
                }
              `}
            >
              Register
            </button>

          </div>


          <form
            onSubmit={handleAuth}
            className="space-y-4"
          >

            {!isLogin && (
              <input
                type="text"
                placeholder="Full name"
                value={fullName}
                onChange={(e) =>
                  setFullName(e.target.value)
                }
                required
                className="
                  w-full
                  rounded-xl
                  bg-black/30
                  border border-white/[0.08]
                  focus:border-lime-400/40
                  outline-none
                  px-4 py-3
                  text-sm
                  placeholder:text-zinc-700
                "
              />
            )}

            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
              className="
                w-full
                rounded-xl
                bg-black/30
                border border-white/[0.08]
                focus:border-lime-400/40
                outline-none
                px-4 py-3
                text-sm
                placeholder:text-zinc-700
              "
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
              className="
                w-full
                rounded-xl
                bg-black/30
                border border-white/[0.08]
                focus:border-lime-400/40
                outline-none
                px-4 py-3
                text-sm
                placeholder:text-zinc-700
              "
            />

            {error && (
              <p className="mt-3 text-sm text-red-500 text-center">
                {error}
              </p>
            )}

            <button
              disabled={loading}
              className="
                w-full
                py-3.5
                rounded-xl
                bg-gradient-to-r
                from-lime-500
                to-green-500
                hover:from-lime-400
                hover:to-green-400
                disabled:opacity-50
                font-medium
                text-sm
                transition
                shadow-lg
                shadow-lime-900/20
              "
            >
              {loading
                ? "Please wait..."
                : isLogin
                  ? "Sign in"
                  : "Create account"}
            </button>

          </form>

        </div>

        <p className="
          text-center
          text-[10px]
          text-zinc-700
          mt-6
        ">
          Secure authentication • Gemini • MongoDB
        </p>

      </div>

    </div>
  );
}

export default App;