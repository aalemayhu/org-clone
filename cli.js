#!/usr/bin/env node

const path = require("path");
const fs = require("fs");

const version = require("./package.json").version;
const octokit = require("@octokit/rest")();
const git = require("nodegit");
const chalk = require("chalk");

process.on("SIGINT", () => process.exit(0));

const outputHelp = function(args) {
  const cmd = args[1];
  console.log(`${cmd} - ${version}
Easily clone a organizations public repositories

USAGE
${cmd} <org>
  `);
};

const clone = function(url, dst) {
  console.log(chalk.yellow(url));
  git
    .Clone(url, dst)
    .then(() => console.log(chalk.green(url)))
    .catch(function(err) {
      if (err) {
        console.log(chalk.red(err.toString()));
      }
    });
};

const clone_all = (data, dst) =>
  data.forEach(repo => {
    const url = repo.clone_url;
    const outputPath = path.join(dst, url.split("/").reverse()[0]);

    if (fs.existsSync(outputPath)) {
      console.log(
        `Skipping ${chalk.yellow(outputPath)}, the path is not empty!`
      );
    } else {
      clone(url, outputPath);
    }
  });

const args = process.argv;
if (args.length < 3) {
  outputHelp(args);
  process.exit(1);
}

const org = args[2];
var dst = ".";

if (args.length >= 4) {
  dst = args[3];
}
// TODO: make sure it's a org

octokit.repos
  .listForOrg({
    org: org,
    type: "public"
  })
  .then(({ data }) => clone_all(data, dst))
  .catch(error => {
    console.log(error);
    outputHelp();
  });
