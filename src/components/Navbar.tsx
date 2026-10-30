import React from 'react';
import { ViewType } from './Sidebar';
import { Menu, Database, UploadCloud, UserCircle, Shield, Wifi, WifiOff } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentView: ViewType;
  onOpenMobileSidebar: () => void;
  onOpenSupabaseModal: () => void;
  onOpenFileImportModal: () => void;
  supabaseConnected: boolean;
  currentUser: User;
}

const VIEW_TITLES: Record<ViewType, { title: string; subtitle: string }> = {
  home: { title: 'หน้าหลัก / ภาพรวมสถิติ', subtitle: 'สรุปผู้ป่วย NCD และผลการตรวจตาจำแนกตามหน่วยบริการ' },
  patients: { title: 'ทะเบียนรายชื่อผู้ป่วย', subtitle: 'ค้นหาด้วย HN หรือเลขบัตร 13 หลัก พร้อมตัวกรองโรคและหน่วยบริการ' },
  fundus: { title: 'ระบบตรวจตา (Fundus Screening)', subtitle: 'บันทึกวันตรวจ วินิจฉัยผลตาซ้าย-ขวา นัดหมาย และส่งต่อผู้ป่วย' },
  lab: { title: 'ผลการตรวจเลือด (Blood Lab)', subtitle: 'ปฏิทินตรวจเลือด อัปโหลด Excel ตรวจสอบผล FBS/HbA1C/Lipid/eGFR' },
  foot: { title: 'ระบบตรวจเท้า (Foot Screening)', subtitle: 'ประเมิน Monofilament ชีพจรหลังเท้า แผลเบาหวาน และความเสี่ยง' },
  remission: { title: 'DM Remission Clinic', subtitle: 'โปรแกรมเบาหวานสงบ ติดตามพฤติกรรม อาหาร และการลดยา' },
  telemed: { title: 'ระบบแพทย์ทางไกล (TeleMedicine)', subtitle: 'จัดการตารางนัดหมาย ห้องตรวจ วิดีโอคอลปรึกษาแพทย์ และจัดส่งยา' },
  export43: { title: 'ส่งออก 43 แฟ้มสุขภาพ', subtitle: 'จัดทำแฟ้มข้อมูลมาตรฐานกระทรวงสาธารณสุข PERSON, CHRONIC, LABFU' },
  download: { title: 'ดาวน์โหลดไฟล์และเอกสาร', subtitle: 'รวมแบบฟอร์มการตรวจ คู่มือแนวทางเวชปฏิบัติ และไฟล์แนบ' },
};

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onOpenMobileSidebar,
  onOpenSupabaseModal,
  onOpenFileImportModal,
  supabaseConnected,
  currentUser
}) => {
  const info = VIEW_TITLES[currentView] || { title: 'NCD Center', subtitle: '' };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 lg:px-7 flex items-center justify-between gap-4">
      {/* Left Title & Mobile Menu */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
          aria-label="เปิดเมนู"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h1 className="text-sm lg:text-base font-bold text-slate-800 truncate leading-snug">
            {info.title}
          </h1>
          <p className="text-[11px] text-slate-500 hidden sm:block truncate">
            {info.subtitle}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 lg:gap-3 shrink-0">
        {/* Supabase Status Button */}
        <button
          type="button"
          onClick={onOpenSupabaseModal}
          title="คลิกเพื่อตั้งค่าการเชื่อมต่อ Supabase"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
            supabaseConnected
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-current" />
          <span className="hidden md:inline">
            {supabaseConnected ? 'Supabase Live' : 'Supabase (Local Mode)'}
          </span>
          {supabaseConnected ? (
            <Wifi className="w-3 h-3 text-emerald-600 animate-pulse" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          )}
        </button>

        {/* File Import Button */}
        <button
          type="button"
          onClick={onOpenFileImportModal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
          title="ดึงข้อมูลจากไฟล์ Excel / CSV / JSON"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">ดึงข้อมูลจากไฟล์</span>
        </button>

        {/* User Info */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 text-xs">
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold">
            {currentUser.name ? currentUser.name.charAt(0) : 'U'}
          </div>
          <div className="hidden xl:block text-left">
            <div className="font-semibold text-slate-700 leading-tight">
              {currentUser.name}
            </div>
            <div className="text-[10px] text-slate-400 capitalize">
              {currentUser.role}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
