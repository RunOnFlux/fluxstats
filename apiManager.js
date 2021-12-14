const inquirer = require('inquirer');
const kda = require('./src/management/kda');
const flux = require('./src/management/flux');
const xdao = require('./src/management/xdao');

mainMenu();

function mainMenu() {
  inquirer.prompt([
    {
      type: 'list',
      name: 'section',
      message: 'Choose an API management section',
      choices: [
        'KDA',
        'Flux',
        'xDAO',
        new inquirer.Separator(),
        'Quit',
        new inquirer.Separator(),
      ],
    },
  ]).then((answers) => {
    switch(answers.section) {
      case 'KDA':
        chooseKDAOperation();
        break;
      case 'Flux':
        chooseFluxOperation();
        break;
      case 'xDAO':
        chooseXDAOOperation();
        break;
      case 'Quit':
        process.exit();
    }
  });
}

function chooseKDAOperation() {
  inquirer.prompt([
    {
      type: 'list',
      name: 'section',
      message: 'Choose a KDA operation',
      choices: [
        'Remove Old Records',
        new inquirer.Separator(),
        'Main Menu',
        new inquirer.Separator(),
      ],
    },
  ]).then(async (answers) => {
    switch (answers.section) {
      case 'Remove Old Records':
        await kda.removeRecords();
        chooseKDAOperation();
        break;
      case 'Main Menu':
        mainMenu();
        break;
    }
  });
}

function chooseFluxOperation() {
  inquirer.prompt([
    {
      type: 'list',
      name: 'section',
      message: 'Choose a Flux operation',
      choices: [
        'Remove Old Records',
        new inquirer.Separator(),
        'Main Menu',
        new inquirer.Separator(),
      ],
    },
  ]).then(async (answers) => {
    switch (answers.section) {
      case 'Remove Old Records':
        await flux.removeRecords();
        chooseFluxOperation();
        break;
      case 'Main Menu':
        mainMenu();
        break;
    }
  });
}

function chooseXDAOOperation() {
  inquirer.prompt([
    {
      type: 'list',
      name: 'section',
      message: 'Choose an xDAO operation',
      choices: [
        'Remove Rejected Unpaid proposals',
        new inquirer.Separator(),
        'Main Menu',
        new inquirer.Separator(),
      ],
    },
  ]).then(async (answers) => {
    switch (answers.section) {
      case 'Remove Old Records':
        await xdao.removeRejectedUnpaidRecords();
        chooseXDAOOperation();
        break;
      case 'Main Menu':
        mainMenu();
        break;
    }
  });
}
