const { notarize } = require("@electron/notarize");

exports.default = async function notarizing(context) {
  const { electronPlatformName } = context;
  if (electronPlatformName !== "darwin") return;
  if (1) return;
  return await notarize({
    tool: "notarytool",
    appBundleId: "",
    appPath: ``,
    appleId: "",
    appleIdPassword: "",
    ascProvider: "",
    teamId: "",
  });
};
