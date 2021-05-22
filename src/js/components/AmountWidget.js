import { settings, select } from '../settings.js';

class AmountWidget {
  constructor(element) {
    //console.log('Constructor arguments:', element);
    const thisWidget = this;
    thisWidget.getElements(element);
    //thisWidget.value = settings.amountWidget.defaultValue; /* W poprzednim module była ta komenda */
    if (thisWidget.input.value) {
      thisWidget.value = thisWidget.input.value;
    } else {
      thisWidget.value = settings.amountWidget.defaultValue;
    }
    thisWidget.setValue(thisWidget.value);
    thisWidget.initActions();

    //console.log('AmountWidget:', thisWidget);
    //console.log('Constructor arguments:', element);

  }

  getElements(element) {
    const thisWidget = this;

    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
    thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
  }

  setValue(value) {
    const thisWidget = this;

    const newValue = parseInt(value);

    if (thisWidget.value !== newValue &&
      !isNaN(newValue) &&
      newValue >= settings.amountWidget.defaultMin &&
      newValue <= settings.amountWidget.defaultMax) {
      thisWidget.value = newValue;
      thisWidget.announce();
    }

    thisWidget.input.value = thisWidget.value;

  }

  initActions() {
    const thisWidget = this;
    thisWidget.input.addEventListener('change', function () { thisWidget.setValue(thisWidget.input.value); });
    thisWidget.linkDecrease.addEventListener('click', function () { thisWidget.setValue(thisWidget.value - 1); });
    thisWidget.linkIncrease.addEventListener('click', function () { thisWidget.setValue(thisWidget.value + 1); });
  }

  announce() {
    const thisWidget = this;

    const event = new CustomEvent('updated', {
      bubbles: true
    });
    thisWidget.element.dispatchEvent(event);
  }

}

export default AmountWidget;