const path = require("path");
const nodeExternals = require("webpack-node-externals");

module.exports = {
  entry: "./packages",
  mode: "development",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
  externals: [
    nodeExternals({
      modulesFromFile: true,
    }),
  ],
  target: "node",
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      "@stingerloom/core": path.resolve(__dirname, "packages/core"),
      "@stingerloom/compiler": path.resolve(__dirname, "packages/compiler"),
      "@stingerloom/cli": path.resolve(__dirname, "cli"),
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: "ts-loader",
          options: {
            configFile: path.resolve(__dirname, "tsconfig.json"),
          },
        },
        exclude: /node_modules/,
        include: [path.resolve(__dirname, "packages")],
      },
    ],
  },
};
