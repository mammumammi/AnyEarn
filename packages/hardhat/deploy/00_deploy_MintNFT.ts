import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployMintNFT: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts } = hre;
  const { deploy } = hre.deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("MintNFT", {
    from: deployer,
    args: [],
    log: true,
  });
};

export default deployMintNFT;
deployMintNFT.tags = ["MintNFT"];
