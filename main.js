const { app, BrowserWindow } = require('electron')
const path = require('path')
const { ipcMain } = require('electron')
const fetch = require('node-fetch')
var Vibrant = require('node-vibrant')

var win;
var token = '';

function createWindow () {
    win = new BrowserWindow({
        width: 1280,
        height: 180,
        frame: false, 
        transparent: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(__dirname, 'preload.js')
        }
    })

    win.loadFile('index.html')
}

var authorizationUrl = 'https://accounts.spotify.com/authorize'
var scopes = 'user-read-currently-playing user-modify-playback-state user-read-playback-state';
var client_id = 'c661a23ad97d44728b4031132e439d06';
var redirectUri = 'https://example.com/';
var state = 'wehn9Hibiuh892iu';
var error_count = 0;

var oauthUrl = 
    authorizationUrl +
    '?response_type=token' +
    '&client_id=' + client_id +
    '&scope=' + encodeURIComponent(scopes) +
    '&redirect_uri=' + encodeURIComponent(redirectUri) + 
    '&show_dialog=false' + 
    '&state=' + state;

ipcMain.on('spotify-oauth', (event, arg) => {
    var authWindow = new BrowserWindow({
        width: 600, 
        height: 800, 
        show: false, 
        alwaysOnTop: true,
        webPreferences: {
            enableRemoteModule: false
        }
    });

    authWindow.loadURL(oauthUrl);
    authWindow.show();
    authWindow.webContents.on('will-redirect', function (event, url) {
        authWindow.close();
        var start, end = 0;
        for (i = 0; i < url.length; i++){
            if (url.charAt(i) == '='){
                start = i + 1;
            }
            if (url.charAt(i) == '&'){
                end = i;
                break;
            }
        }
        token = url.substring(start, end);
        console.log(token);
    });
    
    authWindow.on('closed', function() {
        authWindow = null;
    });

    if (token != 'access_denied' || token != '') {
        win.loadFile('player.html');
    }
});

ipcMain.on('spotify-data', (event, arg) => {
    var headers = new fetch.Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    headers.append('Authorization', ('Bearer ' + token));
    const conf = {
        method: 'GET',
        headers: headers
    }
    
    fetch('https://api.spotify.com/v1/me/player?market=ES&additional_types=episode', conf)
        .then((response) => {response.json().then((data) => {
                event.reply('spotify-data', data)
                error_count = 0;
            }).catch((error) => {
                console.log('ERROR');
                error_count += 1;
                if (error_count > 5) {
                    event.reply('spotify-data', 'ERROR')
                }
        })
    }).catch((exception) => {
        console.log('ERROR');
        error_count += 1;
        if (error_count > 5) {
            event.reply('spotify-data', 'ERROR')
        }
    })
});

ipcMain.on('spotify-play', (event, arg) => {
    var headers = new fetch.Headers();
    headers.append('Authorization', ('Bearer ' + token));
    const conf = {
        method: 'put',
        headers: headers
    }
    
    fetch('https://api.spotify.com/v1/me/player/play', conf)
        .then((response) => {response.json().then((data) => {
            }).catch((error) => {
                console.error('Error:', error);
        })
    })
});

ipcMain.on('spotify-pause', (event, arg) => {
    var headers = new fetch.Headers();
    headers.append('Authorization', ('Bearer ' + token));
    const conf = {
        method: 'put',
        headers: headers
    }
    
    fetch('https://api.spotify.com/v1/me/player/pause', conf)
        .then((response) => {response.json().then((data) => {
            }).catch((error) => {
                console.error('Error:', error);
        })
    })
});

ipcMain.on('spotify-next', (event, arg) => {
    var headers = new fetch.Headers();
    headers.append('Authorization', ('Bearer ' + token));
    const conf = {
        method: 'post',
        headers: headers
    }
    
    fetch('https://api.spotify.com/v1/me/player/next', conf)
        .then((response) => {response.json().then((data) => {
            }).catch((error) => {
                console.error('Error:', error);
        })
    })
});

ipcMain.on('spotify-prev', (event, arg) => {
    var headers = new fetch.Headers();
    headers.append('Authorization', ('Bearer ' + token));
    const conf = {
        method: 'post',
        headers: headers
    }
    
    fetch('https://api.spotify.com/v1/me/player/previous', conf)
        .then((response) => {response.json().then((data) => {
            }).catch((error) => {
                console.error('Error:', error);
        })
    })
});

ipcMain.on('spotify-seek', (event, arg) => {
    var headers = new fetch.Headers();
    headers.append('Authorization', ('Bearer ' + token));
    const conf = {
        method: 'put',
        headers: headers
    }
    
    fetch('https://api.spotify.com/v1/me/player/seek?position_ms=' + Number(arg), conf)
        .then((response) => {response.json().then((data) => {
            }).catch((error) => {
                console.error('Error:', error);
        })
    })
});

ipcMain.on('spotify-volume', (event, arg) => {
    var headers = new fetch.Headers();
    headers.append('Authorization', ('Bearer ' + token));
    const conf = {
        method: 'put',
        headers: headers
    }
    
    fetch('https://api.spotify.com/v1/me/player/volume?volume_percent=' + Number(arg), conf)
        .then((response) => {response.json().then((data) => {
            }).catch((error) => {
                console.error('Error:', error);
        })
    })
});

ipcMain.on('spotify-shuffle', (event, arg) => {
    var headers = new fetch.Headers();
    headers.append('Authorization', ('Bearer ' + token));
    const conf = {
        method: 'put',
        headers: headers
    }
    
    fetch('https://api.spotify.com/v1/me/player/shuffle?state=' + arg, conf)
        .then((response) => {response.json().then((data) => {
            }).catch((error) => {
                console.error('Error:', error);
        })
    })
});

ipcMain.on('spotify-repeat', (event, arg) => {
    var headers = new fetch.Headers();
    headers.append('Authorization', ('Bearer ' + token));
    const conf = {
        method: 'put',
        headers: headers
    }
    
    fetch('https://api.spotify.com/v1/me/player/repeat?state=' + arg, conf)
        .then((response) => {response.json().then((data) => {
            }).catch((error) => {
                console.error('Error:', error);
        })
    })
});

ipcMain.on('vibrant-colors', (event, arg) => {
    Vibrant.from(arg).getPalette().then(function(palette) {
        event.reply('vibrant-colors', palette.Vibrant.getHex())
    });
});

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




