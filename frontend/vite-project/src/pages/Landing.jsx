import React from 'react'
import { Link } from 'react-router-dom'
import heroImage from '../assets/hero.png'

function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900">
      {/* Navigation */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-black text-white shadow-md shadow-indigo-200">
            S
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900">
            SST Social
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            to="/login"
            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Log In
          </Link>
          <Link
            to="/signup"
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-300 transition hover:bg-indigo-700 active:scale-[0.98]"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-6 pt-12 pb-24 lg:px-8 lg:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/70 px-4 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
              Live Real-Time Social Platform
            </div>

            <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-6xl text-slate-900">
              Connect. Share. <br />
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Build your circle.
              </span>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-slate-600 sm:text-xl">
              Share posts, explore short-form reels, post stories, and experience real-time connections with your friends and community.
            </p>

            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
              <Link
                to="/signup"
                className="w-full sm:w-auto rounded-xl bg-indigo-600 px-8 py-3.5 text-center text-base font-semibold text-white shadow-lg shadow-indigo-300/50 transition hover:bg-indigo-700 active:scale-[0.99]"
              >
                Create Free Account
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto rounded-xl border border-slate-300 bg-white px-8 py-3.5 text-center text-base font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
              >
                Sign In to Your Feed
              </Link>
            </div>

            {/* Quick Stats / Highlights */}
            <div className="mt-12 grid grid-cols-3 gap-6 border-t border-slate-200 pt-8">
              <div>
                <p className="text-2xl font-black text-indigo-600">Real-Time</p>
                <p className="mt-1 text-xs text-slate-500 font-medium">Socket.IO Powered</p>
              </div>
              <div>
                <p className="text-2xl font-black text-indigo-600">Reels & Posts</p>
                <p className="mt-1 text-xs text-slate-500 font-medium">Cloud Media Uploads</p>
              </div>
              <div>
                <p className="text-2xl font-black text-indigo-600">Secure</p>
                <p className="mt-1 text-xs text-slate-500 font-medium">JWT & HttpOnly Cookies</p>
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div className="absolute -top-12 -left-12 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl"></div>
            <div className="absolute -bottom-12 -right-12 h-72 w-72 rounded-full bg-violet-200/40 blur-3xl"></div>
            
            <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-4 shadow-2xl shadow-indigo-100/50">
              <img
                src={heroImage}
                alt="Social Media App Preview"
                className="w-full rounded-2xl object-cover shadow-inner"
              />
              
              <div className="mt-4 flex items-center justify-between px-2 py-1">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                    SS
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">SST Community</p>
                    <p className="text-xs text-slate-400">Join classmates and friends</p>
                  </div>
                </div>
                <Link
                  to="/signup"
                  className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 transition"
                >
                  Join Now →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-24">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Everything you need in a modern social network
            </h2>
            <p className="mt-3 text-sm text-slate-500 sm:text-base">
              Explore rich multimedia feeds, express yourself with stories, and stay connected.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 text-xl font-bold">
                📸
              </div>
              <h3 className="mt-4 font-bold text-slate-900">Posts & Media</h3>
              <p className="mt-2 text-sm text-slate-500">
                Share photos, captions, and thoughts. Like and comment on posts with instant updates.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600 text-xl font-bold">
                🎬
              </div>
              <h3 className="mt-4 font-bold text-slate-900">Short-Form Reels</h3>
              <p className="mt-2 text-sm text-slate-500">
                Upload and stream short videos with full audio/video player support.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600 text-xl font-bold">
                ⏳
              </div>
              <h3 className="mt-4 font-bold text-slate-900">24-Hour Stories</h3>
              <p className="mt-2 text-sm text-slate-500">
                Share ephemeral moments with your circle that expire automatically after 24 hours.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 text-xl font-bold">
                ⚡
              </div>
              <h3 className="mt-4 font-bold text-slate-900">Live Presence</h3>
              <p className="mt-2 text-sm text-slate-500">
                Real-time online indicators and live notifications powered by Socket.IO.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-400">
        <p>SST Social Media App • Built with React, Redux, Express & MongoDB</p>
      </footer>
    </div>
  )
}

export default Landing
