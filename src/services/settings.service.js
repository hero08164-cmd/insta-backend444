import Settings from "../models/settings.model.js";

export const getSettingsService = async () => {
  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create({});
  }

  return settings;
};

export const updateSettingsService = async (payload) => {
  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create(payload);
  } else {
    Object.assign(settings, payload);
    await settings.save();
  }

  return settings;
};