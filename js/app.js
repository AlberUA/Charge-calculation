(function () {
  const $ = s => document.querySelector(s);
  const PRESETS = [
    ['Роутер', 12, 100], ['Ноутбук', 60, 100], ['LED-лампа', 10, 100], ['Холодильник', 150, 35],
    ['Телевізор', 80, 100], ['Зарядка телефону', 15, 100], ['Насос опалення', 60, 100], ['Вентилятор', 40, 100]
  ];
  const state = Object.assign({
    cap: 1024, soc: 100, eff: 85, outage: 4,
    devices: [
      { n: 'Роутер', w: 12, duty: 100, on: true },
      { n: 'Ноутбук', w: 60, duty: 100, on: true },
      { n: 'LED-лампа', w: 10, duty: 100, on: true },
      { n: 'Холодильник', w: 150, duty: 35, on: true }
    ]
  }, Store.load() || {});

  const list = $('.devices');
  const update = () => { Store.save(state); Render.result(state); };
  const redraw = () => { Render.devices(list, state.devices, update); update(); };

  document.querySelectorAll('[data-field]').forEach(el => {
    const k = el.dataset.field;
    el.value = state[k];
    el.addEventListener('input', () => { state[k] = parseFloat(el.value) || 0; update(); });
  });

  const chips = $('.chips');
  PRESETS.forEach(([n, w, duty]) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'chips__btn'; b.textContent = `${n}, ${w} Вт`;
    b.addEventListener('click', () => { state.devices.push({ n, w, duty, on: true }); redraw(); });
    chips.append(b);
  });

  $('.devices__add').addEventListener('click', () => {
    state.devices.push({ n: '', w: 50, duty: 100, on: true });
    redraw();
    list.lastElementChild.querySelector('.device__name').focus();
  });

  redraw();
})();
