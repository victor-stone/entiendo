import { Settings } from "../models/index.js";

export function getSettings() {
  return (new Settings()).all();
}

export function getSetting(id) {
  return getSettings()[id];
}

export function putSettings(routeContext) {
  const { payload: { settings } } = routeContext;
  const s = new Settings();
  return s.put(settings);
}

export function addSettings(routeContext) {
  const { payload: { settings } } = routeContext;
  const s = new Settings();
  return s.add(settings);
}
