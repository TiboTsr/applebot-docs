// AppleBot marketing site interactions

// Mobile navigation toggle
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.getElementById('nav-menu');
if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    navMenu.classList.toggle('open');
  });
  // Close on menu link click
  navMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navMenu.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }));
}

// Scroll reveal animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Contact form with Formspree integration (AJAX, no redirect)
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi en cours...';
    
    const formData = new FormData(form);
    
    try {
      const response = await fetch('https://formspree.io/f/xreggnqq', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const name = form.name.value.trim();
        showToast(`Merci ${name || '!'} Votre message a été envoyé avec succès.`);
        form.reset();
      } else {
        showToast('Erreur lors de l\'envoi. Réessayez plus tard.');
      }
    } catch (error) {
      showToast('Erreur de connexion. Vérifiez votre réseau.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
}

// Toast helper
function showToast(text) {
  let root = document.getElementById('toast-root');
  if (!root) return alert(text);
  const toast = document.createElement('div');
  toast.textContent = text;
  toast.style.cssText = `
    position: fixed; right: 20px; bottom: 20px; z-index: 50;
    background: #0f172a; color: #fff; padding: 12px 14px; border-radius: 12px;
    box-shadow: 0 10px 24px rgba(2,6,23,0.28); opacity: 0; transform: translateY(8px);
    transition: opacity .25s ease, transform .25s ease;
  `;
  root.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, 2600);
}
