/* eslint-disable no-plusplus */
import React from 'react';
import ReactDOM from 'react-dom';
import qApp from './qApp';
import qDoc from './qDoc';
import utility from './utilities/';
import settings from './picasso/settings';
import QdtFilter from './components/QdtFilter';
import QdtTable from './components/QdtTable';
import QdtViz from './components/QdtViz';
import QdtSelectionToolbar from './components/QdtSelectionToolbar';
import QdtKpi from './components/QdtKpi';
import QdtButton from './components/QdtButton';
import QdtPicasso from './components/QdtPicasso';
import QdtSearch from './components/QdtSearch';
import QdtCurrentSelections from './components/QdtCurrentSelections';

const components = {
  QdtFilter, QdtTable, QdtViz, QdtSelectionToolbar, QdtKpi, QdtButton, QdtPicasso, QdtSearch, QdtCurrentSelections,
};

function isNumber(n) {
  return !Number.isNaN(parseFloat(n)) && Number.isFinite(parseFloat(n));
}

const QdtComponents = class {
  static picasso = {
    settings,
  };

  constructor(config = {}, connections = { vizApi: true, engineApi: true }) {
    const myConfig = config;
    myConfig.identity = utility.uid(16);
    this.qAppPromise = (connections.vizApi) ? qApp(myConfig) : null;
    this.qDocPromise = (connections.engineApi) ? qDoc(myConfig) : null;
  }

  render = async (type, props, element) => new Promise((resolve, reject) => {
    try {
      const { qAppPromise, qDocPromise } = this;
      const Component = components[type];
      ReactDOM.render(
        <Component
          {...props}
          qAppPromise={qAppPromise}
          qDocPromise={qDocPromise}
          ref={node => resolve(node)}
        />,
        element,
      );
    } catch (error) {
      reject(error);
    }
  });

  async setSelections(selections) {
    try {
      const { qAppPromise } = this;
      const qAppp = await qAppPromise;

      const valuesFromLocalStorage = JSON.parse(selections);

      console.log('setSelections step 1');
      console.log(`setSelections${JSON.stringify(valuesFromLocalStorage)}`);

      if (valuesFromLocalStorage !== null && valuesFromLocalStorage.length > 0) {
        for (let i = 0; i < valuesFromLocalStorage.length; i++) {
          const locField = valuesFromLocalStorage[i].field;
          const locSelected = valuesFromLocalStorage[i].selected;
          let selectedArrayNotTrimmed = [];

          selectedArrayNotTrimmed = locSelected.split(',');
          console.log('selectedArrayNotTrimmed = ', JSON.stringify(selectedArrayNotTrimmed));
          const selectedArrayTrimmed = [];

          for (let j = 0; j < selectedArrayNotTrimmed.length; j++) {
            selectedArrayTrimmed[j] = selectedArrayNotTrimmed[j].trim();
          }
          console.log('selectedArrayTrimmed = ', JSON.stringify(selectedArrayTrimmed));
          console.log('selectedArrayTrimmed[0] = ', selectedArrayTrimmed[0], ' isNumber = ', isNumber(selectedArrayTrimmed[0]));
          if (isNumber(selectedArrayTrimmed[0])) {
            let res = [];
            res = locSelected.split(',').map(item => parseInt(item, 10));
            console.log('field 1 = ', JSON.stringify(locField), 'res array 1 = ', JSON.stringify(res));
            qAppp.field(locField).selectValues(res, false, true);
          } else if (selectedArrayTrimmed[0] === 'ALL') {
            qAppp.field(locField).selectAll();
          } else if (selectedArrayTrimmed[0].substr(0, 4) === 'NOT ') {
            const res = [];
            res.push({ qText: selectedArrayTrimmed[0].slice(4) });
            for (let k = 1; k < selectedArrayTrimmed.length; k++) {
              res.push({ qText: selectedArrayTrimmed[k] });
            }
            console.log('field NOT = ', JSON.stringify(locField), 'res array NOT = ', JSON.stringify(res));
            qAppp.field(locField).selectValues(res, false, true);
            qAppp.field(locField).selectExcluded();
          } else {
            const res = [];
            for (let k = 0; k < selectedArrayTrimmed.length; k++) {
              res.push({ qText: selectedArrayTrimmed[k] });
            }
            console.log('field 2 = ', JSON.stringify(locField), 'res array 2 = ', JSON.stringify(res));
            qAppp.field(locField).selectValues(res, false, true);
          }
          qAppp.field(locField).clearOther(false);
          qAppp.field(locField).lock();
        }
      } else {
        qAppp.clearAll();
      }
      // valuesFromLocalStorage.forEach(item => qAppp.field(item.field).unlock());
      console.log('setSelections step 2');
      console.log(`setSelections ${JSON.stringify(valuesFromLocalStorage)} and appId - ${qAppp.id}`);
    } catch (error) {
      console.log(error);
    }
  }
};

export default QdtComponents;
