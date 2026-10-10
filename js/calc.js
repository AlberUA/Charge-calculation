window.Calc = (function () {
  const load = d => (d.on ? d.w * d.duty / 100 : 0);

  function run(s) {
    const k = s.soc / 100 * s.eff / 100;
    const usable = s.cap * k;
    const total = s.devices.reduce((sum, d) => sum + load(d), 0);
    return {
      usable, total,
      hours: total > 0 ? usable / total : Infinity,
      need: k > 0 ? total * s.outage / k : Infinity
    };
  }

  // Мінімальний набір найпотужніших приладів, які треба вимкнути, щоб дотягнути
  function suggest(s, usable) {
    const active = s.devices.filter(d => load(d) > 0).sort((a, b) => load(b) - load(a));
    const budget = usable / s.outage;
    let total = active.reduce((sum, d) => sum + load(d), 0);
    const off = [];
    while (total > budget && active.length > 1) {
      const d = active.shift();
      off.push(d);
      total -= load(d);
    }
    return total > budget ? null : { off, total, hours: usable / total };
  }

  return { load, run, suggest };
})();
