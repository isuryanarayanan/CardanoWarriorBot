# CardanoWarriorBot

A community enabled bot for exploring NFT's by the CardanoWarrior game on the Cardano blockchain.

## Features
### Search command

`/search id` is a command used to quickly explore a CardanoWarrior NFT. Id is a number from 1 - 9999.

Example
```
/search 1234,2345
```
![enter image description here](https://cdn.discordapp.com/attachments/834476465314856960/888714417066377246/unknown.png)
### Floor command (todo)

`/floor type(optional)` allows users to find the floor price of CardanoWarrior NFT's with an optional type filter.

Examples
```
/floor
> common - 100
> uncommon - 150
> rare - 200
> epic - 300
> legendary - 400
> mythical - 500
```
```
/floor common
> 100
```

## Todos
- Fix bug with group search and cnft.io listings
- Add floor finder
- SVG ui

## Done
- Add CNFT listing link and price for search command if available
- Group search
