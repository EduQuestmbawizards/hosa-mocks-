import Link from "next/link";
import { Activity, ShieldCheck, Shield, Mail, BookOpen, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="site-footer bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="mb-4">
              <div className="bg-white/95 inline-block px-3 py-1.5 rounded-lg shadow-sm">
                <img
                  src="/logo.png"
                  alt="MBA Wizards - Aspire. Advance. Achieve."
                  className="h-10 w-auto object-contain"
                />
              </div>
            </div>
            <p className="text-slate-400 text-sm max-w-sm mb-4 leading-relaxed">
              High-fidelity exam preparation platform for competitive events.
              Practise under strict real-test conditions with referenced question sets, instant practice feedback, and clinical rubrics.
            </p>
            <div className="text-xs text-slate-500">
              Admin & Lead Instructor: <span className="text-slate-300">Rupali</span> (<a href="mailto:rupali.eduquest@gmail.com" className="hover:text-sky-400 underline">rupali.eduquest@gmail.com</a>)
            </div>
            <div className="mt-2.5">
              <Link
                href="/login?role=admin"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition inline-flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700 hover:border-indigo-500/50"
              >
                <Shield className="w-3.5 h-3.5 text-indigo-400" /> Admin Portal Login &rarr;
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs uppercase font-bold text-slate-200 tracking-wider mb-3">
              HOSA Events
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/#tests" className="hover:text-white transition">
                  Surgical Technologist (ST)
                </Link>
              </li>
              <li>
                <Link href="/#tests" className="hover:text-white transition">
                  Healthcare Issues Exam (HCIE)
                </Link>
              </li>
              <li>
                <Link href="/#round-two" className="hover:text-white transition">
                  ST Round Two Clinical Rubric
                </Link>
              </li>
              <li>
                <Link href="/#blueprint" className="hover:text-white transition">
                  6-Category Blueprint (ST)
                </Link>
              </li>
            </ul>
          </div>

          {/* Official References */}
          <div>
            <h4 className="text-xs uppercase font-bold text-slate-200 tracking-wider mb-3">
              HOSA 2026-27 Guidelines
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a
                  href="https://hosa.org/wp-content/uploads/2026/08/ST-26-27-FINAL-1-1.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition inline-flex items-center gap-1.5"
                >
                  ST Guidelines PDF <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://hosa.org/wp-content/uploads/2026/08/HCIE-26-27.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition inline-flex items-center gap-1.5"
                >
                  HCIE Guidelines PDF <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <span className="text-xs text-slate-500">
                  AST 5th Ed. & Nemitz references cited per question.
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            &copy; {new Date().getFullYear()} MBA Wizards. All rights reserved. Aspire. Advance. Achieve.
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> RLS Database Secured
            </span>
            <span>Zero-cheating Answer Encryption</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

