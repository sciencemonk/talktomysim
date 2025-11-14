(function() {
  'use strict';

  window.AgentEmbed = {
    init: function(config) {
      if (!config || !config.agentUrl) {
        console.error('AgentEmbed: agentUrl is required');
        return;
      }

      // Create toggle button (circular, visible when sidebar is closed)
      const button = document.createElement('button');
      button.id = 'agent-embed-button';
      button.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      `;
      button.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: 2px solid rgba(102, 126, 234, 0.3);
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        transition: transform 0.2s, box-shadow 0.2s;
        z-index: 9998;
      `;

      button.addEventListener('mouseenter', function() {
        button.style.transform = 'scale(1.1)';
        button.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2)';
      });

      button.addEventListener('mouseleave', function() {
        button.style.transform = 'scale(1)';
        button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
      });

      // Create sidebar container
      const sidebar = document.createElement('div');
      sidebar.id = 'agent-embed-sidebar';
      sidebar.style.cssText = `
        position: fixed;
        top: 0;
        right: 0;
        width: 0;
        height: 100vh;
        background: white;
        border-left: 1px solid #e5e7eb;
        box-shadow: -4px 0 24px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        transition: width 0.3s ease;
        z-index: 9999;
        display: flex;
        flex-direction: column;
      `;

      // Create iframe
      const iframe = document.createElement('iframe');
      iframe.src = config.agentUrl;
      iframe.style.cssText = `
        width: 100%;
        height: 100%;
        border: none;
      `;
      iframe.setAttribute('allow', 'microphone; camera');

      sidebar.appendChild(iframe);

      // Toggle sidebar
      let isOpen = false;
      button.addEventListener('click', function() {
        isOpen = !isOpen;
        
        if (isOpen) {
          button.style.display = 'none';
          if (window.innerWidth > 1024) {
            sidebar.style.width = '384px'; // 24rem (w-96)
          } else if (window.innerWidth > 768) {
            sidebar.style.width = '320px'; // 20rem
          } else {
            // Mobile: full height bottom panel
            sidebar.style.cssText = `
              position: fixed;
              bottom: 0;
              left: 0;
              right: 0;
              top: auto;
              width: 100%;
              height: 384px;
              background: white;
              border-top: 1px solid #e5e7eb;
              border-left: none;
              box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.1);
              overflow: hidden;
              transition: height 0.3s ease;
              z-index: 9999;
              display: flex;
              flex-direction: column;
            `;
          }
        } else {
          button.style.display = 'flex';
          if (window.innerWidth <= 768) {
            sidebar.style.height = '0';
          } else {
            sidebar.style.width = '0';
          }
        }
      });

          // Mobile: full height bottom panel
          sidebar.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            top: auto;
            width: 100%;
            height: 384px;
            background: white;
            border-top: 1px solid #e5e7eb;
            border-left: none;
            box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            transition: height 0.3s ease;
            z-index: 9999;
            display: flex;
            flex-direction: column;
          `;
        } else {
          // Desktop: restore sidebar styles
          sidebar.style.cssText = `
            position: fixed;
            top: 0;
            right: 0;
            width: ${sidebar.style.width};
            height: 100vh;
            background: white;
            border-left: 1px solid #e5e7eb;
            box-shadow: -4px 0 24px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            transition: width 0.3s ease;
            z-index: 9999;
            display: flex;
            flex-direction: column;
          `;
        }
      }

      // Listen for close message from iframe
      window.addEventListener('message', function(event) {
        if (event.data === 'closeAgentEmbed') {
          isOpen = false;
          button.style.display = 'flex';
          if (window.innerWidth <= 768) {
            sidebar.style.height = '0';
          } else {
            sidebar.style.width = '0';
          }
        }
      });

      window.addEventListener('resize', adjustForMobile);

      // Append to page
      document.body.appendChild(button);
      document.body.appendChild(sidebar);

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
