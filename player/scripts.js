document.addEventListener('DOMContentLoaded', () => {
    const videoPlayerWrapper = document.getElementById('videoPlayerWrapper');
    const urlInput = document.getElementById('urlInput');
    const loadVideoBtn = document.getElementById('loadVideo');

    function updateIframe(src) {
        const iframeCode = `
            <iframe src="${src}" scrolling="no" frameborder="0" width="640" height="360" allowfullscreen="true" webkitallowfullscreen="true" mozallowfullscreen="true"></iframe>
        `;
        return iframeCode;
    }

    loadVideoBtn.addEventListener('click', () => {
        const url = urlInput.value.trim();

        videoPlayerWrapper.innerHTML = '';

        if (url) {
            const iframeCode = updateIframe(url);
            videoPlayerWrapper.innerHTML = iframeCode;
        } else {
            videoPlayerWrapper.innerHTML = '<p>URL girilmedi.</p>';
        }
    });
});
