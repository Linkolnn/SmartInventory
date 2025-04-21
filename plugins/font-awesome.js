// Import the Font Awesome core
import { library } from '@fortawesome/fontawesome-svg-core'

// Import Font Awesome component
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Import specific icons
import { 
  faBox, 
  faChartLine, 
  faFileInvoice, 
  faUsers, 
  faPenToSquare, 
  faTrashAlt,
  faBoxesStacked,
  faExchangeAlt,
  faExclamationTriangle,
  faMoneyBillWave,
  faPlus,
  faMinus
} from '@fortawesome/free-solid-svg-icons'

// Add the icons to the library
library.add(
  faBox, 
  faChartLine, 
  faFileInvoice, 
  faUsers, 
  faPenToSquare, 
  faTrashAlt,
  faBoxesStacked,
  faExchangeAlt,
  faExclamationTriangle,
  faMoneyBillWave,
  faPlus,
  faMinus
)

export default defineNuxtPlugin((nuxtApp) => {
  // Register the component globally
  nuxtApp.vueApp.component('font-awesome-icon', FontAwesomeIcon)
}) 