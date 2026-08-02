const urlParams = new URLSearchParams(window.location.search);
const reason = urlParams.get('reason');
const latest = urlParams.get('latest');
const current = urlParams.get('current');

const title = document.getElementById('title');
const message = document.getElementById('message');
const btnGithub = document.getElementById('btn-github') as HTMLAnchorElement | null;
const btnGithubText = document.getElementById('btn-github-text');

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
} else if (reason === 'update_available') {
    if (title) {
        title.textContent = 'New Update Available!';
    }
    if (message) {
        if (latest && current) {
            message.textContent = `A new version (v${latest}) of Window Mute is available! You are currently on version ${current}.`;
        } else if (latest) {
            message.textContent = `A new version (v${latest}) of Window Mute is available!`;
        } else {
            message.textContent = 'A new update is available! Please download the latest version.';
        }
    }
    if (btnGithubText) {
        btnGithubText.textContent = latest ? `Get v${latest} on GitHub` : 'Get Latest Release';
    }
    if (btnGithub) {
        const currentHref = btnGithub.getAttribute('href') || '';
        if (currentHref) {
            const cleanUrl = currentHref.replace(/\/+$/, '');
            btnGithub.href = `${cleanUrl}/releases/latest`;
        }
    }
}
