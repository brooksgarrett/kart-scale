const {ipcRenderer} = require('electron')

var setPath = (e) => {
    ipcRenderer.send('configure', 'set-com-port', e.srcElement.innerHTML);
}

document.addEventListener('DOMContentLoaded', function () {
    let tableEl = document.querySelector('#port-table');

    ipcRenderer.send('configure', 'get-ports');

    ipcRenderer.on('configure', (event, command, ports) => {
        if (command === 'set-ports')
        {
            ports.forEach((port) => {
                var list = document.querySelector('#port-list');
                var li = document.createElement('li');
                li.innerHTML = port.comName;
                li.addEventListener('click', setPath);
                list.appendChild(li);

            });
        }
    })

    

})
