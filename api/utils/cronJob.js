const Accounts = require('../models/Accounts');
const { sendMail } = require('.');
const mailContent = require('./mailContent');

module.exports = async agentDetails => {
  const date = new Date();
  const day = date.getUTCDate();
  const month = date.getUTCMonth() + 1;
  const year = date.getUTCFullYear();
  const todaysDate = `${year}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day}`;
  const todaysAccount = await Accounts.find({ agentDetails, maturityDate: new Date(todaysDate) });
  if (todaysAccount.length) {
    await sendMail(mailContent(todaysAccount, agentDetails.name), agentDetails.email);
    // await sendMail(mailContent(todaysAccount), 'kulshreshtha.manish@gmail.com');
    console.log(
      `Mail Send on ${todaysDate} for ${todaysAccount.length} accounts to ${agentDetails.name}`
    );
  } else console.log(`No accounts found on ${todaysDate} for ${agentDetails.name}`);
  console.log('running a task every minute');
};
