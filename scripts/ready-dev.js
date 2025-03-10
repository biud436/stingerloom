const fs = require("fs");
const path = require("path");

const paths = {
  "@stingerloom/bootstrap": "file:../bootstrap",
  "@stingerloom/common": "file:../common",
  "@stingerloom/compiler": "file:../compiler",
  "@stingerloom/error": "file:../error",
  "@stingerloom/factory": "file:../factory",
  "@stingerloom/ioc": "file:../ioc",
  "@stingerloom/orm": "file:../orm",
  "@stingerloom/router": "file:../router",
  "@stingerloom/services": "file:../services",
  "@stingerloom/utils": "file:../utils",
};

const packagesDir = path.resolve(__dirname, "../packages");

function updatePackageJson(filePath) {
  const packageJson = JSON.parse(fs.readFileSync(filePath, "utf8"));

  if (packageJson.devDependencies) {
    let updated = false;

    Object.keys(packageJson.devDependencies).forEach((key) => {
      if (packageJson.devDependencies[key].startsWith("^")) {
        packageJson.devDependencies[key] =
          paths[key] || packageJson.devDependencies[key];
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

// 스크립트 실행
processPackages();
