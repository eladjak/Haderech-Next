const fs = require("fs");
const path = require("path");

/**
 * עדכון קובץ package.json להוספת חבילות חסרות
 */
function updatePackageJson() {
  try {
    console.log("מעדכן את קובץ package.json...");

    // קריאת הקובץ הקיים
    const packageJsonPath = path.join(process.cwd(), "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

    // הוספת חבילות חדשות אם הן חסרות
    const dependenciesToAdd = {
      uuid: "^9.0.1",
    };

    let packagesAdded = 0;
    for (const [name, version] of Object.entries(dependenciesToAdd)) {
      if (!packageJson.dependencies[name]) {
        packageJson.dependencies[name] = version;
        console.log(`מוסיף חבילה: ${name}@${version}`);
        packagesAdded++;
      }
    }

    // הוספת סקריפטים חדשים
    const scriptsToAdd = {
      "lint:fix": "eslint . --fix",
      format: 'prettier --write "**/*.{js,jsx,ts,tsx,json,md}"',
      "fix:unused-vars": "node scripts/fix-unused-in-files.js",
      "fix:import-order": "node scripts/fix-import-order.js",
      "fix:all":
        "node scripts/fix-unused-in-files.js && node scripts/fix-import-order.js",
    };

    let scriptsAdded = 0;
    for (const [name, command] of Object.entries(scriptsToAdd)) {
      if (!packageJson.scripts[name]) {
        packageJson.scripts[name] = command;
        console.log(`מוסיף סקריפט: ${name}`);
        scriptsAdded++;
      }
    }

    // שמירת הקובץ המעודכן
    fs.writeFileSync(
      packageJsonPath,
      JSON.stringify(packageJson, null, 2),
      "utf8"
    );
    console.log(
      `עודכן בהצלחה! נוספו ${packagesAdded} חבילות ו-${scriptsAdded} סקריפטים.`
    );
    return true;
  } catch (error) {
    console.error("שגיאה בעדכון קובץ package.json:", error);
    return false;
  }
}

// הרצת הסקריפט
updatePackageJson();
