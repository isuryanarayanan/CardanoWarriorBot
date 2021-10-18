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

### Floor command 

`/floor` is a command used to quickly view the current floor price from cnft.io marketplace
This command allows filters to the floor so that you can see floors for warriors with different characteristics.

![enter image description here](https://media.discordapp.net/attachments/889682253288964160/899682469136171048/unknown.png)

While using the `items_query`, you can use `,` to sepereate different items.

![enter image description here](https://media.discordapp.net/attachments/889682253288964160/899683572124897360/unknown.png)

You can use multiple filters

![enter image description here](https://media.discordapp.net/attachments/889682253288964160/899685424258224228/unknown.png)

![enter image description here](https://media.discordapp.net/attachments/889682253288964160/899686858534043678/unknown.png)
## Todos
-- empty --

## Done

- Add floor finder for rarities
- clean up code
- fix bug with floor finder using classes where no listing for a specific class is found it will not show proper message
- Floor chart added
- Clean up floor chart with readable information
- Add batch search limit of 3
- Add per user command limits
- Fix bug with group search and cnft.io listings
- Add floor finder
- Add CNFT listing link and price for search command if available
- Group search
