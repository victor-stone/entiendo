import { SettingsModel } from "../models/index.js";

export function getSettings() {
  return SettingsModel.all();
}

export function putSettings(routeContext) {
  const { payload: { settings } } = routeContext;
  const model = new SettingsModel();
  return model.put(settings);
}

export function addSettings(routeContext) {
  const { payload: { settings } } = routeContext;
  const model = new SettingsModel();
  return model.add(settings);
}
