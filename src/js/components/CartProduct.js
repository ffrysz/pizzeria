import { select } from '../settings.js';
import AmountWidget from './AmountWidget.js';

class CartProduct {
  constructor(menuProduct, element) {
    const thisCartProduct = this;
    //console.log(menuProduct, element);
    thisCartProduct.id = menuProduct.id;
    thisCartProduct.amount = menuProduct.amount;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.price = menuProduct.price;
    thisCartProduct.priceSingle = menuProduct.priceSingle;
    thisCartProduct.params = menuProduct.params;
    //console.log(thisCartProduct.amount);

    thisCartProduct.getElements(element);
    thisCartProduct.initAmountWidget();
    thisCartProduct.initActions();

    //console.log(thisCartProduct);
  }

  getElements(element) {
    const thisCartProduct = this;
    //console.log(thisCartProduct);
    thisCartProduct.dom = {};
    thisCartProduct.dom.wrapper = element;
    thisCartProduct.dom.amountWidgetElem = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
    thisCartProduct.dom.amount = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amount); /* dodane */
    //console.log(thisCartProduct.dom.amount.value);
    thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
    thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
    thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
  }

  getData() {
    const thisCartProduct = this;
    const data = {};
    data.id = thisCartProduct.id;
    data.amount = thisCartProduct.amount;
    data.price = thisCartProduct.price;
    data.priceSingle = thisCartProduct.priceSingle;
    data.name = thisCartProduct.name;
    data.params = thisCartProduct.params;
    //console.log(data);
    return data;
  }

  initAmountWidget() {
    const thisCartProduct = this;
    //console.log(thisCartProduct.dom.amount.value);
    thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidgetElem);
    thisCartProduct.dom.amountWidgetElem.addEventListener('updated', function () { thisCartProduct.processCartProduct(); });
  }

  initActions() {
    const thisCartProduct = this;
    thisCartProduct.dom.edit.addEventListener('click', function (event) {
      event.preventDefault();
    });
    thisCartProduct.dom.remove.addEventListener('click', function (event) {
      event.preventDefault();
      thisCartProduct.remove();
    });
  }

  processCartProduct() {
    const thisCartProduct = this;
    //console.log(thisCartProduct.dom.amount.value);
    thisCartProduct.amount = thisCartProduct.amountWidget.value;
    thisCartProduct.price = thisCartProduct.amount * thisCartProduct.priceSingle;
    thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
    thisCartProduct.dom.amount.innerHTML = thisCartProduct.amount;
  }

  remove() {
    const thisCartProduct = this;
    //console.log('REMOVE');
    const event = new CustomEvent('remove', {
      bubbles: true,
      detail: {
        cartProduct: thisCartProduct,
      },
    });

    thisCartProduct.dom.wrapper.dispatchEvent(event);
  }
}

export default CartProduct;