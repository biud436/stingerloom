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
            "@stingerloom/common": path.resolve(__dirname, "packages/common"),
            "@stingerloom/bootstrap": path.resolve(
                __dirname,
                "packages/bootstrap",
            ),
            "@stingerloom/error": path.resolve(__dirname, "packages/error"),
            "@stingerloom/IoC": path.resolve(__dirname, "packages/IoC"),
            "@stingerloom/utils": path.resolve(__dirname, "packages/utils"),
            "@stingerloom/example": path.resolve(__dirname, "packages/example"),
            "@stingerloom/factory": path.resolve(__dirname, "packages/factory"),
            "@stingerloom/services": path.resolve(
                __dirname,
                "packages/services",
            ),
            "@stingerloom/router": path.resolve(__dirname, "packages/router"),
            "@stingerloom/orm": path.resolve(__dirname, "packages/orm"),
            "@stingerloom/compiler": path.resolve(
                __dirname,
                "packages/compiler",
            ),
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
