import { select, templates, settings, classNames } from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';
import { utils } from '../utils.js';

class Booking {
  constructor(element) {
    const thisBooking = this;
    //console.log(element);
    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
    thisBooking.chosenTableId = '';
  }

  getData() {
    const thisBooking = this;
    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);
    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };
    //console.log('getData params:', params);

    const urls = {
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat.join('&'),
    };

    //console.log('getData urls:', urls);
    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function (allResponses) {
        const bookingsResponse = allResponses[0];
        const eventsCurrent = allResponses[1];
        const eventsRepeat = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrent.json(),
          eventsRepeat.json(),
        ]);
      })
      .then(function ([bookings, eventsCurrent, eventsRepeat]) {
        //console.log('EventsCurrent:', eventsCurrent);
        //console.log('EventsRepeat:', eventsRepeat);
        //console.log('Bookings:', bookings);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });

  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};

    for (let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for (let item of eventsRepeat) {
      if (item.repeat == 'daily') {
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }

    //console.log('booked:', thisBooking.booked);
    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
      if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }

      thisBooking.booked[date][hourBlock].push(table);
      //console.log(hourBlock);
    }
  }

  updateDOM() {
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);
    thisBooking.chosenTableId = '';

    let allAvailable = false;

    if (
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ) {
      allAvailable = true;
    }

    for (let table of thisBooking.dom.tables) {
      table.classList.remove(classNames.booking.tableChosen);

      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }

      if (
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId) == 1
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }

    }

  }

  render(element) {
    const thisBooking = this;
    const generatedHtml = templates.bookingWidget();
    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generatedHtml;
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.floor = thisBooking.dom.wrapper.querySelector(select.booking.floor);
    thisBooking.dom.bookingForm = thisBooking.dom.wrapper.querySelector(select.booking.form);
    thisBooking.dom.tel = thisBooking.dom.bookingForm.querySelector(select.booking.phone);
    thisBooking.dom.email = thisBooking.dom.bookingForm.querySelector(select.booking.email);
    thisBooking.dom.submit = thisBooking.dom.bookingForm.querySelector(select.booking.submit);
    thisBooking.dom.water = thisBooking.dom.wrapper.querySelector(select.booking.water);
    thisBooking.dom.bread = thisBooking.dom.wrapper.querySelector(select.booking.bread);
  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleWidget = new AmountWidget(thisBooking.dom.peopleAmount);

    thisBooking.hoursWidget = new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);

    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function () {
      thisBooking.updateDOM();
    });

    thisBooking.dom.floor.addEventListener('click', function (event) {
      thisBooking.tableChoice(event);
    });

    thisBooking.dom.submit.addEventListener('click', function (event) {
      event.preventDefault();
      thisBooking.sendBooking();
      //thisBooking.updateDOM();
    });
  }

  tableChoice(event) {
    const thisBooking = this;
    const table = event.target.classList.contains(classNames.booking.table);
    const booked = event.target.classList.contains(classNames.booking.tableBooked);
    const chosen = event.target.classList.contains(classNames.booking.tableChosen);

    if (table && !booked) {
      const newChosenTable = event.target;
      const newChosenTableId = newChosenTable.getAttribute(settings.booking.tableIdAttribute);

      if (!thisBooking.chosenTableId || (thisBooking.chosenTableId == newChosenTableId && !chosen)) {
        thisBooking.chosenTableId = newChosenTableId;
        //console.log("Chosen table id:", thisBooking.chosenTableId);
        newChosenTable.classList.add(classNames.booking.tableChosen);

      } else if (thisBooking.chosenTableId !== newChosenTableId) {
        const selector = '[data-table="' + thisBooking.chosenTableId + '"]';
        const previousTable = thisBooking.dom.floor.querySelector(selector);

        previousTable.classList.remove(classNames.booking.tableChosen);
        thisBooking.chosenTableId = newChosenTableId;
        newChosenTable.classList.toggle(classNames.booking.tableChosen);

      } else if (thisBooking.chosenTableId == newChosenTableId && chosen) {
        newChosenTable.classList.remove(classNames.booking.tableChosen);
        thisBooking.chosenTableId = '';
      }
      //console.log(thisBooking);
    } else if (table && booked) {
      alert('Stolik zajęty!');
    }
  }

  sendBooking() {
    const thisBooking = this;
    const url = settings.db.url + '/' + settings.db.booking;
    const payload = {
      date: thisBooking.datePicker.value,
      hour: thisBooking.hourPicker.value,
      table: parseInt(thisBooking.chosenTableId),
      duration: thisBooking.hoursWidget.value,
      ppl: thisBooking.peopleWidget.value,
      starters: [],
      phone: thisBooking.dom.tel.value,
      address: thisBooking.dom.email.value,
    };
    if (thisBooking.dom.water.checked && !thisBooking.dom.bread.checked) {
      payload.starters.push(thisBooking.dom.water.value);
    } else if (thisBooking.dom.bread.checked) {
      payload.starters.push(thisBooking.dom.water.value, thisBooking.dom.bread.value);
    }
    //console.log('payload:', payload);
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    fetch(url, options)
      .then(function (response) {
        return response.json();
      }).then(function (parsedResponse) {
        console.log('Parsed response booking:', parsedResponse);
        thisBooking.makeBooked(payload.date, payload.hour, payload.duration, payload.table);
        //console.log('Thisbooking.booked:', thisBooking.booked);
        thisBooking.updateDOM();
      });
  }
}
export default Booking;