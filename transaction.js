// transaction.js — submit score and claim reward wrappers
async function submitScoreOnchain(score) {
  if(!pacmanContract) throw new Error('Contract not connected');
  const tx = await pacmanContract.submitScore(score);
  return tx.wait();
}

async function claimRewardOnchain() {
  if(!pacmanContract) throw new Error('Contract not connected');
  const tx = await pacmanContract.claimReward();
  return tx.wait();
}
