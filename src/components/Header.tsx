import React from 'react';
import { Sparkles, ShieldCheck, UserCheck, Settings, Download, Dices, Heart, Lock, LogOut, HardDrive } from 'lucide-react';
import { RaffleConfig } from '../types';

interface HeaderProps {
  config: RaffleConfig;
  isAdmin: boolean;
  onOpenAdminLogin: () => void;
  onLogoutAdmin: () => void;
  onOpenSettings: () => void;
  onOpenDraw: () => void;
  onExport: () => void;
  onOpenGoogleDrive: () => void;
  isDriveConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isAdmin,
  onOpenAdminLogin,
  onLogoutAdmin,
  onOpenSettings,
  onOpenDraw,
  onExport,
  onOpenGoogleDrive,
  isDriveConnected = false,
}) => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-purple-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between py-3 gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
                <Heart className="w-5 h-5 fill-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-script text-xl sm:text-2xl text-purple-900 font-bold tracking-wide">
                    Rifa <span className="text-pink-600 font-script">Solidaria</span>
                  </span>
                  <span className="px-2 py-0.5 text-[11px] font-bold bg-purple-100 text-purple-800 rounded-full border border-purple-200">
                    1 al 200
                  </span>
                </div>
                <p className="text-[11px] text-purple-600 font-medium hidden sm:flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-pink-500" />
                  Tu apoyo hace la diferencia 💜
                </p>
              </div>
            </div>

            {/* Mobile Admin Toggle */}
            <div className="sm:hidden">
              {isAdmin ? (
                <button
                  id="toggle-admin-mobile-btn"
                  onClick={onLogoutAdmin}
                  className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs bg-purple-800 text-white shadow-purple-500/20"
                  title="Cerrar sesión de administrador"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-pink-300" />
                  <span>Admin</span>
                  <LogOut className="w-3 h-3 ml-0.5 text-purple-300" />
                </button>
              ) : (
                <button
                  id="toggle-admin-mobile-btn"
                  onClick={onOpenAdminLogin}
                  className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs bg-purple-100 text-purple-800 hover:bg-purple-200"
                  title="Ingresar como Administrador (requiere PIN)"
                >
                  <Lock className="w-3.5 h-3.5 text-purple-600" />
                  <span>Acceso Admin</span>
                </button>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end overflow-x-auto pb-1 sm:pb-0">
            {isAdmin && (
              <>
                {/* Draw winner button */}
                <button
                  id="header-draw-btn"
                  onClick={onOpenDraw}
                  className="px-3.5 py-2 bg-gradient-to-r from-pink-500 via-purple-600 to-purple-700 hover:from-pink-600 hover:to-purple-800 text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-all shrink-0 shadow-md shadow-pink-500/20"
                  title="Realizar sorteo mediante ruleta virtual"
                >
                  <Dices className="w-4 h-4" />
                  <span>Ruleta Virtual</span>
                </button>

                {/* Export CSV */}
                <button
                  id="header-export-btn"
                  onClick={onExport}
                  className="px-3.5 py-2 bg-white hover:bg-purple-50 text-purple-800 border border-purple-200 text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
                  title="Descargar lista de boletas en Excel / CSV"
                >
                  <Download className="w-4 h-4 text-purple-600" />
                  <span className="hidden md:inline">Reporte</span>
                </button>

                {/* Google Drive Backup & Sync */}
                <button
                  id="header-drive-btn"
                  onClick={onOpenGoogleDrive}
                  className="px-3 py-2 bg-white hover:bg-blue-50 text-blue-700 hover:text-blue-900 border border-blue-200 text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-1.5 transition-colors shrink-0 shadow-xs relative"
                  title="Copias de seguridad y sincronización con Google Drive"
                >
                  <HardDrive className="w-4 h-4 text-blue-600" />
                  <span className="hidden md:inline">Google Drive</span>
                  {isDriveConnected && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white absolute -top-0.5 -right-0.5" />
                  )}
                </button>

                {/* Settings (visible to admin for configuration) */}
                <button
                  id="header-settings-btn"
                  onClick={onOpenSettings}
                  className="p-2 bg-white hover:bg-purple-50 text-purple-700 hover:text-purple-900 border border-purple-200 rounded-xl transition-colors shrink-0 shadow-xs"
                  title="Configuración de la rifa"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Admin toggle switch with PIN authentication */}
            <div className="hidden sm:flex items-center pl-2 border-l border-purple-200">
              {isAdmin ? (
                <div className="flex items-center gap-1 bg-purple-900 p-0.5 pl-2.5 rounded-full border border-purple-700 shadow-xs">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-pink-400" />
                    <span>Admin Verificado</span>
                  </div>
                  <button
                    onClick={onLogoutAdmin}
                    className="ml-2 px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                    title="Cerrar sesión de administrador"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Salir</span>
                  </button>
                </div>
              ) : (
                <button
                  id="toggle-admin-desktop-btn"
                  onClick={onOpenAdminLogin}
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs bg-purple-100 text-purple-800 hover:bg-purple-200 border border-purple-200"
                  title="Acceso restringido para organizadores (requiere PIN)"
                >
                  <Lock className="w-3.5 h-3.5 text-purple-600" />
                  <span>Acceso Administrador</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

