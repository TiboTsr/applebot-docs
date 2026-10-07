// Configuration globale de l'API AppleCore
(function() {
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  // En production, pointe vers le sous-domaine de l'API de ton VPS (ex: api.applecore.tibotsr.dev ou ton port VPS)
  // Peut être écrasé via localStorage.getItem('applecore_api_url') si besoin
  const customApi = localStorage.getItem('applecore_api_url');
  window.API_BASE = customApi || (isLocal ? 'http://localhost:8080' : 'https://api.applecore.tibotsr.dev');
})();
