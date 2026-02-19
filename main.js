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

const DASHBOARD_STORAGE_KEY = 'blecozel.dashboard.v1';
const DASHBOARD_API_DEFAULT_URL = '/api/dashboard';

const DEFAULT_DASHBOARD_DATA = {
  profile: {
    name: '블레코젤',
    initials: 'BL',
    memberType: '일반 회원',
    lastLogin: '2026-02-19',
    preferredTime: '오전 10:00~12:00',
  },
  notifications: 3,
  recentPortfolioViews: 3,
  activities: [
    {
      date: '2026-02-19',
      title: '토탈 패키지 견적서 확인',
      description: '디자이너가 보낸 2차 제안서를 열람했습니다.',
    },
    {
      date: '2026-02-18',
      title: '위시리스트 항목 추가',
      description: '프리미엄 주방 패키지를 저장했습니다.',
    },
    {
      date: '2026-02-16',
      title: '상담 일정 확정',
      description: '2월 21일(금) 오전 11시 비대면 상담 일정이 등록되었습니다.',
    },
  ],
  consults: [
    {
      title: '강남구 34평 아파트 토탈 패키지',
      receivedAt: '2026-02-14',
      designer: '이소현',
      status: 'waiting',
    },
    {
      title: '송파구 구축 욕실 리프레시',
      receivedAt: '2026-02-10',
      designer: '박준영',
      status: 'done',
    },
  ],
  wishlistItems: [
    {
      id: 'wish-001',
      segment: 'residential',
      meta: '주거 · 32평 아파트',
      title: '프리미엄 주방 패키지',
      tags: ['3D 제안', '수납 강화'],
      estimate: '예상 1,850만',
      budget: 1850,
      has3d: true,
      image: '/category/kitchen-category-image.png',
      updatedAt: '2026-02-18',
      consultRequested: true,
    },
    {
      id: 'wish-002',
      segment: 'residential',
      meta: '주거 · 24평 구축',
      title: '욕실 리프레시 듀얼 패키지',
      tags: ['타일 업그레이드', '방수공정'],
      estimate: '예상 980만',
      budget: 980,
      has3d: false,
      image: '/category/bath-category-image.png',
      updatedAt: '2026-02-17',
      consultRequested: false,
    },
    {
      id: 'wish-003',
      segment: 'residential',
      meta: '주거 · 안방 수납',
      title: '붙박이장 맞춤 수납 구성',
      tags: ['슬라이딩', '내부 조명'],
      estimate: '예상 640만',
      budget: 640,
      has3d: false,
      image: '/category/builtin-category-image.png',
      updatedAt: '2026-02-16',
      consultRequested: false,
    },
    {
      id: 'wish-004',
      segment: 'residential',
      meta: '주거 · 거실 특화',
      title: '월플렉스 아트월 + 수납',
      tags: ['LED 간접조명', '배선 정리'],
      estimate: '예상 730만',
      budget: 730,
      has3d: false,
      image: '/category/tvbuiltin-category-image.png',
      updatedAt: '2026-02-15',
      consultRequested: false,
    },
    {
      id: 'wish-005',
      segment: 'residential',
      meta: '주거 · 단열 개선',
      title: '창호 교체 퍼포먼스 패키지',
      tags: ['로이유리', '소음 저감'],
      estimate: '예상 1,240만',
      budget: 1240,
      has3d: false,
      image: '/category/window-category-image.png',
      updatedAt: '2026-02-14',
      consultRequested: false,
    },
    {
      id: 'wish-006',
      segment: 'residential',
      meta: '주거 · 전체 리모델링',
      title: '토탈 패키지 풀 리뉴얼',
      tags: ['공정 일괄', '디자인 2안'],
      estimate: '예상 4,800만',
      budget: 4800,
      has3d: true,
      image: '/category/total-category-image.png',
      updatedAt: '2026-02-13',
      consultRequested: true,
    },
    {
      id: 'wish-007',
      segment: 'commercial',
      meta: '상업 · 18평 카페',
      title: '소프트 인더스트리얼 카페 패키지',
      tags: ['카운터 개선', '동선 최적화'],
      estimate: '예상 2,600만',
      budget: 2600,
      has3d: true,
      image: '/category/foot-category-image.png',
      updatedAt: '2026-02-12',
      consultRequested: false,
    },
  ],
};

const deepCopy = (value) => JSON.parse(JSON.stringify(value));

const safeParseJSON = (value) => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
};

const mergeDashboardData = (savedData) => {
  const merged = deepCopy(DEFAULT_DASHBOARD_DATA);
  if (!savedData || typeof savedData !== 'object') {
    return merged;
  }

  if (savedData.profile && typeof savedData.profile === 'object') {
    merged.profile = { ...merged.profile, ...savedData.profile };
  }
  if (typeof savedData.notifications === 'number') {
    merged.notifications = savedData.notifications;
  }
  if (typeof savedData.recentPortfolioViews === 'number') {
    merged.recentPortfolioViews = savedData.recentPortfolioViews;
  }
  if (Array.isArray(savedData.activities)) {
    merged.activities = savedData.activities;
  }
  if (Array.isArray(savedData.consults)) {
    merged.consults = savedData.consults;
  }
  if (Array.isArray(savedData.wishlistItems)) {
    merged.wishlistItems = savedData.wishlistItems;
  }

  return merged;
};

const resolveDashboardApiConfig = () => {
  const globalConfig =
    typeof window.BLECOZEL_DASHBOARD_API === 'object' && window.BLECOZEL_DASHBOARD_API
      ? window.BLECOZEL_DASHBOARD_API
      : {};
  const urlFromWindow = window.BLECOZEL_DASHBOARD_API_URL;
  const enabledFromWindow = window.BLECOZEL_DASHBOARD_API_ENABLED;

  const enabled =
    typeof enabledFromWindow === 'boolean'
      ? enabledFromWindow
      : typeof globalConfig.enabled === 'boolean'
      ? globalConfig.enabled
      : true;

  const url =
    typeof urlFromWindow === 'string' && urlFromWindow.trim()
      ? urlFromWindow.trim()
      : typeof globalConfig.url === 'string' && globalConfig.url.trim()
      ? globalConfig.url.trim()
      : DASHBOARD_API_DEFAULT_URL;

  const saveMethod =
    typeof globalConfig.saveMethod === 'string' && globalConfig.saveMethod.trim()
      ? globalConfig.saveMethod.trim().toUpperCase()
      : 'PUT';

  return {
    enabled,
    url,
    saveMethod,
    credentials: globalConfig.credentials || 'include',
    headers: typeof globalConfig.headers === 'object' && globalConfig.headers ? globalConfig.headers : {},
  };
};

const DASHBOARD_API_CONFIG = resolveDashboardApiConfig();

const readDashboardData = () => {
  const fallback = deepCopy(DEFAULT_DASHBOARD_DATA);
  try {
    const raw = window.localStorage.getItem(DASHBOARD_STORAGE_KEY);
    const parsed = safeParseJSON(raw);
    const merged = mergeDashboardData(parsed);
    if (!raw || !parsed) {
      window.localStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(merged));
    }
    return merged;
  } catch (error) {
    return fallback;
  }
};

const writeDashboardData = (data) => {
  try {
    window.localStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    // localStorage 접근 불가 환경에서는 UI만 갱신하고 저장은 건너뜁니다.
  }
};

const parseDashboardApiPayload = (payload) => {
  if (payload && typeof payload === 'object' && payload.data && typeof payload.data === 'object') {
    return payload.data;
  }
  return payload;
};

const fetchDashboardFromApi = async () => {
  if (!DASHBOARD_API_CONFIG.enabled) return null;
  try {
    const response = await fetch(DASHBOARD_API_CONFIG.url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...DASHBOARD_API_CONFIG.headers,
      },
      credentials: DASHBOARD_API_CONFIG.credentials,
    });
    if (!response.ok) return null;
    const payload = await response.json();
    const parsed = parseDashboardApiPayload(payload);
    return mergeDashboardData(parsed);
  } catch (error) {
    return null;
  }
};

const saveDashboardToApi = async (data) => {
  if (!DASHBOARD_API_CONFIG.enabled) return false;

  const methods = [DASHBOARD_API_CONFIG.saveMethod, 'PATCH', 'POST'].filter(
    (method, index, arr) => method && arr.indexOf(method) === index
  );

  for (const method of methods) {
    try {
      const response = await fetch(DASHBOARD_API_CONFIG.url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...DASHBOARD_API_CONFIG.headers,
        },
        credentials: DASHBOARD_API_CONFIG.credentials,
        body: JSON.stringify(data),
      });
      if (response.ok) return true;
      if (response.status !== 404 && response.status !== 405) {
        return false;
      }
    } catch (error) {
      return false;
    }
  }
  return false;
};

const loadDashboardData = async () => {
  const localData = readDashboardData();
  const remoteData = await fetchDashboardFromApi();
  if (!remoteData) {
    return localData;
  }
  writeDashboardData(remoteData);
  return remoteData;
};

const persistDashboardData = (data) => {
  writeDashboardData(data);
  void saveDashboardToApi(data);
};

const escapeHtml = (value) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const formatDateDot = (value) => {
  if (typeof value !== 'string' || !value.includes('-')) return value || '-';
  const [year = '', month = '', day = ''] = value.split('-');
  if (!year || !month || !day) return value;
  return `${year}.${month}.${day}`;
};

const getDateObject = (value) => {
  if (typeof value !== 'string') return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getLatestDateLabel = (dateText) => {
  const date = getDateObject(dateText);
  if (!date) return '-';
  const today = new Date();
  const isToday =
    today.getFullYear() === date.getFullYear() &&
    today.getMonth() === date.getMonth() &&
    today.getDate() === date.getDate();
  return isToday ? '오늘' : formatDateDot(dateText);
};

const countByStatus = (consults, status) => consults.filter((item) => item?.status === status).length;

const renderMypage = (data) => {
  if (!document.querySelector('.mypage-main')) return;

  const profile = data.profile ?? {};
  const wishlistItems = Array.isArray(data.wishlistItems) ? data.wishlistItems : [];
  const consults = Array.isArray(data.consults) ? data.consults : [];
  const activities = Array.isArray(data.activities) ? data.activities : [];

  const profileAvatar = document.getElementById('profile-avatar');
  if (profileAvatar) {
    profileAvatar.textContent = (profile.initials || 'BL').slice(0, 2);
  }

  const profileGreeting = document.getElementById('profile-greeting');
  if (profileGreeting) {
    profileGreeting.textContent = `안녕하세요, ${profile.name || '고객'}님`;
  }

  const profileSummary = document.getElementById('profile-summary');
  if (profileSummary) {
    profileSummary.textContent =
      `${profile.memberType || '일반 회원'} · 최근 로그인 ${formatDateDot(profile.lastLogin || '')}` +
      ` · 상담 선호 시간 ${profile.preferredTime || '-'}`;
  }

  const activeConsultCount = countByStatus(consults, 'waiting');
  const doneConsultCount = countByStatus(consults, 'done');

  const statWishlist = document.getElementById('stat-wishlist');
  if (statWishlist) statWishlist.textContent = `${wishlistItems.length}개`;

  const statActiveConsults = document.getElementById('stat-active-consults');
  if (statActiveConsults) statActiveConsults.textContent = `${activeConsultCount}건`;

  const statDoneConsults = document.getElementById('stat-done-consults');
  if (statDoneConsults) statDoneConsults.textContent = `${doneConsultCount}건`;

  const statNotifications = document.getElementById('stat-notifications');
  if (statNotifications) statNotifications.textContent = `${data.notifications || 0}개`;

  const quickWishlistCount = document.getElementById('quick-wishlist-count');
  if (quickWishlistCount) quickWishlistCount.textContent = `저장 ${wishlistItems.length}개`;

  const quickConsultCount = document.getElementById('quick-consult-count');
  if (quickConsultCount) quickConsultCount.textContent = `진행 ${activeConsultCount}건`;

  const quickRecentCount = document.getElementById('quick-recent-count');
  if (quickRecentCount) quickRecentCount.textContent = `${data.recentPortfolioViews || 0}개`;

  const activityList = document.getElementById('activity-list');
  if (activityList) {
    if (!activities.length) {
      activityList.innerHTML =
        '<div class="activity-item"><span class="title">최근 활동이 없습니다.</span></div>';
    } else {
      activityList.innerHTML = activities
        .map(
          (item) => `
          <div class="activity-item">
            <span class="date">${escapeHtml(formatDateDot(item?.date || ''))}</span>
            <span class="title">${escapeHtml(item?.title || '')}</span>
            <p>${escapeHtml(item?.description || '')}</p>
          </div>
        `
        )
        .join('');
    }
  }

  const consultTable = document.getElementById('consult-table');
  if (consultTable) {
    if (!consults.length) {
      consultTable.innerHTML =
        '<div class="consult-row"><div><strong>진행 중인 상담이 없습니다.</strong></div></div>';
    } else {
      consultTable.innerHTML = consults
        .map((item) => {
          const isDone = item?.status === 'done';
          const statusLabel = isDone ? '견적 전달완료' : '도면 작성중';
          const badgeClass = isDone ? 'done' : 'waiting';
          return `
            <div class="consult-row">
              <div>
                <strong>${escapeHtml(item?.title || '')}</strong>
                <p class="consult-meta">접수일 ${escapeHtml(formatDateDot(item?.receivedAt || ''))} · 담당 디자이너 ${escapeHtml(item?.designer || '-')}</p>
              </div>
              <span class="badge ${badgeClass}">${statusLabel}</span>
            </div>
          `;
        })
        .join('');
    }
  }
};

const filterWishlistItems = (items, filterKey) => {
  if (filterKey === 'residential') {
    return items.filter((item) => item?.segment === 'residential');
  }
  if (filterKey === 'commercial') {
    return items.filter((item) => item?.segment === 'commercial');
  }
  if (filterKey === 'budget') {
    return items.filter((item) => Number(item?.budget) <= 2000);
  }
  if (filterKey === 'render3d') {
    return items.filter((item) => Boolean(item?.has3d));
  }
  return items;
};

const renderWishlist = (data) => {
  const wishlistMain = document.querySelector('.wishlist-main');
  if (!wishlistMain) return;

  const wishlistCount = document.getElementById('wishlist-count');
  const consultRequestCount = document.getElementById('consult-request-count');
  const wishlistUpdatedAt = document.getElementById('wishlist-updated-at');
  const wishlistGrid = document.getElementById('wishlist-grid');
  const wishlistEmpty = document.getElementById('wishlist-empty');
  const filterButtons = Array.from(document.querySelectorAll('.filter-chip[data-filter]'));

  if (!wishlistGrid) return;

  let currentFilter = 'all';
  const getItems = () => (Array.isArray(data.wishlistItems) ? data.wishlistItems : []);

  const renderSummary = () => {
    const items = getItems();
    const consultCount = items.filter((item) => item?.consultRequested).length;
    const latestUpdatedItem = items
      .slice()
      .sort((a, b) => {
        const aDate = getDateObject(a?.updatedAt)?.getTime() || 0;
        const bDate = getDateObject(b?.updatedAt)?.getTime() || 0;
        return bDate - aDate;
      })[0];

    if (wishlistCount) wishlistCount.textContent = `${items.length}개`;
    if (consultRequestCount) consultRequestCount.textContent = `${consultCount}건`;
    if (wishlistUpdatedAt) wishlistUpdatedAt.textContent = getLatestDateLabel(latestUpdatedItem?.updatedAt);
  };

  const renderGrid = () => {
    const filtered = filterWishlistItems(getItems(), currentFilter);
    if (!filtered.length) {
      wishlistGrid.innerHTML = '';
      if (wishlistEmpty) wishlistEmpty.hidden = false;
      return;
    }

    if (wishlistEmpty) wishlistEmpty.hidden = true;
    wishlistGrid.innerHTML = filtered
      .map((item) => {
        const image = typeof item?.image === 'string' && item.image.startsWith('/') ? item.image : '/category/total-category-image.png';
        const tags = Array.isArray(item?.tags) ? item.tags : [];
        const mergedTags = item?.estimate ? [...tags, item.estimate] : tags;
        const consultText = item?.consultRequested ? '상담 요청됨' : '상담 요청';

        return `
          <article class="wish-card">
            <div class="wish-media" style="background-image:url('${escapeHtml(image)}');"></div>
            <div class="wish-body">
              <p class="wish-meta">${escapeHtml(item?.meta || '')}</p>
              <h2 class="wish-title">${escapeHtml(item?.title || '')}</h2>
              <div class="wish-tags">
                ${mergedTags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}
              </div>
              <div class="wish-actions">
                <button class="button-outline" type="button" data-action="delete" data-item-id="${escapeHtml(item?.id || '')}">삭제</button>
                <a class="button-solid" href="index.html#estimate" data-action="consult" data-item-id="${escapeHtml(item?.id || '')}">${consultText}</a>
              </div>
            </div>
          </article>
        `;
      })
      .join('');
  };

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      currentFilter = button.dataset.filter || 'all';
      filterButtons.forEach((item) => item.classList.toggle('active', item === button));
      renderGrid();
    });
  });

  wishlistGrid.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const deleteButton = target.closest('[data-action="delete"]');
    if (deleteButton instanceof HTMLElement) {
      const itemId = deleteButton.dataset.itemId;
      if (!itemId) return;
      data.wishlistItems = getItems().filter((item) => item?.id !== itemId);
      persistDashboardData(data);
      renderSummary();
      renderGrid();
      return;
    }

    const consultLink = target.closest('[data-action="consult"]');
    if (consultLink instanceof HTMLElement) {
      const itemId = consultLink.dataset.itemId;
      if (!itemId) return;
      data.wishlistItems = getItems().map((item) =>
        item?.id === itemId ? { ...item, consultRequested: true, updatedAt: new Date().toISOString().slice(0, 10) } : item
      );
      persistDashboardData(data);
      renderSummary();
      renderGrid();
    }
  });

  renderSummary();
  renderGrid();
};

const initDashboardPages = async () => {
  const hasMypage = Boolean(document.querySelector('.mypage-main'));
  const hasWishlist = Boolean(document.querySelector('.wishlist-main'));
  if (!hasMypage && !hasWishlist) return;

  const dashboardData = await loadDashboardData();
  renderMypage(dashboardData);
  renderWishlist(dashboardData);
};

void initDashboardPages();
