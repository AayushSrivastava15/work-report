import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  CheckCircle2,
  FileText,
  FolderKanban,
  BarChart3,
  Download,
  ShieldCheck,
  Search,
  ArrowRight,
  UserPlus,
  LogIn,
  Sparkles,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* PUBLIC HEADER */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Title */}
          <div
            onClick={() => navigate('/')}
            className="flex items-center space-x-2.5 cursor-pointer select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-800 tracking-tight text-lg leading-none">
                Work Report
              </span>
              <div className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">
                Enterprise Hub
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">
              Features
            </a>
            <a href="#workflow" className="hover:text-blue-600 transition-colors">
              How It Works
            </a>
            <a href="#exports" className="hover:text-blue-600 transition-colors">
              Exports
            </a>
            <a href="#security" className="hover:text-blue-600 transition-colors">
              Security
            </a>
          </nav>

          {/* Auth Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <LogIn className="w-4 h-4 mr-1.5" />
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all hover:shadow-md cursor-pointer"
            >
              <UserPlus className="w-4 h-4 mr-1.5" />
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-white via-slate-50 to-slate-100 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-6 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Work Report Management System &bull; v1.0</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
            Manage, Track & Export Your <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700">
              Work Reports in One Place
            </span>
          </h1>

          {/* Description */}
          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Record daily work logs, organize project activities, inspect real-time productivity
            analytics, and export executive-ready PDF, Word, and Excel reports with strict security.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer group"
            >
              <span>Login to Dashboard</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4 mr-2 text-slate-500" />
              <span>Create Account</span>
            </button>
          </div>

          {/* Value Highlights */}
          <div className="mt-12 pt-8 border-t border-slate-200/80 max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold text-slate-600">
            <div className="flex items-center justify-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>JWT Authentication</span>
            </div>
            <div className="flex items-center justify-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Live Analytics</span>
            </div>
            <div className="flex items-center justify-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>PDF / Word / Excel</span>
            </div>
            <div className="flex items-center justify-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>User Data Isolation</span>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES SECTION */}
      <section id="features" className="py-16 sm:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
              Platform Capabilities
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Everything You Need for Enterprise Work Tracking
            </h3>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              Built with Spring Boot 3, React, and PostgreSQL for fast, reliable reporting.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200/80 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Work Entry Management</h4>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Log daily tasks, add descriptions, classify by category, tag technologies used, and
                track progress status seamlessly.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200/80 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Dashboard & Analytics</h4>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Gain instant visibility with visual breakdowns across projects, tech stacks,
                categories, and current week activity logs.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200/80 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Search & Smart Filtering</h4>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Find any entry instantly with full-text search, date ranges, removable filter chips,
                and paginated results.
              </p>
            </div>

            {/* Feature 4 */}
            <div id="exports" className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200/80 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
                <Download className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Multi-Format Exports</h4>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Generate and download formatted PDF documents, Word (.docx) files, and Excel
                spreadsheets matching your filtered criteria.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200/80 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                <FolderKanban className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Project Workspaces</h4>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Organize work by organizational projects. Assign tasks directly and track cumulative
                contributions per project.
              </p>
            </div>

            {/* Feature 6 */}
            <div id="security" className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200/80 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Enterprise Security</h4>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Stateless JWT Bearer token authentication, BCrypt encryption, and strict per-user
                data isolation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="workflow" className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
              Simple 4-Step Workflow
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              How The Work Report System Works
            </h3>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              Designed to minimize administrative overhead and maximize reporting clarity.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs relative">
              <div className="text-2xl font-black text-blue-600 mb-2">01</div>
              <h4 className="text-base font-bold text-slate-800">Create Account</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Register with your corporate email and credentials to create your secure workspace.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs relative">
              <div className="text-2xl font-black text-blue-600 mb-2">02</div>
              <h4 className="text-base font-bold text-slate-800">Log Daily Tasks</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Record your daily work entries, select projects, and update task completion statuses.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs relative">
              <div className="text-2xl font-black text-blue-600 mb-2">03</div>
              <h4 className="text-base font-bold text-slate-800">Inspect Analytics</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Review distribution charts, weekly volume, and filter entries by date range or stack.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs relative">
              <div className="text-2xl font-black text-blue-600 mb-2">04</div>
              <h4 className="text-base font-bold text-slate-800">Export & Submit</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Generate clean PDF, Word, or Excel reports ready for managers, stakeholders, or HR.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION BANNER */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-extrabold tracking-tight">
            Ready to Streamline Your Work Reports?
          </h3>
          <p className="mt-3 text-blue-100 text-base max-w-xl mx-auto">
            Log in to your account or create a new profile to begin recording and generating reports.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-blue-700 bg-white hover:bg-blue-50 rounded-xl shadow-md transition-colors cursor-pointer"
            >
              Sign In Now
            </button>
            <button
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-white bg-blue-700 hover:bg-blue-800 border border-blue-500 rounded-xl transition-colors cursor-pointer"
            >
              Create Account
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Briefcase className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-200 text-sm">
              Work Report Management System
            </span>
          </div>
          <div>&copy; {new Date().getFullYear()} Work Report Enterprise. All rights reserved.</div>
          <div className="flex items-center space-x-4 text-slate-400">
            <span>Spring Security JWT</span>
            <span>&bull;</span>
            <span>PostgreSQL</span>
            <span>&bull;</span>
            <span>React + Vite</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
