/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amount: '.widget-amount .amount',
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
  };

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
      app.cart.add(thisProduct.prepareCartProduct());
    }
  }

  class AmountWidget {
    constructor(element) {
      //console.log('Constructor arguments:', element);
      const thisWidget = this;
      thisWidget.getElements(element);
      //thisWidget.element = element;
      //console.log('This widget input:', thisWidget.input.value);
      //thisWidget.value = settings.amountWidget.defaultValue; /* W poprzednim module była ta komenda */
      thisWidget.value = thisWidget.input.value;
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

      const event = new Event('updated');
      thisWidget.element.dispatchEvent(event);
    }

  }

  class Cart {
    constructor(element) {
      const thisCart = this;

      thisCart.products = [];
      thisCart.getElements(element);
      thisCart.initActions();

      console.log('New cart:', thisCart);
    }

    getElements(element) {
      const thisCart = this;
      //console.log(element);
      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    }

    initActions() {
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function () { thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive); });
    }

    add(menuProduct) {
      const thisCart = this;
      //console.log(menuProduct);
      const generatedHTML = templates.cartProduct(menuProduct);
      //console.log(generatedHTML);
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);
      //console.log(generatedDOM);
      thisCart.dom.productList.appendChild(generatedDOM);
      //console.log('Adding products:', menuProduct);
      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
      console.log('This cart products:', thisCart.products);

    }
  }

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

      //console.log(thisCartProduct);
    }

    getElements(element) {
      const thisCartProduct = this;

      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidgetElem = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.amount = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amount); /* dodane */
      //console.log(thisCartProduct.dom.amount.value);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
    }


    initAmountWidget() {
      const thisCartProduct = this;
      //console.log(thisCartProduct.dom.amount.value);
      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidgetElem);
      thisCartProduct.dom.amountWidgetElem.addEventListener('updated', function () { thisCartProduct.processCartProduct(); });
    }

    /*
    initAmountWidget() {
      const thisCartProduct = this;
      //console.log(thisCartProduct.dom.amount.value);
      thisCartProduct.dom.amountWidgetElem.addEventListener('updated', function () { thisCartProduct.processCartProduct(); });
      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidgetElem);

    } */

    processCartProduct() {
      const thisCartProduct = this;
      console.log(thisCartProduct.dom.amount.value);
      thisCartProduct.amount = thisCartProduct.amountWidget.value;
      thisCartProduct.price = thisCartProduct.amount * thisCartProduct.priceSingle;
      thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      thisCartProduct.dom.amount.innerHTML = thisCartProduct.amount;
    }
  }


  const app = {
    initMenu: function () {
      const thisApp = this;
      console.log('thisApp.data:', thisApp.data);
      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    //data: dataSource,
    initData: function () {
      const thisApp = this;
      thisApp.data = dataSource;
    },

    initCart: function () {
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },

    init: function () {
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);
      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();

    },
  };

  app.init();
}
