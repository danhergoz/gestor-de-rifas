import React, { useState, useEffect } from 'react';
import {
  X,
  HardDrive,
  Upload,
  Download,
  Trash2,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  FileCode,
  FileText,
  Lock,
  LogOut,
  FolderSync,
  HelpCircle,
} from 'lucide-react';
import { Ticket, RaffleConfig, PaymentRecord } from '../types';
import {
  DriveFileItem,
  listDriveBackupFiles,
  uploadFileToDrive,
  downloadDriveFileContent,
  deleteDriveFile,
  requestGoogleAccessToken,
} from '../services/googleDriveService';
import { exportTicketsToCSV, formatCurrency, formatDate } from '../utils/formatters';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  tickets: Ticket[];
  config: RaffleConfig;
  payments: PaymentRecord[];
  onRestoreBackup: (backupData: { tickets: Ticket[]; config?: RaffleConfig; payments?: PaymentRecord[] }) => void;
  onShowToast: (message: string, type: 'success' | 'info' | 'error') => void;
  googleToken: string | null;
  setGoogleToken: (token: string | null) => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  tickets,
  config,
  payments,
  onRestoreBackup,
  onShowToast,
  googleToken,
  setGoogleToken,
}) => {
  const [customClientId, setCustomClientId] = useState<string>(() => {
    return localStorage.getItem('rifa_google_client_id') || import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [showConfigHelp, setShowConfigHelp] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const effectiveClientId = customClientId.trim() || import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  // Load files when connected
  const fetchFiles = async (token: string) => {
    setIsLoadingFiles(true);
    try {
      const driveFiles = await listDriveBackupFiles(token);
      setFiles(driveFiles);
    } catch (err: any) {
      console.error('Error al listar archivos de Drive:', err);
      onShowToast(`No se pudieron cargar los archivos de Drive: ${err.message}`, 'error');
    } finally {
      setIsLoadingFiles(false);
    }
  };

  useEffect(() => {
    if (isOpen && googleToken) {
      fetchFiles(googleToken);
    }
  }, [isOpen, googleToken]);

  if (!isOpen) return null;

  // Handle Google Drive connection
  const handleConnect = () => {
    if (!effectiveClientId) {
      setShowConfigHelp(true);
      onShowToast('Por favor, ingresa tu Client ID de Google Cloud o configúralo en .env', 'info');
      return;
    }

    // Save custom Client ID for convenience
    if (customClientId) {
      localStorage.setItem('rifa_google_client_id', customClientId.trim());
    }

    setIsConnecting(true);
    requestGoogleAccessToken(
      effectiveClientId,
      (token) => {
        setIsConnecting(false);
        setGoogleToken(token);
        onShowToast('¡Conectado con éxito a Google Drive!', 'success');
        fetchFiles(token);
      },
      (errorMsg) => {
        setIsConnecting(false);
        onShowToast(errorMsg, 'error');
      }
    );
  };

  const handleDisconnect = () => {
    setGoogleToken(null);
    setFiles([]);
    onShowToast('Desconectado de Google Drive.', 'info');
  };

  // Upload JSON Backup
  const handleBackupJSON = async () => {
    if (!googleToken) return;
    setIsUploading(true);
    setActionSuccess(null);
    try {
      const now = new Date();
      const dateStr = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const fileName = `Respaldo_Rifa_Solidaria_${dateStr}.json`;

      const backupData = {
        app: 'Rifa Solidaria 1-200',
        version: '1.0',
        timestamp: now.toISOString(),
        totalTickets: tickets.length,
        config,
        tickets,
        payments,
      };

      const result = await uploadFileToDrive(
        googleToken,
        fileName,
        'application/json',
        JSON.stringify(backupData, null, 2)
      );

      setActionSuccess(`Copia de seguridad guardada: ${fileName}`);
      onShowToast(`¡Copia de seguridad guardada en Google Drive!`, 'success');
      fetchFiles(googleToken);
    } catch (err: any) {
      onShowToast(`Error al subir a Google Drive: ${err.message}`, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // Upload CSV Report
  const handleBackupCSV = async () => {
    if (!googleToken) return;
    setIsUploading(true);
    setActionSuccess(null);
    try {
      const now = new Date();
      const dateStr = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const fileName = `Reporte_Boletas_Rifa_${dateStr}.csv`;

      // Generate CSV string
      const headers = ['Numero', 'Estado', 'Comprador', 'Telefono', 'Email', 'Metodo_Pago', 'Fecha_Reserva', 'Fecha_Pago', 'Notas'];
      const rows = tickets.map((t) => [
        t.number,
        t.status.toUpperCase(),
        `"${(t.buyerName || '').replace(/"/g, '""')}"`,
        `"${(t.buyerPhone || '').replace(/"/g, '""')}"`,
        `"${(t.buyerEmail || '').replace(/"/g, '""')}"`,
        `"${(t.paymentMethod || '').replace(/"/g, '""')}"`,
        `"${(t.reservedAt ? formatDate(t.reservedAt) : '').replace(/"/g, '""')}"`,
        `"${(t.paidAt ? formatDate(t.paidAt) : '').replace(/"/g, '""')}"`,
        `"${(t.notes || '').replace(/"/g, '""')}"`,
      ]);

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

      const result = await uploadFileToDrive(googleToken, fileName, 'text/csv', csvContent);

      setActionSuccess(`Reporte CSV guardado en Drive: ${fileName}`);
      onShowToast(`¡Reporte Excel / CSV subido a Google Drive!`, 'success');
      fetchFiles(googleToken);
    } catch (err: any) {
      onShowToast(`Error al exportar CSV a Google Drive: ${err.message}`, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // Upload Raffle Status & Rules Act
  const handleBackupSummaryDoc = async () => {
    if (!googleToken) return;
    setIsUploading(true);
    setActionSuccess(null);
    try {
      const now = new Date();
      const dateStr = now.toISOString().replace(/[:.]/g, '-').slice(0, 10);
      const fileName = `Acta_Estado_Rifa_${config.title.replace(/\s+/g, '_')}_${dateStr}.txt`;

      const paidTickets = tickets.filter((t) => t.status === 'pagado');
      const reservedTickets = tickets.filter((t) => t.status === 'reservado');
      const totalCollected = paidTickets.length * config.ticketPrice;

      const reportContent = `
=====================================================
          ACTA OFICIAL - RIFA SOLIDARIA
=====================================================
Título: ${config.title}
Premio: ${config.prizeName} (${formatCurrency(config.prizeValue)})
Valor por Boleta: ${formatCurrency(config.ticketPrice)}
Fecha del Sorteo: ${config.drawDate} (Lotería: ${config.lotteryName})
Fecha de Emisión del Reporte: ${formatDate(now.toISOString())}

-----------------------------------------------------
1. BALANCE GENERAL
-----------------------------------------------------
- Total de Boletas: ${config.totalTickets}
- Boletas Pagadas (Marcadas con X): ${paidTickets.length} (${((paidTickets.length / config.totalTickets) * 100).toFixed(1)}%)
- Boletas Apartadas (Reservadas): ${reservedTickets.length}
- Boletas Disponibles: ${config.totalTickets - paidTickets.length - reservedTickets.length}
- Total Recaudado: ${formatCurrency(totalCollected)}
- Meta de Recaudación: ${formatCurrency(config.totalTickets * config.ticketPrice)}

-----------------------------------------------------
2. INFORMACIÓN DE PAGO
-----------------------------------------------------
${config.bankInfo}

-----------------------------------------------------
3. DETALLE DE PARTICIPANTES PAGADOS
-----------------------------------------------------
${paidTickets
  .map(
    (t) =>
      `#${String(t.number).padStart(3, '0')} | ${t.buyerName} | Tel: ${t.buyerPhone || 'N/A'} | Pago: ${t.paymentMethod || 'Efectivo'} | ${t.paidAt ? formatDate(t.paidAt) : ''}`
  )
  .join('\n')}

=====================================================
Generado automáticamente por el Gestor de Rifas
=====================================================
`;

      await uploadFileToDrive(googleToken, fileName, 'text/plain', reportContent.trim());

      setActionSuccess(`Acta oficial guardada en Drive: ${fileName}`);
      onShowToast(`¡Acta oficial guardada en Google Drive!`, 'success');
      fetchFiles(googleToken);
    } catch (err: any) {
      onShowToast(`Error al subir acta a Google Drive: ${err.message}`, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // Restore backup from Google Drive file
  const handleRestore = async (file: DriveFileItem) => {
    if (!googleToken) return;
    if (
      !window.confirm(
        `¿Estás seguro de restaurar los datos desde el archivo "${file.name}"?\n\nEsta acción reemplazará la lista de boletas y pagos actual.`
      )
    ) {
      return;
    }

    setIsRestoring(true);
    try {
      const content = await downloadDriveFileContent(googleToken, file.id);
      const parsed = JSON.parse(content);

      if (parsed.tickets && Array.isArray(parsed.tickets)) {
        onRestoreBackup({
          tickets: parsed.tickets,
          config: parsed.config,
          payments: parsed.payments,
        });
        onShowToast('¡Copia de seguridad restaurada con éxito desde Google Drive!', 'success');
        onClose();
      } else {
        throw new Error('El archivo no tiene el formato de respaldo de boletas válido.');
      }
    } catch (err: any) {
      onShowToast(`Error al restaurar desde Google Drive: ${err.message}`, 'error');
    } finally {
      setIsRestoring(false);
    }
  };

  // Delete file
  const handleDelete = async (file: DriveFileItem) => {
    if (!googleToken) return;
    if (!window.confirm(`¿Deseas eliminar el archivo "${file.name}" de tu Google Drive?`)) {
      return;
    }

    try {
      await deleteDriveFile(googleToken, file.id);
      onShowToast('Archivo eliminado de Google Drive.', 'info');
      fetchFiles(googleToken);
    } catch (err: any) {
      onShowToast(`Error al eliminar: ${err.message}`, 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl border-2 border-purple-200 shadow-2xl max-w-2xl w-full p-6 space-y-6 my-8 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-purple-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-emerald-500 to-blue-600 flex items-center justify-center text-white shadow-md">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-purple-950 flex items-center gap-2">
                <span>Google Drive Sync</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Cloud Backup
                </span>
              </h3>
              <p className="text-xs text-purple-700">
                Guarda copias de seguridad, reportes CSV y actas oficiales en tu Google Drive.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-purple-400 hover:text-purple-950 hover:bg-purple-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Connection State Panel */}
        {!googleToken ? (
          <div className="space-y-4">
            <div className="bg-purple-50/80 border border-purple-200 rounded-2xl p-5 space-y-4 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-white shadow-md flex items-center justify-center">
                <svg className="w-8 h-8" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>

              <div>
                <h4 className="font-black text-purple-950 text-base">Conectar con Google Drive</h4>
                <p className="text-xs text-purple-700 max-w-md mx-auto mt-1">
                  Autoriza el acceso para almacenar copias de respaldo y exportar los listados de participantes en una carpeta privada de tu cuenta Google.
                </p>
              </div>

              {/* Client ID Configuration Field */}
              <div className="text-left bg-white p-3.5 rounded-xl border border-purple-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-purple-900 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-purple-600" />
                    <span>Google OAuth Client ID (Opcional):</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowConfigHelp(!showConfigHelp)}
                    className="text-pink-600 hover:text-pink-700 flex items-center gap-1 text-[11px] font-semibold"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>¿Cómo obtenerlo?</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={customClientId}
                  onChange={(e) => setCustomClientId(e.target.value)}
                  placeholder="ej. 123456789-abc.apps.googleusercontent.com"
                  className="w-full px-3 py-2 bg-purple-50/50 border border-purple-200 rounded-lg text-xs text-purple-950 font-mono focus:outline-none focus:border-purple-600 focus:bg-white"
                />
                {showConfigHelp && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 space-y-1.5">
                    <p className="font-bold">Pasos para habilitar Google Drive:</p>
                    <ol className="list-decimal list-inside space-y-0.5 text-[10px] text-amber-800">
                      <li>Ve a <strong>Google Cloud Console</strong> &gt; <em>APIs & Services &gt; Credentials</em>.</li>
                      <li>Crea un <strong>OAuth Client ID</strong> tipo <em>Web Application</em>.</li>
                      <li>Agrega el origen autorizado de tu aplicación.</li>
                      <li>Pega el Client ID generado en este campo.</li>
                    </ol>
                  </div>
                )}
              </div>

              <button
                id="google-drive-connect-btn"
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Conectando con Google...</span>
                  </>
                ) : (
                  <>
                    <HardDrive className="w-4 h-4" />
                    <span>Autorizar Google Drive</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Connected Badge */}
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-950">Conectado a Google Drive</h4>
                  <p className="text-xs text-emerald-700">Carpeta de destino: <strong>Rifa Solidaria - Respaldos</strong></p>
                </div>
              </div>

              <button
                onClick={handleDisconnect}
                className="px-3 py-1.5 bg-white text-purple-700 hover:text-red-600 hover:bg-red-50 border border-purple-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Desconectar</span>
              </button>
            </div>

            {/* Quick Upload Actions */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-950 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-purple-600" />
                <span>Subir Respaldo a Drive:</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* JSON Full Backup */}
                <button
                  onClick={handleBackupJSON}
                  disabled={isUploading}
                  className="p-3.5 bg-purple-50 hover:bg-purple-100/80 border border-purple-200 rounded-2xl text-left transition-all hover:shadow-md group disabled:opacity-50"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-200 text-purple-800 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <FileCode className="w-4 h-4" />
                  </div>
                  <h5 className="text-xs font-bold text-purple-950">Copia Total (JSON)</h5>
                  <p className="text-[10px] text-purple-700 mt-0.5">200 boletas, participantes y pagos restaurables.</p>
                </button>

                {/* CSV Spreadsheet Report */}
                <button
                  onClick={handleBackupCSV}
                  disabled={isUploading}
                  className="p-3.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-2xl text-left transition-all hover:shadow-md group disabled:opacity-50"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-200 text-emerald-800 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <h5 className="text-xs font-bold text-emerald-950">Planilla (CSV/Excel)</h5>
                  <p className="text-[10px] text-emerald-700 mt-0.5">Reporte tabular compatible con hojas de cálculo.</p>
                </button>

                {/* Status Act Text Doc */}
                <button
                  onClick={handleBackupSummaryDoc}
                  disabled={isUploading}
                  className="p-3.5 bg-blue-50 hover:bg-blue-100/80 border border-blue-200 rounded-2xl text-left transition-all hover:shadow-md group disabled:opacity-50"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-200 text-blue-800 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h5 className="text-xs font-bold text-blue-950">Acta Oficial (TXT)</h5>
                  <p className="text-[10px] text-blue-700 mt-0.5">Resumen de recaudación, balances y reglas.</p>
                </button>
              </div>
            </div>

            {/* Success indicator */}
            {actionSuccess && (
              <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{actionSuccess}</span>
              </div>
            )}

            {/* List of Files in Drive */}
            <div className="space-y-3 pt-3 border-t border-purple-100">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-950 flex items-center gap-1.5">
                  <FolderSync className="w-3.5 h-3.5 text-purple-600" />
                  <span>Archivos en tu Google Drive ({files.length}):</span>
                </h4>
                <button
                  onClick={() => fetchFiles(googleToken)}
                  disabled={isLoadingFiles}
                  className="text-xs text-purple-700 hover:text-purple-950 flex items-center gap-1 font-semibold"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                  <span>Actualizar</span>
                </button>
              </div>

              {isLoadingFiles ? (
                <div className="p-8 text-center text-xs text-purple-600 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Consultando archivos en Google Drive...</span>
                </div>
              ) : files.length === 0 ? (
                <div className="p-6 bg-purple-50/50 border border-dashed border-purple-200 rounded-2xl text-center text-xs text-purple-600">
                  <HardDrive className="w-8 h-8 text-purple-300 mx-auto mb-2" />
                  <p>Aún no hay copias de seguridad guardadas en la carpeta de la rifa.</p>
                  <p className="text-[11px] text-purple-400 mt-1">Usa los botones superiores para crear tu primer respaldo.</p>
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {files.map((file) => {
                    const isJSON = file.name.endsWith('.json');
                    const isCSV = file.name.endsWith('.csv');

                    return (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 bg-white border border-purple-200 hover:border-purple-300 rounded-xl text-xs transition-all shadow-xs gap-2"
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          {isJSON ? (
                            <FileCode className="w-4 h-4 text-purple-600 shrink-0" />
                          ) : isCSV ? (
                            <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                          )}
                          <div className="truncate">
                            <p className="font-bold text-purple-950 truncate">{file.name}</p>
                            <p className="text-[10px] text-purple-500">
                              {file.modifiedTime ? formatDate(file.modifiedTime) : ''}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {file.webViewLink && (
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-purple-600 hover:text-purple-950 hover:bg-purple-100 rounded-lg transition-colors"
                              title="Abrir en Google Drive"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}

                          {isJSON && (
                            <button
                              onClick={() => handleRestore(file)}
                              disabled={isRestoring}
                              className="px-2.5 py-1 bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold rounded-lg text-[10px] uppercase transition-colors"
                              title="Restaurar este respaldo en la aplicación"
                            >
                              Restaurar
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(file)}
                            className="p-1.5 text-purple-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar de Drive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-purple-100">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
