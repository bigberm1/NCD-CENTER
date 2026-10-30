import React, { useState } from 'react';
import { supabaseManager } from '../lib/supabase';
import { KeyRound, CheckCircle2, AlertCircle, X } from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  username
}) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ success: boolean; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      setMsg({ success: false, text: 'กรุณากรอกข้อมูลให้ครบทุกช่อง' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMsg({ success: false, text: 'รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน' });
      return;
    }
    if (newPassword.length < 4) {
      setMsg({ success: false, text: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 4 ตัวอักษร' });
      return;
    }

    setLoading(true);
    setMsg(null);

    const res = await supabaseManager.changePassword(username, oldPassword, newPassword);
    setLoading(false);
    setMsg({ success: res.success, text: res.message });

    if (res.success) {
      setTimeout(() => {
        onClose();
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setMsg(null);
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-['Sarabun',sans-serif]">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-800 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <KeyRound className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-sm">เปลี่ยนรหัสผ่าน (Change Password)</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {msg && (
            <div
              className={`p-3 rounded-xl flex items-center gap-2 border ${
                msg.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {msg.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{msg.text}</span>
            </div>
          )}

          <div>
            <label className="block text-slate-600 mb-1 font-semibold">ชื่อผู้ใช้</label>
            <input
              type="text"
              disabled
              value={username}
              className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-600"
            />
          </div>

          <div>
            <label className="block text-slate-600 mb-1 font-semibold">รหัสผ่านเดิม *</label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="กรอกรหัสผ่านเดิม"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-600 mb-1 font-semibold">รหัสผ่านใหม่ *</label>
            <input
              type="password"
              required
              minLength={4}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="อย่างน้อย 4 ตัวอักษร"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-600 mb-1 font-semibold">ยืนยันรหัสผ่านใหม่ *</label>
            <input
              type="password"
              required
              minLength={4}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs disabled:opacity-50"
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
