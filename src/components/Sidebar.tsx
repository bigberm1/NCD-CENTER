import React from 'react';
import {
  Home,
  Users,
  Eye,
  FlaskConical,
  Footprints,
  TrendingDown,
  Video,
  FileSpreadsheet,
  Download,
  X,
  PlusSquare
} from 'lucide-react';

export type ViewType =
  | 'home'
  | 'patients'
  | 'fundus'
  | 'lab'
  | 'foot'
  | 'remission'
  | 'telemed'
  | 'export43'
  | 'download';

interface SidebarProps {
  currentView: ViewType;
  onSelectView: (view: ViewType) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  counts?: {
    patients?: number;
    fundusDates?: number;
    telemedDates?: number;
    labRecords?: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  isOpenMobile,
  onCloseMobile,
  counts
}) => {
  const menuItems = [
    { id: 'home', label: 'หน้าหลัก', icon: Home, badge: null },
    { id: 'patients', label: 'ทะเบียน', icon: Users, badge: counts?.patients },
    { id: 'fundus', label: 'ตรวจตา', icon: Eye, badge: counts?.fundusDates },
    { id: 'lab', label: 'ตรวจเลือด', icon: FlaskConical, badge: counts?.labRecords },
    { id: 'foot', label: 'ตรวจเท้า', icon: Footprints, badge: null },
    { id: 'remission', label: 'Remission', icon: TrendingDown, badge: null },
    { id: 'telemed', label: 'TeleMed', icon: Video, badge: counts?.telemedDates },
    { id: 'export43', label: 'ส่ง 43 แฟ้ม', icon: FileSpreadsheet, badge: null },
    { id: 'download', label: 'ดาวน์โหลด', icon: Download, badge: null },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-white border-r border-slate-200 z-50 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand */}
        <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <PlusSquare className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="font-bold text-slate-800 text-sm tracking-tight leading-tight">
                NCD Center
              </div>
              <div className="text-[11px] text-blue-600 font-medium">
                PCU โฮงยาไทย
              </div>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            ระบบงานคลินิก NCD
          </div>
          {menuItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectView(item.id as ViewType);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-50/80 text-blue-700 font-bold shadow-2xs border border-blue-100/60'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-blue-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge !== null && item.badge > 0 && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3.5 border-t border-slate-100 text-[11px] text-slate-500 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Hong Ya Thai PCU</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
              v2.0 React
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            อ.เมือง จ.เชียงราย เครือข่าย รพศ.
          </div>
        </div>
      </aside>
    </>
  );
};
