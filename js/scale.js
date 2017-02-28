const {ipcRenderer} = require('electron')

document.addEventListener('DOMContentLoaded', function () {

  let controlEl = document.querySelector('#scale-control');

  controlEl.addEventListener('click', (event) => {
      ipcRenderer.send('stream-control', controlEl.getAttribute('command'));
  });

  ipcRenderer.on('new-data', (event, field, data) => {
      var weightEl = document.querySelector(`#scale-${field}`);
      if (weightEl) {
          weightEl.innerHTML = data;
      }
  });

  ipcRenderer.on('stream-status', (event, status) => {
      switch (status) {
          case 'stopped': 
            controlEl.setAttribute('command', 'start');
            controlEl.className = 'btn btn-positive';
            controlEl.innerHTML = 'Start';
            break;
        case 'running':
            controlEl.setAttribute('command', 'stop');
            controlEl.className = 'btn btn-negative';
            controlEl.innerHTML = 'Stop';
            break;

      }
  })
  
})