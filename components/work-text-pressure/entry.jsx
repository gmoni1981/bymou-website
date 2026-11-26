import { createRoot } from 'react-dom/client';
import WorkPressureTitle from './WorkPressureTitle.jsx';

const heading = document.querySelector('#work #selected-title');
if (heading) {
  const text = heading.textContent;
  createRoot(heading).render(<WorkPressureTitle text={text} />);
}
