// Global error handler for unhandled promise rejections
export function initializeErrorHandlers() {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.warn('Handled unhandled promise rejection:', event.reason);
    event.preventDefault(); // Prevent the default browser behavior
  });

  // Handle global errors
  window.addEventListener('error', (event) => {
    console.warn('Handled global error:', event.error);
  });

  console.log('Error handlers initialized');
}

// Initialize error handlers when module is imported
initializeErrorHandlers();