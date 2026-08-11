(function () {
  // Find the script tag that loaded this script
  const scriptTag = document.currentScript || document.querySelector('script[src*="widget.js"]');
  if (!scriptTag) {
    console.error('WaBot Widget: Could not find script tag.');
    return;
  }

  const tenantId = scriptTag.getAttribute('data-tenant-id');
  if (!tenantId) {
    console.error('WaBot Widget: data-tenant-id is missing.');
    return;
  }

  // Base URL (Change this to production URL later)
  // const BASE_URL = 'http://localhost:3001';
  // const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}`;
  const BASE_URL = 'https://aiagent.wamapss.com';
  const API_URL = 'https://aiagent.wamapss.com';

  // Create Container
  const container = document.createElement('div');
  container.id = 'wabot-widget-container';
  Object.assign(container.style, {
    position: 'fixed',
    bottom: '20px',
    zIndex: '999999',
    fontFamily: 'sans-serif',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    pointerEvents: 'none' // Allow clicks to pass through empty space
  });

  // Load config to position the widget correctly
  fetch(`${API_URL}/api/widget/config/${tenantId}`)
    .then(res => res.json())
    .then(config => {
      const position = config.position || 'right';
      const primaryColor = config.primaryColor || '#2563EB';

      if (position === 'left') {
        container.style.left = '20px';
        container.style.alignItems = 'flex-start';
      } else {
        container.style.right = '20px';
      }

      let isOpen = false;

      // Create Iframe
      const iframe = document.createElement('iframe');
      iframe.src = `${BASE_URL}/widget/${tenantId}`;
      Object.assign(iframe.style, {
        width: '350px',
        height: '550px',
        maxHeight: 'calc(100vh - 100px)',
        border: 'none',
        borderRadius: '16px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
        backgroundColor: '#fff',
        display: 'none',
        marginBottom: '16px',
        pointerEvents: 'auto',
        transition: 'all 0.3s ease',
        transform: 'translateY(20px)',
        opacity: '0'
      });

      // Create Button
      const button = document.createElement('div');
      Object.assign(button.style, {
        width: '60px',
        height: '60px',
        borderRadius: '30px',
        backgroundColor: primaryColor,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        cursor: 'pointer',
        pointerEvents: 'auto',
        transition: 'transform 0.2s ease'
      });

      // Default SVG icon (Chat)
      const chatIcon = '<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>';
      // Close SVG icon (X)
      const closeIcon = '<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>';

      button.innerHTML = chatIcon;

      // Interactions
      button.addEventListener('mouseenter', () => button.style.transform = 'scale(1.05)');
      button.addEventListener('mouseleave', () => button.style.transform = 'scale(1)');

      button.addEventListener('click', () => {
        isOpen = !isOpen;
        if (isOpen) {
          button.innerHTML = closeIcon;
          iframe.style.display = 'block';
          setTimeout(() => {
            iframe.style.opacity = '1';
            iframe.style.transform = 'translateY(0)';
          }, 10);
        } else {
          button.innerHTML = chatIcon;
          iframe.style.opacity = '0';
          iframe.style.transform = 'translateY(20px)';
          setTimeout(() => {
            iframe.style.display = 'none';
          }, 300);
        }
      });

      container.appendChild(iframe);
      container.appendChild(button);
      document.body.appendChild(container);
    })
    .catch(err => console.error('WaBot Widget: Failed to load configuration', err));
})();
