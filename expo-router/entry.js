// Entry fallback for cloud hosting environments (such as Render)
if (process.env.PORT || process.env.RENDER || !process.env.EXPO_ROUTER_APP_ROOT) {
  try {
    require('../server/index.js');
  } catch (e) {
    require('expo-router/entry');
  }
} else {
  require('expo-router/entry');
}
