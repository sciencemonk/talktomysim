(function() {
  'use strict';

  window.AgentEmbed = {
    init: function(config) {
      if (!config || !config.agentUrl) {
        console.error('AgentEmbed: agentUrl is required');
        return;
      }

      // Create container
      const container = document.createElement('div');
      container.id = 'agent-embed-container';
      container.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      `;

      // Create chat button
      const button = document.createElement('button');
      button.id = 'agent-embed-button';
      button.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      `;
      button.style.cssText = `
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        transition: transform 0.2s, box-shadow 0.2s;
      `;

      button.addEventListener('mouseenter', function() {
        button.style.transform = 'scale(1.1)';
        button.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2)';
      });

      button.addEventListener('mouseleave', function() {
        button.style.transform = 'scale(1)';
        button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
      });

      // Create iframe container
      const iframeContainer = document.createElement('div');
      iframeContainer.id = 'agent-embed-iframe-container';
      iframeContainer.style.cssText = `
        position: fixed;
        bottom: 90px;
        right: 20px;
        width: 400px;
        height: 600px;
        max-height: calc(100vh - 120px);
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        overflow: hidden;
        display: none;
        z-index: 9999;
      `;

      // Create iframe
      const iframe = document.createElement('iframe');
      iframe.src = config.agentUrl;
      iframe.style.cssText = `
        width: 100%;
        height: 100%;
        border: none;
        border-radius: 12px;
      `;
      iframe.setAttribute('allow', 'microphone; camera');

      iframeContainer.appendChild(iframe);

      // Toggle chat
      let isOpen = false;
      button.addEventListener('click', function() {
        isOpen = !isOpen;
        iframeContainer.style.display = isOpen ? 'block' : 'none';
        button.innerHTML = isOpen ? `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ` : `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        `;
      });

      // Handle responsive design
      function adjustForMobile() {
        if (window.innerWidth <= 768) {
          iframeContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100%;
            height: 100%;
            max-height: 100vh;
            border-radius: 0;
            box-shadow: none;
            display: ${isOpen ? 'block' : 'none'};
            z-index: 9999;
          `;
        } else {
          iframeContainer.style.cssText = `
            position: fixed;
            bottom: 90px;
            right: 20px;
            width: 400px;
            height: 600px;
            max-height: calc(100vh - 120px);
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            overflow: hidden;
            display: ${isOpen ? 'block' : 'none'};
            z-index: 9999;
          `;
        }
      }

      window.addEventListener('resize', adjustForMobile);
      adjustForMobile();

      // Append to page
      container.appendChild(button);
      container.appendChild(iframeContainer);
      document.body.appendChild(container);

      console.log('AgentEmbed: Initialized successfully');
    }
  };

  // Auto-initialize if data attributes are present
  document.addEventListener('DOMContentLoaded', function() {
    const script = document.querySelector('script[data-agent-url]');
    if (script) {
      const agentUrl = script.getAttribute('data-agent-url');
      const position = script.getAttribute('data-position') || 'bottom-right';
      window.AgentEmbed.init({ agentUrl, position });
    }
  });
})();
