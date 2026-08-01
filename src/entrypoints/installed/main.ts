const urlParams = new URLSearchParams(window.location.search);
const reason = urlParams.get('reason');

const title = document.getElementById('title');
const message = document.getElementById('message');

if (reason === 'install') {
    if (title) {
        title.textContent = 'Installation Complete!';
    }
    if (message) {
        message.textContent = 'Click the extension icon on any window to toggle sound on or off.';
    }
} else if (reason === 'update') {
    if (title) {
        title.textContent = 'Window Mute Updated!';
    }
    if (message) {
        message.textContent = 'The extension has been updated to the latest version.';
    }
}