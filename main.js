const { app, BrowserWindow, screen, ipcMain } = require('electron')
const path = require('path')

function createWindow() {

  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.bounds

  const win = new BrowserWindow({
    width: width,
    height: height,
    frame: false, 
    resizable: true,
    fullscreenable: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, 
      enableRemoteModule: true
    }
  })

  win.loadFile('index.html')
  win.setSimpleFullScreen(true)
  
  win.webContents.executeJavaScript(`
    const closeBtn = document.querySelector('.minecraft-btn');
    const themeBtn = document.createElement('button');
    themeBtn.className = 'minecraft-btn theme-btn';
    themeBtn.innerHTML = '<span class="btn-face">🐝</span>';
    document.body.appendChild(themeBtn);

    closeBtn.addEventListener('click', () => {
      window.close();
    });

    themeBtn.addEventListener('click', () => {
      document.body.classList.add('background-mode');
      closeBtn.style.display = 'none';
      themeBtn.style.display = 'none';
      window.electron.ipcRenderer.send('set-background');
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.body.classList.contains('background-mode')) {
        document.body.classList.remove('background-mode');
        closeBtn.style.display = 'block';
        themeBtn.style.display = 'block';
        window.electron.ipcRenderer.send('reset-window');
      }
    });

    // Add style to prevent scrollbars
    const style = document.createElement('style');
    style.textContent = \`
      body.background-mode {
        overflow: hidden !important;
        width: 100vw !important;
        height: 100vh !important;
        margin: 0 !important;
        padding: 0 !important;
      }
    \`;
    document.head.appendChild(style);
  `);

  ipcMain.on('set-background', () => {
    win.setSimpleFullScreen(true)
    win.setBounds({
      x: 0,
      y: 0,
      width: width,
      height: height
    })
  })

  ipcMain.on('reset-window', () => {
    win.setSimpleFullScreen(false)
    win.setSize(width, height)
    win.center()
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
