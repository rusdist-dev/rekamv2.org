/* Page chrome: nav panel and form handling.
   The 360° hero is driven separately by ../hero-360.js */

(() => {
  'use strict';

  let panelOpen = false;
  let applyPanel = () => {};

  /* ---- Reveal the nav card once the hero has scrolled past ----
     Declared per page with data-reveal="<hero selector>"; pages without it
     simply show the card from the start. */
  const nav = document.getElementById('site-header');
  const revealTarget = nav && nav.dataset.reveal
    ? document.querySelector(nav.dataset.reveal)
    : null;

  if (nav && revealTarget) {
    const syncReveal = () => {
      const revealed = revealTarget.getBoundingClientRect().bottom <= 1;
      nav.classList.toggle('is-revealed', revealed);
      // The centred mark shares the hero's horizontal centre, so the headline
      // would slide straight through it on the way past. Retire the mark as
      // soon as the page leaves the top.
      nav.classList.toggle('is-scrolled', window.scrollY > 24);
      // Scrolling back to the hero hides the nav, so drop any open drawer
      // with it; the toggle's visibility changes here too.
      if (!revealed) panelOpen = false;
      applyPanel();
    };
    syncReveal();
    window.addEventListener('scroll', syncReveal, { passive: true });
    window.addEventListener('resize', syncReveal);
  }

  /* ---- Nav panel ----
     Works for both nav variants without being told which is active: if the
     toggle is visible the links behave as a drawer, and if it is not they are
     already laid out inline and the panel must simply stay open. That keeps
     the card variant (toggle always shown) and the bar variant (toggle only
     on narrow screens) on one code path. */
  const toggle = document.getElementById('nav-toggle');
  const panel = document.getElementById('nav-panel');

  const usesDrawer = () => toggle && getComputedStyle(toggle).display !== 'none';

  applyPanel = () => {
    if (!toggle || !panel) return;
    const drawer = usesDrawer();
    panel.hidden = drawer ? !panelOpen : false;
    toggle.setAttribute('aria-expanded', String(drawer && panelOpen));
    toggle.setAttribute('aria-label', panelOpen ? 'Tutup menu' : 'Buka menu');
    const card = toggle.closest('.sidenav__card');
    if (card) card.classList.toggle('is-open', drawer && panelOpen);
    // Only the overlay variant styles this, but setting it unconditionally
    // keeps the variants free of their own JS.
    document.body.classList.toggle('nav-open', drawer && panelOpen);
  };

  if (toggle && panel) {
    toggle.addEventListener('click', () => { panelOpen = !panelOpen; applyPanel(); });

    // Following a link closes the drawer, which matters most on narrow screens
    // where the open panel covers the page.
    panel.addEventListener('click', (event) => {
      if (event.target.closest('a')) { panelOpen = false; applyPanel(); }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && panelOpen) {
        panelOpen = false;
        applyPanel();
        toggle.focus();
      }
    });

    window.addEventListener('resize', applyPanel);
    applyPanel();
  }

  /* ---- Dropdown submenus ----
     Click-driven, so touch works. One open at a time; closes on outside click,
     on Escape, and when focus leaves the item. */
  const subs = [...document.querySelectorAll('.sidenav__has-sub')];

  const closeSubs = (except) => {
    for (const item of subs) {
      if (item === except) continue;
      item.classList.remove('is-open');
      item.querySelector('.sidenav__sub-toggle')?.setAttribute('aria-expanded', 'false');
    }
  };

  for (const item of subs) {
    const btn = item.querySelector('.sidenav__sub-toggle');
    if (!btn) continue;
    btn.addEventListener('click', () => {
      const open = !item.classList.contains('is-open');
      closeSubs(item);
      item.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
    // Tabbing out of the item closes it, so the menu never lingers offscreen.
    item.addEventListener('focusout', (event) => {
      if (!item.contains(event.relatedTarget)) {
        item.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  if (subs.length) {
    document.addEventListener('click', (event) => {
      if (!event.target.closest('.sidenav__has-sub')) closeSubs(null);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeSubs(null);
    });
  }

  /* ---- Search ----
     No search backend exists yet, so the field is kept honest rather than
     silently doing nothing on submit. */
  const search = document.getElementById('nav-search');
  if (search) {
    search.addEventListener('submit', (event) => {
      event.preventDefault();
      const q = search.elements.q.value.trim();
      if (!q) { search.elements.q.focus(); return; }
      window.alert(`Pencarian belum tersambung ke backend. Kata kunci: “${q}”`);
    });
  }

  /* ---- Team profiles in a dialog ----
     The markup ships each bio inside <details>, so it is readable with no JS at
     all. This upgrades that to one shared <dialog>, which brings focus
     trapping, Escape, the top layer and focus restoration from the platform
     rather than from hand-written code.

     The <details> is hidden, never removed: it is where the bio text lives, so
     the dialog reads from the page instead of from a duplicate copy in JS. */
  const grid = document.querySelector('.team__grid');
  const dialogSupported = typeof HTMLDialogElement === 'function'
    && 'showModal' in HTMLDialogElement.prototype;

  if (grid && dialogSupported) {
    const people = [...grid.querySelectorAll('.person')];

    const dialog = document.createElement('dialog');
    dialog.className = 'bio';
    dialog.setAttribute('aria-labelledby', 'bio-name');
    dialog.innerHTML = `
      <div class="bio__panel" tabindex="-1">
        <button class="bio__close" type="button" aria-label="Tutup profil">&times;</button>
        <div class="bio__aside"><img class="bio__photo" alt="" width="600" height="750"></div>
        <div class="bio__head">
          <p class="bio__role"></p>
          <h2 class="bio__name" id="bio-name"></h2>
        </div>
        <div class="bio__text"></div>
        <nav class="bio__nav" aria-label="Pindah profil">
          <button class="bio__step" type="button" data-step="-1">&larr; Sebelumnya</button>
          <button class="bio__step" type="button" data-step="1">Berikutnya &rarr;</button>
          <span class="bio__count" aria-hidden="true"></span>
        </nav>
      </div>`;
    document.body.appendChild(dialog);

    const panel = dialog.querySelector('.bio__panel');
    const photo = dialog.querySelector('.bio__photo');
    const el = (sel) => dialog.querySelector(sel);

    let index = 0;

    const show = (i) => {
      // Wrap at both ends, so the arrows never dead-end.
      index = (i + people.length) % people.length;
      const person = people[index];
      const src = person.querySelector('.person__photo');

      photo.src = src.getAttribute('src');
      // The name is right beside it, so the portrait adds nothing for a screen
      // reader and is marked decorative rather than read twice.
      photo.alt = '';
      el('.bio__name').textContent = person.querySelector('.person__name').textContent;
      el('.bio__role').textContent = person.querySelector('.person__role').textContent;
      el('.bio__text').innerHTML = [...person.querySelectorAll('.person__bio p')]
        .map((p) => p.outerHTML).join('');
      el('.bio__count').textContent = `${index + 1} / ${people.length}`;

      if (!dialog.open) {
        dialog.showModal();
        document.body.classList.add('bio-open');
      }
      // Reading a long bio then stepping on would otherwise start halfway down.
      // The text is the scroller now, not the panel.
      el('.bio__text').scrollTop = 0;
      panel.focus();
    };

    people.forEach((person, i) => {
      const button = document.createElement('button');
      button.className = 'person__more';
      button.type = 'button';
      const name = person.querySelector('.person__name').textContent;
      button.textContent = 'Baca profil';
      // The visible label repeats 18 times; the accessible name says whose.
      button.setAttribute('aria-label', `Baca profil ${name}`);
      button.addEventListener('click', () => show(i));
      person.querySelector('.person__body').appendChild(button);
    });

    grid.classList.add('team__grid--modal');

    // A click that reaches the dialog itself landed outside the centred panel.
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
    el('.bio__close').addEventListener('click', () => dialog.close());

    dialog.addEventListener('click', (event) => {
      const step = event.target.closest('[data-step]');
      if (step) show(index + Number(step.dataset.step));
    });

    dialog.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); show(index - 1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); show(index + 1); }
    });

    // Escape closes it without going through our handler, so unlock here rather
    // than in the close button.
    dialog.addEventListener('close', () => document.body.classList.remove('bio-open'));
  }

  /* ---- Organisation chart ----
     Each unit opens on demand. Names are matched against the team section
     below, and any name with a profile there becomes a button that opens the
     same dialog — so the chart never carries its own copy of who has a bio,
     and cannot fall out of step with the team list. */
  const chart = document.getElementById('orgchart');

  if (chart) {
    const heads = [...chart.querySelectorAll('.orgunit__toggle')];

    const setUnit = (head, open) => {
      head.setAttribute('aria-expanded', String(open));
      document.getElementById(head.getAttribute('aria-controls')).hidden = !open;
    };

    for (const head of heads) {
      head.addEventListener('click', () => {
        setUnit(head, head.getAttribute('aria-expanded') !== 'true');
      });
    }

    chart.querySelector('[data-org="expand"]')
      .addEventListener('click', () => heads.forEach((h) => setUnit(h, true)));
    chart.querySelector('[data-org="collapse"]')
      .addEventListener('click', () => heads.forEach((h) => setUnit(h, false)));

    // Open the first unit so the interaction is discoverable rather than a
    // wall of closed rows.
    if (heads.length) setUnit(heads[0], true);

    // ---- link names to their profiles ----
    const profiles = new Map();
    for (const person of document.querySelectorAll('.person')) {
      const name = person.querySelector('.person__name');
      const trigger = person.querySelector('.person__more');
      if (name && trigger) profiles.set(name.textContent.trim(), trigger);
    }

    const profileButton = (label, trigger) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'orgperson';
      button.textContent = label;
      button.setAttribute('aria-label', `Baca profil ${label}`);
      button.addEventListener('click', () => trigger.click());
      return button;
    };

    /* Every name is now an ordinary element — the unit header is a div with an
       invisible toggle behind it, not a button — so each one can become a
       profile button in place. The director no longer has to be smuggled into
       the manager list, where they did not belong and appeared twice. */
    for (const slot of chart.querySelectorAll('[data-person]')) {
      const trigger = profiles.get(slot.dataset.person);
      if (!trigger) continue;             // no profile written for this person
      const shown = slot.textContent.trim();
      slot.textContent = '';
      slot.appendChild(profileButton(shown, trigger));
    }
  }

  /* ---- Strategic thinking ----
     Four stages as a tablist. Selecting one sets data-step on the section, and
     CSS lifts the matching ring out of the dimmed diagram — the flat image
     could show the layers but never say which stage was which. */
  const strategy = document.querySelector('.strategy[data-step]');

  if (strategy) {
    const tabs = [...strategy.querySelectorAll('[role="tab"]')];

    const select = (index, moveFocus) => {
      const chosen = tabs[(index + tabs.length) % tabs.length];
      for (const tab of tabs) {
        const on = tab === chosen;
        tab.setAttribute('aria-selected', String(on));
        // Only the selected tab stays in the tab order; arrows move between
        // them, which is the expected behaviour for a tablist.
        tab.tabIndex = on ? 0 : -1;
        document.getElementById(tab.getAttribute('aria-controls')).hidden = !on;
      }
      strategy.dataset.step = chosen.dataset.step;
      if (moveFocus) chosen.focus();
    };

    tabs.forEach((tab, i) => tab.addEventListener('click', () => select(i, false)));

    strategy.querySelector('[role="tablist"]').addEventListener('keydown', (event) => {
      const i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      const keys = {
        ArrowRight: i + 1, ArrowLeft: i - 1,
        ArrowDown: i + 1, ArrowUp: i - 1,
        Home: 0, End: tabs.length - 1,
      };
      if (!(event.key in keys)) return;
      event.preventDefault();
      select(keys[event.key], true);
    });
  }

  /* ---- Language switch ----
     There is no English build yet, so the alternate reports that rather than
     navigating nowhere. Replace this with the real href once it exists. */
  const langAlt = document.querySelector('.sidenav__lang-alt');
  if (langAlt) {
    langAlt.addEventListener('click', (event) => {
      event.preventDefault();
      window.alert('Versi bahasa Inggris belum tersedia.');
    });
  }

})();
