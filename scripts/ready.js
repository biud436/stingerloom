const fs = require("fs");
const path = require("path");

const libs = "^1.0.0";

const paths = {
    "@stingerloom/bootstrap": "^1.0.0",
    "@stingerloom/common": "^1.0.0",
    "@stingerloom/compiler": "^1.0.0",
    "@stingerloom/error": "^1.0.0",
    "@stingerloom/factory": "^1.0.0",
    "@stingerloom/ioc": "^1.0.0",
    "@stingerloom/orm": "^1.0.0",
    "@stingerloom/router": "^1.0.0",
    "@stingerloom/services": "^1.0.0",
    "@stingerloom/utils": "^1.0.0",
};

const packagesDir = path.resolve(__dirname, "../packages");

function updatePackageJson(filePath) {
    const packageJson = JSON.parse(fs.readFileSync(filePath, "utf8"));

    if (packageJson.devDependencies) {
        let updated = false;

        Object.keys(packageJson.devDependencies).forEach((key) => {
            if (packageJson.devDependencies[key].startsWith("file:")) {
                packageJson.devDependencies[key] = paths[key] || libs;
                updated = true;
            }
        });

        if (updated) {
            fs.writeFileSync(filePath, JSON.stringify(packageJson, null, 2));
            console.log(`Updated ${filePath}`);
        }
    }
}

function processPackages() {
    fs.readdirSync(packagesDir).forEach((dir) => {
        const packageJsonPath = path.join(packagesDir, dir, "package.json");

        if (fs.existsSync(packageJsonPath)) {
            updatePackageJson(packageJsonPath);
        }
    });
}

processPackages();
