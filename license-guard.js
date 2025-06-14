
// License Guard System - Igreja Manager
// Sistema de proteção e geração de QR codes únicos

class LicenseGuard {
  constructor() {
    this.domain = window.location.hostname;
    this.baseUrl = `${window.location.protocol}//${this.domain}`;
  }

  // Gera um ID único para o QR code
  generateUniqueId() {
    return 'qr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Cria uma URL única baseada no domínio e palavra-chave
  generateUniqueUrl(keyword, eventId) {
    const sanitizedKeyword = keyword.toLowerCase().replace(/[^a-z0-9]/g, '-');
    return `${this.baseUrl}/evento/${sanitizedKeyword}/${eventId}`;
  }

  // Valida se o QR code é válido para este domínio
  validateQRCode(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname === this.domain;
    } catch (error) {
      return false;
    }
  }

  // Gera dados do QR code com informações de segurança
  generateQRData(eventName, keyword) {
    const eventId = this.generateUniqueId();
    const timestamp = Date.now();
    const url = this.generateUniqueUrl(keyword, eventId);
    
    return {
      eventId,
      eventName,
      keyword,
      url,
      timestamp,
      domain: this.domain,
      scanCount: 0,
      active: true
    };
  }

  // Registra um scan do QR code
  registerScan(eventId) {
    const scanData = {
      eventId,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      ip: null // Will be filled by backend
    };
    
    // Aqui você pode enviar para seu backend
    console.log('QR Code scan registered:', scanData);
    return scanData;
  }

  // Verifica integridade do sistema
  checkSystemIntegrity() {
    const checks = {
      domain: this.domain !== 'localhost',
      https: window.location.protocol === 'https:',
      timestamp: Date.now()
    };
    
    return checks;
  }
}

// Instância global do sistema de proteção
window.LicenseGuard = new LicenseGuard();

// Função utilitária para gerar QR codes seguros
window.generateSecureQR = function(eventName, keyword) {
  return window.LicenseGuard.generateQRData(eventName, keyword);
};

// Exportar para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LicenseGuard;
}
