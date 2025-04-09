
const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, 'public/favicon.ico')
  });

  // Load the app
  mainWindow.loadURL(
    isDev
      ? 'http://localhost:5173' // Dev server address
      : `file://${path.join(__dirname, 'dist/index.html')}` // Production build
  );

  // Open DevTools in development mode
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Set up IPC handlers for file operations
  setupIpcHandlers();

  // Create application menu
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Export Data',
          click() {
            mainWindow.webContents.executeJavaScript('window.exportData && window.exportData()');
          }
        },
        {
          label: 'Import Data',
          click() {
            mainWindow.webContents.executeJavaScript('window.importData && window.importData()');
          }
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click() {
            dialog.showMessageBox(mainWindow, {
              title: 'About Demo Retail Management',
              message: 'Demo Retail Management System',
              detail: 'Version 1.0.0\n© 2025 Demo',
              buttons: ['OK']
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function setupIpcHandlers() {
  // Handler for saving files
  ipcMain.handle('save-file', async (event, { content, fileName, fileType }) => {
    try {
      const { filePath } = await dialog.showSaveDialog({
        defaultPath: fileName,
        filters: [
          { name: fileType === 'pdf' ? 'PDF Documents' : 'All Files', 
            extensions: [fileType || '*'] }
        ]
      });
      
      if (filePath) {
        // Convert base64 content to buffer if it's a PDF
        if (fileType === 'pdf' && content.startsWith('data:application/pdf;base64,')) {
          const base64Data = content.replace(/^data:application\/pdf;base64,/, '');
          fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
        } else {
          fs.writeFileSync(filePath, content);
        }
        return { success: true, filePath };
      }
      return { success: false, error: 'User cancelled' };
    } catch (error) {
      console.error('Error saving file:', error);
      return { success: false, error: error.message };
    }
  });
  
  // Handler for exporting data
  ipcMain.handle('export-data', async (event, data) => {
    try {
      const { filePath } = await dialog.showSaveDialog({
        defaultPath: 'retail-data-backup.json',
        filters: [{ name: 'JSON Files', extensions: ['json'] }]
      });
      
      if (filePath) {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return { success: true, filePath };
      }
      return { success: false, error: 'User cancelled' };
    } catch (error) {
      console.error('Error exporting data:', error);
      return { success: false, error: error.message };
    }
  });
  
  // Handler for importing data
  ipcMain.handle('import-data', async () => {
    try {
      const { filePaths } = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'JSON Files', extensions: ['json'] }]
      });
      
      if (filePaths && filePaths.length > 0) {
        const data = fs.readFileSync(filePaths[0], 'utf8');
        return { success: true, data: JSON.parse(data) };
      }
      return { success: false, error: 'User cancelled' };
    } catch (error) {
      console.error('Error importing data:', error);
      return { success: false, error: error.message };
    }
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
