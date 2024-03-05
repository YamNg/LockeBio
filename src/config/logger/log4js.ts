import log4js from "log4js";

// Configure log4js
log4js.configure({
  appenders: {
    out: { type: "stdout" },
  },
  categories: {
    default: { appenders: ["out"], level: "debug" },
  },
});

export default log4js;
