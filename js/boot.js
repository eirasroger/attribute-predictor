/* must stay render-blocking in <head>, above the stylesheet */
(function () {
  var LANGS = ['en', 'ca', 'es'], root = document.documentElement, pick = null;
  try { pick = new URLSearchParams(location.search).get('lang'); } catch (e) {}
  if (LANGS.indexOf(pick) < 0) {
    try { pick = localStorage.getItem('ap-lang'); } catch (e) {}
  }
  if (LANGS.indexOf(pick) < 0) {
    var want = navigator.languages || [navigator.language || ''];
    pick = 'en';
    for (var i = 0; i < want.length; i++) {
      var code = String(want[i]).toLowerCase().split('-')[0];
      if (LANGS.indexOf(code) > -1) { pick = code; break; }
    }
  }
  root.lang = pick;
  if (pick !== 'en') {
    root.className += ' i18n-pending';
    setTimeout(function () { root.classList.remove('i18n-pending'); }, 1500);
  }
})();
