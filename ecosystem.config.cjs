module.exports = {
  apps: [
    {
      script: "./src/index.ts",
      name: "ssb-relay",
      interpreter: "node",
      interpreterArgs: "--import tsx",
    },
  ],
};
