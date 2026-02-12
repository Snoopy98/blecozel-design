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
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const action = form.getAttribute('action');
    if (!action) return;
    const formData = new FormData(form);
    try {
      await fetch(action, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      });
      form.reset();
      if (toast) {
        toast.innerHTML = `
          <span>요청이 접수되었습니다. 48시간 내 연락드릴게요 감사합니다!</span>
          <button type="button" class="toast-close">확인</button>
        `;
        toast.classList.add('show');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      if (!toast) return;
      toast.innerHTML = `
        <span>전송에 실패했습니다. 잠시 후 다시 시도해주세요.</span>
        <button type="button" class="toast-close">확인</button>
      `;
      toast.classList.add('show');
    }
  });
}

if (toast) {
  toast.addEventListener('click', (event) => {
    if (event.target && event.target.classList.contains('toast-close')) {
      toast.classList.remove('show');
    }
  });
}
