import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys the ServiceNFT contract
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployServiceNFT: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, get } = hre.deployments;

  // Get the UserVerification contract address
  const userVerification = await get("UserVerification");
  
  await deploy("ServiceNFT", {
    from: deployer,
    args: [userVerification.address],
    log: true,
    autoMine: true,
  });

  // Get the deployed contract
  const serviceNFT = await hre.ethers.getContract("ServiceNFT", deployer);
  console.log("ServiceNFT deployed to:", await serviceNFT.getAddress());
  console.log("Connected to UserVerification at:", await serviceNFT.userVerification());
};

export default deployServiceNFT;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags ServiceNFT
deployServiceNFT.tags = ["ServiceNFT"];
