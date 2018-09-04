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

  // fields = ['Год', 'Месяц', 'Год - Неделя', 'Неделя'];

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

  async setSelections(selection) {
    try {
      const { qAppPromise } = this;
      const qAppp = await qAppPromise;

      const valuesFromLocalStorage = JSON.parse(selection);
      console.log('setSelections valuesFromLocalStorage =', valuesFromLocalStorage);

      if (localStorage.getItem('selectSrc') === 'sidebar') {
        localStorage.setItem('selectSrc', 'sidebar_clear_all');
        console.log('setSelections clearAll =', JSON.stringify(valuesFromLocalStorage), 'selectSrc = sidebar_clear_all', 'app =', qAppp.id);
        qAppp.clearAll();
      }
      console.log('setSelections valuesFromLocalStorage 1 =', valuesFromLocalStorage);

      if (valuesFromLocalStorage !== null) {
        const locField = valuesFromLocalStorage.field;
        const locSelected = JSON.parse(valuesFromLocalStorage.selected);

        if (locSelected === null) {
          console.log('setSelections field =', locField, 'res array = null');
          qAppp.field(locField).clear();
        } else if (locSelected[0] === 'ALL') {
          console.log('setSelections field =', locField, 'res array = selectAll');
          qAppp.field(locField).selectAll();
        } else if (isNumber(locSelected[0])) {
          let res = [];
          res = locSelected.map(item => parseInt(item, 10));
          console.log('setSelections field =', locField, 'res array Numeric =', JSON.stringify(res));
          qAppp.field(locField).selectValues(res, false, true);
        } else {
          const res = [];
          locSelected.forEach(value => res.push({ qText: value }));
          console.log('setSelections field =', locField, 'res array =', JSON.stringify(res));
          qAppp.field(locField).selectValues(res, false, true);
        }
      } else {
        console.log('setSelections clearAll =', JSON.stringify(valuesFromLocalStorage));
        qAppp.clearAll();
      }
    } catch (error) {
      console.log(error);
    }
  }
};

export default QdtComponents;
