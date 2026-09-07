const items = document.querySelectorAll('.fit-card,.team-message,.reason-card');
items.forEach(item => item.classList.add('reveal'));
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: .12 });
items.forEach(item => observer.observe(item));
