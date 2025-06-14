
// Sistema de Proteção de Licença - ID do Reino
// Domínio autorizado: celulas.intrategica.com.br
// Token: zl0we1b3pqmwn8a4h9u878

// ATENÇÃO: Este script deve ser incluído no <head> para funcionar corretamente

(function() {
    'use strict';
    
    // Marcador de proteção ativa
    window.__LICENSE_GUARD_ACTIVE__ = true;
    window.__LICENSE_TOKEN__ = 'zl0we1b3pqmwn8a4h9u878';
    window.__LICENSE_DOMAIN__ = 'celulas.intrategica.com.br';
    
    class LicenseGuard {
        constructor() {
            this.apiUrl = 'https://immkxabaicgtyybpdgtg.supabase.co/functions/v1/verify-license';
            this.token = 'zl0we1b3pqmwn8a4h9u878';
            this.authorizedDomain = 'celulas.intrategica.com.br';
            this.authorizedIp = null;
            this.checkInterval = 300000; // 5 minutos
            this.securityCheckInterval = 30000; // 30 segundos
            this.protectionActive = true;
            this.init();
        }

        async init() {
            // Verificação imediata de domínio
            if (!this.validateDomain()) {
                this.blockAccess('invalid');
                return;
            }

            // Verificação inicial da licença
            const isValid = await this.verifyLicense();
            if (!isValid) {
                return; // Sistema já foi bloqueado na verificação
            }

            // Verificações periódicas da licença
            setInterval(() => {
                this.verifyLicense();
            }, this.checkInterval);

            // Verificações de segurança mais frequentes
            setInterval(() => {
                this.performSecurityChecks();
            }, this.securityCheckInterval);

            // Criar múltiplos pontos de verificação no DOM
            this.createSecurityMarkers();
            
            // Monitorar mudanças no DOM
            this.observeDOMChanges();

            console.log('Sistema de proteção ativo para ID do Reino');
        }

        validateDomain() {
            const currentDomain = window.location.hostname;
            const allowedDomains = [
                this.authorizedDomain,
                'www.' + this.authorizedDomain,
                this.authorizedDomain.replace('www.', '')
            ];
            
            return allowedDomains.includes(currentDomain);
        }

        createSecurityMarkers() {
            // Criar elementos invisíveis para detectar manipulação
            const markers = [
                { id: '__lg_marker_1__', content: 'LG_ACTIVE' },
                { id: '__lg_marker_2__', content: 'LG_TOKEN_' + this.token.substring(0, 8) },
                { id: '__lg_marker_3__', content: 'LG_DOMAIN_' + this.authorizedDomain }
            ];

            markers.forEach(marker => {
                const el = document.createElement('div');
                el.id = marker.id;
                el.style.display = 'none';
                el.setAttribute('data-guard', marker.content);
                document.head.appendChild(el);
            });
        }

        observeDOMChanges() {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    // Verificar se scripts de proteção foram removidos
                    if (mutation.type === 'childList') {
                        mutation.removedNodes.forEach((node) => {
                            if (node.nodeName === 'SCRIPT' && 
                                node.src && 
                                node.src.includes('license-guard')) {
                                this.handleTampering('Script de proteção removido');
                            }
                        });
                    }
                });
            });

            observer.observe(document.head, {
                childList: true,
                subtree: true
            });
        }

        performSecurityChecks() {
            // Verificar se marcadores ainda existem
            const markers = ['__lg_marker_1__', '__lg_marker_2__', '__lg_marker_3__'];
            for (let markerId of markers) {
                if (!document.getElementById(markerId)) {
                    this.handleTampering('Marcador de segurança removido: ' + markerId);
                    return;
                }
            }

            // Verificar se variáveis globais ainda existem
            if (!window.__LICENSE_GUARD_ACTIVE__ || 
                window.__LICENSE_TOKEN__ !== this.token ||
                window.__LICENSE_DOMAIN__ !== this.authorizedDomain) {
                this.handleTampering('Variáveis de proteção foram alteradas');
                return;
            }

            // Verificar domínio novamente
            if (!this.validateDomain()) {
                this.handleTampering('Domínio alterado durante execução');
                return;
            }
        }

        handleTampering(reason) {
            console.error('VIOLAÇÃO DE SEGURANÇA DETECTADA:', reason);
            this.blockAccess('invalid');
        }

        async verifyLicense() {
            try {
                const response = await fetch(this.apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-License-Guard': 'true',
                        'X-Security-Token': btoa(this.token + ':' + Date.now())
                    },
                    body: JSON.stringify({
                        token: this.token,
                        domain: window.location.hostname,
                        timestamp: Date.now(),
                        userAgent: navigator.userAgent,
                        referrer: document.referrer,
                        securityHash: btoa(this.token + this.authorizedDomain + Date.now())
                    })
                });

                if (!response.ok) {
                    throw new Error('Erro na comunicação com servidor de licenças');
                }

                const result = await response.json();
                
                if (result.remoteDisconnected) {
                    this.blockAccess('suspended');
                    return false;
                }
                
                if (result.expired) {
                    this.blockAccess('expired');
                    return false;
                }
                
                if (!result.valid) {
                    this.blockAccess('invalid');
                    return false;
                }

                return true;
            } catch (error) {
                console.error('Erro na verificação de licença:', error);
                // Em caso de falha na conexão, bloquear acesso para segurança
                this.blockAccess('suspended');
                return false;
            }
        }

        blockAccess(reason = 'invalid') {
            let blockHTML = '';
            
            switch(reason) {
                case 'expired':
                    blockHTML = '';
                    break;
                case 'suspended':
                    blockHTML = '';
                    break;
                default:
                    blockHTML = '';
            }
            
            // Remover todos os scripts e estilos existentes
            document.querySelectorAll('script:not([data-guard])').forEach(script => script.remove());
            document.querySelectorAll('link[rel="stylesheet"]').forEach(link => link.remove());
            
            // Substituir todo o conteúdo da página
            document.documentElement.innerHTML = blockHTML;
            
            // Bloquear interações
            this.disableInteractions();
            
            // Marcar como bloqueado
            this.protectionActive = false;
        }

        disableInteractions() {
            // Bloquear teclas comuns de desenvolvedor
            document.addEventListener('keydown', (e) => {
                // F12, Ctrl+Shift+I, Ctrl+U, Ctrl+Shift+C, etc.
                if (e.key === 'F12' || 
                    (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C' || e.key === 'J')) ||
                    (e.ctrlKey && e.key === 'u') ||
                    (e.ctrlKey && e.key === 's')) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    return false;
                }
            }, true);
            
            // Bloquear menu de contexto
            document.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                return false;
            }, true);
            
            // Bloquear seleção de texto
            document.addEventListener('selectstart', (e) => {
                e.preventDefault();
                return false;
            }, true);

            // Bloquear drag and drop
            document.addEventListener('dragstart', (e) => {
                e.preventDefault();
                return false;
            }, true);
        }
    }

    // Função para detectar se o script foi carregado corretamente
    function validateScriptIntegrity() {
        // Verificar se foi carregado via <script> tag no head
        const scripts = document.head.getElementsByTagName('script');
        let scriptFound = false;
        
        for (let script of scripts) {
            if (script.src && script.src.includes('license-guard')) {
                scriptFound = true;
                break;
            }
        }
        
        if (!scriptFound) {
            // Script não foi incluído corretamente no head
            document.documentElement.innerHTML = '';
            return false;
        }
        
        return true;
    }

    // Inicializar proteção quando página carregar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (validateScriptIntegrity()) {
                new LicenseGuard();
            }
        });
    } else {
        if (validateScriptIntegrity()) {
            new LicenseGuard();
        }
    }

    // Proteção adicional contra dev tools
    let devtools = { open: false };
    const threshold = 160;
    
    setInterval(() => {
        if (window.outerHeight - window.innerHeight > threshold || 
            window.outerWidth - window.innerWidth > threshold) {
            if (!devtools.open) {
                devtools.open = true;
                console.clear();
                console.log('%cVIOLAÇÃO DE SEGURANÇA DETECTADA!', 'color: red; font-size: 20px; font-weight: bold;');
                console.log('%cFerramentas de desenvolvedor detectadas. Recarregando...', 'color: red; font-size: 14px;');
                setTimeout(() => window.location.reload(), 1000);
            }
        } else {
            devtools.open = false;
        }
    }, 500);

    // Proteção contra console clears
    const originalClear = console.clear;
    console.clear = function() {
        console.log('%cTentativa de limpar console detectada!', 'color: red; font-weight: bold;');
    };

})();

// Verificação adicional no final do documento
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (!window.__LICENSE_GUARD_ACTIVE__) {
            document.body.innerHTML = '<div style="position:fixed;top:0;left:0;width:100%;height:100%;background:#dc2626;color:white;display:flex;align-items:center;justify-content:center;font-size:24px;z-index:99999;">⚠️ Sistema de Proteção Não Detectado</div>';
        }
    }, 2000);
});
