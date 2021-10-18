# CardanoWarriorBot

A community enabled bot for exploring NFT's by the CardanoWarrior game on the Cardano blockchain.

## Donate

This bot is free, but if you like what you see here's my cardano wallet address (ADA)
`addr1q9hkd92zj5jfpnu3y6h05u0cqrec4rjmff83evcl9egn2fesfda49hjutl24g5f9ulvutmqf5mlzm8mzntlxyrqkudds6z6fc7`

## Features

### Search command

`/search id` is a command used to quickly explore a CardanoWarrior NFT. Id is a number from 1 - 9999.

Example

```
/search 1234,2345
```

![enter image description here](https://cdn.discordapp.com/attachments/834476465314856960/888714417066377246/unknown.png)

### Floor command (todo)

`/floor class:classname` allows users to find the floor price of CardanoWarrior NFT's with a class filter.

Examples

```
/floor class:balrog
```

`/floor rarity:option` allows users to find the floor price of CardanoWarrior NFT's with a rarity filter.

Examples

```
/floor
> common
> uncommon
> rare
> epic
> legendary
> mythical
```

```
/floor common
```

## Todos

- fix bug with floor finder using classes where no listing for a specific class is found it will not show proper message
- clean up code

## Done

- Add floor finder for rarities
- Floor chart added
- Clean up floor chart with readable information
- Add batch search limit of 3
- Add per user command limits
- Fix bug with group search and cnft.io listings
- Add floor finder
- Add CNFT listing link and price for search command if available
- Group search
