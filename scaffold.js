#!/usr/bin/env node

const fs = require("fs");
const { execSync } = require("child_process");
const path = require("path");
const {
  buttonComponentContent,
  featureSliceContent,
  storeContent,
} = require("./components");

// Color constants
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  fgBlue: "\x1b[34m",
  fgCyan: "\x1b[36m",
  fgGreen: "\x1b[32m",
  fgYellow: "\x1b[33m",
};

// ASCII art
const asciiArt = `
  ██████╗ ██████╗ ██████╗ ██████╗ ███████╗██████╗ 
  ██╔══██╗██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔══██╗
  ██║  ██║██████╔╝██████╔╝██║  ██║█████╗  ██████╔╝
  ██║  ██║██╔═══╝ ██╔═══╝ ██║  ██║██╔══╝  ██╔══██╗
  ██████╔╝██║     ██║     ██████╔╝███████╗██║  ██║
  ╚═════╝ ╚═╝     ╚═╝     ╚═════╝ ╚══════╝╚═╝  ╚═╝
`;

console.log(`${colors.bright}${colors.fgGreen}${asciiArt}${colors.reset}`);
console.log(
  `${colors.bright}${colors.fgBlue}Welcome to the Project Setup CLI!${colors.reset}\n`
);

// Get the project name from the command line arguments
const projectName = process.argv[2];

if (!projectName) {
  console.error(
    `${colors.fgYellow}Please supply a project name${colors.reset}`
  );
  process.exit(1);
}

// Check if the directory already exists
if (fs.existsSync(projectName)) {
  console.error(
    `${colors.fgYellow}Directory already exists. Choose a different name.${colors.reset}`
  );
  process.exit(1);
}

// Function to execute a command
const executeCommand = (command, workingDir = ".") => {
  try {
    execSync(command, { cwd: workingDir, stdio: [0, 1, 2] });
  } catch (err) {
    console.error(
      `${colors.fgYellow}Error executing ${command}: ${err}${colors.reset}`
    );
    process.exit(1);
  }
};

// Initialize a new React project using TypeScript.
executeCommand(`npm init vite@latest ${projectName} -- --template react-ts`);

// Commands to execute in sequence inside the newly created project folder
const commands = [
  `git init`,
  `npm install react-router-dom @reduxjs/toolkit`,
  `npm install tailwindcss postcss autoprefixer`,
  `npx tailwindcss init -p`,
  `npm install eslint prettier eslint-plugin-prettier eslint-config-prettier eslint-plugin-react eslint-plugin-react-hooks @typescript-eslint/eslint-plugin @typescript-eslint/parser`,
  `npm install husky lint-staged`,
  `npm install @heroicons/react @headlessui/react`,
  "npm install --save-dev jest @testing-library/react @types/testing-library__react",
];

commands.forEach((command) => {
  executeCommand(command, projectName);
});

// Initialize .eslintrc.json file
const eslintrcContent = `
{
  "parser": "@typescript-eslint/parser",
  "extends": [
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier/@typescript-eslint",
    "plugin:prettier/recommended"
  ],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "prettier/prettier": ["error", {}, { "usePrettierrc": true }]
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
}
`;

fs.writeFileSync(
  path.join(__dirname, projectName, ".eslintrc.json"),
  eslintrcContent
);

// Initialize .prettierrc.json file
const prettierrcContent = `
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
`;

fs.writeFileSync(
  path.join(__dirname, projectName, ".prettierrc.json"),
  prettierrcContent
);

// Intialise jest.config.tsx
const jestConfigContent = `
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/src/components/**/__tests__/**/*.test.(ts|tsx)'],
};
`;

fs.writeFileSync(
  path.join(__dirname, projectName, "jest.config.tsx"),
  jestConfigContent
);

// Delay for filesystem
setTimeout(() => {
  // Initialize package.json script and husky hook
  const packageJsonPath = path.join(__dirname, projectName, "package.json");
  const packageJsonData = require(packageJsonPath);

  packageJsonData.scripts = {
    ...packageJsonData.scripts,
    prepare: "husky install",
    lint: "eslint --fix .",
    format: "prettier --write .",
  };

  packageJsonData.husky = {
    hooks: {
      "pre-commit": "lint-staged",
    },
  };

  packageJsonData["lint-staged"] = {
    "*.{js,jsx,ts,tsx}": ["npm run lint", "npm run format"],
  };

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJsonData, null, 2));

  // Set up Husky
  executeCommand("npx husky install", path.join(__dirname, projectName));
  executeCommand(
    'npx husky add .husky/pre-commit "npm run lint-staged"',
    path.join(__dirname, projectName)
  );
}, 1000);

// Create directories for Atomic design
const atomicDirectories = [
  "atoms",
  "molecules",
  "organisms",
  "templates",
  "pages",
];

const componentsDirectory = path.join(
  __dirname,
  projectName,
  "src",
  "components"
);

fs.mkdirSync(componentsDirectory, { recursive: true });

atomicDirectories.forEach((directory) => {
  fs.mkdirSync(path.join(componentsDirectory, directory));
});

fs.writeFileSync(
  path.join(componentsDirectory, "atoms", "Button.tsx"),
  buttonComponentContent
);

const buttonTestContent = `
import { render, screen } from '@testing-library/react';
import Button from '../Button';

test('renders a button with the correct text', () => {
  render(<Button>Click me</Button>);
  const buttonElement = screen.getByText(/click me/i);
  expect(buttonElement).toBeInTheDocument();
});
`;

// Create new files within atoms directory
fs.writeFileSync(
  path.join(componentsDirectory, "atoms", "Button.test.tsx"),
  buttonTestContent
);

// Create index.css with Nunito font
const indexCssContent = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@200;300;400;600;700&display=swap');

body {
  font-family: 'Nunito', sans-serif;
}
`;

fs.writeFileSync(
  path.join(__dirname, projectName, "src", "index.css"),
  indexCssContent
);

fs.mkdirSync(path.join(__dirname, projectName, "src", "features"));

// Create folder for store.ts
fs.mkdirSync(path.join(__dirname, projectName, "src", "app"));

fs.writeFileSync(
  path.join(__dirname, projectName, "src/app", "store.ts"),
  storeContent
);

fs.writeFileSync(
  path.join(__dirname, projectName, "src/features", "authSlice.ts"),
  featureSliceContent
);

console.log(`${colors.fgGreen}Project setup completed!${colors.reset}\n`);
