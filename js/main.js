/* =====================================================================
   Дентомир+ — скрипты главной страницы
   1. Мобильное меню (бургер)
   2. Карусель интерьеров (вращение ленты, центральное фото крупнее)
   3. Карусель врачей (сдвиг ленты, свайп)
   ===================================================================== */
(function () {
  'use strict';

  /* ---------- 1. Мобильное меню ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  if (burger && nav) {
    var setMenu = function (open) {
      nav.classList.toggle('is-open', open);
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    };

    burger.addEventListener('click', function () {
      setMenu(!nav.classList.contains('is-open'));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.header')) setMenu(false);
    });
  }

  /* ---------- 2. Карусель интерьеров ---------- */
  var interiors = document.getElementById('interiorsTrack');

  if (interiors) {
    var busy = false;

    var rotate = function (dir) {
      if (busy) return;
      busy = true;

      var items = Array.prototype.slice.call(interiors.children);
      var before = new Map();
      items.forEach(function (el) { before.set(el, el.getBoundingClientRect()); });

      // переставляем крайний элемент в другой конец ленты
      var moved = dir > 0 ? interiors.firstElementChild : interiors.lastElementChild;
      if (dir > 0) interiors.appendChild(moved);
      else interiors.insertBefore(moved, interiors.firstElementChild);

      // FLIP-анимация: элементы плавно «переезжают» на новые места
      var after = Array.prototype.slice.call(interiors.children);
      after.forEach(function (el) {
        var first = before.get(el);
        var last = el.getBoundingClientRect();
        el.style.transition = 'none';
        if (el === moved) {
          el.style.opacity = '0';
        } else {
          var dx = first.left - last.left;
          var dy = first.top - last.top;
          var sx = first.width / last.width;
          var sy = first.height / last.height;
          el.style.transformOrigin = 'top left';
          el.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(' + sx + ',' + sy + ')';
        }
      });

      void interiors.offsetWidth; // принудительный reflow

      after.forEach(function (el) {
        el.style.transition = 'transform .5s ease, opacity .45s ease';
        el.style.transform = '';
        el.style.opacity = '';
      });

      setTimeout(function () {
        after.forEach(function (el) {
          el.style.transition = '';
          el.style.transformOrigin = '';
        });
        busy = false;
      }, 520);
    };

    var iPrev = document.querySelector('[data-interiors-prev]');
    var iNext = document.querySelector('[data-interiors-next]');
    if (iPrev) iPrev.addEventListener('click', function () { rotate(-1); });
    if (iNext) iNext.addEventListener('click', function () { rotate(1); });
  }

  /* ---------- 3. Карусель врачей ---------- */
  var viewport = document.getElementById('doctorsViewport');
  var track = document.getElementById('doctorsTrack');

  if (viewport && track) {
    var index = 0;

    var metrics = function () {
      var card = track.firstElementChild;
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      var step = card.getBoundingClientRect().width + gap;
      var perView = Math.max(1, Math.round((viewport.clientWidth + gap) / step));
      var max = Math.max(0, track.children.length - perView);
      return { step: step, max: max };
    };

    var update = function () {
      var m = metrics();
      if (index > m.max) index = m.max;
      if (index < 0) index = 0;
      track.style.transform = 'translateX(' + (-index * m.step) + 'px)';
    };

    var go = function (dir) {
      var m = metrics();
      index += dir;
      if (index > m.max) index = 0;       // зацикливание
      if (index < 0) index = m.max;
      update();
    };

    var dPrev = document.querySelector('[data-doctors-prev]');
    var dNext = document.querySelector('[data-doctors-next]');
    if (dPrev) dPrev.addEventListener('click', function () { go(-1); });
    if (dNext) dNext.addEventListener('click', function () { go(1); });

    // свайп пальцем / мышью
    var startX = null;
    viewport.addEventListener('pointerdown', function (e) { startX = e.clientX; });
    viewport.addEventListener('pointerup', function (e) {
      if (startX === null) return;
      var delta = e.clientX - startX;
      startX = null;
      if (Math.abs(delta) > 40) go(delta < 0 ? 1 : -1);
    });
    viewport.addEventListener('pointercancel', function () { startX = null; });

    window.addEventListener('resize', update);
    update();
  }
})();
