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
      name: 'owner',
      message: 'Enter the Owner',
    },
    {
      type: 'number',
      name: 'version',
      message: 'Enter the version',
    },
    {
      type: 'number',
      name: 'instances',
      message: 'Enter the number of instances',
    },
    {
      type: 'number',
      name: 'price',
      message: 'Enter the price',
    },
    {
      type: 'confirm',
      name: 'visible',
      message: 'Is app visible on the marketplace?'
    },
    {
      type: 'confirm',
      name: 'enabled',
      message: 'Is app enabled on the marketplace?'
    },
    {
      type: 'number',
      name: 'components',
      message: 'Enter the number of components',
    },
  ]).then(async (answers) => {
    const components = [];
    for (let i=0;i<answers.components;i++) {
      let componentAnswer = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: `Enter the name for component ${i+1}`,
        },
        {
          type: 'input',
          name: 'description',
          message: `Enter the description for component ${i+1}`,
        },
        {
          type: 'input',
          name: 'repotag',
          message: `Enter the repo tag for component ${i+1}`,
        },
        {
          type: 'input',
          name: 'ports',
          message: `Enter the ports as a range (e.g. 35000-35100), separated by commas for component ${i+1}`,
        },
        {
          type: 'input',
          name: 'containerPorts',
          message: `Enter the container ports, separated by commas for component ${i+1}`,
        },
        {
          type: 'input',
          name: 'domains',
          message: `Enter the domains, separated by commas for component ${i+1}`,
        },
        {
          type: 'input',
          name: 'environmentParameters',
          message: `Enter the static environment parameters, separated by commas for component ${i+1}`,
        },
        {
          type: 'input',
          name: 'userEnvironmentParameters',
          message: `Enter the user environment parameters as a single line JSON object for component ${i+1}`,
        },
        {
          type: 'input',
          name: 'commands',
          message: `Enter the commands, separated by commas for component ${i+1}`,
        },
        {
          type: 'input',
          name: 'containerData',
          message: `Enter the container data volume for component ${i+1}`,
        },
        {
          type: 'number',
          name: 'cpu',
          message: `Enter the cpu requirements for component ${i+1}`,
        },
        {
          type: 'number',
          name: 'ram',
          message: `Enter the ram requirements for component ${i+1}`,
        },
        {
          type: 'number',
          name: 'hdd',
          message: `Enter the hdd requirements for component ${i+1}`,
        },
      ]);
      const containerPorts = (componentAnswer.containerPorts.length > 0 ? componentAnswer.containerPorts.split(',') : []).map((value) => Number(value));
      const ports = (componentAnswer.ports.length > 0 ? componentAnswer.ports.split(',') : []);
      const component = {
        name: componentAnswer.name,
        description: componentAnswer.description,
        repotag: componentAnswer.repotag,
        portSpecs: ports,
        containerPorts: containerPorts,
        domains: componentAnswer.domains.length > 0 ? componentAnswer.domains.split(',') : [],
        environmentParameters: componentAnswer.environmentParameters.length > 0 ? componentAnswer.environmentParameters.split(',') : [],
        userEnvironmentParameters: componentAnswer.userEnvironmentParameters,
        commands: componentAnswer.commands.length > 0 ? componentAnswer.commands.split(',') : [],
        containerData: componentAnswer.containerData,
        tiered: false,
        cpu: componentAnswer.cpu,
        ram: componentAnswer.ram,
        hdd: componentAnswer.hdd,
        cpubasic: componentAnswer.cpu,
        cpusuper: componentAnswer.cpu,
        cpubamf: componentAnswer.cpu,
        rambasic: componentAnswer.ram,
        ramsuper: componentAnswer.ram,
        rambamf: componentAnswer.ram,
        hddbasic: componentAnswer.hdd,
        hddsuper: componentAnswer.hdd,
        hddbamf: componentAnswer.hdd,
      };
      components.push(component);
    }
    const app = {
      description: answers.description,
      price: answers.price,
      category: answers.category,
      version: answers.version,
      name: answers.name,
      owner: answers.owner,
      instances: answers.instances,
      compose: components,
      visible: answers.visible,
      enabled: answers.enabled,
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
        'Description',
        'Category',
        'Version',
        'Price',
        'Visible',
        'Enabled',
        'Component',
        new inquirer.Separator(),
        'Back',
        new inquirer.Separator(),
      ]
    }
  ]).then(async (answers) => {
    const appSpec = allApps.find((app) => app.name === answers.appName);
    if (answers.field === 'Back') {
      chooseMarketplaceOperation();
      return;
    }
    if (!appSpec) {
      console.log('App not found');
      chooseMarketplaceOperation();
      return;
    }
    switch (answers.field) {
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
      case 'Visible':
        inquirer.prompt([
          {
            type: 'confirm',
            name: 'newVisible',
            message: 'Is the app visible on the marketplace? ',
          }
        ]).then(async (answers) => {
          appSpec.visible = answers.newVisible;
          await marketplace.modifyApp(appSpec);
          chooseMarketplaceOperation();
        });
        break;
      case 'Enabled':
        inquirer.prompt([
          {
            type: 'confirm',
            name: 'newEnabled',
            message: 'Is the app enabled on the marketplace? ',
          }
        ]).then(async (answers) => {
          appSpec.enabled = answers.newEnabled;
          await marketplace.modifyApp(appSpec);
          chooseMarketplaceOperation();
        });
        break;
      case 'Component':
        inquirer.prompt([
          {
            type: 'number',
            name: 'component',
            message: `Enter the component to edit (1 - ${appSpec.compose.length})`,
          }
        ]).then(async (answers) => {
          const component = appSpec.compose[answers.component-1];
          inquirer.prompt([
            {
              type: 'list',
              name: 'field',
              message: 'Select the field to edit',
              choices: [
                'Name',
                'Description',
                'Repotag',
                'Ports',
                'Container Ports',
                'Domains',
                'Static Environment Parameters',
                'User Environment Parameters',
                'Commands',
                'Container Data',
                'CPU',
                'RAM',
                'HDD',
                new inquirer.Separator(),
                'Back',
                new inquirer.Separator(),
              ]
            }
          ]).then(async (componentAnswer) => {
            if (componentAnswer.field === 'Back') {
              chooseMarketplaceOperation();
              return;
            }
            switch (componentAnswer.field) {
              case 'Name':
                inquirer.prompt([
                  {
                    type: 'input',
                    name: 'newName',
                    message: `Enter the new name (${component.name})`,
                  }
                ]).then(async (componentFieldAnswer) => {
                  appSpec.compose[answers.component-1].name = componentFieldAnswer.newName;
                  await marketplace.modifyApp(appSpec);
                  chooseMarketplaceOperation();
                });
                break;
              case 'Description':
                inquirer.prompt([
                  {
                    type: 'input',
                    name: 'newDescription',
                    message: `Enter the new description (${component.description})`,
                  }
                ]).then(async (componentFieldAnswer) => {
                  appSpec.compose[answers.component-1].description = componentFieldAnswer.newDescription;
                  await marketplace.modifyApp(appSpec);
                  chooseMarketplaceOperation();
                });
                break;
              case 'Repotag':
                inquirer.prompt([
                  {
                    type: 'input',
                    name: 'newRepotag',
                    message: `Enter the new repotag (${component.repotag})`,
                  }
                ]).then(async (componentFieldAnswer) => {
                  appSpec.compose[answers.component-1].repotag = componentFieldAnswer.newRepotag;
                  await marketplace.modifyApp(appSpec);
                  chooseMarketplaceOperation();
                });
                break;
              case 'Ports':
                inquirer.prompt([
                  {
                    type: 'input',
                    name: 'newPorts',
                    message: `Enter the new Ports as a range (e.g. 35000-35100) (${component.portSpecs.join(', ')})`,
                  }
                ]).then(async (componentFieldAnswer) => {
                  const ports = (componentFieldAnswer.newPorts.length > 0 ? componentFieldAnswer.newPorts.split(',') : []);
                  appSpec.compose[answers.component-1].portSpecs = ports;
                  await marketplace.modifyApp(appSpec);
                  chooseMarketplaceOperation();
                });
                break;
              case 'Container Ports':
                inquirer.prompt([
                  {
                    type: 'input',
                    name: 'newContainerPorts',
                    message: `Enter the new Container Ports (${component.containerPorts.join(', ')})`,
                  }
                ]).then(async (componentFieldAnswer) => {
                  const containerPorts = (componentFieldAnswer.newContainerPorts.length > 0 ? componentFieldAnswer.newContainerPorts.split(',') : []).map((value) => Number(value));
                  appSpec.compose[answers.component-1].containerPorts = containerPorts;
                  await marketplace.modifyApp(appSpec);
                  chooseMarketplaceOperation();
                });
                break;
              case 'Domains':
                inquirer.prompt([
                  {
                    type: 'input',
                    name: 'newDomains',
                    message: `Enter the new Domains (${component.domains.join(', ')})`,
                  }
                ]).then(async (componentFieldAnswer) => {
                  appSpec.compose[answers.component-1].domains = componentFieldAnswer.newDomains.length > 0 ? componentFieldAnswer.newDomains.split(',') : [];
                  await marketplace.modifyApp(appSpec);
                  chooseMarketplaceOperation();
                });
                break;
              case 'Static Environment Parameters':
                inquirer.prompt([
                  {
                    type: 'input',
                    name: 'newEnvironmentParameters',
                    message: `Enter the new Static Environment Parameters (${component.environmentParameters.join(', ')})`,
                  }
                ]).then(async (componentFieldAnswer) => {
                  appSpec.compose[answers.component-1].environmentParameters = componentFieldAnswer.newEnvironmentParameters.length > 0 ? componentFieldAnswer.newEnvironmentParameters.split(',') : [];
                  await marketplace.modifyApp(appSpec);
                  chooseMarketplaceOperation();
                });
                break;
              case 'User Environment Parameters':
                inquirer.prompt([
                  {
                    type: 'input',
                    name: 'newUserEnvironmentParameters',
                    message: `Enter the new User Environment Parameters as JSON (${component.userEnvironmentParameters})`,
                  }
                ]).then(async (componentFieldAnswer) => {
                  appSpec.compose[answers.component-1].userEnvironmentParameters = componentFieldAnswer.newUserEnvironmentParameters;
                  await marketplace.modifyApp(appSpec);
                  chooseMarketplaceOperation();
                });
                break;
              case 'Commands':
                inquirer.prompt([
                  {
                    type: 'input',
                    name: 'newCommands',
                    message: `Enter the new Commands (${component.commands.join(', ')})`,
                  }
                ]).then(async (componentFieldAnswer) => {
                  appSpec.compose[answers.component-1].commands = componentFieldAnswer.newCommands.length > 0 ? componentFieldAnswer.newCommands.split(',') : [];
                  await marketplace.modifyApp(appSpec);
                  chooseMarketplaceOperation();
                });
                break;
              case 'Container Data':
                inquirer.prompt([
                  {
                    type: 'input',
                    name: 'newContainerData',
                    message: `Enter the new Container Data (${component.containerData})`,
                  }
                ]).then(async (componentFieldAnswer) => {
                  appSpec.compose[answers.component-1].containerData = componentFieldAnswer.newContainerData;
                  await marketplace.modifyApp(appSpec);
                  chooseMarketplaceOperation();
                });
                break;
              case 'CPU':
                inquirer.prompt([
                  {
                    type: 'number',
                    name: 'newCPU',
                    message: `Enter the new CPU (${component.cpu} cores)`,
                  }
                ]).then(async (componentFieldAnswer) => {
                  appSpec.compose[answers.component-1].cpu = componentFieldAnswer.newCPU;
                  appSpec.compose[answers.component-1].cpubasic = componentFieldAnswer.newCPU;
                  appSpec.compose[answers.component-1].cpusuper = componentFieldAnswer.newCPU;
                  appSpec.compose[answers.component-1].cpubamf = componentFieldAnswer.newCPU;
                  await marketplace.modifyApp(appSpec);
                  chooseMarketplaceOperation();
                });
                break;
              case 'RAM':
                inquirer.prompt([
                  {
                    type: 'number',
                    name: 'newRAM',
                    message: `Enter the new RAM (${component.ram} GB)`,
                  }
                ]).then(async (componentFieldAnswer) => {
                  appSpec.compose[answers.component-1].ram = componentFieldAnswer.newRAM;
                  appSpec.compose[answers.component-1].rambasic = componentFieldAnswer.newRAM;
                  appSpec.compose[answers.component-1].ramsuper = componentFieldAnswer.newRAM;
                  appSpec.compose[answers.component-1].rambamf = componentFieldAnswer.newRAM;
                  await marketplace.modifyApp(appSpec);
                  chooseMarketplaceOperation();
                });
                break;
              case 'HDD':
                inquirer.prompt([
                  {
                    type: 'number',
                    name: 'newHDD',
                    message: `Enter the new HDD (${component.hdd} GB)`,
                  }
                ]).then(async (componentFieldAnswer) => {
                  appSpec.compose[answers.component-1].hdd = componentFieldAnswer.newHDD;
                  appSpec.compose[answers.component-1].hddbasic = componentFieldAnswer.newHDD;
                  appSpec.compose[answers.component-1].hddsuper = componentFieldAnswer.newHDD;
                  appSpec.compose[answers.component-1].hddbamf = componentFieldAnswer.newHDD;
                  await marketplace.modifyApp(appSpec);
                  chooseMarketplaceOperation();
                });
                break;
              }
          });
        });
        break;
      }
  })
}