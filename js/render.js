window.Render = (function () {
  const $ = s => document.querySelector(s);

  function fmt(h) {
    if (!isFinite(h)) return '∞';
    if (h >= 48) return (h / 24).toFixed(1).replace('.', ',') + ' доби';
    const m = Math.round(h * 60), hh = Math.floor(m / 60), mm = m % 60;
    return [hh && hh + ' год', (mm || !hh) && mm + ' хв'].filter(Boolean).join(' ');
  }
  const wh = n => isFinite(n) ? Math.ceil(n) + ' Вт·год' : '—';

  function result(s) {
    const r = Calc.run(s), box = $('.verdict'), tip = $('.tip');
    const set = (sel, t) => { $(sel).textContent = t; };
    const gauge = (fill, gap) => {
      $('.gauge__fill').style.width = fill + '%';
      $('.gauge__gap').style.width = gap + '%';
    };
    let tone = 'ok', title, text;
    tip.hidden = true;

    set('.stats__load', Math.round(r.total) + ' Вт');
    set('.stats__usable', Math.round(r.usable) + ' Вт·год');
    set('.stats__runtime', fmt(r.hours));
    set('.stats__need', wh(r.need));
    set('.gauge__runtime', 'Заряду на ' + fmt(r.hours));
    set('.gauge__outage', 'Відключення ' + fmt(s.outage));

    if (!(s.outage > 0) || !(s.cap > 0)) {
      tone = 'warn'; title = 'Введіть дані';
      text = 'Вкажіть ємність і тривалість відключення.'; gauge(0, 0);
    } else if (r.total <= 0) {
      tone = 'warn'; title = 'Немає навантаження';
      text = 'Увімкніть хоча б один прилад зі списку.'; gauge(0, 0);
    } else {
      const ratio = r.hours / s.outage;
      gauge(Math.min(ratio, 1) * 100, Math.max(1 - ratio, 0) * 100);
      if (ratio >= 1.15) {
        title = 'Вистачить';
        text = `Заряду вистачить на ${fmt(r.hours)}, запас ${fmt(r.hours - s.outage)}.`;
      } else if (ratio >= 1) {
        tone = 'warn'; title = 'Вистачить впритул';
        text = `Запас лише ${fmt(r.hours - s.outage)}. Будь-який додатковий прилад його з'їсть.`;
      } else {
        tone = 'bad'; title = 'Не вистачить';
        text = `Енергії вистачить на ${fmt(r.hours)}, ще ${fmt(s.outage - r.hours)} будете без світла.`;
        const sg = Calc.suggest(s, r.usable);
        tip.hidden = false;
        if (sg) {
          set('.tip__title', 'Як дотягнути до кінця');
          set('.tip__text', `Вимкніть: ${sg.off.map(d => d.n || 'без назви').join(', ')}. Навантаження впаде до ${Math.round(sg.total)} Вт, і заряду вистачить на ${fmt(sg.hours)}.`);
        } else {
          set('.tip__title', 'Не дотягнути навіть на мінімумі');
          set('.tip__text', `Для цього набору потрібно щонайменше ${wh(r.need)} або підзарядка під час відключення.`);
        }
      }
    }
    box.className = 'verdict verdict--' + tone;
    set('.verdict__title', title);
    set('.verdict__text', text);
  }

  function devices(list, devs, onChange) {
    list.replaceChildren(...devs.map((d, i) => {
      const li = document.createElement('li');
      li.className = 'device' + (d.on ? '' : ' device--off');
      li.innerHTML =
        '<input class="device__on" type="checkbox" aria-label="Увімкнено">' +
        '<input class="device__name" aria-label="Назва">' +
        '<input class="device__w" type="number" min="0" inputmode="decimal" aria-label="Потужність, Вт">' +
        '<input class="device__duty" type="number" min="1" max="100" inputmode="decimal" aria-label="Час роботи, %">' +
        '<button class="device__del" type="button" aria-label="Видалити">×</button>';
      const q = c => li.querySelector('.device__' + c);
      q('on').checked = d.on; q('name').value = d.n; q('w').value = d.w; q('duty').value = d.duty;
      q('on').addEventListener('change', e => { d.on = e.target.checked; li.classList.toggle('device--off', !d.on); onChange(); });
      q('name').addEventListener('input', e => { d.n = e.target.value; onChange(); });
      q('w').addEventListener('input', e => { d.w = parseFloat(e.target.value) || 0; onChange(); });
      q('duty').addEventListener('input', e => { d.duty = Math.min(100, parseFloat(e.target.value) || 0); onChange(); });
      q('del').addEventListener('click', () => { devs.splice(i, 1); devices(list, devs, onChange); onChange(); });
      return li;
    }));
  }

  return { result, devices };
})();
