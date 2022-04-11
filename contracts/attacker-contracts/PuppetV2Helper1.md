pragma solidity ^0.8.0;

import "@uniswap/v2-periphery/contracts/libraries/UniswapV2Library.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract PuppetV2Helper {
  address public wethAddress;
  address public tokenAddress;
  address public uniswapRouterAddress;
	constructor (address wethAddress, address tokenAddress) {
    this.wethAddress = wethAddress;
    this.tokenAddress = tokenAddress;
		
	}

  function swap(address tokenIn, address tokenOut, address to, uint256 amountIn) external{
    IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
    IERC20(tokenIn).approve(uniswapRouterAddress, amountIn);

    address[] memory path = new address[](3);
    path[0] = tokenIn;
    path[1] = this.wethAddress;
    path[2] = tokenOut;

    IUNiswapV2Router(uniswapRouterAddress).swapExactTokensForTokens(amountIn, path, to);
    
  }
			
		

}