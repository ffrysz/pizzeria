import { settings, select } from '../settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget {
  constructor(element) {
    super(element, settings.amountWidget.defaultValue);
    //console.log('Constructor arguments:', element);
    const thisWidget = this;
    thisWidget.getElements();
    thisWidget.setValue(thisWidget.dom.input.value || settings.amountWidget.defaultValue);
    //thisWidget.value = settings.amountWidget.defaultValue; /* W poprzednim module była ta komenda */
    /*
    Poniższe linie przeniesione do klasy BaseWidget
    if (thisWidget.dom.input.value) {
      thisWidget.value = thisWidget.dom.input.value;
    } else {
      thisWidget.value = settings.amountWidget.defaultValue;
    }
    thisWidget.setValue(thisWidget.value);
    */

    thisWidget.initActions();

    //console.log('AmountWidget:', thisWidget);
    //console.log('Constructor arguments:', element);

  }

  getElements() {
    const thisWidget = this;

    //thisWidget.dom.wrapper = element; Ustawiany w klasie BaseWidget
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }

  isValid(value) {
    return !isNaN(value) &&
      value >= settings.amountWidget.defaultMin &&
      value <= settings.amountWidget.defaultMax;
  }

  renderValue() {
    const thisWidget = this;
    if (thisWidget.dom.input) { thisWidget.dom.input.value = thisWidget.value; }
  }

  initActions() {
    const thisWidget = this;
    thisWidget.dom.input.addEventListener('change', function () { thisWidget.setValue(thisWidget.dom.input.value); });
    thisWidget.dom.linkDecrease.addEventListener('click', function () { thisWidget.setValue(thisWidget.value - 1); });
    thisWidget.dom.linkIncrease.addEventListener('click', function () { thisWidget.setValue(thisWidget.value + 1); });
  }

}

export default AmountWidget;