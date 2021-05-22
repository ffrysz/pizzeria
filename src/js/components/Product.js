import { select, classNames, templates } from '../settings.js';
import { utils } from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Product {
  constructor(id, data) {
    const thisProduct = this;
    thisProduct.id = id;
    thisProduct.data = data;
    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
    //console.log('This product:', thisProduct);
  }

  renderInMenu() {
    const thisProduct = this;
    /* Generate HTML based on template */
    const generatedHTML = templates.menuProduct(thisProduct.data);
    /* Create element using utils.createElementFromHTML */
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);
    /* Find menu container */
    const menuContainer = document.querySelector(select.containerOf.menu);
    /* Add element to menu */
    menuContainer.appendChild(thisProduct.element);
  }

  getElements() {
    const thisProduct = this;

    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    //console.log(thisProduct.formInputs);

  }

  initAccordion() {
    const thisProduct = this;
    /* find the clickable trigger (the element that should react to clicking) */
    //const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    /* START: add event listener to clickable trigger on event click */
    thisProduct.accordionTrigger.addEventListener('click', function (event) {
      /* prevent default action for event */
      event.preventDefault();
      /* find active product (product that has active class) */
      const activeProduct = document.querySelector(select.all.menuProductsActive);
      //console.log(activeProduct);
      /* if there is active product and it's not thisProduct.element, remove class active from it */
      if (activeProduct && (activeProduct !== thisProduct.element)) {
        activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
      }
      /* toggle active class on thisProduct.element */
      thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
    });
  }

  initOrderForm() {
    const thisProduct = this;
    //console.log('initOrderForm');
    thisProduct.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
    });

    for (let input of thisProduct.formInputs) {
      input.addEventListener('change', function () {
        thisProduct.processOrder();
      });
    }

    thisProduct.cartButton.addEventListener('click', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }

  initAmountWidget() {
    const thisProduct = this;
    thisProduct.amountWidgetElem.addEventListener('updated', function () { thisProduct.processOrder(); });
    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
  }

  processOrder() {
    const thisProduct = this;
    //console.log('processOrder');
    /* Convert form to object structure */
    const formData = utils.serializeFormToObject(thisProduct.form);
    //console.log('formData: ', formData);
    /* Set price to default price */
    let price = thisProduct.data.price;
    /* For every category */
    for (let paramId in thisProduct.data.params) {
      const param = thisProduct.data.params[paramId];
      //console.log(paramId, param);
      for (let optionId in param.options) {
        const option = param.options[optionId];
        //console.log(optionId, option);
        /* Check if option is chosen and default, price doesn't change */
        if (((formData[paramId] && formData[paramId].includes(optionId)) && option.default) ||
          ((formData[paramId] && !formData[paramId].includes(optionId)) && !option.default)) {
          price += 0;
          //console.log('price doesnt change', price);
        } else if ((formData[paramId] && formData[paramId].includes(optionId)) && !option.default) {
          /* If chosen and not default, price rises */
          price += option.price;
          //console.log('price incresed', price);
        } else if ((formData[paramId] && !formData[paramId].includes(optionId)) && option.default) {
          /* If not chosen and default, price decreases*/
          price -= option.price;
          //console.log('price decreased', price);
        }
        /* Check if option is checked and add class active to img */
        const imgOption = '.' + paramId + '-' + optionId;
        const imgFound = thisProduct.imageWrapper.querySelector(imgOption);
        //console.log(imgFound);
        if (imgFound) {
          if ((formData[paramId] && formData[paramId].includes(optionId))) {
            imgFound.classList.add(classNames.menuProduct.imageVisible);
          } else {
            imgFound.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
      }
    }

    /* Update calculated price in HTML */
    //console.log(thisProduct.amountWidget.value);
    thisProduct.priceSingle = price;
    price *= thisProduct.amountWidget.value;
    thisProduct.priceElem.innerHTML = price;
  }

  prepareCartProduct() {
    const thisProduct = this;

    const productSummary = {};
    productSummary.id = thisProduct.id;
    productSummary.name = thisProduct.data.name;
    productSummary.amount = thisProduct.amountWidget.value;
    productSummary.priceSingle = thisProduct.priceSingle;
    productSummary.price = productSummary.amount * productSummary.priceSingle;
    productSummary.params = thisProduct.prepareCartProductParams();
    //console.log(productSummary);
    return productSummary;
  }

  prepareCartProductParams() {
    const thisProduct = this;
    /* Convert form to object structure */
    const formData = utils.serializeFormToObject(thisProduct.form);
    const paramsPrepared = {};
    //console.log(thisProduct.data.params);
    for (let paramId in thisProduct.data.params) {
      const param = thisProduct.data.params[paramId];
      paramsPrepared[paramId] = {};
      paramsPrepared[paramId].label = param.label;
      paramsPrepared[paramId].options = {};
      //console.log(paramsPrepared);
      for (let optionId in param.options) {
        const option = param.options[optionId];
        //console.log(optionId);
        if (formData[paramId] && formData[paramId].includes(optionId)) {
          paramsPrepared[paramId].options[optionId] = option.label;
        }
      }
    }
    //console.log(paramsPrepared);
    return paramsPrepared;

  }

  addToCart() {
    const thisProduct = this;
    //app.cart.add(thisProduct.prepareCartProduct());

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct.prepareCartProduct(),
      },
    });

    thisProduct.element.dispatchEvent(event);
  }
}

export default Product;