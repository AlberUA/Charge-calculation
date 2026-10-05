window.Store = (function () {
  const KEY = 'power-check:v1';
  return {
    load() { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } },
    save(state) { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* приватний режим */ } }
  };
})();
