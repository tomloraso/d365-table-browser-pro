export default defineContentScript({
  matches: [
    'https://*.dynamics.com/*',
    'https://*.operations.dynamics.com/*',
    'https://*.cloudax.dynamics.com/*',
    'https://*.sandbox.operations.dynamics.com/*',
  ],
  main() {
    // Detect environment URL and company from the current D365 page
    const detectEnvironment = () => {
      const url = window.location.origin;
      // D365 stores the current company in the URL query string as 'cmp'
      const params = new URLSearchParams(window.location.search);
      const company = params.get('cmp') || '';

      return { url, company };
    };

    // Listen for requests from the popup/sidepanel
    browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.type === 'DETECT_ENVIRONMENT') {
        const env = detectEnvironment();
        sendResponse(env);
        return true;
      }
    });
  },
});
