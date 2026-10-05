// Google Drive API Integration Service
// Direct client-side calls using Google Identity Services (GIS) and Google Drive v3 REST API

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: string;
  webViewLink?: string;
}

export interface DriveUploadResult {
  id: string;
  name: string;
  webViewLink?: string;
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
            error_callback?: (err: any) => void;
          }) => {
            requestAccessToken: (options?: { prompt?: string }) => void;
          };
          revoke: (token: string, done: () => void) => void;
        };
      };
    };
  }
}

const DRIVE_FOLDER_NAME = 'Rifa Solidaria - Respaldos';
const DRIVE_SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive';

/**
 * Ensures or retrieves the specific folder ID in Google Drive
 */
export async function getOrCreateRaffleFolder(accessToken: string): Promise<string> {
  const query = `name = '${DRIVE_FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`;

  const response = await fetch(searchUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error al buscar carpeta en Drive (${response.status})`);
  }

  const data = await response.json();
  if (data.files && data.files.length > 0) {
    return data.files[0].id;
  }

  // Create folder
  const createUrl = 'https://www.googleapis.com/drive/v3/files';
  const createResponse = await fetch(createUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: DRIVE_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
      description: 'Copias de seguridad y reportes de la Rifa Solidaria',
    }),
  });

  if (!createResponse.ok) {
    throw new Error(`Error al crear carpeta en Google Drive (${createResponse.status})`);
  }

  const folderData = await createResponse.json();
  return folderData.id;
}

/**
 * Uploads a file (JSON, CSV, or Text) to Google Drive in the app's folder
 */
export async function uploadFileToDrive(
  accessToken: string,
  fileName: string,
  mimeType: string,
  content: string | Blob
): Promise<DriveUploadResult> {
  let parentFolderId: string | null = null;
  try {
    parentFolderId = await getOrCreateRaffleFolder(accessToken);
  } catch (err) {
    console.warn('No se pudo ubicar/crear la carpeta específica, subiendo a raíz:', err);
  }

  const metadata: Record<string, any> = {
    name: fileName,
    mimeType: mimeType,
  };

  if (parentFolderId) {
    metadata.parents = [parentFolderId];
  }

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const bodyContent = typeof content === 'string' ? content : await content.text();

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    bodyContent +
    closeDelimiter;

  const uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink';

  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al subir archivo a Google Drive (${response.status}): ${errorText}`);
  }

  return await response.json();
}

/**
 * Lists files saved by the app in Google Drive
 */
export async function listDriveBackupFiles(accessToken: string): Promise<DriveFileItem[]> {
  let query = `trashed = false and (name contains 'Rifa' or name contains 'boletas' or name contains 'respaldo' or name contains 'recibo')`;
  
  try {
    const folderId = await getOrCreateRaffleFolder(accessToken);
    if (folderId) {
      query = `'${folderId}' in parents and trashed = false`;
    }
  } catch (e) {
    console.warn('Folder query fallback:', e);
  }

  const listUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
    query
  )}&orderBy=modifiedTime desc&fields=files(id,name,mimeType,modifiedTime,size,webViewLink)`;

  const response = await fetch(listUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error al listar archivos de Google Drive (${response.status})`);
  }

  const data = await response.json();
  return data.files || [];
}

/**
 * Downloads a file's text/JSON content from Google Drive by ID
 */
export async function downloadDriveFileContent(accessToken: string, fileId: string): Promise<string> {
  const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;

  const response = await fetch(downloadUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error al descargar archivo desde Google Drive (${response.status})`);
  }

  return await response.text();
}

/**
 * Deletes a file from Google Drive
 */
export async function deleteDriveFile(accessToken: string, fileId: string): Promise<void> {
  const deleteUrl = `https://www.googleapis.com/drive/v3/files/${fileId}`;

  const response = await fetch(deleteUrl, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok && response.status !== 204) {
    throw new Error(`Error al eliminar archivo de Google Drive (${response.status})`);
  }
}

/**
 * Requests an access token using Google Identity Services (GIS)
 */
export function requestGoogleAccessToken(
  clientId: string,
  onSuccess: (token: string) => void,
  onError: (error: string) => void
) {
  if (!window.google?.accounts?.oauth2) {
    onError('El servicio de Google Identity (GIS) aún se está cargando. Por favor, intenta de nuevo en unos segundos.');
    return;
  }

  if (!clientId || clientId.trim() === '') {
    onError(
      'Falta configurar el Client ID de Google (VITE_GOOGLE_CLIENT_ID). Puedes ingresar un Client ID en la ventana de configuración.'
    );
    return;
  }

  try {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId.trim(),
      scope: DRIVE_SCOPES,
      callback: (response) => {
        if (response.error) {
          onError(`Error al autorizar con Google: ${response.error}`);
        } else if (response.access_token) {
          onSuccess(response.access_token);
        } else {
          onError('No se recibió el token de acceso de Google.');
        }
      },
      error_callback: (err) => {
        onError(`Error en la ventana emergente de Google: ${err?.message || 'Cancelado por el usuario'}`);
      },
    });

    tokenClient.requestAccessToken({ prompt: 'consent' });
  } catch (err: any) {
    onError(`Error al inicializar autenticación de Google: ${err?.message || err}`);
  }
}
