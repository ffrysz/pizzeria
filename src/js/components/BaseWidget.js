
class BaseWidget {
  constructor(wrapperElement, initialValue) {
    const thisWidget = this;
    //console.log(wrapperElement);
    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapperElement;
    //thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    //console.log(thisWidget.dom.input);
    thisWidget.correctValue = initialValue;
    //thisWidget.setValue(thisWidget.dom.input.value || initialValue); //z tym zapisem nie działa datepicker
    thisWidget.setValue(initialValue);
  }

  get value() {
    const thisWidget = this;
    return thisWidget.correctValue;
  }

  set value(value) {
    const thisWidget = this;

    const newValue = thisWidget.parseValue(value);

    if (thisWidget.correctValue !== newValue &&
      thisWidget.isValid(newValue)) {
      thisWidget.correctValue = newValue;
      thisWidget.announce();
    }

    thisWidget.renderValue();
  }

  setValue(value) {
    const thisWidget = this;

    thisWidget.value = value;
  }

  parseValue(value) {
    return parseInt(value);
  }

  isValid(value) {
    return !isNaN(value);
  }

  renderValue() {
    const thisWidget = this;

    thisWidget.dom.wrapper.innerHTML = thisWidget.value;
  }

  announce() {
    const thisWidget = this;

    const event = new CustomEvent('updated', {
      bubbles: true
    });
    thisWidget.dom.wrapper.dispatchEvent(event);
  }
}

export default BaseWidget;