import { select, templates } from '../settings.js';

class Home {
  constructor(element) {
    const thisHome = this;
    thisHome.render(element);
    thisHome.initWidgets();

  }

  render(element) {
    const thisHome = this;
    const generatedHtml = templates.homePage();
    //console.log(generatedHtml);
    thisHome.dom = {};
    thisHome.dom.wrapper = element;
    thisHome.dom.wrapper.innerHTML = generatedHtml;
    thisHome.dom.links = thisHome.dom.wrapper.querySelectorAll(select.home.links);
    //console.log(thisHome.dom.links);
  }

  initWidgets() {
    /*const thisHome = this;
    for (let link of thisHome.dom.links) {
      link.addEventListener('click', function () {
        const id = link.getAttribute('href').replace('#', '');
        thisHome.id = id;
        console.log(thisHome.id);
      });
    }*/
  }
}
export default Home;