import { templates } from '../settings.js';

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
  }

  initWidgets() {
    //const thisHome = this;

  }
}
export default Home;