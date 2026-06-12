// location-cascade.js — shared: register.html,
// register-spa.html, dashboard.html
// provinces/towns/suburbs own field = `name`; areas = `areaName`
// Client-side sort — existing indexes don't cover these queries

import { db as locDb } from './firebase-config.js';
import {
  collection, query, where, getDocs
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

function locReset(sel, label) {
  sel.innerHTML = '<option value="">' + label + '</option>';
  sel.disabled = true;
}
function locShow(id, show) {
  document.getElementById(id).classList.toggle('hidden', !show);
}
function locSort(docs, field) {
  return docs.sort((a, b) =>
    a.data()[field].localeCompare(b.data()[field]));
}

export async function initLocationCascade() {
  const sel = document.getElementById('province');
  locReset(sel, 'Select province…');
  sel.disabled = false;
  const snap = await getDocs(collection(locDb, 'locations_provinces'));
  locSort(snap.docs, 'name').forEach(d =>
    sel.add(new Option(d.data().name, d.id)));
}

export async function onProvinceChange() {
  const provinceId = document.getElementById('province').value;
  const townSel = document.getElementById('area');
  locReset(townSel, 'Select city/town…');
  locReset(document.getElementById('locationArea'), 'Select area…');
  locReset(document.getElementById('suburb'), 'Select suburb…');
  locShow('locationAreaField', false);
  locShow('suburbField', true);
  if (!provinceId) return;
  const snap = await getDocs(query(
    collection(locDb, 'locations_towns'),
    where('provinceId', '==', provinceId)));
  locSort(snap.docs, 'name').forEach(d =>
    townSel.add(new Option(d.data().name, d.id)));
  townSel.disabled = false;
}

export async function onAreaChange() {
  const townId = document.getElementById('area').value;
  const areaSel = document.getElementById('locationArea');
  const subSel = document.getElementById('suburb');
  locReset(areaSel, 'Select area…');
  locReset(subSel, 'Select suburb…');
  locShow('locationAreaField', false);
  locShow('suburbField', true);
  if (!townId) return;
  const [areaSnap, subSnap] = await Promise.all([
    getDocs(query(
      collection(locDb, 'locations_areas'),
      where('townId', '==', townId))),
    getDocs(query(
      collection(locDb, 'locations_suburbs'),
      where('townId', '==', townId)))
  ]);
  locSort(subSnap.docs, 'name').forEach(d =>
    subSel.add(new Option(d.data().name, d.data().name)));
  subSel.disabled = false;
  if (!areaSnap.empty) {
    locSort(areaSnap.docs, 'areaName').forEach(d =>
      areaSel.add(new Option(d.data().areaName, d.data().areaName)));
    areaSel.disabled = false;
    locShow('locationAreaField', true);
  }
}

export function onLocationAreaChange() {
  const areaSel = document.getElementById('locationArea');
  const subSel = document.getElementById('suburb');
  if (areaSel.value) {
    subSel.value = '';
    locShow('suburbField', false);
    areaSel.options[0].text = '— Clear selection —';
  } else {
    locShow('suburbField', true);
    areaSel.options[0].text = 'Select area…';
  }
}

export function onSuburbChange() {
  const areaSel = document.getElementById('locationArea');
  const subSel = document.getElementById('suburb');
  const hasAreas = areaSel.options.length > 1;
  if (subSel.value && hasAreas) {
    areaSel.value = '';
    locShow('locationAreaField', false);
    subSel.options[0].text = '— Clear selection —';
  } else if (hasAreas) {
    locShow('locationAreaField', true);
    subSel.options[0].text = 'Select suburb…';
  }
}

export function getLocationValues() {
  const p = document.getElementById('province');
  const t = document.getElementById('area');
  return {
    province: p.value,
    provinceName: p.value ? p.options[p.selectedIndex].text : '',
    townId: t.value,
    townName: t.value ? t.options[t.selectedIndex].text : '',
    locationArea: document.getElementById('locationArea').value || '',
    suburb: document.getElementById('suburb').value || ''
  };
}

export async function preSelectLocation(saved) {
  if (!saved || !saved.province) return;
  await initLocationCascade();
  document.getElementById('province').value = saved.province;
  await onProvinceChange();
  if (!saved.townId) return;
  document.getElementById('area').value = saved.townId;
  await onAreaChange();
  if (saved.locationArea) {
    document.getElementById('locationArea').value = saved.locationArea;
    onLocationAreaChange();
  } else if (saved.suburb) {
    document.getElementById('suburb').value = saved.suburb;
    onSuburbChange();
  }
}
