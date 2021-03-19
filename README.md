# spacetraders-automation

Tool for automating trades using [spacetraders.io](https://spacetraders.io/) API. 
Built with Typescript

## Table of contents
* [How to use](#how-to-use)
* [Running application](#running-application)
* [License](#license)

## How To Use

### Prerequisites

- [Node](https://nodejs.org/en/)
- [Git](https://git-scm.com)
- [npm](https://www.npmjs.com/get-npm) or [yarn](https://classic.yarnpkg.com/en/docs/install)


### Installation and setup

```bash
# Clone this repository
$ git clone https://github.com/PezeM/spacetraders-automation.git

# Go into the repository
$ cd spacetraders-automation

# Install dependencies
$ yarn install

# Start
$ yarn start:dev or yarn start:prod
```

## Running application

To start the application you can run `yarn build` then enter `dist` directory and run `node index.js`
or use existing scripts in `package.json` like `yarn start:dev` or `yarn start:prod`. 

This app uses [node-config](https://github.com/lorenwest/node-config) for configuration files placed in `config` directory. 
Default configuration is placed in `default.json` file. 
You can easily override config, [read more](https://github.com/lorenwest/node-config/wiki/Configuration-Files). 

### Example config file

In the `config` directory create `production.json` file.

```json
{
  "shipsToScrapMarket": "0",
  "marketplaceRefreshTimer": "3000000"
}
```

Then when running `yarn start:prod` the default config properties will be overridden with production config.

## License

>You can check out the full license [here](https://github.com/PezeM/spacetraders-automation/blob/main/LICENSE)

This project is licensed under the terms of the **MIT** license.