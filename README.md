# directory-listing-helper

This repository is meant to be used as a global helper function to get a quick overview of you local projects.
It will print out a directory listing including the last edit time, and if this directory includes a `.git` directory, a `package.json` file and a `node_modules` directory.

Sample output:

```txt
C:\Users\MyUser\projects
 Git   package.json   node_modules  14.07.2019 15:45:03 directory-listing-helper
 Git   package.json   node_modules  14.07.2019 14:49:24 linear-quadratic-cubic-eq-solver
 Git   package.json                 14.07.2019 13:58:02 assemble-function
 Git                                14.07.2019 13:46:21 nd-bezier
       package.json   node_modules  07.07.2019 22:27:24 tft
 Git   package.json   node_modules  07.07.2019 21:59:06 teamfight-tactics-data
```

## usage

This helper is only useful if you organise your local projects in one (or some) root directory(s). Each project should have its own directory in it and each of thoose should carry its `.git` `node_modules` directorys as their direct descendent.

If this is the case you can go adhead and install this package:

```shell
yarn global add https://github.com/Feirell/directory-listing-helper.git
// or
npm install --global https://github.com/Feirell/directory-listing-helper.git
// be awere that you need to restart the terminal to be able to use the command if you use npm
```

If you want to remove it you just need to use the name:

```shell
yarn global remove directory-listing-helper
npm remove --global directory-listing-helper
```

After this you can use it as a command: 

```shell
// for me this is ./projects
directory-listing-helper ./the-root-directory

// you can also inspect a mutli root structure
directory-listing-helper first-root second-root
```

There are two sorting preferences available:

```shell
directory-listing-helper --sort EditTime // default
directory-listing-helper --sort FoundParts
```

FoundParts sorts the results in the found parts. So all directories with a `.git` directory will be listed first, then all with a `package.json` and so on.