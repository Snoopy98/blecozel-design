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

const carouselTrack = document.querySelector('.carousel-track');
if (carouselTrack) {
  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;
  let cards = Array.from(carouselTrack.querySelectorAll('.carousel-card'));
  const indicatorCurrent = document.querySelector('.indicator-current');
  const indicatorTotal = document.querySelector('.indicator-total');
  const indicatorProgress = document.querySelector('.indicator-progress');
  let rafId = null;

  const formatIndex = (value) => String(value).padStart(2, '0');

  const syncIndicatorTotal = () => {
    cards = Array.from(carouselTrack.querySelectorAll('.carousel-card'));
    if (indicatorTotal) {
      indicatorTotal.textContent = formatIndex(cards.length || 1);
    }
  };

  const getActiveIndex = () => {
    if (!cards.length) return 0;
    const currentScroll = carouselTrack.scrollLeft;
    let closestIndex = 0;
    let closestDistance = Infinity;
    cards.forEach((card, index) => {
      const distance = Math.abs(card.offsetLeft - currentScroll);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });
    return closestIndex;
  };

  const updateIndicator = () => {
    if (!indicatorCurrent || !indicatorProgress) return;
    const activeIndex = getActiveIndex();
    indicatorCurrent.textContent = formatIndex(activeIndex + 1);
    const total = Math.max(cards.length, 1);
    const progress = total > 1 ? activeIndex / (total - 1) : 1;
    indicatorProgress.style.width = `${Math.min(Math.max(progress, 0), 1) * 100}%`;
  };

  const scheduleUpdate = () => {
    if (rafId) return;
    rafId = window.requestAnimationFrame(() => {
      rafId = null;
      updateIndicator();
    });
  };

  const startDrag = (event) => {
    isDown = true;
    carouselTrack.classList.add('dragging');
    startX = event.pageX ?? event.touches?.[0]?.pageX ?? 0;
    scrollLeft = carouselTrack.scrollLeft;
  };

  const stopDrag = () => {
    isDown = false;
    carouselTrack.classList.remove('dragging');
  };

  const onDrag = (event) => {
    if (!isDown) return;
    const x = event.pageX ?? event.touches?.[0]?.pageX ?? 0;
    const walk = (x - startX) * 1.2;
    carouselTrack.scrollLeft = scrollLeft - walk;
  };

  carouselTrack.addEventListener('mousedown', startDrag);
  carouselTrack.addEventListener('mouseleave', stopDrag);
  carouselTrack.addEventListener('mouseup', stopDrag);
  carouselTrack.addEventListener('mousemove', onDrag);

  carouselTrack.addEventListener('touchstart', startDrag, { passive: true });
  carouselTrack.addEventListener('touchend', stopDrag);
  carouselTrack.addEventListener('touchmove', onDrag, { passive: true });

  carouselTrack.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);

  const observer = new MutationObserver(() => {
    syncIndicatorTotal();
    scheduleUpdate();
  });
  observer.observe(carouselTrack, { childList: true });

  syncIndicatorTotal();
  updateIndicator();
}

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
