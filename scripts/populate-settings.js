import SettingsModel from "../src/server/models/SettingsModel.js";

const settings = {
  inBeta                       : true,
  betaKey                      : "66d6cb60157343d5d814beb1afa57f529d8933f5773e3837e7a8c5a4ff1f6370",
  testKey                      : "b505bcba365779809dbda63b4283b9af",
  GET_NEXT_ATTEMPTS_PER_EXAMPLE: 3,
  GET_NEXT_EXAMPLES_PER_IDIOM  : 3,
  GET_NEXT_MAX_INITIAL_IDIOMS  : 5,
  GET_NEXT_MAX_NEW_IDIOMS      : 4,
  SANDBOX_MAX_EXAMPLES_PER     : 10,
  SANDBOX_CUTOFF_DAYS          : 4,
  SANDBOX_MAX_BASED_ON         : 6,
  APP_VERSION                  : "0.1"
};

const model = new SettingsModel();
const result = await model.put(settings);
console.log( ' new settings: ', SettingsModel.all())
console.log(result)
