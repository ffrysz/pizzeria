import { select, classNames, templates } from '../settings.js';
import AmountWidget from './AmountWidget.js';

class Booking {
  constructor(element) {
    const thisBooking = this;
    thisBooking.render(element);
    thisBooking.initWidgets();
  }

  render(element) {
    const thisBooking = this;
    const generatedHtml = templates.bookingWidget();
    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generatedHtml;
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.dom.peopleAmount.addEventListener('updated', function () {
      console.log('People widget callback');
    });

    thisBooking.hoursWidget = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.dom.hoursAmount.addEventListener('updated', function () {
      console.log('Hours widget callback');
    });
  }
}
export default Booking;