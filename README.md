# spacetraders-automation

Tool for automating trades using [spacetraders.io](https://spacetraders.io/) API. 
Built with Typescript

## Table of contents
* [How to use](#how-to-use)
* [Running application](#running-application)
* [Config](#config)
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

## Config
Default config is in `default.json` file. You can overwrite any config property.

### Properties

#### `token?: string`

Spacetraders API token. Will create new account if token and username are not presented.

#### `username?: string`

Spacetraders API username. Will create new account if token and username are not presented.

#### `logsDir: string`

Name of the directory where logs will be saved. It will be created if it doesn't exist.
shipsToScrapMarket
#### `strategy: TradeStrategy`

What strategy is used for trading, either `PROFIT` or `LOSS`. When `LOSS` is selected, app will make the worst trades possible.

#### `shipsToScrapMarket: number | 'MAX'`

Number of ships to scrap market to calculate the best/worst trades. If `0` then marketplace won't be scraped. 
If `MAX` then every possible marketplace will have its own ship just for scrapping the market. 

#### `marketplaceRefreshTimer: number`

The interval to scrap marketplace in milliseconds.

#### `sortProfitBy: MarketplaceProfitType`

Defines which property will be used to determine the best profit. The best is to use `ror` (Rate of return) or `profitPerVolume`. 
All available types are in the interface [MarketplaceProfitPer](https://github.com/PezeM/spacetraders-automation/blob/main/src/types/marketplace.interface.ts). 

#### `defaultTrade?: ITradeData`

Property to set default trade which is used when the marketplace data is not available (eg. not scrapped yet). Type is [ITradeData](https://github.com/PezeM/spacetraders-automation/blob/main/src/types/config.interface.ts).

#### `shipToBuy?: string`

Name of the ship to buy. To disable this feature set the name to empty or undefined.

#### `minMoneyLeftAfterBuyingShip: numer`

Required number of money left after buying a ship.

#### `sellNotUsedCargo: boolean`

Sell all the cargo in the ship other than `FUEL` and current trade resource. Useful for emptying space in ships for more profit.

#### `cacheTTL: number`

Number in seconds of marketplace cache.

#### `payLoans?: { minMoneyLeftAfterLoanPayment: number }`

Enables/disables pay loan feature. `minMoneyLeftAfterLoanPayment` specifies how much money must be left before paying the loan.

## License

>You can check out the full license [here](https://github.com/PezeM/spacetraders-automation/blob/main/LICENSE)

This project is licensed under the terms of the **MIT** license.