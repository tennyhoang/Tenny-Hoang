// ── Projects Data ──
const projectsData = [
  {
    id: 1,
    title: "GlassStore",
    shortDesc: "Hệ thống thương mại điện tử kính mắt full-stack — thiết kế kính tùy chỉnh, tải đơn thuốc, giỏ hàng và quy trình đặt hàng.",
    longDesc: "Hệ thống thương mại điện tử kính mắt xây dựng bằng Java 21 + Spring Boot 3. Tôi phụ trách toàn bộ phần backend: 13 REST controllers, 24 JPA entities, tích hợp Spring Security + JWT với 3 role phân quyền (admin, nhân viên, khách hàng), Docker multi-stage build và pipeline CI/CD. Frontend (React) được thực hiện phối hợp cùng nhóm.",
    tech: ["Java 21", "Spring Boot 3", "JWT", "Spring Security", "Docker", "React"],
    highlights: [
      "13 REST controllers, 24 JPA entities",
      "Spring Security + JWT, 3 role phân quyền",
      "Docker multi-stage build + CI/CD",
      "Vai trò: Backend Developer"
    ],
    github: "https://github.com/tennyhoang/GlassStore",
    video: null,
    isPublic: true
  },
  {
    id: 2,
    title: "Portfolio Website",
    shortDesc: "Portfolio cá nhân & CV trực tuyến — giao diện tối hiện đại, responsive hoàn toàn, deploy trên GitHub Pages.",
    longDesc: "Portfolio cá nhân xây dựng bằng pure HTML/CSS/JS với dark techy theme. Responsive hoàn toàn trên mobile & desktop. Có sections: Giới thiệu (Java code block), Tech Stack, Dự án, Liên hệ. Deploy tĩnh trên GitHub Pages.",
    tech: ["HTML5", "CSS3", "JavaScript"],
    highlights: [
      "Responsive hoàn toàn (mobile + desktop)",
      "Chuyển đổi dark/light theme",
      "Deploy trên GitHub Pages"
    ],
    github: "https://github.com/tennyhoang/Tenny-Hoang",
    liveDemo: "https://tennyhoang.github.io/Tenny-Hoang/",
    video: null,
    isPublic: true
  }
];

// ── Icon map theo tech ──
const techIconMap = {
  "Java 21": "fab fa-java",
  "Spring Boot 3": "fab fa-java",
  "HTML5": "fab fa-html5",
  "CSS3": "fab fa-css3-alt",
  "JavaScript": "fab fa-js",
  "React": "fab fa-react",
  "Docker": "fab fa-docker",
  "Git": "fab fa-git-alt",
};
function getProjectIcon(techList) {
  for (const t of techList) {
    if (techIconMap[t]) return techIconMap[t];
  }
  return "fas fa-code";
}

// ── DOM Ready ──
document.addEventListener('DOMContentLoaded', () => {

  // 1. Theme toggle
  const themeBtn = document.getElementById('theme-toggle');
  const currentTheme = localStorage.getItem('theme') || 'dark';

  if (currentTheme === 'light') {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
    if (themeBtn) themeBtn.innerHTML = '<i class="fas fa-moon"></i>';
  } else {
    if (themeBtn) themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      document.body.classList.toggle('dark-theme');
      const isDark = document.body.classList.contains('dark-theme');
      themeBtn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
  }

  // 2. Render projects grid
  const projectsGrid = document.getElementById('projects-grid');
  if (projectsGrid) {
    projectsData.forEach((p, i) => {
      const card = document.createElement('div');
      card.className = 'project-card fade-in';
      card.style.animationDelay = `${i * 0.08}s`;
      const highlightsHTML = p.highlights
        ? `<ul class="project-highlights">${p.highlights.map(h => `<li>${h}</li>`).join('')}</ul>`
        : '';
      const liveDemoLink = p.liveDemo
        ? `<a href="${p.liveDemo}" target="_blank" onclick="event.stopPropagation()" title="Xem demo"><i class="fas fa-external-link-alt"></i></a>`
        : '';
      card.innerHTML = `
        <div class="project-header">
          <div class="project-icon">
            <i class="${getProjectIcon(p.tech)}"></i>
          </div>
          <div class="project-links">
            <a href="${p.github}" target="_blank" onclick="event.stopPropagation()" title="GitHub">
              <i class="fab fa-github"></i>
            </a>
            ${liveDemoLink}
          </div>
        </div>
        <div class="project-body">
          <h3>${p.title}</h3>
          <p>${p.shortDesc}</p>
          ${highlightsHTML}
          <div class="tech-stack">
            ${p.tech.map(t => `<span class="tech-tag">${t}</span>`).join('')}
          </div>
        </div>
      `;
      card.onclick = () => openModal(p);
      projectsGrid.appendChild(card);
    });
  }

  // 3. Modal logic
  const modal = document.getElementById('project-modal');
  const closeModalBtn = document.querySelector('.close-modal');

  window.openModal = (project) => {
    const modalBody = document.getElementById('modal-body');
    const highlightsHTML = project.highlights
      ? `<ul style="font-family:var(--font-mono);font-size:0.82rem;color:var(--text-muted);margin:0 0 20px 20px;line-height:2;">
          ${project.highlights.map(h => `<li>${h}</li>`).join('')}
         </ul>`
      : '';
    const videoHTML = project.video
      ? `<div class="video-container">
           <iframe src="${project.video}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
         </div>`
      : '';
    const liveDemoBtn = project.liveDemo
      ? `<a href="${project.liveDemo}" target="_blank" class="btn btn-outline"><i class="fas fa-external-link-alt"></i> Xem demo</a>`
      : '';
    modalBody.innerHTML = `
      <div style="margin-bottom: 6px;">
        <span style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--primary); letter-spacing: 0.1em; text-transform: uppercase;">// dự án</span>
      </div>
      <div class="modal-title">${project.title}</div>
      <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px;">
        ${project.tech.map(t => `<span class="tech-tag">${t}</span>`).join('')}
      </div>
      <div class="modal-desc">${project.longDesc}</div>
      ${highlightsHTML}
      ${videoHTML}
      <div style="display: flex; gap: 12px; margin-top: 8px; flex-wrap: wrap;">
        <a href="${project.github}" target="_blank" class="btn btn-primary">
          <i class="fab fa-github"></i> Xem mã nguồn
        </a>
        ${liveDemoBtn}
        <button onclick="closeModalFn()" class="btn btn-ghost">Đóng</button>
      </div>
    `;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  };

  window.closeModalFn = () => {
    modal.style.display = 'none';
    document.body.style.overflow = '';
    document.getElementById('modal-body').innerHTML = '';
  };

  if (closeModalBtn) closeModalBtn.onclick = closeModalFn;

  window.onclick = (e) => {
    if (e.target === modal) closeModalFn();
  };

  // 4. Contact form — mở mailto thực sự
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name    = form.querySelector('input[name="name"]').value.trim();
      const email   = form.querySelector('input[name="email"]').value.trim();
      const message = form.querySelector('textarea[name="message"]').value.trim();

      const subject = encodeURIComponent(`Liên hệ portfolio từ ${name}`);
      const body    = encodeURIComponent(`Từ: ${name} <${email}>\n\n${message}`);
      const mailto  = `mailto:hoanganhtuan@example.com?subject=${subject}&body=${body}`;

      window.location.href = mailto;

      const btn = form.querySelector('button[type="submit"]');
      btn.innerHTML = '<i class="fas fa-check"></i> Đang mở ứng dụng email...';
      btn.style.background = 'var(--green)';
      setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Gửi tin nhắn';
        btn.style.background = '';
      }, 3000);
    });
  }

  // 5. Scroll reveal
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.skill-card, .stat-card, .info-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });

  // 6. Navbar scroll effect
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.style.borderBottomColor = 'var(--border)';
    } else {
      navbar.style.borderBottomColor = 'transparent';
    }
  });
});