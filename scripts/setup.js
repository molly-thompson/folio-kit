import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import fs from "node:fs/promises";
import path from "node:path";

async function main() {
  const rl = readline.createInterface({ input, output });

  console.log("\n🚀 Initializing new project from template...\n");

  try {
    const projectName = await rl.question("Project name (kebab-case): ");
    const description = await rl.question("Project description: ");
    const authorName = await rl.question("Author name: ");
    const githubUser = await rl.question("GitHub username or organization: ");

    rl.close();

    const rootDir = process.cwd();

    // 1. Update package.json
    const packageJsonPath = path.join(rootDir, "package.json");
    const packageJsonRaw = await fs.readFile(packageJsonPath, "utf8");
    const pkg = JSON.parse(packageJsonRaw);

    pkg.name = projectName;
    pkg.description = description;
    pkg.author = authorName;
    pkg.repository = {
      type: "git",
      url: `git+https://github.com/${githubUser}/${projectName}.git`
    };
    pkg.bugs = {
      url: `https://github.com/${githubUser}/${projectName}/issues`
    };
    pkg.homepage = `https://github.com/${githubUser}/${projectName}#readme`;

    await fs.writeFile(packageJsonPath, JSON.stringify(pkg, null, 2) + "\n", "utf8");
    console.log("✔ Updated package.json");

    // 2. Update README.md title & clone URL references
    const readmePath = path.join(rootDir, "README.md");
    try {
      let readme = await fs.readFile(readmePath, "utf8");
      readme = readme.replace(/repo-template-react-tanstack/g, projectName);
      readme = readme.replace(/<your-org>/g, githubUser);
      await fs.writeFile(readmePath, readme, "utf8");
      console.log("✔ Updated README.md");
    } catch {
      console.log("ℹ README.md not found, skipping text replacement.");
    }

    console.log("\n✨ Project setup complete! Run `pnpm install` to get started.\n");
  } catch (error) {
    console.error("❌ Error during setup:", error);
    process.exit(1);
  }
}

main();