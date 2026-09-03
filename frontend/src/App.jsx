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
        throw new Error(
          data.detail ||
          data.message ||
          "Something went wrong"
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
        setConversationId(
          data.conversation_id
        );
      }

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
    <div className="h-screen bg-[#050505] text-white flex overflow-hidden">

      {/* SIDEBAR */}

      <aside
        className={`
          ${sidebarOpen ? "w-[280px]" : "w-0"}
          transition-all duration-300
          overflow-hidden
          border-r border-white/[0.07]
          bg-[#080908]
          flex flex-col
        `}
      >
        <div className="p-5">

          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl
              bg-gradient-to-br
              from-purple-500
              to-emerald-600
              flex items-center justify-center
              shadow-lg shadow-purple-500/20">

              <Sparkles size={19} />
            </div>

            <div>
              <h1 className="font-bold text-lg">
                Nexus AI
              </h1>

              <p className="text-[11px] text-zinc-500">
                RAG Intelligence
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

          {conversationId && (
            <button
              className="
                w-full
                text-left
                px-3 py-3
                rounded-xl
                bg-purple-500/[0.08]
                border border-purple-500/10
                flex gap-3
                items-center
              "
            >
              <MessageSquare
                size={16}
                className="text-purple-400"
              />

              <span className="text-sm text-zinc-300 truncate">
                Current conversation
              </span>
            </button>
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
              from-purple-500/30
              to-emerald-500/20
              flex items-center justify-center
            ">
              <User size={17} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">
                AI User
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
          bg-[#070807]/80
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
              AI Knowledge Assistant
            </h2>

            <div className="
              flex items-center gap-2
              text-[11px] text-zinc-600
            ">
              <span className="
                w-1.5 h-1.5
                rounded-full
                bg-emerald-400
                shadow shadow-emerald-400
              "/>

              RAG system online
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
                    from-purple-500
                    to-emerald-600
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
                        bg-purple-400
                        animate-bounce
                      "/>

                      <span className="
                        w-1.5 h-1.5
                        rounded-full
                        bg-purple-400
                        animate-bounce
                        [animation-delay:150ms]
                      "/>

                      <span className="
                        w-1.5 h-1.5
                        rounded-full
                        bg-emerald-400
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
          bg-[#070807]
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
              placeholder="Ask anything from your knowledge base..."
              rows="1"
              className="
                w-full
                resize-none
                rounded-2xl
                bg-white/[0.045]
                border border-white/[0.09]
                focus:border-purple-500/40
                focus:ring-2
                focus:ring-purple-500/10
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
                from-purple-600
                to-emerald-600
                flex items-center justify-center
                disabled:opacity-30
                disabled:cursor-not-allowed
                hover:scale-105
                transition
                shadow-lg
                shadow-purple-900/20
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
            Powered by Gemini • MongoDB Vector Search
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
          from-purple-500
          to-emerald-600
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
              from-purple-600/90
              to-purple-700/80
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
    "What is Artificial Intelligence?",
    "Explain Retrieval-Augmented Generation",
    "What are embeddings?",
    "How does vector search work?"
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
          from-purple-500
          via-purple-600
          to-emerald-600
          flex items-center justify-center
          shadow-2xl
          shadow-purple-900/30
        ">
          <Sparkles size={28} />
        </div>

        <h1 className="
          text-4xl
          md:text-5xl
          font-bold
          tracking-tight
        ">
          Your knowledge,
          <span className="
            block
            bg-gradient-to-r
            from-purple-400
            via-fuchsia-400
            to-emerald-400
            bg-clip-text
            text-transparent
          ">
            intelligently retrieved.
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
          Ask questions and get grounded answers
          from your private knowledge base using
          Retrieval-Augmented Generation.
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
                  hover:border-purple-500/30
                  hover:bg-purple-500/[0.04]
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
      bg-[#050505]
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
        bg-purple-700/10
        blur-[120px]
        -top-40
        -left-40
      "/>

      <div className="
        absolute
        w-[500px]
        h-[500px]
        rounded-full
        bg-emerald-700/10
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
            from-purple-500
            to-emerald-600
            flex items-center justify-center
            shadow-xl
            shadow-purple-900/30
            mb-5
          ">
            <Sparkles size={25} />
          </div>

          <h1 className="
            text-3xl
            font-bold
          ">
            Welcome to Nexus AI
          </h1>

          <p className="
            mt-2
            text-sm
            text-zinc-600
          ">
            Your intelligent knowledge assistant
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
                  focus:border-purple-500/40
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
                focus:border-purple-500/40
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
                focus:border-purple-500/40
                outline-none
                px-4 py-3
                text-sm
                placeholder:text-zinc-700
              "
            />

            {error && (
              <p className="
                text-xs
                text-red-400
                leading-5
              ">
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
                from-purple-600
                to-emerald-600
                hover:from-purple-500
                hover:to-emerald-500
                disabled:opacity-50
                font-medium
                text-sm
                transition
                shadow-lg
                shadow-purple-900/20
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