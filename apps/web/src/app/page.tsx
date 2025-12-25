export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            AnuCode
          </h1>
          <p className="text-2xl text-gray-300 mb-8">
            AI-Powered Code Editor - Build Faster, Code Smarter
          </p>
          <div className="flex justify-center space-x-4">
            <button className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold transition-colors">
              Get Started Free
            </button>
            <button className="border border-blue-600 hover:bg-blue-900/50 px-8 py-3 rounded-lg font-semibold transition-colors">
              Watch Demo
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-bold mb-2">AI Agent Mode</h3>
            <p className="text-gray-300">
              Autonomous AI agent that understands context and executes complex tasks
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
            <p className="text-gray-300">
              Built on Monaco Editor with optimized performance for large codebases
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-bold mb-2">One-Click Deploy</h3>
            <p className="text-gray-300">
              Deploy to Vercel, Netlify, AWS, or any cloud provider instantly
            </p>
          </div>
        </div>

        {/* Pricing Preview */}
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-8">Simple, Transparent Pricing</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="bg-white/5 backdrop-blur-lg rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-bold mb-2">Free</h3>
              <div className="text-4xl font-bold mb-4">$0</div>
              <ul className="text-left space-y-2 text-gray-300">
                <li>✓ 1,000 AI requests/month</li>
                <li>✓ Basic Agent Mode</li>
                <li>✓ 1 Deployment Slot</li>
                <li>✓ Community Support</li>
              </ul>
            </div>

            <div className="bg-blue-600/20 backdrop-blur-lg rounded-lg p-6 border-2 border-blue-500">
              <div className="bg-blue-500 text-xs font-bold px-3 py-1 rounded-full inline-block mb-2">
                MOST POPULAR
              </div>
              <h3 className="text-xl font-bold mb-2">Pro</h3>
              <div className="text-4xl font-bold mb-4">$20/mo</div>
              <ul className="text-left space-y-2 text-gray-300">
                <li>✓ 10,000 AI requests/month</li>
                <li>✓ Full Agent Mode</li>
                <li>✓ 5 Deployment Slots</li>
                <li>✓ Priority Support</li>
              </ul>
            </div>

            <div className="bg-white/5 backdrop-blur-lg rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-bold mb-2">Team</h3>
              <div className="text-4xl font-bold mb-4">$50/user</div>
              <ul className="text-left space-y-2 text-gray-300">
                <li>✓ Unlimited AI requests</li>
                <li>✓ Team Collaboration</li>
                <li>✓ 20 Deployment Slots</li>
                <li>✓ SSO Integration</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
