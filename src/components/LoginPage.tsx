import React, { useState } from 'react';
import { supabaseManager } from '../lib/supabase';
import { User } from '../types';
import {
  PlusSquare,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  Database,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  onOpenSupabaseConfig: () => void;
  supabaseConnected: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onOpenSupabaseConfig,
  supabaseConnected
}) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('1234');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await supabaseManager.login(username, password);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMsg(res.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50/40 flex items-center justify-center p-4 font-['Sarabun',sans-serif]">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden">
        {/* Top Header Card */}
        <div className="bg-slate-900 text-white p-7 text-center relative overflow-hidden">
          {/* Subtle glow background */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-blue-600/30 rounded-full blur-2xl" />
          <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-emerald-600/20 rounded-full blur-2xl" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 mb-3">
              <PlusSquare className="w-8 h-8 stroke-[2.2]" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">NCD Center</h1>
            <p className="text-xs text-blue-200 font-medium mt-0.5">
              PCU โฮงยาไทย (กลุ่มงานเวชกรรมสังคม รพศ.เชียงราย)
            </p>
          </div>
        </div>

        {/* Database Status Strip */}
        <div className="bg-slate-50 border-b border-slate-200/70 px-6 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span>ฐานข้อมูล:</span>
            <span className={`font-semibold ${supabaseConnected ? 'text-emerald-700' : 'text-amber-700'}`}>
              {supabaseConnected ? 'Supabase (ตาราง users)' : 'Local Database'}
            </span>
          </div>
          <button
            type="button"
            onClick={onOpenSupabaseConfig}
            className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline"
          >
            ตั้งค่า Supabase
          </button>
        </div>

        {/* Login Form Body */}
        <div className="p-7 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Username Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อผู้ใช้งาน (Username)
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="กรอกชื่อผู้ใช้ เช่น admin"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                รหัสผ่าน (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่าน"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>กำลังตรวจสอบสิทธิ์...</span>
                </>
              ) : (
                <>
                  <span>เข้าสู่ระบบ</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Accounts */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 block mb-2 text-center">
              บัญชีทดสอบในระบบ (คลิกเพื่อใส่ข้อมูลอัตโนมัติ)
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Admin', user: 'admin', pass: '1234', desc: 'ผู้ดูแลระบบ' },
                { label: 'Staff', user: 'staff', pass: '1234', desc: 'เจ้าหน้าที่' },
                { label: 'Doctor', user: 'doctor', pass: '1234', desc: 'แพทย์ NCD' },
              ].map(acc => (
                <button
                  key={acc.user}
                  type="button"
                  onClick={() => handleQuickFill(acc.user, acc.pass)}
                  className="p-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-left transition"
                >
                  <div className="font-bold text-[11px] text-slate-800">{acc.label}</div>
                  <div className="text-[10px] text-slate-400">pass: {acc.pass}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-400">
          งานพัฒนาระบบบริการปฐมภูมิและสนับสนุนเครือข่าย รพศ.เชียงราย
        </div>
      </div>
    </div>
  );
};
