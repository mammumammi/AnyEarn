import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys the ServiceManager contract
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployServiceManager: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("ServiceManager", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  // Get the deployed contract
  const serviceManager = await hre.ethers.getContract("ServiceManager", deployer);
  console.log("ServiceManager deployed to:", await serviceManager.getAddress());
};

export default deployServiceManager;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags ServiceManager
deployServiceManager.tags = ["ServiceManager"];
