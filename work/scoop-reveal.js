(() => {
  const gallery = document.querySelector('.scoop-campaign');
  if (!gallery) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (!reduced.matches) {
    gallery.setAttribute('data-motion', '');
    const reveal = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.setAttribute('data-in', '');
        reveal.unobserve(entry.target);
      }
    }, { threshold: .08 });
    gallery.querySelectorAll('[data-reveal]').forEach(panel => reveal.observe(panel));
  }
})();
