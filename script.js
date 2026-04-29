document.addEventListener('DOMContentLoaded', () => {

    // 1. ANIMAÇÕES DE SCROLL
    const observerOptions = { root: null, rootMargin: '0px 0px -50px 0px', threshold: 0.1 };
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    document.querySelectorAll('.fade-in').forEach(element => observer.observe(element));

    // 2. LÓGICA DO CARD EXPANSIVO (MOVE PARA O BODY)
    const cards = document.querySelectorAll('.js-expandable');
    const backdrop = document.getElementById('backdrop');

    let activeCard = null;
    let activeWrapper = null;
    let isAnimating = false;

    // Transição suave em formato de string para usar dinamicamente
    const expandTransition = 'left 0.6s cubic-bezier(0.25, 1, 0.5, 1), top 0.6s cubic-bezier(0.25, 1, 0.5, 1), width 0.6s cubic-bezier(0.25, 1, 0.5, 1), height 0.6s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.6s ease';

    const closeActiveCard = () => {
        if (!activeCard || isAnimating) return;
        isAnimating = true;

        // Pega as coordenadas originais do buraco no grid
        const rect = activeWrapper.getBoundingClientRect();

        // Anima o card de volta para o grid
        activeCard.style.left = `${rect.left}px`;
        activeCard.style.top = `${rect.top}px`;
        activeCard.style.width = `${rect.width}px`;
        activeCard.style.height = `${rect.height}px`;

        activeCard.classList.remove('is-expanded');
        backdrop.classList.remove('is-visible');

        // Quando a animação acaba, devolve pro Wrapper original
        setTimeout(() => {
            activeCard.style.transition = 'none'; // Previne pulos visuais
            
            // Devolve pro HTML original
            activeWrapper.appendChild(activeCard);
            
            // Limpa todos os estilos inline
            activeCard.style = ''; 
            activeWrapper.style = ''; // Limpa a altura congelada do wrapper
            
            activeCard.offsetHeight; // Força reflow do navegador
            
            activeCard = null;
            activeWrapper = null;
            isAnimating = false;
        }, 600);
    };

    cards.forEach(card => {
        const wrapper = card.closest('.card-wrapper');
        const closeBtn = card.querySelector('.close-btn');

        card.addEventListener('click', () => {
            if (activeCard || isAnimating) return;
            isAnimating = true;
            activeCard = card;
            activeWrapper = wrapper;

            // 1. Pega tamanho e posição ATUAL
            const rect = wrapper.getBoundingClientRect();

            // 2. Congela o tamanho do wrapper para o Grid não desmontar
            wrapper.style.width = `${rect.width}px`;
            wrapper.style.height = `${rect.height}px`;

            // 3. Configura o card para fixed antes de injetar no Body
            card.style.position = 'fixed';
            card.style.left = `${rect.left}px`;
            card.style.top = `${rect.top}px`;
            card.style.width = `${rect.width}px`;
            card.style.height = `${rect.height}px`;
            card.style.margin = '0';
            card.style.zIndex = '1000'; // Agora o z-index vai funcionar, pois está no body!
            card.style.transition = 'none'; // Desliga a transição para não voar do canto da tela

            // 4. Move pro Body
            document.body.appendChild(card);
            backdrop.classList.add('is-visible');

            // 5. Força a leitura do navegador para aplicar o CSS (Reflow)
            card.offsetHeight;

            // 6. Religa a transição e calcula destino final (Centro da tela)
            card.style.transition = expandTransition;

            const targetWidth = Math.min(window.innerWidth * 0.9, 900);
            const targetHeight = Math.min(window.innerHeight * 0.9, 700);
            const targetLeft = (window.innerWidth - targetWidth) / 2;
            const targetTop = (window.innerHeight - targetHeight) / 2;

            // 7. Dispara a animação
            card.style.left = `${targetLeft}px`;
            card.style.top = `${targetTop}px`;
            card.style.width = `${targetWidth}px`;
            card.style.height = `${targetHeight}px`;

            card.classList.add('is-expanded');

            setTimeout(() => { isAnimating = false; }, 600);
        });

        // Evento de fechar (botão)
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita que o clique re-abra o card
            closeActiveCard();
        });
    });

    // Fechar ao clicar fora
    backdrop.addEventListener('click', closeActiveCard);

    // Fechar com ESCAPE
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && activeCard) closeActiveCard();
    });

});