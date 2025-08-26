/**
 * Talk to My Sim Simple Widget
 * A simplified embed script that can be placed in the HTML header
 * Automatically creates a profile picture button in the bottom right corner
 */
(function() {
  // Configuration with defaults
  const config = {
    simId: null,
    position: 'bottom-right',
    buttonColor: '#0072f5',
    avatarUrl: null,
    buttonText: '',
    width: 380,
    height: 600,
    showBranding: true
  };

  // Widget state
  let isOpen = false;
  let widgetContainer = null;
  let buttonElement = null;
  let simData = null;

  // Initialize when the DOM is fully loaded
  document.addEventListener('DOMContentLoaded', function() {
    // Get the script tag
    const scriptTags = document.querySelectorAll('script');
    let currentScript = null;

    // Find our script tag
    for (let i = 0; i < scriptTags.length; i++) {
      if (scriptTags[i].src.includes('simple-widget.js')) {
        currentScript = scriptTags[i];
        break;
      }
    }

    if (!currentScript) {
      console.error('Talk to My Sim: Could not find script tag');
      return;
    }

    // Extract configuration from script tag attributes
    config.simId = currentScript.getAttribute('data-sim-id');
    
    if (currentScript.hasAttribute('data-position')) {
      config.position = currentScript.getAttribute('data-position');
    }
    
    if (currentScript.hasAttribute('data-color')) {
      config.buttonColor = currentScript.getAttribute('data-color');
    }
    
    if (currentScript.hasAttribute('data-width')) {
      config.width = parseInt(currentScript.getAttribute('data-width'), 10);
    }
    
    if (currentScript.hasAttribute('data-height')) {
      config.height = parseInt(currentScript.getAttribute('data-height'), 10);
    }
    
    if (currentScript.hasAttribute('data-avatar')) {
      config.avatarUrl = currentScript.getAttribute('data-avatar');
    }
    
    if (currentScript.hasAttribute('data-text')) {
      config.buttonText = currentScript.getAttribute('data-text');
    }
    
    if (currentScript.hasAttribute('data-branding')) {
      config.showBranding = currentScript.getAttribute('data-branding') === 'true';
    }

    // Validate required configuration
    if (!config.simId) {
      console.error('Talk to My Sim: Missing required data-sim-id attribute');
      return;
    }

    // Fetch Sim data to get avatar if not provided
    if (!config.avatarUrl) {
      fetchSimData();
    } else {
      // Initialize the widget immediately if avatar is provided
      initWidget();
    }
  });

  // Fetch Sim data from the API
  function fetchSimData() {
    const baseUrl = 'https://talktomysim.com';
      
    fetch(`${baseUrl}/api/public-agent/${config.simId}`)
      .then(response => response.json())
      .then(data => {
        simData = data;
        if (data && (data.avatar_url || data.avatar)) {
          config.avatarUrl = data.avatar_url || `${baseUrl}/lovable-uploads/${data.avatar}`;
        }
        initWidget();
      })
      .catch(error => {
        console.error('Error fetching Sim data:', error);
        // Initialize with default icon if fetch fails
        initWidget();
      });
  }

  // Initialize the widget
  function initWidget() {
    createWidgetElements();
    attachEventListeners();
  }

  // Create widget elements
  function createWidgetElements() {
    // Create widget container
    widgetContainer = document.createElement('div');
    widgetContainer.id = 'ttms-widget-container';
    widgetContainer.style.position = 'fixed';
    widgetContainer.style.zIndex = '9999';
    widgetContainer.style.display = 'none';
    widgetContainer.style.width = `${config.width}px`;
    widgetContainer.style.height = `${config.height}px`;
    widgetContainer.style.overflow = 'hidden';
    widgetContainer.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    widgetContainer.style.borderRadius = '10px';
    widgetContainer.style.transition = 'all 0.3s ease';
    
    // Position the widget
    positionWidget();
    
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
    closeButton.style.width = '24px';
    closeButton.style.height = '24px';
    closeButton.style.textAlign = 'center';
    closeButton.style.lineHeight = '24px';
    closeButton.addEventListener('click', toggleWidget);
    
    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.id = 'ttms-widget-iframe';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '10px';
    iframe.allow = 'microphone';
    
    // Set iframe source
    const baseUrl = 'https://talktomysim.com';
    iframe.src = `${baseUrl}/embed/${config.simId}`;
    
    // Add elements to container
    widgetContainer.appendChild(closeButton);
    widgetContainer.appendChild(iframe);
    
    // Create chat button with profile picture
    buttonElement = document.createElement('div');
    buttonElement.id = 'ttms-widget-button';
    buttonElement.style.position = 'fixed';
    buttonElement.style.width = '60px';
    buttonElement.style.height = '60px';
    buttonElement.style.borderRadius = '50%';
    buttonElement.style.backgroundColor = config.buttonColor;
    buttonElement.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
    buttonElement.style.cursor = 'pointer';
    buttonElement.style.zIndex = '9998';
    buttonElement.style.display = 'flex';
    buttonElement.style.alignItems = 'center';
    buttonElement.style.justifyContent = 'center';
    buttonElement.style.transition = 'transform 0.3s ease, background-color 0.3s ease';
    buttonElement.style.overflow = 'hidden';
    
    // Position the button
    positionButton();
    
    // Add profile picture or fallback
    if (config.avatarUrl) {
      // Create an image element for the avatar
      const avatarImg = document.createElement('img');
      avatarImg.src = config.avatarUrl;
      avatarImg.alt = simData?.name || 'AI Assistant';
      avatarImg.style.width = '100%';
      avatarImg.style.height = '100%';
      avatarImg.style.objectFit = 'cover';
      avatarImg.style.borderRadius = '50%';
      
      // Handle image load error
      avatarImg.onerror = function() {
        // Fallback to default icon if image fails to load
        buttonElement.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        `;
      };
      
      buttonElement.appendChild(avatarImg);
    } else if (config.buttonText) {
      // Use text if provided and no avatar
      buttonElement.textContent = config.buttonText;
      buttonElement.style.color = '#fff';
      buttonElement.style.fontFamily = 'Arial, sans-serif';
      buttonElement.style.fontSize = '14px';
      buttonElement.style.fontWeight = 'bold';
    } else {
      // Default to chat icon as last resort
      buttonElement.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      `;
    }
    
    // Add elements to document
    document.body.appendChild(widgetContainer);
    document.body.appendChild(buttonElement);
  }

  // Position the widget based on config
  function positionWidget() {
    switch (config.position) {
      case 'bottom-right':
        widgetContainer.style.bottom = '90px';
        widgetContainer.style.right = '20px';
        break;
      case 'bottom-left':
        widgetContainer.style.bottom = '90px';
        widgetContainer.style.left = '20px';
        break;
      case 'top-right':
        widgetContainer.style.top = '20px';
        widgetContainer.style.right = '20px';
        break;
      case 'top-left':
        widgetContainer.style.top = '20px';
        widgetContainer.style.left = '20px';
        break;
      default:
        widgetContainer.style.bottom = '90px';
        widgetContainer.style.right = '20px';
    }
  }

  // Position the button based on config
  function positionButton() {
    switch (config.position) {
      case 'bottom-right':
        buttonElement.style.bottom = '20px';
        buttonElement.style.right = '20px';
        break;
      case 'bottom-left':
        buttonElement.style.bottom = '20px';
        buttonElement.style.left = '20px';
        break;
      case 'top-right':
        buttonElement.style.top = '20px';
        buttonElement.style.right = '20px';
        break;
      case 'top-left':
        buttonElement.style.top = '20px';
        buttonElement.style.left = '20px';
        break;
      default:
        buttonElement.style.bottom = '20px';
        buttonElement.style.right = '20px';
    }
  }

  // Attach event listeners
  function attachEventListeners() {
    buttonElement.addEventListener('click', toggleWidget);
    
    // Add hover effects
    buttonElement.addEventListener('mouseover', function() {
      buttonElement.style.transform = 'scale(1.1)';
    });
    
    buttonElement.addEventListener('mouseout', function() {
      buttonElement.style.transform = 'scale(1)';
    });
  }

  // Toggle widget visibility
  function toggleWidget() {
    if (isOpen) {
      widgetContainer.style.display = 'none';
      isOpen = false;
    } else {
      widgetContainer.style.display = 'block';
      isOpen = true;
    }
  }

  // Expose public API
  window.TalkToMySimWidget = {
    open: function() {
      widgetContainer.style.display = 'block';
      isOpen = true;
    },
    close: function() {
      widgetContainer.style.display = 'none';
      isOpen = false;
    },
    toggle: toggleWidget
  };
})();
