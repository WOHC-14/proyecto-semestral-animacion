document.addEventListener('DOMContentLoaded', () => {
    const faqItems = document.querySelectorAll('.item-faq');

    faqItems.forEach(item => {
        const summary = item.querySelector('summary');
        const content = item.querySelector('.contenido-faq');

        if (content.children.length > 0 && content.children[0].tagName !== 'DIV') {
            const innerHTML = content.innerHTML;
            content.innerHTML = `<div>${innerHTML}</div>`;
        }

        summary.addEventListener('click', (e) => {
            e.preventDefault(); 

  
            if (item.classList.contains('is-open')) {
                item.classList.remove('is-open');
                setTimeout(() => {
                    item.open = false; 
                }, 200); 
                
            } else {
                item.open = true; 
                requestAnimationFrame(() => {
                    item.classList.add('is-open');
                });
            }
        });
    });
});