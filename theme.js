// little theme toggle simple and clean.
(() => {
    const root = document.documentElement;
    const themeBtn = document.getElementById('themeBtn');
    const saved = localStorage.getItem('theme2048') || 'light';

    function apply(t){
        root.classList.remove('light','dark');
        root.classList.add(t);
        themeBtn.textContent = t === 'dark' ? '🌙' : '🔆';
        localStorage.setItem('theme2048', t);
    }
    themeBtn.addEventListener('click', () => {
        const now = root.classList.contains('dark') ? 'dark' : (root.classList.contains('light') ? 'light' : saved);
        apply(now === 'dark' ? 'light' : 'dark');
    });

    apply(saved);
})();