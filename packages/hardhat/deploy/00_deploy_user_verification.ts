import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys the UserVerification contract
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployUserVerification: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("UserVerification", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  // Get the deployed contract
  const userVerification = await hre.ethers.getContract("UserVerification", deployer);
  console.log("UserVerification deployed to:", await userVerification.getAddress());
};

export default deployUserVerification;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags UserVerification
deployUserVerification.tags = ["UserVerification"];
