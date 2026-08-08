/* ==========================================================================
   Street View for the "Where we work" section
   ==========================================================================

   Deliberately click-to-load. Three reasons, all of them the same decision:

     - Cost. Dynamic Street View bills per panorama load. Auto-loading would
       charge REKAM for every page view of the About page, including the ones
       that scroll straight past this section.
     - Privacy. Fetching Google's script hands the visitor's IP to Google. Not
       requesting it until someone asks keeps that from happening by default.
     - Weight. The Maps bootstrap plus imagery is a large third-party payload on
       a page we otherwise keep lean.

   Attribution is left exactly as Google renders it. The Google logo, "© Google",
   the imagery date and the "Report a problem" link all live inside the panorama
   element and nothing here draws over them — obscuring them would breach the
   Maps Platform terms, and the cover overlay is removed the moment the panorama
   is up.

   The illustrated FMA map stays the primary graphic. This is additive: it
   answers "what does it actually look like on the ground", which a vector map
   cannot.
   ========================================================================== */

(() => {
  'use strict';

  const root = document.getElementById('sv');
  if (!root) return;

  const CFG = window.REKAM_STREETVIEW || {};
  const places = Array.isArray(CFG.places) ? CFG.places : [];
  const radius = Number(CFG.radius) || 3000;

  const chips = root.querySelector('.sv__places');
  const stage = root.querySelector('.sv__pano');
  const cover = root.querySelector('.sv__cover');
  const status = root.querySelector('.sv__status');
  const loadBtn = root.querySelector('.sv__load');

  if (!places.length) {
    root.hidden = true;
    return;
  }

  const say = (msg) => { status.textContent = msg; };

  /* ---- place buttons ---------------------------------------------------- */

  let current = 0;

  chips.innerHTML = places.map((p, i) => `
    <button class="chip${i === 0 ? ' is-on' : ''}" type="button"
            data-place="${i}" aria-pressed="${i === 0}">${p.label}</button>`).join('');

  const markChip = (i) => {
    for (const chip of chips.querySelectorAll('.chip')) {
      const on = Number(chip.dataset.place) === i;
      chip.classList.toggle('is-on', on);
      chip.setAttribute('aria-pressed', String(on));
    }
  };

  /* ---- the API, fetched once and only on request ------------------------ */

  let apiPromise = null;

  const loadApi = () => {
    if (apiPromise) return apiPromise;

    apiPromise = new Promise((resolve, reject) => {
      // The bootstrap calls a global when it is ready; give it a name unlikely
      // to collide and clean it up afterwards.
      const done = '__rekamMapsReady';
      window[done] = () => { delete window[done]; resolve(); };

      const script = document.createElement('script');
      const params = new URLSearchParams({
        key: CFG.apiKey,
        v: 'weekly',
        loading: 'async',
        callback: done,
      });
      script.src = `https://maps.googleapis.com/maps/api/js?${params}`;
      script.async = true;
      script.onerror = () => reject(new Error('Skrip Google Maps gagal dimuat.'));
      document.head.appendChild(script);

      // A blocked or offline request can hang without firing onerror.
      window.setTimeout(() => reject(new Error('Google Maps terlalu lama merespons.')), 12000);
    });

    return apiPromise;
  };

  /* ---- the panorama ----------------------------------------------------- */

  let panorama = null;
  let service = null;

  const goTo = (i) => {
    current = i;
    markChip(i);
    const place = places[i];
    say(`Mencari citra terdekat di ${place.label}…`);

    // Ask for the nearest panorama rather than assuming one sits on the point:
    // coverage in smaller towns can be several streets away, and outside the
    // cities there may be none at all.
    service.getPanorama(
      { location: { lat: place.lat, lng: place.lng }, radius, source: 'outdoor' },
      (data, svStatus) => {
        if (svStatus !== 'OK' || !data || !data.location) {
          say(`Belum ada citra Street View di sekitar ${place.label} (radius ${radius / 1000} km).`);
          return;
        }
        panorama.setPano(data.location.pano);
        panorama.setPov({ heading: 0, pitch: 0 });
        panorama.setVisible(true);
        const where = data.location.description || place.label;
        say(`${where} — ${place.region}. Seret untuk melihat sekeliling.`);
      },
    );
  };

  const start = async () => {
    loadBtn.disabled = true;
    say('Memuat Google Street View…');

    try {
      await loadApi();
    } catch (error) {
      loadBtn.disabled = false;
      say(`${error.message} Peta ilustrasi di atas tetap bisa dibaca.`);
      return;
    }

    service = new google.maps.StreetViewService();
    panorama = new google.maps.StreetViewPanorama(stage, {
      // Google's own attribution stays; only the navigation furniture is
      // trimmed, which the terms allow.
      addressControl: false,
      fullscreenControl: true,
      motionTracking: false,
      motionTrackingControl: false,
      zoomControl: true,
      linksControl: true,
      panControl: false,
      visible: false,
    });

    root.classList.add('is-live');
    cover.hidden = true;
    goTo(current);
  };

  loadBtn.addEventListener('click', start);

  chips.addEventListener('click', (event) => {
    const chip = event.target.closest('[data-place]');
    if (!chip) return;
    const i = Number(chip.dataset.place);
    // Before the API is up, a place click just preselects — it must not trigger
    // a load the visitor did not ask for.
    if (!panorama) { current = i; markChip(i); return; }
    goTo(i);
  });

  /* ---- honest about not being configured ------------------------------- */

  if (!CFG.apiKey) {
    loadBtn.disabled = true;
    loadBtn.textContent = 'Street View belum dikonfigurasi';
    say('Belum ada API key di streetview-config.js, jadi Street View belum bisa dibuka. '
      + 'Peta ilustrasi dan tabel cakupan di atas tidak terpengaruh.');
  }
})();
