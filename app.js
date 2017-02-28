// {app}            Module to control application life.
// {BrowserWindow}  Module to create native browser window.
const {app, BrowserWindow, ipcMain} = require('electron')
const SerialPort = require('serialport')

var fields = [
  'LF',
  'RF',
  'LR',
  'RR',
  'LS',
  'RS',
  'FT',
  'RE',
  'FB',
  'RB',
  'CR',
  'TO',
  'TS'
]

var firstKey = 48;

var scale = undefined;

var comPort = '';

var startScale = () => {
  console.log(comPort);
  scale = new SerialPort(comPort, {
          baudRate: 9600,
          // parser: SerialPort.parsers.readline('\r\n') 
          parser: SerialPort.parsers.byteDelimiter([13,10])
        });
        // Read the scale
        scale.on('data', (buff) => {
          var field = fields[buff[2] - firstKey];
          var data = new Buffer(buff.slice(3, buff.length - 2))
            .toString('ascii')
            .trim();
            mainWindow.webContents.send('new-data', field, data);
        });

        scale.on('open', () => {
          mainWindow.webContents.send('stream-status', 'running');
        });

        scale.on('close', () => {
          mainWindow.webContents.send('stream-status', 'stopped');
        });
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform != 'darwin') {
    app.quit();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 500,
    minHeight: 200,
    acceptFirstMouse: true,
    titleBarStyle: 'hidden',
    frame: false
  });

  var firstPage = scale ? '/index.html' : '/configure.html';

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + firstPage);

  ipcMain.on('navigation', (event, arg) => {
    switch (arg) {
      case 'configure':
        mainWindow.loadURL('file://' + __dirname + '/configure.html');
        break;
      case 'weigh':
        mainWindow.loadURL('file://' + __dirname + '/index.html');
        break;
      default:
        console.log(`No matching action on 'navigation' for ${arg}`);
    }
  })

  ipcMain.on('configure', (event, command, arg) => {
    switch (command) {
      case 'get-ports':
        var ports = new SerialPort.list((err, ports) => {
          if (err) {
            return console.log(err);
          }

          mainWindow.webContents.send('configure', 'set-ports', ports);
        });
        break;
      case 'set-com-port':
        comPort = arg;
        startScale();
        
    }
  })

  ipcMain.on('stream-control', (event, command) => {
    switch (command) {
      case 'stop':
        console.log('Stop stream');
        scale.close((e) => {
          if (e) {
            console.log(e);
          } 
          scale = undefined;
        });
        break;
      case 'start':
        console.log('Start stream');
        startScale();
        break;
      default:
        console.log(`No matching action on 'stream-control' for ${command}`);
    }
  });
  
  // Open the DevTools.
  mainWindow.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    if (scale.isOpen()) {
      scale.close();
      scale = null;
    }
    mainWindow = null;
  });
});
