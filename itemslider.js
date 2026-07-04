;(function () {
  'use strict';

  function sliderParts(slider) {
    return {
      categories: Array.prototype.slice.call(slider.children).filter(function (child) {
        return child.tagName && child.tagName.toLowerCase() === 'ul';
      }),
      navItems: Array.prototype.slice.call(slider.querySelectorAll('nav > a')),
    };
  }

  function clearCategoryClasses(category) {
    category.className = '';
  }

  function currentIndex(navItems) {
    var index = navItems.findIndex(function (item) {
      return item.classList.contains('mi-selected');
    });
    return index < 0 ? 0 : index;
  }

  function showCategory(slider, nextIndex) {
    if (slider.dataset.animating === 'true') return;

    var parts = sliderParts(slider);
    var categories = parts.categories;
    var navItems = parts.navItems;
    var current = currentIndex(navItems);

    if (nextIndex === current || !categories[nextIndex]) return;

    slider.dataset.animating = 'true';
    navItems[current].classList.remove('mi-selected');
    navItems[nextIndex].classList.add('mi-selected');

    var direction = nextIndex > current ? 'right' : 'left';
    var toClass = direction === 'right' ? 'mi-moveToLeft' : 'mi-moveToRight';
    var fromClass = direction === 'right' ? 'mi-moveFromRight' : 'mi-moveFromLeft';
    var currentCategory = categories[current];
    var nextCategory = categories[nextIndex];
    var lastChild = nextCategory.children[nextCategory.children.length - 1];

    clearCategoryClasses(currentCategory);
    currentCategory.classList.add(toClass);

    setTimeout(function () {
      clearCategoryClasses(nextCategory);
      nextCategory.classList.add(fromClass);

      function finish() {
        lastChild.removeEventListener('animationend', finish);
        nextCategory.classList.add('mi-current');
        slider.dataset.animating = 'false';
      }

      lastChild.addEventListener('animationend', finish);
    }, nextCategory.children.length * 90);
  }

  document.addEventListener('click', function (event) {
    var navItem = event.target.closest('#mi-slider nav a');
    if (!navItem) return;

    event.preventDefault();
    var slider = navItem.closest('#mi-slider');
    var navItems = Array.prototype.slice.call(slider.querySelectorAll('nav > a'));
    showCategory(slider, navItems.indexOf(navItem));
  });

  window.addEventListener('resize', function () {
    var slider = document.getElementById('mi-slider');
    if (!slider) return;

    var parts = sliderParts(slider);
    parts.categories.forEach(clearCategoryClasses);
    if (parts.categories[0]) parts.categories[0].classList.add('mi-current');
    parts.navItems.forEach(function (item) { item.classList.remove('mi-selected'); });
    if (parts.navItems[0]) parts.navItems[0].classList.add('mi-selected');
    slider.dataset.animating = 'false';
  });

  function updateHeaderLogoForSection() {
    var spacer = document.getElementById('scroll-spacer');
    if (!spacer) return;

    var active = window.scrollY >= spacer.offsetHeight - window.innerHeight * 0.2;
    document.body.classList.toggle('is-section-2', active);
  }

  window.addEventListener('scroll', updateHeaderLogoForSection, { passive: true });
  window.addEventListener('resize', updateHeaderLogoForSection);
  updateHeaderLogoForSection();

  document.querySelectorAll('.web-video-item').forEach(function (item) {
    var video = item.querySelector('.web-portfolio-video');
    if (!video) return;

    video.muted = true;
    video.controls = false;
    video.pause();
    video.currentTime = 0;

    item.addEventListener('mouseenter', function () {
      video.play().catch(function () {});
    });

    item.addEventListener('mouseleave', function () {
      video.pause();
      video.currentTime = 0;
    });
  });
})();
