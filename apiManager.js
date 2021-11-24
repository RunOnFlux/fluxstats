const inquirer = require('inquirer');
const kda = require('./src/management/kda');
const flux = require('./src/management/flux');
const xdao = require('./src/management/xdao');
const marketplace = require('./src/management/marketplace');

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
        'Marketplace',
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
      case 'Marketplace':
        chooseMarketplaceOperation();
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


function chooseMarketplaceOperation() {
  inquirer.prompt([
    {
      type: 'list',
      name: 'section',
      message: 'Choose a Marketplace operation',
      choices: [
        'List Apps',
        'Add new app',
        'Delete app',
        'Modify app',
        new inquirer.Separator(),
        'Main Menu',
        new inquirer.Separator(),
      ],
    },
  ]).then(async (answers) => {
    switch (answers.section) {
      case 'List Apps':
        console.log(JSON.stringify(await marketplace.listApps(), null, 2));
        chooseMarketplaceOperation();
        break;
      case 'Add new app':
        addNewApp();
        break;
      case 'Delete app':
        deleteApp();
        break;
      case 'Modify app':
        modifyApp();
        break;
      case 'Main Menu':
        mainMenu();
        break;
    }
  });
}

function addNewApp() {
  inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Enter the name',
    },
    {
      type: 'input',
      name: 'hash',
      message: 'Enter the hash',
    },
    {
      type: 'input',
      name: 'description',
      message: 'Enter the description',
    },
    {
      type: 'list',
      name: 'category',
      message: 'Select the category',
      choices: marketplace.listCategories(),
    },
    {
      type: 'input',
      name: 'repotag',
      message: 'Enter the repo tag',
    },
    {
      type: 'number',
      name: 'version',
      message: 'Enter the version',
    },
    {
      type: 'number',
      name: 'price',
      message: 'Enter the price',
    },
    {
      type: 'number',
      name: 'cpu',
      message: 'Enter the cpu requirements',
    },
    {
      type: 'number',
      name: 'ram',
      message: 'Enter the ram requirements',
    },
    {
      type: 'number',
      name: 'hdd',
      message: 'Enter the hdd requirements',
    },
    {
      type: 'input',
      name: 'ports',
      message: 'Enter the ports, separated by commas',
    },
    {
      type: 'input',
      name: 'containerPorts',
      message: 'Enter the container ports, separated by commas',
    },
    {
      type: 'input',
      name: 'commands',
      message: 'Enter the commands, separated by commas',
    },
    {
      type: 'input',
      name: 'environmentParameters',
      message: 'Enter the environment parameters, separated by commas',
    },
    
  ]).then(async (answers) => {
    const app = {
      hash: answers.hash,
      description: answers.description,
      price: answers.price,
      category: answers.category,
      cpu: answers.cpu,
      ram: answers.ram,
      hdd: answers.hdd,
      repotag: answers.repotag,
      tiered: false,
      version: answers.version,
      name: answers.name,
      commands: answers.commands.length > 0 ? answers.commands.split(',') : [],
      containerPorts: answers.containerPorts.length > 0 ? answers.containerPorts.split(',') : [],
      environmentParameters: answers.environmentParameters.length > 0 ? answers.environmentParameters.split(',') : [],
      ports: answers.ports.length > 0 ? answers.ports.split(',') : [],
    };
    await marketplace.addApp(app);
    chooseMarketplaceOperation();
  });
}

async function deleteApp() {
  const allApps = await marketplace.listApps();
  const allAppNames = allApps.map((app) => app.name);
  inquirer.prompt([
    {
      type: 'list',
      name: 'appName',
      message: 'Select the name of app to delete',
      choices: allAppNames,
    },
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Really delete app?',
    }
  ]).then(async (answers) => {
    const appSpec = allApps.find((app) => app.name === answers.appName);
    if (answers.confirm) {
      await marketplace.deleteApp(appSpec);
    }
    chooseMarketplaceOperation();
  });
}

async function modifyApp() {
  const allApps = await marketplace.listApps();
  const allAppNames = allApps.map((app) => app.name);
  inquirer.prompt([
    {
      type: 'list',
      name: 'appName',
      message: 'Select the name of app to edit',
      choices: allAppNames,
    },
    {
      type: 'list',
      name: 'field',
      message: 'Select the field to edit',
      choices: [
        'Name',
        'Hash',
        'Description',
        'Category',
        'Repotag',
        'Version',
        'Price',
        'CPU',
        'RAM',
        'HDD',
        'Ports',
        'Container Ports',
        'Commands',
        'Environment Parameters',
        new inquirer.Separator(),
        'Back',
        new inquirer.Separator(),
      ]
    }
  ]).then(async (answers) => {
    const appSpec = allApps.find((app) => app.name === answers.appName);
    if (answers.field === 'Main Menu') {
      chooseMarketplaceOperation();
      return;
    }
    if (!appSpec) {
      console.log('App not found');
      chooseMarketplaceOperation();
      return;
    }
    switch (answers.field) {
      case 'Hash':
        inquirer.prompt([
          {
            type: 'input',
            name: 'newHash',
            message: `Enter the new hash (${appSpec.hash})`,
          }
        ]).then(async (answers) => {
          appSpec.hash = answers.newHash;
          await marketplace.modifyApp(appSpec);
          chooseMarketplaceOperation();
        });
        break;
      case 'Name':
        inquirer.prompt([
          {
            type: 'input',
            name: 'newName',
            message: `Enter the new name (${appSpec.name})`,
          }
        ]).then(async (answers) => {
          appSpec.name = answers.newName;
          await marketplace.modifyApp(appSpec);
          chooseMarketplaceOperation();
        });
        break;
      case 'Description':
        inquirer.prompt([
          {
            type: 'input',
            name: 'newDescription',
            message: `Enter the new description (${appSpec.description})`,
          }
        ]).then(async (answers) => {
          appSpec.description = answers.newDescription;
          await marketplace.modifyApp(appSpec);
          chooseMarketplaceOperation();
        });
        break;
      case 'Category':
        inquirer.prompt([
          {
            type: 'list',
            name: 'newCategory',
            message: `Select the new category (${appSpec.category})`,
            choices: marketplace.listCategories(),
          }
        ]).then(async (answers) => {
          appSpec.category = answers.newCategory;
          await marketplace.modifyApp(appSpec);
          chooseMarketplaceOperation();
        });
        break;
      case 'Repotag':
        inquirer.prompt([
          {
            type: 'input',
            name: 'newRepotag',
            message: `Enter the new repotag (${appSpec.repotag})`,
          }
        ]).then(async (answers) => {
          appSpec.repotag = answers.newRepotag;
          await marketplace.modifyApp(appSpec);
          chooseMarketplaceOperation();
        });
        break;
      case 'Version':
        inquirer.prompt([
          {
            type: 'number',
            name: 'newVersion',
            message: `Enter the new version (${appSpec.version})`,
          }
        ]).then(async (answers) => {
          appSpec.version = answers.newVersion;
          await marketplace.modifyApp(appSpec);
          chooseMarketplaceOperation();
        });
        break;
      case 'Price':
        inquirer.prompt([
          {
            type: 'number',
            name: 'newPrice',
            message: `Enter the new price (${appSpec.price} Flux)`,
          }
        ]).then(async (answers) => {
          appSpec.price = answers.newPrice;
          await marketplace.modifyApp(appSpec);
          chooseMarketplaceOperation();
        });
        break;
      case 'CPU':
        inquirer.prompt([
          {
            type: 'number',
            name: 'newCPU',
            message: `Enter the new CPU (${appSpec.cpu} cores)`,
          }
        ]).then(async (answers) => {
          appSpec.cpu = answers.newCPU;
          await marketplace.modifyApp(appSpec);
          chooseMarketplaceOperation();
        });
        break;
      case 'RAM':
        inquirer.prompt([
          {
            type: 'number',
            name: 'newRAM',
            message: `Enter the new RAM (${appSpec.ram} GB)`,
          }
        ]).then(async (answers) => {
          appSpec.ram = answers.newRAM;
          await marketplace.modifyApp(appSpec);
          chooseMarketplaceOperation();
        });
        break;
      case 'HDD':
        inquirer.prompt([
          {
            type: 'number',
            name: 'newHDD',
            message: `Enter the new HDD (${appSpec.hdd} GB)`,
          }
        ]).then(async (answers) => {
          appSpec.hdd = answers.newHDD;
          await marketplace.modifyApp(appSpec);
          chooseMarketplaceOperation();
        });
        break;
      case 'Ports':
        inquirer.prompt([
          {
            type: 'input',
            name: 'newPorts',
            message: `Enter the new Ports (${appSpec.ports.join(', ')})`,
          }
        ]).then(async (answers) => {
          appSpec.ports = answers.newPorts.length > 0 ? answers.newPorts.split(',') : [];
          await marketplace.modifyApp(appSpec);
          chooseMarketplaceOperation();
        });
        break;
      case 'Container Ports':
        inquirer.prompt([
          {
            type: 'input',
            name: 'newContainerPorts',
            message: `Enter the new Container Ports (${appSpec.containerPorts.join(', ')})`,
          }
        ]).then(async (answers) => {
          appSpec.containerPorts = answers.newContainerPorts.length > 0 ? answers.newContainerPorts.split(',') : [];
          await marketplace.modifyApp(appSpec);
          chooseMarketplaceOperation();
        });
        break;
      case 'Commands':
        inquirer.prompt([
          {
            type: 'input',
            name: 'newCommands',
            message: `Enter the new Commands (${appSpec.commands.join(', ')})`,
          }
        ]).then(async (answers) => {
          appSpec.commands = answers.newCommands.length > 0 ? answers.newCommands.split(',') : [];
          await marketplace.modifyApp(appSpec);
          chooseMarketplaceOperation();
        });
        break;
      case 'Environment Parameters':
        inquirer.prompt([
          {
            type: 'input',
            name: 'newEnvironmentParameters',
            message: `Enter the new Environment Parameters (${appSpec.environmentParameters.join(', ')})`,
          }
        ]).then(async (answers) => {
          appSpec.environmentParameters = answers.newEnvironmentParameters.length > 0 ? answers.newEnvironmentParameters.split(',') : [];
          await marketplace.modifyApp(appSpec);
          chooseMarketplaceOperation();
        });
        break;
      }
  })
}