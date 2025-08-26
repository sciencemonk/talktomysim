/**
 * Talk to My Sim Widget Loader
 * This script creates a popup chat widget for embedding Sims on websites
 */
(function() {
  // Configuration
  let config = {
    id: null,
    position: 'bottom-right',
    theme: null,
    width: 380,
    height: 600
  };

  // Widget state
  let isOpen = false;
  let widgetContainer = null;
  let iframe = null;

  // Initialize the widget
  function init(options) {
    // Merge options with default config
    if (options) {
      config = { ...config, ...options };
    }

    // Create widget container if it doesn't exist
    if (!widgetContainer) {
      createWidgetElements();
    }
  }

  // Create the widget elements
  function createWidgetElements() {
    // Create container
    widgetContainer = document.createElement('div');
    widgetContainer.id = 'ttms-widget-container';
    widgetContainer.style.position = 'fixed';
    widgetContainer.style.zIndex = '9999';
    widgetContainer.style.display = 'none';
    
    // Position the widget
    setWidgetPosition();
    
    // Create close button
    const closeButton = document.createElement('div');
    closeButton.id = 'ttms-widget-close';
    closeButton.innerHTML = '&times;';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '5px';
    closeButton.style.right = '10px';
    closeButton.style.fontSize = '24px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.color = '#666';
    closeButton.style.zIndex = '10000';
    closeButton.addEventListener('click', close);
    
    // Create iframe
    iframe = document.createElement('iframe');
    iframe.id = 'ttms-widget-iframe';
    iframe.style.width = `${config.width}px`;
    iframe.style.height = `${config.height}px`;
    iframe.style.border = '1px solid rgba(0, 0, 0, 0.1)';
    iframe.style.borderRadius = '10px';
    iframe.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    iframe.style.backgroundColor = '#fff';
    iframe.allow = 'microphone';
    
    // Set iframe source
    const baseUrl = 'https://talktomysim.com';
    let src = `${baseUrl}/embed/${config.id}`;
    if (config.theme) {
      src += `?theme=${config.theme.replace('#', '')}`;
    }
    iframe.src = src;
    
    // Add elements to container
    widgetContainer.appendChild(closeButton);
    widgetContainer.appendChild(iframe);
    
    // Add container to document
    document.body.appendChild(widgetContainer);
    
    // Create launcher button
    createLauncherButton();
  }

  // Create launcher button
  function createLauncherButton() {
    const button = document.createElement('div');
    button.id = 'ttms-widget-launcher';
    button.style.position = 'fixed';
    button.style.width = '60px';
    button.style.height = '60px';
    button.style.borderRadius = '50%';
    button.style.backgroundColor = config.theme || '#0072f5';
    button.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    button.style.cursor = 'pointer';
    button.style.zIndex = '9998';
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.transition = 'transform 0.3s ease';
    
    // Position the button
    if (config.position === 'bottom-right') {
      button.style.bottom = '20px';
      button.style.right = '20px';
    } else if (config.position === 'bottom-left') {
      button.style.bottom = '20px';
      button.style.left = '20px';
    }
    
    // Add chat icon
    button.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    `;
    
    // Add hover effect
    button.addEventListener('mouseover', () => {
      button.style.transform = 'scale(1.1)';
    });
    button.addEventListener('mouseout', () => {
      button.style.transform = 'scale(1)';
    });
    
    // Add click event
    button.addEventListener('click', toggle);
    
    // Add to document
    document.body.appendChild(button);
  }

  // Set widget position
  function setWidgetPosition() {
    if (config.position === 'bottom-right') {
      widgetContainer.style.bottom = '90px';
      widgetContainer.style.right = '20px';
    } else if (config.position === 'bottom-left') {
      widgetContainer.style.bottom = '90px';
      widgetContainer.style.left = '20px';
    }
  }

  // Open the widget
  function open() {
    if (widgetContainer) {
      widgetContainer.style.display = 'block';
      isOpen = true;
    } else {
      init();
      open();
    }
  }

  // Close the widget
  function close() {
    if (widgetContainer) {
      widgetContainer.style.display = 'none';
      isOpen = false;
    }
  }

  // Toggle the widget
  function toggle() {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }

  // Public API
  window.TalkToMySimWidget = {
    init,
    open,
    close,
    toggle
  };
})();
