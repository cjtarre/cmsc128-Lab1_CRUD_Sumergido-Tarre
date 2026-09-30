const { defineConfig } = require("vitest/config");

module.exports = defineConfig({
    test: {
        environment: "node",
        setupFiles: ["./tests/setup.js"],
        experimental: {viteModuleRunner: false, },
    },
});