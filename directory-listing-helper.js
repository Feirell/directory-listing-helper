#!/usr/bin/env node
const util = require('util');
const path = require('path');
const fs = require('fs');

const minimist = require('minimist');
const chalk = require('chalk');

const readdir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);

const CLIArgs = (() => {
    const cwd = process.cwd();
    const { _: paths, sort } = minimist(process.argv.slice(2), { string: ['s', 'sort'], alias: { 's': 'sort' } });

    const correctedPaths = paths.map(p => path.resolve(cwd, p))
    if (correctedPaths.length == 0) correctedPaths.push(cwd);

    return { correctedPaths, sort };
})();

const containsDirectory = (fsDirents, name) =>
    fsDirents.find(dirent => dirent.isDirectory() && dirent.name == name) != undefined;

const containsFile = (fsDirents, name) =>
    fsDirents.find(dirent => dirent.isFile() && dirent.name == name) != undefined;

const directoryContainsGitPackageNodeModules = (path) =>
    readdir(path, { withFileTypes: true })
        .then(contents => ({
            git: containsDirectory(contents, '.git'),
            nodeModules: containsDirectory(contents, 'node_modules'),
            packageJson: containsFile(contents, 'package.json')
        }))
        .then(assembled => stat(path)
            .then(stat => ({
                ...assembled,
                modTime: stat.mtime.getTime()
            }))
        )

const scanProjectsDirectory = (directoryPath) =>
    readdir(directoryPath, { withFileTypes: true })
        .then(entries => entries
            .filter(dirent => dirent.isDirectory())
            .map(dirent => directoryContainsGitPackageNodeModules(path.join(directoryPath, dirent.name))
                .then(result => ({ name: dirent.name, ...result }))
            )
        )
        .then(entries => Promise.all(entries));

const mapping = [
    ['git', 'Git', 'bgGreen'],
    ['packageJson', 'package.json', 'bgYellow'],
    ['nodeModules', 'node_modules', 'bgMagenta']
];

const order = mapping.map(v => v[0]);

const sortFncFoundParts = (a, b) => {
    for (const field of order)
        if (a[field] && !b[field])
            return -1;
        else if (!a[field] && b[field])
            return 1;

    return a.name.localeCompare(b.name);
}

const sortFncEditTime = (a, b) => b.modTime - a.modTime;

const dateFormatter = timestamp => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);

    return ('' + date.getDate()).padStart(2, '0')
        + '.' + ('' + (1 + date.getMonth())).padStart(2, '0')
        + '.' + ('' + date.getFullYear()).padStart(4, '0')
        + ' ' + ('' + date.getHours()).padStart(2, '0')
        + ':' + ('' + date.getMinutes()).padStart(2, '0')
        + ':' + ('' + date.getSeconds()).padStart(2, '0')
}

const mapToConsoleString = entry => mapping
    .map(([key, readable, color]) =>
        entry[key] ? chalk.black[color](' ' + readable + ' ') : " ".repeat(readable.length + 2)
    )
    .join(' ') + ' ' + dateFormatter(entry.modTime) + ' ' + entry.name;

const availableSortFunctions = { sortFncFoundParts, sortFncEditTime };
const sortFnc = CLIArgs.sort ? availableSortFunctions['sortFnc' + CLIArgs.sort] : sortFncEditTime;
if (!sortFnc) {
    console.error('could not find the given sort function ' + CLIArgs.sort + ' available sort functions are ' + Object.keys(availableSortFunctions).map(s => s.slice(7)).join(', '));
    process.exit(1);
}

Promise.all(CLIArgs.correctedPaths.map(dir =>
    scanProjectsDirectory(dir)
        .then(result => dir + '\n' + result
            .sort(sortFnc)
            .map(mapToConsoleString).join('\n')
        )
))
    .then(result => console.log(result.join('\n')))
    .catch(err => { console.error(err); process.exit(1) })