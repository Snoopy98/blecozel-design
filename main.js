const scrollButtons = document.querySelectorAll('[data-scroll]');
const toast = document.querySelector('.toast');

scrollButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const target = document.querySelector(button.dataset.scroll);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

const revealTargets = document.querySelectorAll('.section, .hero, .footer');
revealTargets.forEach((target, index) => {
  target.classList.add('reveal');
  target.dataset.delay = String(index % 4);
});

const form = document.querySelector('.estimate-form');
if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    form.reset();
    showToast('요청이 접수되었습니다. 48시간 내 연락드릴게요.');
  });
}

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3200);
}
