import { app, BrowserWindow, desktopCapturer, screen, session } from 'electron';
import * as path from 'path';
// 非正规patch,为了修复 app-root-path使用filename
globalThis.require.main = import.meta as any;

let win: BrowserWindow | null = null;
const preload = path.join(__dirname, './preload.mjs');

async function createWindow(): Promise<BrowserWindow> {
  // Setup Better Auth main process

  const { AppService, init } = await import('./app.service');
  const size = screen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    webPreferences: {
      spellcheck: false,
      nodeIntegration: true,
      allowRunningInsecureContent: SERVE,
      contextIsolation: true,
      webSecurity: !SERVE,
      preload,
      // 暂时打开,稳定再关闭
      devTools: process.env.NODE_ENV === 'dev',
    },
  });
  win.webContents.session.setSpellCheckerDictionaryDownloadURL(
    'http://127.0.0.1',
  );
  const injector = await init().catch((rej) => {
    console.warn(rej);
    process.exit(1);
  });

  session.defaultSession.setDisplayMediaRequestHandler(
    (request, callback) => {
      desktopCapturer
        .getSources({ types: ['screen', 'window'] })
        .then((sources) => {
          callback({ video: sources[0], audio: 'loopback' });
        });
    },
    { useSystemPicker: true },
  );
  const appService = injector.get(AppService);
  appService.bootstrap(win!);
  if (SERVE) {
    // import('electron-debug').then((debug) => {
    //   debug.default({ isEnabled: true, showDevTools: true });
    // });
    // import('electron-reloader').then((reloader) => {
    //   const reloaderFn = (reloader as any).default || reloader;
    //   reloaderFn(module);
    // });
    win.loadURL('http://localhost:4200');
    win.webContents.openDevTools();
  } else {
    win.webContents.openDevTools();
    win.loadFile('./webview/index.html');
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  return win;
}

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on('ready', () => setTimeout(createWindow, 400));

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });
} catch (e) {
  // Catch Error
  // throw e;
}
