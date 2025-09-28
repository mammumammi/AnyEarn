import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys the ServiceManager contract
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployServiceManager: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, get } = hre.deployments;

  // Get the UserVerification and ServiceNFT contract addresses
  const userVerification = await get("UserVerification");
  const serviceNFT = await get("ServiceNFT");
  
  await deploy("ServiceManager", {
    from: deployer,
    args: [userVerification.address, serviceNFT.address],
    log: true,
    autoMine: true,
  });

  // Get the deployed contract
  const serviceManager = await hre.ethers.getContract("ServiceManager", deployer);
  console.log("ServiceManager deployed to:", await serviceManager.getAddress());
  console.log("Connected to UserVerification at:", await serviceManager.userVerification());
  console.log("Connected to ServiceNFT at:", await serviceManager.serviceNFT());
};

export default deployServiceManager;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags ServiceManager
deployServiceManager.tags = ["ServiceManager"];
